'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/retroui/Button'
import { Input } from '@/components/retroui/Input'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { client } from '@/lib/sanity/client'
import Cropper from 'react-easy-crop'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'



export default function OnboardingPage() {
    console.log("Onboarding Page Mounted")
    const router = useRouter()
    const { user, isLoaded } = useUser()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [isCropperOpen, setIsCropperOpen] = useState(false)
    const [isCropping, setIsCropping] = useState(false)

    // We need to fetch existing data if any (for editing)
    // But this is onboarding... wait, user might have just signed up.
    // We'll rely on our API to handle the user update.

    const [formData, setFormData] = useState({
        name: '',
        avatar: '',
        bio: '', // Headline
        about: '', // Long text
        university: '',
        education: '', // Degree
    })



    useEffect(() => {
        const fetchUserData = async () => {
            if (isLoaded && user) {
                try {
                    // Fetch existing Sanity user
                    const sanityUser = await client.fetch(
                        `*[_type == "user" && clerkId == $clerkId][0]`,
                        { clerkId: user.id }
                    )

                    if (sanityUser) {
                        setIsEditing(true)
                        setFormData({
                            name: sanityUser.name || user.fullName || '',
                            avatar: sanityUser.avatar || user.imageUrl || '',
                            bio: sanityUser.bio || '',
                            about: sanityUser.about || '',
                            university: sanityUser.university || '',
                            education: sanityUser.education || '',
                        })
                    } else {
                        // New user defaults
                        setFormData(prev => ({
                            ...prev,
                            name: user.fullName || '',
                        }))
                    }
                } catch (err) {
                    console.error("Failed to fetch user data", err)
                }
            }
        }

        fetchUserData()
    }, [isLoaded, user])

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // We need a server action or API route to update the Sanity user. 
            // Since we don't have a specific user update API yet, I'll create one quickly or assume one exists? 
            // I'll create `app/api/user/update/route.ts` next to handle this securely.

            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user?.id, // Clerk ID
                    ...formData,
                    isOnboarded: true
                }),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to update profile')
            }

            toast.success("Profile setup complete!")
            router.push(`/profile/${user?.id}`) // Redirect to profile
            router.refresh()

        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Something went wrong.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full border-brutal bg-card p-8">
                <div className="text-center mb-8">
                    <h1 className="font-head text-4xl font-bold mb-2">
                        {isEditing ? 'Update Profile ✏️' : 'Welcome to SPARK ⚡'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditing ? 'Make changes to your public profile.' : "Let's set up your profile so you can start building."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative w-24 h-24 rounded-full border-4 border-black overflow-hidden mb-4 group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center text-2xl">👤</div>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs">
                                Upload
                            </div>
                        </div>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return

                                const reader = new FileReader()
                                reader.addEventListener('load', () => {
                                    setImageSrc(reader.result?.toString() || '')
                                    setIsCropperOpen(true)
                                })
                                reader.readAsDataURL(file)
                            }}
                        />
                    </div>

                    {/* Naive check to clear input if needed, but not critical */}

                    {/* Name */}
                    <div>
                        <label className="block font-bold mb-2">Full Name *</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            required
                            placeholder="e.g. Elon Musk"
                        />
                    </div>

                    {/* Headline */}
                    <div>
                        <label className="block font-bold mb-2">Headline (Short Bio) *</label>
                        <Input
                            value={formData.bio}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            required
                            placeholder="e.g. Building rockets @ SpaceX"
                            maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Appears next to your name on posts.</p>
                    </div>

                    {/* University */}


                    <div>
                        <label className="block font-bold mb-2">College / University *</label>
                        <Input
                            value={formData.university}
                            onChange={(e) => handleChange('university', e.target.value)}
                            required
                            placeholder="e.g. Stanford University"
                        />
                    </div>

                    {/* Education */}
                    <div>
                        <label className="block font-bold mb-2">Education / Degree</label>
                        <Input
                            value={formData.education}
                            onChange={(e) => handleChange('education', e.target.value)}
                            placeholder="e.g. B.S. Computer Science"
                        />
                    </div>

                    {/* About */}
                    <div>
                        <label className="block font-bold mb-2">About Me</label>
                        <textarea
                            value={formData.about}
                            onChange={(e) => handleChange('about', e.target.value)}
                            className="w-full border-brutal p-3 rounded-none focus:ring-primary font-body"
                            rows={5}
                            placeholder="Tell us about your interests, skills, and what you're building..."
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm"
                    >
                        {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Complete Profile →')}
                    </Button>
                </form>
            </div>
            {/* Cropper Dialog */}
            <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
                <DialogContent className="max-w-xl border-brutal bg-card">
                    <DialogHeader>
                        <DialogTitle>Adjust Profile Picture</DialogTitle>
                    </DialogHeader>

                    <div className="relative w-full h-64 bg-black/5 border-2 border-black rounded-md overflow-hidden my-4">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                                style={{
                                    containerStyle: { background: '#f0f0f0' },
                                    cropAreaStyle: { border: '2px solid black', borderRadius: '50%' }
                                }}
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-sm font-bold">Zoom</span>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCropperOpen(false)}>Cancel</Button>
                        <Button
                            onClick={async () => {
                                if (!imageSrc || !croppedAreaPixels) return
                                setIsCropping(true)
                                const toastId = toast.loading('Cropping & Uploading...')

                                try {
                                    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
                                    const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" })

                                    const res = await fetch(`/api/upload?type=image`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': file.type || 'application/octet-stream' },
                                        body: file,
                                    })

                                    if (!res.ok) {
                                        let errorMessage = 'Upload failed'
                                        try {
                                            const errorData = await res.json()
                                            errorMessage = errorData.error || errorMessage
                                        } catch (e) {
                                            errorMessage = `Upload failed: ${res.status} ${res.statusText}`
                                        }
                                        throw new Error(errorMessage)
                                    }

                                    const data = await res.json()
                                    handleChange('avatar', data.secure_url)
                                    toast.success('Avatar updated!', { id: toastId })
                                    setIsCropperOpen(false)
                                } catch (e: any) {
                                    console.error(e)
                                    toast.error(e.message || 'Failed', { id: toastId })
                                } finally {
                                    setIsCropping(false)
                                }
                            }}
                            disabled={isCropping}
                            className="bg-primary text-primary-foreground border-brutal shadow-brutal hover:shadow-brutal-sm"
                        >
                            {isCropping ? 'Saving...' : 'Save Picture'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Helper to create an image element from a URL
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        const isLocal = url.startsWith('blob:') || url.startsWith('data:')
        if (!isLocal) image.crossOrigin = 'anonymous' // Only if loading external
        image.src = url
        image.onload = () => resolve(image)
        image.onerror = (error) => reject(error)
    })

// Helper to crop the image
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('No 2d context')
    }

    // set canvas size to match the bounding box
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // draw image using pixelCrop coordinates
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'))
                return
            }
            resolve(blob)
        }, 'image/jpeg', 0.95) // high quality jpeg
    })
}
