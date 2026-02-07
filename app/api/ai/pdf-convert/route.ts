import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required for conversion' },
                { status: 400 }
            );
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'OPENROUTER_API_KEY is not configured in .env' },
                { status: 500 }
            );
        }

        const prompt = `You are a professional technical blogger and research analyst.
        
        I will provide you with the extracted text from a research paper or engineering project PDF.
        Your task is to convert this text into a high-quality, engaging, and professional research post.
        
        **REQUIRED OUTPUT FORMAT (JSON ONLY)**:
        Return a JSON object with exactly these fields:
        {
          "title": "A concise and catchy title for the post",
          "excerpt": "A 1-2 sentence summary that captures the essence of the work",
          "content": "A long, detailed markdown formatted post content. Use H2, H3 headers, bullet points, and code blocks where applicable. Structure it as: Introduction, Methodology/Approach, Results/Key Findings, and Conclusion.",
          "tags": ["tag1", "tag2", "tag3", "tag4"] (select up to 4 relevant tags from this list: ai-ml, iot, web3, security, devops, mobile, cloud)
        }
        
        **CRITICAL RULES**:
        1. The content must be in valid Markdown.
        2. Ensure the tone is professional yet accessible.
        3. Do NOT include any text other than the JSON object itself.
        4. If there are any diagrams or images mentioned in text, describe them or use placeholders if necessary, but focus on the textual content.
        5. The excerpt must be under 200 characters.
        6. The title must be under 100 characters.
        
        Extracted PDF Text:
        ${text.substring(0, 15000)} // Limiting to first 15k chars for token safety`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    { "role": "user", "content": prompt }
                ],
                "response_format": { "type": "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const resultString = data.choices[0].message.content;

        try {
            const result = JSON.parse(resultString);
            return NextResponse.json(result);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', resultString);
            throw new Error('AI generated an invalid response format.');
        }

    } catch (error: any) {
        console.error('PDF Conversion Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to convert PDF text to post' },
            { status: 500 }
        );
    }
}
