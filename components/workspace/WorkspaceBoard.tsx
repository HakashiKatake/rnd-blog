import dynamic from 'next/dynamic'
import 'tldraw/tldraw.css'

// Dynamically import Tldraw with SSR disabled to avoid production issues with browser-only APIs
const Tldraw = dynamic(async () => (await import('tldraw')).Tldraw, {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-50 font-head font-bold">Loading Canvas...</div>
})

export function WorkspaceBoard() {
    return (
        <div className="w-full h-full border-2 border-black rounded-lg overflow-hidden bg-white shadow-brutal">
            <Tldraw persistenceKey="workspace-canvas" />
        </div>
    )
}
