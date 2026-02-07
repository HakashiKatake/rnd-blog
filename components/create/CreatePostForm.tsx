'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Button } from '@/components/retroui/Button'
import { Input } from '@/components/retroui/Input'
import { toast } from 'sonner'
import { Code, Sparkles, Image as ImageIcon, Loader2, UploadCloud, FileText } from 'lucide-react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const TAGS = [
  'ai-ml',
  'iot',
  'web3',
  'security',
  'devops',
  'mobile',
  'cloud',
]

interface PostFormProps {
  userId: string
  initialData?: {
    title: string
    excerpt: string
    content: string
    tags: string[]
    coverImageUrl?: string
  }
  postId?: string // If present, it's an edit
}

export function PostForm({ userId, initialData, postId }: PostFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(true) // Default to true
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [signature, setSignature] = useState('')

  const isEditing = !!postId

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    tags: initialData?.tags || [],
    coverImageUrl: initialData?.coverImageUrl || '',
  })

  // Initialize char counts based on initialData
  const [charCounts, setCharCounts] = useState({
    title: initialData?.title?.length || 0,
    excerpt: initialData?.excerpt?.length || 0,
    content: initialData?.content?.length || 0,
  })

  const handleChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field in charCounts) {
      setCharCounts((prev) => ({ ...prev, [field]: value.length }))
    }
  }

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null)
  const [isImproving, setIsImproving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isConvertingPdf, setIsConvertingPdf] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingCover(true)
    const toastId = toast.loading('Uploading cover image...')

    try {
      const res = await fetch(`/api/upload?type=image`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()

      if (data.secure_url) {
        handleChange("coverImageUrl", data.secure_url)
        toast.success("Cover image uploaded!", { id: toastId })
      }
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to upload cover image", { id: toastId })
    } finally {
      setIsUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const toastId = toast.loading('Uploading media...')

    try {
      // Determine type for Cloudinary
      // Check MIME type or file extension (some browsers don't set MIME for .mov correctly)
      const isVideo = file.type.startsWith('video/') ||
        file.name.toLowerCase().endsWith('.mov') ||
        file.name.toLowerCase().endsWith('.mp4') ||
        file.name.toLowerCase().endsWith('.avi');

      const type = isVideo ? 'video' : 'image';

      // Send file directly with type param
      const res = await fetch(`/api/upload?type=${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Upload failed')
      }

      const data = await res.json()

      if (data.secure_url) {
        const isImage = data.resource_type === 'image'
        const mediaMarkdown = isImage
          ? `\n![Image](${data.secure_url})\n`
          : `\n![Video](${data.secure_url})\n`

        handleChange("content", formData.content + mediaMarkdown)
        toast.success("Media added!", { id: toastId })
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to upload media", { id: toastId })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    setIsConvertingPdf(true)
    const toastId = toast.loading('Extracting text from PDF...')

    try {
      // 1. Extract text from PDF
      const extractRes = await fetch('/api/ai/pdf-to-text', {
        method: 'POST',
        body: file,
      })

      if (!extractRes.ok) {
        const err = await extractRes.json()
        throw new Error(err.error || 'Failed to extract text')
      }

      const { text } = await extractRes.json()

      toast.loading('Converting to post format...', { id: toastId })

      // 2. Convert text to post
      const convertRes = await fetch('/api/ai/pdf-convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (!convertRes.ok) {
        const err = await convertRes.json()
        throw new Error(err.error || 'Failed to convert PDF')
      }

      const postData = await convertRes.json()

      // 3. Update form data
      setFormData({
        ...formData,
        title: postData.title || formData.title,
        excerpt: postData.excerpt || formData.excerpt,
        content: postData.content || formData.content,
        tags: postData.tags || formData.tags,
      })

      setCharCounts({
        title: postData.title?.length || 0,
        excerpt: postData.excerpt?.length || 0,
        content: postData.content?.length || 0,
      })

      toast.success('PDF successfully converted to post!', { id: toastId })
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to process PDF', { id: toastId })
    } finally {
      setIsConvertingPdf(false)
      if (pdfInputRef.current) pdfInputRef.current.value = ''
    }
  }

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title || formData.title.length < 10) {
      toast.error('Title must be at least 10 characters')
      return
    }

    if (!formData.content || formData.content.length < 200) {
      toast.error(`Content must be at least 200 characters. Current: ${formData.content.length}`)
      return
    }

    setIsTermsOpen(true)
  }

  const handleFinalSubmit = async () => {
    if (!signature || signature.trim().length < 3) {
      toast.error("Please sign your name to agree.")
      return
    }

    setIsSubmitting(true)

    try {
      const url = isEditing ? `/api/posts/${postId}` : '/api/posts'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(isEditing ? 'Post updated successfully!' : 'Post created successfully!')
        setIsTermsOpen(false) // Close dialog

        setTimeout(() => {
          if (isEditing) {
            router.push(`/post/${data.post?.slug?.current || 'explore'}`)
            router.refresh()
          } else {
            router.push(`/post/${data.slug}`)
          }
        }, 1000)

      } else {
        const errorData = await response.json()
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} post: ${errorData.error || 'Unknown error'}`)
        setIsSubmitting(false) // Stop loading on error
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleInitialSubmit} className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor */}
          <div className="space-y-6">
            <h2 className="font-head text-2xl font-bold">{isEditing ? 'Edit Post' : 'Write'}</h2>

            {/* Title */}
            <div>
              <label className="block font-semibold mb-2">
                Title *{' '}
                <span className="text-muted-foreground text-sm">
                  ({charCounts.title}/100)
                </span>
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="What did you build?"
                maxLength={100}
                required
                className="w-full"
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block font-semibold mb-2">Cover Image</label>
              <div className="border-2 border-dashed border-black/20 rounded-md p-4 text-center hover:bg-muted/10 transition-colors">
                <input
                  type="file"
                  ref={coverInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleCoverUpload}
                />

                {formData.coverImageUrl ? (
                  <div className="relative w-full h-48 rounded-md overflow-hidden border-2 border-black group">
                    <Image
                      src={formData.coverImageUrl}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange("coverImageUrl", "")}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => coverInputRef.current?.click()}
                        className="text-white border-white hover:bg-white/20"
                      >
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => coverInputRef.current?.click()}>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      {isUploadingCover ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
                    </div>
                    <p className="text-sm font-medium">Click to upload cover image</p>
                    <p className="text-xs text-muted-foreground">Recommended: 1200x630px</p>
                  </div>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block font-semibold mb-2">
                Excerpt{' '}
                <span className="text-muted-foreground text-sm">
                  ({charCounts.excerpt}/200)
                </span>
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                placeholder="Brief summary of your work..."
                maxLength={200}
                rows={3}
                className="w-full border-brutal p-3 focus:ring-primary font-body"
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold">
                  Content * (Markdown){' '}
                  <span className="text-muted-foreground text-sm">
                    ({charCounts.content} chars, min 200)
                  </span>
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 p-2 bg-muted/10 border-2 border-black rounded-t-xl gap-3">
                  {/* File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleUpload}
                  />

                  {/* Left: Editing Tools */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border-2 border-transparent hover:border-black hover:bg-white transition-all rounded-md"
                      title="Upload Image or Video"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      <span className="sm:inline">Media</span>
                    </button>

                    <input
                      type="file"
                      ref={pdfInputRef}
                      className="hidden"
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                    />
                    <button
                      type="button"
                      onClick={() => pdfInputRef.current?.click()}
                      disabled={isConvertingPdf}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border-2 border-transparent hover:border-black hover:bg-white transition-all rounded-md"
                      title="Import content from PDF"
                    >
                      {isConvertingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      <span className="sm:inline">Import PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const codeBlockTemplate = "\n```javascript\n// Your code here\n```\n";
                        handleChange("content", formData.content + codeBlockTemplate);
                        toast.success("Code block added!");
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border-2 border-transparent hover:border-black hover:bg-white transition-all rounded-md"
                      title="Insert Code Block"
                    >
                      <Code className="w-4 h-4" /> <span className="sm:inline">Code</span>
                    </button>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 sm:border-l-2 sm:border-black/10 sm:pl-2">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.content || formData.content.length < 50) {
                          toast.error("Please write at least 50 characters before improving.");
                          return;
                        }

                        setIsImproving(true);
                        setAiSuggestions(null);

                        try {
                          const res = await fetch("/api/ai/improve", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ content: formData.content }),
                          });

                          if (!res.ok) {
                            const err = await res.json();
                            throw new Error(err.error || "Failed to improve");
                          }

                          const data = await res.json();
                          handleChange("content", data.content);

                          if (data.suggestions) {
                            setAiSuggestions(data.suggestions);
                            toast.success("Content improved! Check suggestions below.");
                          } else {
                            toast.success("Content improved!");
                          }

                        } catch (error: any) {
                          toast.error(error.message);
                        } finally {
                          setIsImproving(false);
                        }
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold bg-primary text-white border-2 border-primary hover:bg-primary/90 hover:border-black transition-all rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-0 hover:translate-y-[2px]"
                    >
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                      {isImproving ? 'Improving...' : 'Fix Grammar'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold border-2 border-black transition-all rounded-md ${showPreview ? 'bg-black text-white' : 'bg-transparent hover:bg-black/5'}`}
                    >
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  </div>
                </div>
              </div>
              {isImproving ? (
                <div className="w-full border-brutal p-4 h-[400px]">
                  <div className="space-y-4">
                    <div className="h-4 animate-shimmer w-3/4 rounded"></div>
                    <div className="h-4 animate-shimmer w-full rounded"></div>
                    <div className="h-4 animate-shimmer w-5/6 rounded"></div>
                    <div className="h-4 animate-shimmer w-full rounded"></div>
                    <br />
                    <div className="h-32 animate-shimmer w-full rounded"></div>
                    <br />
                    <div className="h-4 animate-shimmer w-2/3 rounded"></div>
                  </div>
                </div>
              ) : (
                <textarea
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="# Your Research Here\n\nExplain your project methodology, results, and key findings...\n\n```python\n# Include code snippets\nprint('Hello SPARK!')\n```"
                  rows={20}
                  required
                  className="w-full border-brutal p-4 font-mono text-sm focus:ring-primary rounded-t-none border-t-0"
                />
              )}

              {aiSuggestions && !isImproving && (
                <div className="mt-4 p-4 border-2 border-primary bg-primary/5 rounded-none shadow-brutal-sm">
                  <h3 className="font-bold flex items-center gap-2 mb-2 text-primary">
                    <Sparkles className="w-4 h-4" />
                    AI Suggestions for Improvement
                  </h3>
                  <div className="whitespace-pre-wrap text-sm text-foreground/80 font-mono">
                    {aiSuggestions}
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block font-semibold mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 border-2 border-black text-sm font-semibold transition-all ${formData.tags.includes(tag)
                      ? 'bg-primary text-primary-foreground shadow-brutal'
                      : 'bg-background hover:shadow-brutal-sm'
                      }`}
                  >
                    {tag.toUpperCase().replace('-', '/')}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.title ||
                  !formData.content ||
                  formData.content.length < 200
                }
                className="bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm"
              >
                {isSubmitting ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Post' : 'Submit for Review')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-brutal"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <h2 className="font-head text-2xl font-bold mb-4">Preview</h2>
              <div className="border-brutal p-6 bg-card">
                <h1 className="font-head text-3xl font-bold mb-4">
                  {formData.title || 'Your Title Here'}
                </h1>

                {formData.coverImageUrl && (
                  <div className="relative w-full h-64 mb-6 rounded-md overflow-hidden border-2 border-black">
                    <Image
                      src={formData.coverImageUrl}
                      alt="Cover Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {formData.excerpt && (
                  <p className="text-muted-foreground mb-6 italic">
                    {formData.excerpt}
                  </p>
                )}
                <div className="prose prose-brutal max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      },
                      img({ node, ...props }: any) {
                        if (props.alt === 'Video') {
                          return (
                            <video
                              src={props.src}
                              controls
                              className="w-full rounded-md border-2 border-black my-4"
                            />
                          )
                        }
                        return (
                          <img
                            {...props}
                            className="w-full rounded-md border-2 border-black my-4"
                            alt={props.alt}
                          />
                        )
                      },
                    }}
                  >
                    {formData.content || '*Write something to see a preview...*'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="max-w-md border-brutal bg-card">
          <DialogHeader>
            <DialogTitle className="font-head text-2xl">Community Pledge ✍️</DialogTitle>
            <DialogDescription className="font-sans text-muted-foreground">
              Before publishing, please agree to our community guidelines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/20 border-2 border-black/10 rounded-md text-sm space-y-2">
              <p>I certify that this post:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Contains <strong>NO vulgarity, hate speech, or harassment</strong>.</li>
                <li>Is original content or properly cited.</li>
                <li>Respects the intellectual property of others.</li>
              </ul>
              <p className="items-center font-bold text-destructive mt-2">
                ⚠️ Violations will result in immediate ban.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">Sign with your name to agree:</label>
              <Input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your full name..."
                className="font-cursive text-2xl text-primary border-b-2 border-primary border-t-0 border-x-0 rounded-none px-0 focus:ring-0 focus:border-b-4 transition-all placeholder:font-sans placeholder:text-base placeholder:text-muted-foreground/50"
                style={{ fontFamily: '"Brush Script MT", "Comic Sans MS", cursive' }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTermsOpen(false)} className="border-brutal">
              Cancel
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting || signature.length < 3}
              className="bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm"
            >
              {isSubmitting ? 'Publishing...' : 'I Agree & Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
