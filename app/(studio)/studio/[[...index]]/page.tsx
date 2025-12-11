'use client'

/**
 * Next.js Route for Sanity Studio
 * This loads the Sanity Studio at /studio
 */

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity/sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
