'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBolt } from 'react-icons/fa6'

export function IntroAnimation({ children }: { children: React.ReactNode }) {
    const [showIntro, setShowIntro] = useState(false)
    const [animationComplete, setAnimationComplete] = useState(false)

    useEffect(() => {
        // Check if intro has already played in this session
        const introPlayed = sessionStorage.getItem('introPlayed')
        if (!introPlayed) {
            setShowIntro(true)
            // Lock scrolling while animation is playing
            document.body.style.overflow = 'hidden'
        } else {
            setAnimationComplete(true)
        }
    }, [])

    const handleAnimationComplete = () => {
        sessionStorage.setItem('introPlayed', 'true')
        setAnimationComplete(true)
        setShowIntro(false)
        // Restore scrolling
        document.body.style.overflow = 'unset'
    }

    return (
        <>
            <AnimatePresence mode="wait">
                {showIntro && (
                    <motion.div
                        key="intro-overlay"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
                    >
                        <div className="flex items-center justify-center gap-6 sm:gap-8 px-8">
                            {/* Logo (FaBolt) */}
                            <motion.div
                                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                                animate={{
                                    scale: [0, 1.2, 1],
                                    opacity: 1,
                                    rotate: 0,
                                }}
                                transition={{
                                    duration: 1.5,
                                    times: [0, 0.7, 1],
                                    ease: "easeOut"
                                }}
                                className="text-primary text-7xl sm:text-9xl shrink-0"
                            >
                                <FaBolt />
                            </motion.div>

                            {/* Text "SPARK" */}
                            <motion.div
                                initial={{ width: 0, opacity: 0, x: -30 }}
                                animate={{
                                    width: "auto",
                                    opacity: 1,
                                    x: 0
                                }}
                                transition={{
                                    duration: 1.2,
                                    delay: 1.8, // Wait for logo to settle
                                    ease: [0.16, 1, 0.3, 1] // Custom easeOutExpo
                                }}
                                onAnimationComplete={() => {
                                    // Give the user a moment to soak in the brand reveal
                                    setTimeout(handleAnimationComplete, 1200)
                                }}
                                className="font-head text-6xl sm:text-8xl font-black tracking-tighter overflow-hidden whitespace-nowrap"
                            >
                                <span className="pr-4">SPARK</span>
                            </motion.div>
                        </div>

                        {/* Interactive Spark background line */}
                        <motion.div
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.8 }}
                            className="absolute bottom-1/2 translate-y-[80px] w-80 sm:w-96 h-2 bg-primary/30 rounded-full blur-[2px]"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: animationComplete ? 1 : 0,
                    scale: animationComplete ? 1 : 0.98,
                    y: animationComplete ? 0 : 30
                }}
                transition={{
                    duration: 1,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.2 // Slight delay after overlay starts fading
                }}
                className="w-full h-full origin-top"
            >
                {children}
            </motion.div>
        </>
    )
}
