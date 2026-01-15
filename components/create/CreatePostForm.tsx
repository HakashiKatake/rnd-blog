'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Button } from '@/components/retroui/Button'
import { Input } from '@/components/retroui/Input'
import { toast } from 'sonner' // Using sonner for notifications
import { Code, Sparkles } from 'lucide-react'

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

  const handleSubmit = async (e: React.FormEvent) => {
    // ... (unchanged)
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
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ... in return ...


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

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold">
                Content * (Markdown){' '}
                <span className="text-muted-foreground text-sm">
                  ({charCounts.content} chars, min 200)
                </span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const codeBlockTemplate = "\n```javascript\n// Your code here\n```\n";
                    handleChange("content", formData.content + codeBlockTemplate);
                    toast.success("Code block added!");
                  }}
                  className="text-primary hover:underline text-sm flex items-center gap-1"
                >
                  <Code className="w-4 h-4" /> Code Block
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.content || formData.content.length < 50) {
                      toast.error("Please write at least 50 characters before improving.");
                      return;
                    }

                    setIsImproving(true);
                    setAiSuggestions(null); // Clear previous suggestions

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
                  className="text-primary hover:underline text-sm flex items-center gap-1"
                >
                  {isImproving ? 'Improving...' : '✨ Improve with AI'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-primary hover:underline text-sm"
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
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
                className="w-full border-brutal p-4 font-mono text-sm focus:ring-primary"
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
