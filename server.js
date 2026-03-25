const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "DAGGER.AI"
  },
  body: JSON.stringify({
    model: "mistralai/mistral-7b-instruct:free",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  })
});

const data = await response.json();

console.log(data); // DEBUG

res.json({
  result: data.choices?.[0]?.message?.content || "No response"
});
