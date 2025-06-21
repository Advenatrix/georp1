// netlify/functions/countryReport.js
import { Client } from 'pg';
import fetch from 'node-fetch';

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
  // 1) Handle CORS preflight:
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  // 2) Parse country_id:
  const params = event.httpMethod === 'GET'
    ? event.queryStringParameters
    : JSON.parse(event.body || '{}');
  const countryId = parseInt(params.country_id, 10);
  if (!countryId) {
    return {
      statusCode: 400, headers,
      body: JSON.stringify({ error: 'country_id is required' })
    };
  }

  // 3) Connect to Neon Postgres:
  const client = new Client({ connectionString: process.env.NEON_DATABASE_URL });
  try {
    await client.connect();
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'DB connection failed', details: err.message }) };
  }

  // 4) Fetch the country’s name & webhook URL:
  let countryName, webhookUrl;
  try {
    const res = await client.query(
      'SELECT name, webhook FROM country WHERE id = $1',
      [countryId]
    );
    if (res.rowCount === 0) {
      await client.end();
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Country not found' }) };
    }
    ({ name: countryName, webhook: webhookUrl } = res.rows[0]);
  } catch (err) {
    await client.end();
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Fetch country failed', details: err.message }) };
  }

  // 5) Fetch all companies for that country:
  let companies;
  try {
    const res = await client.query(
      'SELECT name, income FROM company WHERE country_id = $1 ORDER BY name',
      [countryId]
    );
    companies = res.rows;
  } catch (err) {
    await client.end();
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Fetch companies failed', details: err.message }) };
  } finally {
    await client.end();
  }

  // 6) Build the Discord message
  let content;
  if (companies.length === 0) {
    content = `**${countryName}** has no registered companies.`;
  } else {
    const lines = [`**Companies in ${countryName}:**`];
    companies.forEach(c => lines.push(`- **${c.name}**: Income ${c.income}`));
    content = lines.join('\n');
  }

  // 7) Send to Discord
  try {
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Webhook failed', details: err.message }) };
  }

  // 8) Return success
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, message: content })
  };
};
