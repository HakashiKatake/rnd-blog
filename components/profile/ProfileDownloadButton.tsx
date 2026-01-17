
'use client'

import React, { useState, useEffect } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { ProfilePDF } from './ProfilePDF'
import { Button } from '@/components/retroui/Button'
import { Download } from 'lucide-react'

interface ProfileDownloadButtonProps {
    user: any
    posts: any[]
}

export default function ProfileDownloadButton({ user, posts }: ProfileDownloadButtonProps) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) return null // PDF generation only works on client

    return (
        <PDFDownloadLink
            document={<ProfilePDF user={user} posts={posts} />}
            fileName={`${user.name?.replace(/\s+/g, '_') || 'profile'}_spark_cv.pdf`}
            className="w-full sm:w-auto"
        >
            {({ blob, url, loading, error }) => {
                if (error) {
                    console.error("PDF Generation Error:", error)
                    return <span className="text-red-500 text-sm font-bold">PDF Error (Check Console)</span>
                }
                return (
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto border-brutal flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        <Download className="w-4 h-4" />
                        {loading ? 'Preparing PDF...' : 'Download Resume'}
                    </Button>
                )
            }}
        </PDFDownloadLink>
    )
}
