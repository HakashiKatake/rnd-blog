'use client'

import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Button } from '@/components/retroui/Button'
import { Download } from 'lucide-react'
import { useCallback } from 'react'
import { toast } from 'sonner'

interface DownloadPdfButtonProps {
    post: {
        title: string
        content: string
        author: {
            name: string
        }
    }
}

export function DownloadPdfButton({ post }: DownloadPdfButtonProps) {
    const handleDownload = useCallback(async () => {
        const contentElement = document.querySelector('.prose')
        if (!contentElement) {
            toast.error('Could not find post content')
            return
        }

        const toastId = toast.loading('Generating PDF...')

        try {
            // 1. Create a clean container for the PDF
            const container = document.createElement('div')
            container.style.width = '800px'
            container.style.padding = '60px' // Generous margins
            container.style.backgroundColor = '#ffffff'
            container.style.position = 'absolute'
            container.style.left = '-9999px'
            container.style.top = '0'
            container.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif'
            container.style.color = '#000000'

            // 2. Add Header (Title + Author)
            const header = document.createElement('div')
            header.style.borderBottom = '2px solid #000'
            header.style.marginBottom = '40px'
            header.style.paddingBottom = '20px'

            const title = document.createElement('h1')
            title.innerText = post.title
            title.style.fontSize = '36px'
            title.style.fontWeight = 'bold'
            title.style.marginBottom = '10px'
            title.style.lineHeight = '1.2'
            title.style.color = '#000000'
            header.appendChild(title)

            const author = document.createElement('p')
            author.innerText = `By ${post.author.name}`
            author.style.fontSize = '18px'
            author.style.color = '#444'
            header.appendChild(author)

            container.appendChild(header)

            // 3. Add Content (Clone of the rendered prose)
            const contentClone = contentElement.cloneNode(true) as HTMLElement

            // Fix prose styles for print
            contentClone.style.color = '#000000'

            // Force code blocks to look good
            const codeBlocks = contentClone.querySelectorAll('pre, code')
            codeBlocks.forEach((block) => {
                if (block instanceof HTMLElement) {
                    block.style.backgroundColor = '#f4f4f5'
                    block.style.border = '1px solid #000'
                    block.style.color = '#000'
                    // Ensure padding in code blocks
                    if (block.tagName === 'PRE') {
                        block.style.padding = '16px'
                        block.style.borderRadius = '8px'
                    }
                }
            })

            // Force headers to be black
            const headers = contentClone.querySelectorAll('h1, h2, h3, h4, h5, h6')
            headers.forEach((h) => {
                if (h instanceof HTMLElement) h.style.color = '#000'
            })

            container.appendChild(contentClone)

            // 4. Add Watermark
            // We create a wrapper to hold the watermark fully covering the content area
            const watermarkWrapper = document.createElement('div')
            watermarkWrapper.style.position = 'absolute'
            watermarkWrapper.style.top = '0'
            watermarkWrapper.style.left = '0'
            watermarkWrapper.style.width = '100%'
            watermarkWrapper.style.height = '100%'
            watermarkWrapper.style.overflow = 'hidden'
            watermarkWrapper.style.pointerEvents = 'none'
            watermarkWrapper.style.zIndex = '0'

            const watermark = document.createElement('div')
            watermark.innerText = 'SPARK ⚡'
            watermark.style.position = 'absolute'
            watermark.style.top = '50%'
            watermark.style.left = '50%'
            watermark.style.transform = 'translate(-50%, -50%) rotate(-45deg)'
            watermark.style.fontSize = '120px'
            watermark.style.fontWeight = '900'
            watermark.style.color = '#000000'
            watermark.style.opacity = '0.05' // Very subtle
            watermark.style.whiteSpace = 'nowrap'

            watermarkWrapper.appendChild(watermark)

            // Make content relative so it sits on top of absolute watermark
            container.style.position = 'relative'
            container.insertBefore(watermarkWrapper, container.firstChild)

            // Ensure content is above watermark
            header.style.position = 'relative'
            header.style.zIndex = '1'
            contentClone.style.position = 'relative'
            contentClone.style.zIndex = '1'

            document.body.appendChild(container)

            // 5. Capture
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            })

            // 6. PDF Generation
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            const imgData = canvas.toDataURL('image/png')
            const imgWidth = pdfWidth
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            let heightLeft = imgHeight
            let position = 0

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
            heightLeft -= pdfHeight

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
                heightLeft -= pdfHeight
            }

            pdf.save(`${post.title.replace(/\s+/g, '_')}_Spark.pdf`)

            // Cleanup
            document.body.removeChild(container)
            toast.success('PDF Downloaded!')

        } catch (error) {
            console.error(error)
            toast.error('Failed to generate PDF')
        } finally {
            toast.dismiss(toastId)
        }
    }, [post.title, post.author.name])

    return (
        <Button
            variant="outline"
            size="sm"
            className="border-brutal shadow-brutal hover:shadow-brutal-sm flex items-center gap-2"
            onClick={handleDownload}
        >
            <Download className="w-4 h-4" />
            Save as PDF
        </Button>
    )
}
