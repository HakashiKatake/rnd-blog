const apiKey = process.env.OPENROUTER_API_KEY || "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";

async function testOpenRouter() {
    console.log("Testing OpenRouter with key:", apiKey.substring(0, 10) + "...");
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    { "role": "user", "content": "Say hello world" }
                ]
            })
        });

        if (!response.ok) {
            console.error("Status:", response.status);
            const text = await response.text();
            console.error("Body:", text);
        } else {
            const data = await response.json();
            console.log("Success! Response:", data.choices[0].message.content);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

testOpenRouter();
