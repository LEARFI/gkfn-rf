const { Bot, webhookCallback } = require("grammy");
const express = require("express");

// Токены из переменных окружения Vercel
const BOT_TOKEN = process.env.BOT_TOKEN;
const CRYPTO_PAY_TOKEN = process.env.CRYPTO_PAY_TOKEN;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!BOT_TOKEN) throw new Error("BOT_TOKEN не указан");
if (!CRYPTO_PAY_TOKEN) throw new Error("CRYPTO_PAY_TOKEN не указан");

const bot = new Bot(BOT_TOKEN);

// Команда /start
bot.command("start", (ctx) => {
  ctx.reply(
    `👋 Привет, ${ctx.from.first_name}!\n\n` +
    `Это бот для покупки донатов на сервере BlewXays.\n\n` +
    `Доступные команды:\n` +
    `/buy — купить донат\n` +
    `/status — проверить статус`
  );
});

// Команда /buy — создаёт счёт в Crypto Pay
bot.command("buy", async (ctx) => {
  try {
    // Создаём счёт через Crypto Pay API
    const response = await fetch("https://pay.crypt.bot/api/createInvoice", {
      method: "POST",
      headers: {
        "Crypto-Pay-API-Token": CRYPTO_PAY_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        asset: "USDT",
        amount: 199, // Цена в USDT
        description: "Привилегия SAND на 30 дней",
        payload: `user_${ctx.from.id}_sand`,
        paid_btn_name: "openBot",
        paid_btn_url: "https://t.me/blewxays_bot",
      }),
    });

    const data = await response.json();

    if (data.ok) {
      const payUrl = data.result.bot_invoice_url;
      await ctx.reply(
        `💎 Счёт создан!\n\n` +
        `Сумма: 199 USDT\n` +
        `Товар: SAND (30 дней)\n\n` +
        `Оплатить: ${payUrl}`
      );
    } else {
      await ctx.reply("❌ Ошибка при создании счёта. Попробуй позже.");
    }
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Ошибка. Попробуй позже.");
  }
});

// Команда /status
bot.command("status", (ctx) => {
  ctx.reply("✅ Бот работает! Оплата через @CryptoBot.");
});

// Обработка вебхуков от Crypto Pay (уведомление об оплате)
const app = express();
app.use(express.json());

app.post(`/crypto/${WEBHOOK_SECRET}`, async (req, res) => {
  const { update_type, payload } = req.body;

  if (update_type === "invoice_paid") {
    console.log("✅ Оплата получена:", payload);
    // Здесь — выдача доната (см. ниже)
  }

  res.sendStatus(200);
});

// Webhook для Telegram
app.use(`/webhook/${WEBHOOK_SECRET}`, webhookCallback(bot, "express"));

module.exports = app;
