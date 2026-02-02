# SPARK ⚡

**Ignite Ideas. Build Together. Prove Your Work.**

SPARK is a peer-curated research and blogging platform built for Gen Z engineers. It combines authentic storytelling, verifiable portfolios, and a collaborative community where students can share their engineering projects, research, and innovations.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Sanity](https://img.shields.io/badge/Sanity-CMS-red?logo=sanity)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)

---

## ✨ Features

### 📝 **Content Creation**
- **Rich Markdown Editor** - Write posts with full Markdown support including code syntax highlighting
- **Cover Image Uploads** - Upload cover images via Cloudinary
- **Content Images** - Insert up to 5 images directly into your blog content
- **Tag System** - Categorize posts with tags (AI/ML, IoT, Web3, Security, DevOps, Mobile, Cloud)
- **Draft & Publish Flow** - Posts go through pending review before being approved

### 🔍 **Explore & Discovery**
- **Tag Filtering** - Filter posts by technology category
- **Search** - Full-text search across titles and excerpts
- **Responsive Grid** - Beautiful card layout for browsing research

### ⚡ **Engagement**
- **Spark System** - Like/upvote posts with "Sparks"
- **Comments** - Comment on posts with nested discussions
- **View Counts** - Track post popularity
- **Bookmarks** - Save posts to personal collections

### 👤 **User Profiles**
- **Personal Profiles** - View user posts, sparks, and activity
- **Tier System** - Users have tiers based on engagement
- **Avatar Upload** - Custom profile pictures via Cloudinary

### 🤝 **Collaboration**
- **Collaborate Page** - Find and join collaborative projects
- **Quests** - Gamified challenges for the community
- **Leaderboard** - Top contributors and sparks ranking

### 🎨 **Design System**
- **NeoBrutalism UI** - Bold borders, hard shadows, vibrant colors
- **Dark/Light Mode** - Full theme support with next-themes
- **Responsive Design** - Mobile-first approach
- **Custom RetroUI Components** - Button, Input, Card, Accordion, etc.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4, NeoBrutalism Design |
| **UI Components** | Radix UI, Custom RetroUI |
| **CMS** | Sanity.io |
| **Authentication** | Clerk |
| **Media Storage** | Cloudinary |
| **State Management** | Zustand |
| **Animations** | Framer Motion |
| **Markdown** | React Markdown + Syntax Highlighter |
| **Notifications** | Sonner |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Sanity CLI (`npm install -g @sanity/cli`)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/rnd-blog.git
cd rnd-blog
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp env.example .env.local
```

Required variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-write-token

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=default
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Sanity Studio (Optional)

```bash
cd studio
npm install
npx sanity dev
```

Studio runs at `http://localhost:3333`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📁 Project Structure

```
rnd-blog/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Authentication pages (sign-in, sign-up)
│   ├── (studio)/             # Embedded Sanity Studio
│   ├── api/                  # API routes
│   │   ├── posts/            # Post CRUD, comments, sparks
│   │   ├── users/            # User management
│   │   ├── quests/           # Quest management
│   │   └── ...
│   ├── collaborate/          # Collaboration features
│   ├── create/               # Post creation page
│   ├── explore/              # Browse all posts
│   ├── leaderboard/          # Top users ranking
│   ├── onboarding/           # New user onboarding
│   ├── post/[slug]/          # Individual post pages
│   ├── profile/[userId]/     # User profiles
│   └── quests/               # Quests page
│
├── components/
│   ├── create/               # Post creation form
│   ├── explore/              # PostCard, FilterBar
│   ├── layout/               # Navigation, Footer
│   ├── post/                 # Post detail components
│   ├── profile/              # Profile components
│   ├── retroui/              # NeoBrutalism UI components
│   ├── ui/                   # Shadcn/Radix UI components
│   └── workspace/            # Collaborative workspace
│
├── lib/
│   ├── auth/                 # Authentication utilities
│   ├── sanity/               # Sanity client & queries
│   └── clerk-theme.ts        # Clerk styling configuration
│
├── studio/                   # Sanity Studio (standalone)
│   └── schemas/              # Content schemas
│
├── scripts/                  # Utility scripts
│   ├── fix-tags.ts           # Normalize post tags
│   └── debug-tags.ts         # Debug tag queries
│
└── public/                   # Static assets
```

---

## 🎨 Design System

SPARK uses a **NeoBrutalism** design language:

- **Bold Borders**: 2-4px solid black borders
- **Hard Shadows**: Offset box shadows (`4px 4px 0 0 black`)
- **Vibrant Colors**: Orange (#FF6B35), Teal (#00B4D8), Cream (#FFF8F3)
- **Typography**: Poppins (headings), Inter (body), JetBrains Mono (code)

### Custom Tailwind Utilities

```css
.border-brutal       /* 2px black border */
.border-brutal-thick /* 4px black border */
.shadow-brutal       /* 4px offset shadow */
.shadow-brutal-sm    /* 2px offset shadow */
.shadow-brutal-lg    /* 6px offset shadow */
```

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsx scripts/fix-tags.ts` | Normalize post tags to lowercase |

---

## 🔐 Authentication Flow

1. Users sign up/sign in via **Clerk**
2. On first sign-in, users are redirected to **/onboarding**
3. Onboarding creates a Sanity user document with their Clerk ID
4. Protected routes check for authentication via middleware

---

## 📄 Content Flow

1. **Create**: User writes post with Markdown content
2. **Submit**: Post is saved with `status: 'pending'`
3. **Review**: Admin approves/rejects in Sanity Studio
4. **Publish**: Approved posts appear on `/explore`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is private and not licensed for public use.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - React Framework
- [Sanity.io](https://sanity.io) - Headless CMS
- [Clerk](https://clerk.com) - Authentication
- [Cloudinary](https://cloudinary.com) - Media Management
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Radix UI](https://radix-ui.com) - Accessible Components

---

<p align="center">
  Built with ❤️ by the SPARK Team
</p>
