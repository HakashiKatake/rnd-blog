import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
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

        const prompt = `You are an expert technical editor. Rewrite the following engineering research post content to be more professional, engaging, and clear. 
    Maintain all technical details and code snippets accurately. 
    Use proper Markdown formatting. 
    Make it sound like a high-quality engineering blog post.
    CRITICAL: If the content contains ANY code, programming logic, terminal commands, or technical syntax, you MUST strictly format them using Markdown code blocks (e.g., \`\`\`python ... \`\`\`). Do NOT leave code as plain text. Detect the language and specify it.
    CRITICAL: Do NOT wrap the entire response in a code block (like \`\`\`markdown). Only wrap specific code snippets in code blocks.
    Return the raw markdown text directly.
    
    Content to improve:
    ${content}`;

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
                ]
            })
        });

        // If the first model fails or isn't available, we could implement fallback, but let's check the response first.
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let improvedContent = data.choices[0].message.content;

        // Clean up if AI wrapped everything in a code block despite instructions
        improvedContent = improvedContent.trim();
        if (improvedContent.startsWith('```markdown')) {
            improvedContent = improvedContent.replace(/^```markdown\s*/, '').replace(/```\s*$/, '');
        } else if (improvedContent.startsWith('```')) {
            improvedContent = improvedContent.replace(/^```\s*/, '').replace(/```\s*$/, '');
        }

        return NextResponse.json({ content: improvedContent });
    } catch (error: any) {
        console.error('AI Improvement Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to improve content with AI' },
            { status: 500 }
        );
    }
}
