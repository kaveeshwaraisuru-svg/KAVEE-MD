export default async function ping(sock, jid) {
  const start = Date.now();

  await sock.sendMessage(jid, {
    text: "🏓 Pong!"
  });

  const speed = Date.now() - start;

  await sock.sendMessage(jid, {
    text: `⚡ Response Speed: ${speed}ms\n🤖 Kavee AI is Online!`
  });
}
