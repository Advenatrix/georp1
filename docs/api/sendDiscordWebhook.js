const fetch = require("node-fetch");

exports.handler = async function () {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      throw new Error("Missing Discord webhook URL. Set DISCORD_WEBHOOK_URL in environment variables.");
    }

    const content = "Automated resource processing completed successfully!";

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Failed to send webhook", detail }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Webhook sent successfully!" }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
