import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with env variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

import { Readable } from 'stream';

export async function POST(req: NextRequest) {
    try {


        // Get resource type from query param (video or image)
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type') || 'auto';

        const arrayBuffer = await req.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload using a Promise wrapper
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: type as any,
                    folder: 'rnd-blog',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(buffer);
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}
