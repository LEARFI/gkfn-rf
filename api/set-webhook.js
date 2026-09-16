export default async function handler(req, res) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const VERCEL_URL = process.env.VERCEL_URL;
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  const url = `https://${VERCEL_URL}/api/webhook/${WEBHOOK_SECRET}`;

  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${url}`
  );

  const data = await response.json();
  res.json(data);
}
