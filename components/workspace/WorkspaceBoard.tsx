'use client'

import React from 'react'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export function WorkspaceBoard() {
    return (
        <div className="w-full h-full border-2 border-black rounded-lg overflow-hidden bg-white shadow-brutal">
            <Tldraw persistenceKey="workspace-canvas" />
        </div>
    )
}
