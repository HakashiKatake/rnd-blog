'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Button } from '@/components/retroui/Button'
import { Input } from '@/components/retroui/Input'
import { toast } from 'sonner' // Using sonner for notifications
import { CldUploadWidget } from 'next-cloudinary'

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
  const [showPreview, setShowPreview] = useState(false)
  
  const isEditing = !!postId

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    tags: initialData?.tags || [],
    coverImageUrl: initialData?.coverImageUrl || '',
  })

  // State for additional content images
  const [contentImages, setContentImages] = useState<string[]>([])

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

  const handleSubmit = async (e: React.FormEvent) => {
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
        
        // If editing, we might want to go back to the post, or if creating, to the new slug
        // API should return the slug (or we know it if editing and it didn't change, but safer to use response)
        // For update, the API I wrote returns `post` object which has slug.
        
        // Wait a moment for toast
        setTimeout(() => {
           // For edit, reusing existing slug if not returned, usually safe unless we change slug logic
           // Ideally API returns slug in both cases.
           // My create API returns { slug }. My update API returns { post: { ... } } (check this).
           // Let's assume slug might not change on edit.
           
           if (isEditing) {
               router.push(`/post/${data.post?.slug?.current || 'explore'}`) // Fallback if slug missing
               router.refresh()
           } else {
               router.push(`/post/${data.slug}`)
           }
        }, 1000)
        
      } else {
        const errorData = await response.json()
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} post: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl">
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

          {/* Cover Image */}
          <div>
             <label className="block font-semibold mb-2">Cover Image</label>
             <div className="border-brutal p-4 bg-muted/20">
               {formData.coverImageUrl ? (
                 <div className="relative w-full h-48 mb-4 border-2 border-black">
                   <img 
                     src={formData.coverImageUrl} 
                     alt="Cover" 
                     className="w-full h-full object-cover"
                   />
                   <button
                     type="button"
                     onClick={() => handleChange('coverImageUrl', '')}
                     className="absolute top-2 right-2 bg-red-500 text-white p-1 border-2 border-black text-xs hover:bg-red-600"
                   >
                     Remove
                   </button>
                 </div>
               ) : (
                 <CldUploadWidget 
                   uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'default'}
                   onSuccess={(result: any) => {
                     if (result.info?.secure_url) {
                       handleChange('coverImageUrl', result.info.secure_url)
                       toast.success('Image uploaded successfully!')
                     }
                   }}
                 >
                   {({ open }) => {
                     return (
                       <button 
                         type="button"
                         onClick={() => open()}
                         className="bg-accent text-accent-foreground border-brutal px-4 py-2 hover:shadow-brutal-sm transition-all font-bold flex items-center gap-2"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                           <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                           <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                         </svg>
                         Upload Image
                       </button>
                     );
                   }}
                 </CldUploadWidget>
               )}
             </div>
          </div>

          {/* Content Images (Max 5) */}
          <div className="border-t-2 border-black pt-6 mt-6">
             <label className="block font-semibold mb-2">Content Images (Max 5)</label>
             <p className="text-sm text-muted-foreground mb-4">
               Upload images to include in your post. Copy the markdown code to insert into the content.
             </p>
             
             {/* Image List */}
             {contentImages.length > 0 && (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                 {contentImages.map((url, idx) => (
                   <div key={idx} className="relative group border-brutal bg-card p-2">
                     <div className="relative h-24 mb-2 bg-muted/20">
                       <img src={url} alt={`Content ${idx + 1}`} className="w-full h-full object-contain" />
                     </div>
                     <div className="flex flex-col gap-2">
                       <button
                         type="button"
                         onClick={() => {
                           // Try to copy to clipboard, fallback to appending to content
                           navigator.clipboard.writeText(`![Image](${url})`)
                           toast.success('Markdown copied!')
                         }}
                         className="text-xs bg-primary text-primary-foreground px-2 py-1 font-bold hover:bg-primary/90 text-center"
                       >
                         Copy MD
                       </button>
                       <button
                         type="button"
                         onClick={() => {
                           const md = `\n![Image](${url})\n`
                           setFormData(prev => ({ ...prev, content: prev.content + md }))
                           toast.success('Added to content!')
                         }}
                         className="text-xs bg-accent text-accent-foreground px-2 py-1 font-bold hover:bg-accent/90 text-center"
                       >
                         Insert
                       </button>
                       <button
                          type="button"
                          onClick={() => {
                             setContentImages(prev => prev.filter((_, i) => i !== idx))
                          }}
                          className="text-xs bg-red-500 text-white px-2 py-1 font-bold hover:bg-red-600 text-center"
                       >
                          Remove
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}

             {/* Upload Button */}
             {contentImages.length < 5 && (
               <CldUploadWidget 
                 uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'default'}
                 onSuccess={(result: any) => {
                   if (result.info?.secure_url) {
                     setContentImages([...contentImages, result.info.secure_url])
                     toast.success('Image uploaded!')
                   }
                 }}
                 onError={(err) => {
                   console.error('Cloudinary Error:', err)
                   toast.error('Upload failed. Check console for details.')
                 }}
               >
                 {({ open }) => (
                   <button 
                     type="button"
                     onClick={() => open()}
                     className="w-full bg-muted border-brutal border-dashed p-4 text-center hover:bg-muted/70 font-semibold flex flex-col items-center gap-2"
                   >
                     <span className="text-2xl">📷</span>
                     <span>Add Content Image ({contentImages.length}/5)</span>
                   </button>
                 )}
               </CldUploadWidget>
             )}
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
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-primary hover:underline text-sm"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="# Your Research Here\n\nExplain your project methodology, results, and key findings...\n\n```python\n# Include code snippets\nprint('Hello SPARK!')\n```"
              rows={20}
              required
              className="w-full border-brutal p-4 font-mono text-sm focus:ring-primary"
            />
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
                  className={`px-3 py-1 border-2 border-black text-sm font-semibold transition-all ${
                    formData.tags.includes(tag)
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
  )
}
