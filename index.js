import express from "express";
import dotenv from "dotenv";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import P from "pino";

import config from "./config.js";
import ping from "./commands/ping.js";
import alive from "./commands/alive.js";
import ai from "./commands/ai.js";
import help from "./commands/help.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Render health check
app.get("/", (req, res) => {
  res.status(200).send("🤖 Kavee AI WhatsApp Bot is Online!");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "online",
    bot: config.botName
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

async function startBot() {
  try {
    const { state, saveCreds } =
      await useMultiFileAuthState("./auth_info");

    const sock = makeWASocket({
      auth: state,
      logger: P({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
      if (connection === "open") {
        console.log("✅ WhatsApp connected!");
      }

      if (connection === "connecting") {
        console.log("🔄 Connecting to WhatsApp...");
      }

      if (connection === "close") {
        const statusCode =
          lastDisconnect?.error?.output?.statusCode;

        const shouldReconnect =
          statusCode !== DisconnectReason.loggedOut;

        console.log("❌ WhatsApp disconnected.");

        if (shouldReconnect) {
          console.log("🔄 Reconnecting...");
          setTimeout(startBot, 5000);
        } else {
          console.log("🚪 WhatsApp logged out.");
        }
      }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
      try {
        const message = messages[0];

        if (!message?.message) return;
        if (message.key.fromMe) return;

        const jid = message.key.remoteJid;

        if (!jid || jid === "status@broadcast") return;

        const text =
          message.message.conversation ||
          message.message.extendedTextMessage?.text ||
          "";

        if (!text.trim()) return;

        console.log(`📩 ${jid}: ${text}`);

        const command = text.trim();

        // .ping
        if (command.toLowerCase() === ".ping") {
          await ping(sock, jid);
          return;
        }

        // .alive
        if (command.toLowerCase() === ".alive") {
          await alive(sock, jid);
          return;
        }

        // .help
        if (command.toLowerCase() === ".help") {
          await help(sock, jid);
          return;
        }

        // .ai
        if (command.toLowerCase().startsWith(".ai")) {
          const prompt = command.slice(3).trim();

          await sock.sendMessage(jid, {
            text: "🧠 Thinking..."
          });

          await ai(sock, jid, prompt);
          return;
        }

      } catch (error) {
        console.error("❌ Message Error:", error);
      }
    });

  } catch (error) {
    console.error("❌ Bot startup error:", error);

    setTimeout(startBot, 5000);
  }
}

console.log(`🤖 Starting ${config.botName}...`);

startBot();
