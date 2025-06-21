// netlify/functions/countryReport.js
const fetch = require("node-fetch");
const mysql = require("mysql2/promise"); // or mysql2, adjust if you used mysql

exports.handler = async function (event) {
  try {
    // 1) Parse country_id from query
    const params = event.queryStringParameters || {};
    const countryId = parseInt(params.country_id, 10);
    if (!countryId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Usage: ?country_id=<id>" }),
      };
    }

    // 2) Connect to MySQL (use your ENV variables or hard-code for InfinityFree)
    const db = await mysql.createConnection({
      host: "sql211.infinityfree.com",
      user: "if0_38934414",
      password: "GhvgBcX9l5Fdb",
      database: "if0_38934414_geolarp",
    });

    // 3) Fetch country name + webhook
    const [countryRows] = await db.execute(
      "SELECT name, webhook FROM country WHERE id = ?",
      [countryId]
    );
    if (countryRows.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: "Country not found" }) };
    }
    const { name: countryName, webhook: webhookUrl } = countryRows[0];

    // 4) Fetch companies
    const [companies] = await db.execute(
      "SELECT name, income FROM company WHERE country_id = ? ORDER BY name",
      [countryId]
    );
    await db.end();

    // 5) Build message
    let content;
    if (companies.length === 0) {
      content = `**${countryName}** has no registered companies.`;
    } else {
      content = [
        `**Companies in ${countryName}:**`,
        ...companies.map(c => `- **${c.name}**: Income ${c.income}`)
      ].join("\n");
    }

    // 6) Post to Discord
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: "Discord webhook failed", detail: text })
      };
    }

    // 7) Return success
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: content }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
