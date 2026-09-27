export default async function help(sock, jid) {
  const helpText = `
🤖 *KAVEE AI BOT*

━━━━━━━━━━━━━━━━━━
📌 *Available Commands*
━━━━━━━━━━━━━━━━━━

🏓 .ping
   Check bot response speed

❤️ .alive
   Check bot status

🧠 .ai <message>
   Chat with AI

📚 .help
   Show this help menu

━━━━━━━━━━━━━━━━━━
💬 *AI Example*

.ai Hello Kavee AI

━━━━━━━━━━━━━━━━━━
⚡ Powered by Kavee
`;

  await sock.sendMessage(jid, {
    text: helpText
  });
}
