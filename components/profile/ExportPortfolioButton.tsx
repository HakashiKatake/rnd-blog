'use client'

import { useState } from 'react'
import { Button } from '@/components/retroui/Button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ExportPortfolioButtonProps {
    userId: string
}

export function ExportPortfolioButton({ userId }: ExportPortfolioButtonProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            // Trigger download by intentionally navigating (or fetching blob)
            // Since it's a file download with Content-Disposition attachment, window.location works
            // but fetch provides better error handling.

            const response = await fetch(`/api/portfolio/export?userId=${userId}`)

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Export API Error:', errorText)
                if (response.status === 403) {
                    toast.error("You can only export your own portfolio.")
                    return
                }
                throw new Error(`Export failed: ${errorText}`)
            }

            // Convert to blob and download
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            // Filename is usually set by header, but we can default
            a.download = `spark-portfolio-${userId}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success('Portfolio exported successfully!')
        } catch (error) {
            console.error(error)
            toast.error('Failed to generate portfolio. Please try again.')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2"
        >
            {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
            {isExporting ? 'Generating PDF...' : 'Export Portfolio'}
        </Button>
    )
}
