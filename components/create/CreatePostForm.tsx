'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Button } from '@/components/retroui/Button'
import { Input } from '@/components/retroui/Input'
import { Badge } from '@/components/retroui/Badge'

const TAGS = [
  'ai-ml',
  'iot',
  'web3',
  'security',
  'devops',
  'mobile',
  'cloud',
]

export function CreatePostForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // DEBUG: Log when component mounts
  useEffect(() => {
    console.log('🚀 CreatePostForm mounted! UserId:', userId)
    console.log('🔧 JavaScript is working!')
  }, [userId])

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    tags: [] as string[],
  })

  const [charCounts, setCharCounts] = useState({
    title: 0,
    excerpt: 0,
    content: 0,
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
    
    console.log('Form submitted!', {
      title: formData.title,
      contentLength: formData.content.length,
      userId,
    })
    
    // Validation
    if (!formData.title || formData.title.length < 10) {
      alert('Title must be at least 10 characters')
      return
    }
    
    if (!formData.content || formData.content.length < 200) {
      alert(`Content must be at least 200 characters. Current: ${formData.content.length}`)
      return
    }
    
    setIsSubmitting(true)

    try {
      console.log('Sending POST request to /api/posts...')
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const { slug } = await response.json()
        console.log('Post created successfully! Slug:', slug)
        router.push(`/post/${slug}`)
      } else {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        alert(`Failed to create post: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert(`An error occurred: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="space-y-6">
          <h2 className="font-head text-2xl font-bold">Write</h2>

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
                  key={tag}
                  type="button"
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
              onClick={() => {
                console.log('🔘 Submit button clicked!')
                console.log('📝 Form data:', {
                  titleLength: formData.title.length,
                  contentLength: formData.content.length,
                  tagsCount: formData.tags.length,
                })
                console.log('✅ Button enabled:', !isSubmitting && formData.title && formData.content && formData.content.length >= 200)
              }}
              className="bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/explore')}
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
