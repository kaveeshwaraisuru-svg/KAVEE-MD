const AI_API_URL = "https://api.openai.com/v1/chat/completions";

export default async function ai(sock, jid, prompt) {
  if (!prompt || !prompt.trim()) {
    await sock.sendMessage(jid, {
      text: "🤖 AI එකෙන් අහන්න දෙයක් ලියන්න.\n\nExample:\n.ai Hello"
    });
    return;
  }

  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_API_KEY}`
      },

      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are Kavee AI, a friendly WhatsApp AI assistant. Reply clearly and helpfully."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("AI API Error:", data);

      await sock.sendMessage(jid, {
        text: "❌ AI service එකෙන් response එකක් ගන්න බැරි වුණා."
      });

      return;
    }

    const answer =
      data?.choices?.[0]?.message?.content ||
      "❌ AI response එකක් ලැබුණේ නැහැ.";

    await sock.sendMessage(jid, {
      text: `🤖 *Kavee AI*\n\n${answer}`
    });

  } catch (error) {
    console.error("AI Error:", error);

    await sock.sendMessage(jid, {
      text: "❌ AI error එකක් සිදුවුණා. ටිකකින් නැවත try කරන්න."
    });
  }
}
