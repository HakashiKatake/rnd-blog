import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import crypto from 'crypto'

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

export async function POST(request: NextRequest) {
    try {
        // 1. Verify User
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Verify Config
        if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
            console.error('Missing Cloudinary configuration')
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            )
        }

        // 3. Get File from FormData
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // 4. Prepare Cloudinary Upload
        // We'll use signed upload
        const timestamp = Math.round(new Date().getTime() / 1000)

        // Parameters to sign
        const paramsToSign = `timestamp=${timestamp}${API_SECRET}`

        // Generate signature (SHA-1)
        const signature = crypto
            .createHash('sha1')
            .update(paramsToSign)
            .digest('hex')

        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        uploadFormData.append('api_key', API_KEY)
        uploadFormData.append('timestamp', timestamp.toString())
        uploadFormData.append('signature', signature)

        // 5. Upload to Cloudinary
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

        const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: uploadFormData,
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Cloudinary API error:', data)
            return NextResponse.json({ error: data.error?.message || 'Upload failed' }, { status: response.status })
        }

        return NextResponse.json({
            url: data.secure_url,
            public_id: data.public_id
        })

    } catch (error) {
        console.error('Upload handler error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
