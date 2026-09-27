export default async function alive(sock, jid) {
  await sock.sendMessage(jid, {
    text:
      "🤖 *Kavee AI*\n\n" +
      "🟢 Status: Online\n" +
      "⚡ System: Running\n" +
      "📱 WhatsApp: Connected\n" +
      "🧠 AI: Ready\n\n" +
      "❤️ Bot is alive!"
  });
}
