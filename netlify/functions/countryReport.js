// netlify/functions/countryReport.js
const fetch = require("node-fetch");
const { Client } = require("pg");

await client.query('SET search_path TO development, public;');

exports.handler = async function (event) {
    try {
        // 1) Parse country_id
        const params = event.queryStringParameters || {};
        const countryId = parseInt(params.country_id, 10);
        if (!countryId) {
            return { statusCode: 400, body: JSON.stringify({ error: "Usage: ?country_id=<id>" }) };
        }

        // 2) Connect to Postgres via Netlify
        const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.NETLIFY_DATABASE_URL_UNPOOLED;
        if (!connectionString) {
            throw new Error("Missing database URL; ensure you've linked your Neon database in Netlify and redeployed");
        }

        const client = new Client({
            connectionString,
            ssl: { rejectUnauthorized: false }
        });
        await client.connect();


        // 3) Fetch country
        const countryRes = await client.query(
            "SELECT name, webhook FROM country WHERE id = $1",
            [countryId]
        );
        if (countryRes.rowCount === 0) {
            await client.end();
            return { statusCode: 404, body: JSON.stringify({ error: "Country not found" }) };
        }
        const { name: countryName, webhook: webhookUrl } = countryRes.rows[0];

        // 4) Fetch companies
        const compRes = await client.query(
            "SELECT name, income FROM company WHERE country_id = $1 ORDER BY name",
            [countryId]
        );
        await client.end();

        // 5) Build Discord message
        let content;
        if (compRes.rows.length === 0) {
            content = `**${countryName}** has no registered companies.`;
        } else {
            content = [
                `**Companies in ${countryName}:**`,
                ...compRes.rows.map(c => `- **${c.name}**: Income ${c.income}`)
            ].join("\n");
        }

        // 6) Send to Discord
        const resp = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
        });
        if (!resp.ok) {
            const detail = await resp.text();
            return {
                statusCode: resp.status,
                body: JSON.stringify({ error: "Discord failed", detail }),
            };
        }

        // 7) Success
        return { statusCode: 200, body: JSON.stringify({ success: true, message: content }) };
    }
    catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
