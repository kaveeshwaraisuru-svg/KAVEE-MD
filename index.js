import express from "express";
import dotenv from "dotenv";
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import P from "pino";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🤖 Kavee AI WhatsApp Bot is Online!");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Server running on port ${PORT}`);
});

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("✅ WhatsApp connected!");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("❌ WhatsApp disconnected.");

      if (shouldReconnect) {
        console.log("🔄 Reconnecting...");
        startBot();
      }
    }

    if (connection === "connecting") {
      console.log("🔄 Connecting to WhatsApp...");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const message = messages[0];

    if (!message?.message) return;
    if (message.key.fromMe) return;

    const jid = message.key.remoteJid;

    const text =
      message.message.conversation ||
      message.message.extendedTextMessage?.text ||
      "";

    if (!text) return;

    console.log(`📩 Message from ${jid}: ${text}`);

    if (text.toLowerCase() === ".ping") {
      await sock.sendMessage(jid, {
        text: "🏓 Pong!\n⚡ Bot is online."
      });
    }

    if (text.toLowerCase() === ".alive") {
      await sock.sendMessage(jid, {
        text:
          "🤖 Kavee AI Bot\n\n" +
          "🟢 Status: Online\n" +
          "⚡ System: Running\n" +
          "❤️ Made with love"
      });
    }
  });
}

startBot();
