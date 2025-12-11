# SPARK - Sanity CMS Setup

## Overview
This directory contains the Sanity.io CMS configuration for SPARK. Sanity serves as the content management system for posts, quests, users, and collaborations.

## Schemas

### 📝 Post Schema (`sanity/schemas/post.ts`)
Fields:
- `title` - Post title (10-100 characters)
- `slug` - URL-friendly identifier
- `author` - Reference to User
- `excerpt` - Brief summary (max 200 chars)
- `content` - Main content in Markdown
- `thumbnail` - Featured image
- `tags` - Array of tags (AI/ML, IoT, Web3, etc.)
- `status` - draft | pending | approved | rejected
- `sparkCount` - Number of sparks received
- `viewCount` - Number of views
- `quest` - Optional link to Quest
- `publishedAt` - Publication timestamp

### 👤 User Schema (`sanity/schemas/user.ts`)
Fields:
- `clerkId` - Clerk authentication ID
- `name`, `email`, `avatar`, `bio`
- `university`, `location`
- `tier` - 1-4 (Spark Initiate → RnD Fellow)
- `points`, `sparksReceived`, `postsPublished`, `collaborationsCount`
- `badges` - Array of achievement badges
- `githubUrl`, `linkedinUrl`, `portfolioUrl`

### 🎯 Quest Schema (`sanity/schemas/quest.ts`)
Fields:
- `title` - The "What If..." question
- `slug` - URL identifier
- `description` - Quest description in Markdown
- `proposedBy` - User who created the quest
- `participants` - Array of User references
- `status` - open | active | completed
- `timeline` - Array of milestones with dates
- `rewardPoints` - Points awarded on completion
- `difficulty` - easy | medium | hard
- `daysRemaining` - Countdown timer
- `resources` - Array of helpful links

### 🤝 Collaboration Schema (`sanity/schemas/collaboration.ts`)
Fields:
- `projectName` - Name of the collaboration
- `description` - Project details
- `skillsNeeded` - Array of required skills
- `duration`, `commitment` - Time requirements
- `postedBy` - User who posted
- `teamMembers` - Array of User references
- `applicants` - Array of applications with status
- `status` - open | in-progress | completed
- `githubRepo`, `designDoc` - Project links

## Getting Started

### 1. Create Sanity Project
Visit https://www.sanity.io/manage and create a new project.

### 2. Set Environment Variables
Copy the values to your `.env.local`:
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_token_with_write_permissions
```

### 3. Deploy Schemas
```bash
npx sanity schema deploy
```

### 4. Access Sanity Studio
```bash
npx sanity dev
```
This will open the Sanity Studio at `http://localhost:3333`

## Using the Sanity Client

Import the client and queries:
```typescript
import { client, queries, urlFor } from '@/lib/sanity/client'

// Fetch all posts
const posts = await client.fetch(queries.getAllPosts)

// Get post by slug
const post = await client.fetch(queries.getPostBySlug('my-post'))

// Get image URL
const imageUrl = urlFor(post.thumbnail).width(800).url()
```

## Next Steps
- Set up Clerk authentication (Phase 3)
- Build post creation page with Markdown editor (Phase 5)
- Implement three-tier moderation workflow
