import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';

export async function POST(req: NextRequest) {
    try {
        const arrayBuffer = await req.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();

        if (!data.text || !data.text.trim()) {
            return NextResponse.json(
                { error: 'No text extracted from PDF. Please ensure the PDF contains text and is not just an image.' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            text: data.text,
        });
    } catch (error: any) {
        console.error('PDF Extraction Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to extract text from PDF' },
            { status: 500 }
        );
    }
}
