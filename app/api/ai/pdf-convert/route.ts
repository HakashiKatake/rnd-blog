import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { pdfBase64, fileName } = await req.json();

        if (!pdfBase64) {
            return NextResponse.json(
                { error: 'PDF data is required' },
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
        
        I have provided you with a research paper or engineering project PDF file named "${fileName || 'document.pdf'}".
        Your task is to read this PDF and convert it into a high-quality, engaging, and professional research post.
        
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
        4. If there are any diagrams or images mentioned, describe them or use placeholders if necessary, but focus on the textual content.
        5. The excerpt must be under 180 characters.
        6. The title must be under 100 characters.`;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": `data:application/pdf;base64,${pdfBase64}`
                                }
                            }
                        ]
                    }
                ],
                "response_format": { "type": "json_object" }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let resultString = data.choices[0].message.content;

        // Remove markdown code blocks if the AI included them
        if (resultString.includes('```')) {
            resultString = resultString.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        try {
            const result = JSON.parse(resultString);
            return NextResponse.json(result);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', resultString);
            return NextResponse.json(
                {
                    error: 'AI generated an invalid response format.',
                    details: resultString.substring(0, 500)
                },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('PDF Conversion Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to convert PDF to post' },
            { status: 500 }
        );
    }
}
