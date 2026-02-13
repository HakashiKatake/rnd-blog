"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { toast } from "sonner";
import {
  Code,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  FileText,
  Eye,
  EyeOff,
  LayoutTemplate,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const TAGS = ["ai-ml", "iot", "web3", "security", "devops", "mobile", "cloud"];

interface PostFormProps {
  userId: string;
  initialData?: {
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
    coverImageUrl?: string;
  };
  postId?: string; // If present, it's an edit
}

export function PostForm({ userId, initialData, postId }: PostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // Default to true
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [signature, setSignature] = useState("");

  const isEditing = !!postId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    tags: initialData?.tags || [],
    coverImageUrl: initialData?.coverImageUrl || "",
  });

  // Initialize char counts based on initialData
  const [charCounts, setCharCounts] = useState({
    title: initialData?.title?.length || 0,
    excerpt: initialData?.excerpt?.length || 0,
    content: initialData?.content?.length || 0,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in charCounts) {
      setCharCounts((prev) => ({ ...prev, [field]: value.length }));
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [isImproving, setIsImproving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isConvertingPdf, setIsConvertingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Helper to insert text at cursor position
  const insertTextAtCursor = (textToInsert: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    const newContent = before + textToInsert + after;

    handleChange("content", newContent);

    // Restore cursor position after the inserted text
    // Need to use setTimeout to allow state update to happen first
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = start + textToInsert.length;
        textareaRef.current.selectionEnd = start + textToInsert.length;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    const toastId = toast.loading("Uploading cover image...");

    try {
      const res = await fetch(`/api/upload?type=image`, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      if (data.secure_url) {
        handleChange("coverImageUrl", data.secure_url);
        toast.success("Cover image uploaded!", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload cover image", { id: toastId });
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading media...");

    try {
      // Determine type for Cloudinary
      const isVideo =
        file.type.startsWith("video/") ||
        file.name.toLowerCase().endsWith(".mov") ||
        file.name.toLowerCase().endsWith(".mp4") ||
        file.name.toLowerCase().endsWith(".avi");

      const type = isVideo ? "video" : "image";

      const res = await fetch(`/api/upload?type=${type}`, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Upload failed");
      }

      const data = await res.json();

      if (data.secure_url) {
        const isImage = data.resource_type === "image";
        const mediaMarkdown = isImage
          ? `\n![Image](${data.secure_url})\n`
          : `\n![Video](${data.secure_url})\n`;

        insertTextAtCursor(mediaMarkdown);
        toast.success("Media added!", { id: toastId });
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload media", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setIsConvertingPdf(true);
    const toastId = toast.loading("Reading PDF...");

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64String = (reader.result as string).split(",")[1];
          resolve(base64String);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const pdfBase64 = await base64Promise;

      toast.loading("Converting to post format (AI)...", { id: toastId });

      const convertRes = await fetch("/api/ai/pdf-convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfBase64,
          fileName: file.name,
        }),
      });

      if (!convertRes.ok) {
        const err = await convertRes.json().catch(() => ({}));
        throw new Error(err.error || "AI conversion failed");
      }

      const postData = await convertRes.json();

      setFormData({
        ...formData,
        title: postData.title || formData.title,
        excerpt: postData.excerpt || formData.excerpt,
        content: postData.content || formData.content,
        tags: postData.tags || formData.tags,
      });

      setCharCounts({
        title: postData.title?.length || 0,
        excerpt: postData.excerpt?.length || 0,
        content: postData.content?.length || 0,
      });

      toast.success("PDF successfully converted to post!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to process PDF", { id: toastId });
    } finally {
      setIsConvertingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || formData.title.length < 10) {
      toast.error("Title must be at least 10 characters");
      return;
    }

    if (!formData.content || formData.content.length < 200) {
      toast.error(
        `Content must be at least 200 characters. Current: ${formData.content.length}`,
      );
      return;
    }

    setIsTermsOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (!signature || signature.trim().length < 3) {
      toast.error("Please sign your name to agree.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/posts/${postId}` : "/api/posts";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          isEditing
            ? "Post updated successfully!"
            : "Post created successfully!",
        );
        setIsTermsOpen(false);

        setTimeout(() => {
          if (isEditing) {
            router.push(`/post/${data.post?.slug?.current || "explore"}`);
            router.refresh();
          } else {
            router.push(`/post/${data.slug}`);
          }
        }, 1000);
      } else {
        const errorData = await response.json();
        toast.error(
          `Failed to ${isEditing ? "update" : "create"} post: ${errorData.error || "Unknown error"}`,
        );
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleInitialSubmit} className="max-w-7xl mx-auto">
        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT COLUMN: Editor */}
          <div className="space-y-6">
            {/* Metadata Card */}
            <div className="bg-card border-brutal p-6 space-y-6 rounded-lg">
              <h3 className="font-head text-xl font-bold border-b border-border pb-2 mb-4">
                Post Details
              </h3>

              {/* Title */}
              <div>
                <label className="block font-semibold mb-2 text-sm uppercase tracking-wide">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="E.g., Building a Neural Network from Scratch"
                  maxLength={100}
                  required
                  className="w-full text-lg font-bold"
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={cn(
                      "text-xs font-mono",
                      charCounts.title > 90
                        ? "text-red-500"
                        : "text-muted-foreground",
                    )}
                  >
                    {charCounts.title}/100
                  </span>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block font-semibold mb-2 text-sm uppercase tracking-wide">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleChange("excerpt", e.target.value)}
                  placeholder="A brief summary that appears on the card..."
                  maxLength={200}
                  rows={3}
                  className="w-full border-brutal p-3 focus:ring-primary font-body text-sm resize-none bg-background text-foreground"
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={cn(
                      "text-xs font-mono",
                      charCounts.excerpt > 190
                        ? "text-red-500"
                        : "text-muted-foreground",
                    )}
                  >
                    {charCounts.excerpt}/200
                  </span>
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block font-semibold mb-2 text-sm uppercase tracking-wide">
                  Cover Image
                </label>
                <input
                  type="file"
                  ref={coverInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleCoverUpload}
                />

                {formData.coverImageUrl ? (
                  <div className="relative w-full h-48 rounded-md overflow-hidden border-2 border-brutal group">
                    <Image
                      src={formData.coverImageUrl}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange("coverImageUrl", "")}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => coverInputRef.current?.click()}
                        className="bg-background text-foreground hover:bg-muted"
                      >
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-md p-8 text-center hover:bg-muted/10 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      {isUploadingCover ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <UploadCloud className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Click to upload cover
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        1200x630px recommended
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold mb-2 text-sm uppercase tracking-wide">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-3 py-1 border-2 text-xs font-bold transition-all rounded-md uppercase tracking-wider",
                        formData.tags.includes(tag)
                          ? "bg-primary text-primary-foreground border-brutal"
                          : "bg-card text-card-foreground border-border hover:border-foreground",
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-head font-bold text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Content
                </label>
                <span
                  className={cn(
                    "text-xs font-mono",
                    charCounts.content < 200
                      ? "text-orange-500"
                      : "text-success",
                  )}
                >
                  {charCounts.content} chars (min 200)
                </span>
              </div>

              {/* Toolbar */}
              <div className="bg-foreground text-background p-2 rounded-t-lg flex flex-wrap items-center gap-2 shadow-sm sticky top-2 z-20">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 hover:bg-background/20 rounded-md transition-colors"
                  title="Upload Media"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleUpload}
                />

                <button
                  type="button"
                  onClick={() => pdfInputRef.current?.click()}
                  disabled={isConvertingPdf}
                  className="p-2 hover:bg-background/20 rounded-md transition-colors"
                  title="Import from PDF"
                >
                  {isConvertingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="file"
                  ref={pdfInputRef}
                  className="hidden"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                />

                <div className="h-4 w-px bg-background/20 mx-1"></div>

                <button
                  type="button"
                  onClick={() =>
                    insertTextAtCursor(
                      "\n```javascript\n// Your code here\n```\n",
                    )
                  }
                  className="p-2 hover:bg-background/20 rounded-md transition-colors font-mono text-xs font-bold"
                  title="Code Block"
                >
                  {`</>`}
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor("**Bold Text**")}
                  className="p-2 hover:bg-background/20 rounded-md transition-colors font-bold text-xs"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor("*Italic Text*")}
                  className="p-2 hover:bg-background/20 rounded-md transition-colors italic text-xs font-serif"
                  title="Italic"
                >
                  I
                </button>

                <div className="flex-1"></div>

                <button
                  type="button"
                  onClick={async () => {
                    if (!formData.content || formData.content.length < 50) {
                      toast.error(
                        "Please write at least 50 characters before improving.",
                      );
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
                      if (!res.ok) throw new Error("Failed to improve");
                      const data = await res.json();
                      handleChange("content", data.content);
                      if (data.suggestions) {
                        setAiSuggestions(data.suggestions);
                        toast.success(
                          "Content improved! Check suggestions below.",
                        );
                      }
                    } catch (error: any) {
                      toast.error(error.message);
                    } finally {
                      setIsImproving(false);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-md text-xs font-bold transition-all shadow-sm"
                >
                  <Sparkles className="w-3 h-3" />
                  {isImproving ? "Fixing..." : "Fix Grammar"}
                </button>
              </div>

              {/* Textarea */}
              {isImproving ? (
                <div className="w-full border-brutal border-t-0 p-4 h-[500px] rounded-b-lg bg-muted/5">
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-muted w-3/4 rounded"></div>
                    <div className="h-4 bg-muted w-full rounded"></div>
                    <div className="h-4 bg-muted w-5/6 rounded"></div>
                  </div>
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder="# Your Research Header\n\nStart writing your amazing findings here..."
                  className="w-full border-2 border-brutal rounded-b-lg p-6 font-mono text-sm focus:ring-2 focus:ring-ring focus:outline-none min-h-[500px] leading-relaxed resize-y bg-background text-foreground"
                />
              )}

              {aiSuggestions && !isImproving && (
                <div className="mt-4 p-4 border-l-4 border-orange-500 bg-orange-50/10 rounded-r-md">
                  <h3 className="font-bold flex items-center gap-2 mb-2 text-orange-700 text-sm">
                    <Sparkles className="w-4 h-4" />
                    AI Suggestions
                  </h3>
                  <div className="whitespace-pre-wrap text-sm text-orange-900/80 font-mono">
                    {aiSuggestions}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.title ||
                  formData.content.length < 200
                }
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                size="lg"
              >
                {isSubmitting
                  ? isEditing
                    ? "Updating..."
                    : "Publishing..."
                  : isEditing
                    ? "Update Post"
                    : "Publish Post"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-2 border-brutal hover:bg-muted"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Preview (Sticky) */}
          <div className="hidden lg:block relative">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-head text-xl font-bold flex items-center gap-2">
                  <Eye className="w-5 h-5" /> Live Preview
                </h2>
                <div className="text-xs text-muted-foreground">
                  Markdown supported
                </div>
              </div>

              <div className="border-2 border-dashed border-border rounded-xl p-8 bg-card/50 backdrop-blur-sm shadow-sm min-h-[800px] max-h-[calc(100vh-150px)] overflow-y-auto">
                <h1 className="font-head text-4xl font-bold mb-4 leading-tight">
                  {formData.title || (
                    <span className="text-muted-foreground/30">
                      Your Title...
                    </span>
                  )}
                </h1>

                {formData.coverImageUrl && (
                  <div className="relative w-full h-64 mb-8 rounded-lg overflow-hidden border border-border shadow-sm">
                    <Image
                      src={formData.coverImageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      img({ node, ...props }: any) {
                        if (props.alt === "Video") {
                          return (
                            <video
                              src={props.src}
                              controls
                              className="w-full rounded-md border-2 border-brutal my-4"
                            />
                          );
                        }
                        return (
                          <img
                            {...props}
                            className="w-full rounded-md border-2 border-brutal my-4"
                            alt={props.alt}
                          />
                        );
                      },
                    }}
                  >
                    {formData.content || "*Start writing to see preview...*"}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="max-w-md border-brutal bg-card">
          <DialogHeader>
            <DialogTitle className="font-head text-2xl">
              Community Pledge ✍️
            </DialogTitle>
            <DialogDescription className="font-sans text-muted-foreground">
              Before publishing, please agree to our community guidelines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/20 border-2 border-black/10 rounded-md text-sm space-y-2">
              <p>I certify that this post:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Contains{" "}
                  <strong>NO vulgarity, hate speech, or harassment</strong>.
                </li>
                <li>Is original content or properly cited.</li>
                <li>Respects the intellectual property of others.</li>
              </ul>
              <p className="items-center font-bold text-destructive mt-2">
                ⚠️ Violations will result in immediate ban.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold">
                Sign with your name to agree:
              </label>
              <Input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your full name..."
                className="font-cursive text-2xl text-primary border-b-2 border-primary border-t-0 border-x-0 rounded-none px-0 focus:ring-0 focus:border-b-4 transition-all placeholder:font-sans placeholder:text-base placeholder:text-muted-foreground/50"
                style={{
                  fontFamily: '"Brush Script MT", "Comic Sans MS", cursive',
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTermsOpen(false)}
              className="border-brutal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting || signature.length < 3}
              className="bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm"
            >
              {isSubmitting ? "Publishing..." : "I Agree & Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TrashIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
