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

        const prompt = `You are an expert technical editor and critique partner.
    
    Your task is to:
    1. **Grammar & Polish**: Correct grammatical, spelling, and punctuation errors. 
       - **IMPORTANT**: If the text contains informal language, slang, or mixed languages (e.g., Hinglish), **rewrite those specific parts into clear, professional English** while keeping the original meaning and sentence structure.
       - Do not change the underlying code or technical logic.
    2. **Structure Analysis**: Analyze the content formatting against an ideal blog structure.
    
    **OUTPUT FORMAT**:
    Return the **polished info-dense content first**.
    Then, append this exact separator: <<<SUGGESTIONS>>>
    Then, list specific suggestions for the user to improve formatting.
    
    **CRITICAL RULES:**
    - Do NOT reformat the content yourself (do not add H1/H2 if they aren't there).
    - Do NOT include the suggestions in the first part.
    
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

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let fullResponse = data.choices[0].message.content;

        // Clean up markdown code blocks if present
        if (fullResponse.startsWith('```markdown')) {
            fullResponse = fullResponse.replace(/^```markdown\s*/, '').replace(/```\s*$/, '');
        } else if (fullResponse.startsWith('```')) {
            fullResponse = fullResponse.replace(/^```\s*/, '').replace(/```\s*$/, '');
        }

        // Split content and suggestions
        const parts = fullResponse.split('<<<SUGGESTIONS>>>');
        const improvedContent = parts[0].trim();
        const suggestions = parts[1] ? parts[1].trim() : null;

        return NextResponse.json({
            content: improvedContent,
            suggestions: suggestions
        });
    } catch (error: any) {
        console.error('AI Improvement Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to improve content with AI' },
            { status: 500 }
        );
    }
}
