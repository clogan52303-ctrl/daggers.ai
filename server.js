const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
     "HTTP-Referer": "https://your-vercel-app.vercel.app",
    "X-Title": "DAGGER.AI"
  },
  body: JSON.stringify({
    model: "mistralai/mistral-7b-instruct:free",
    messages: [
      { role: "user", content: prompt }
    ]
  })
});

const data = await response.json();

return res.status(200).json({
  result: data.choices?.[0]?.message?.content || "No response"
});
