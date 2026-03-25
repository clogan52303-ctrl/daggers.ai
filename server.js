const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "openrouter/free",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  })
});

const data = await response.json();

res.json({
  result: data.choices[0].message.content
});
