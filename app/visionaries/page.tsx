"use client";

import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/retroui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface MemberProps {
    name: string;
    role?: string;
    image?: string;
    size?: "lg" | "md" | "sm";
    className?: string;
}

const MemberCard = ({ name, role, image, size = "sm", className = "" }: MemberProps) => {
    const [imageError, setImageError] = useState(false);

    // Size configuration
    const sizeConfig = {
        sm: {
            avatar: "w-24 h-24",
            text: "text-lg",
            padding: "p-4",
            initials: "text-2xl",
            imgSize: "96px"
        },
        md: {
            avatar: "w-32 h-32 md:w-40 md:h-40",
            text: "text-xl md:text-2xl",
            padding: "p-6",
            initials: "text-4xl",
            imgSize: "160px"
        },
        lg: {
            avatar: "w-48 h-48",
            text: "text-2xl",
            padding: "p-8",
            initials: "text-5xl",
            imgSize: "192px"
        }
    };

    const config = sizeConfig[size] || sizeConfig.sm;

    return (
        <div className={`bg-card border-2 border-brutal rounded-xl ${config.padding} shadow-brutal hover:shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex flex-col items-center text-center group h-full ${className}`}>
            <div className={`${config.avatar} rounded-full border-2 border-brutal mb-4 overflow-hidden relative bg-muted shrink-0`}>
                {image && !imageError ? (
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={() => setImageError(true)}
                        sizes={config.imgSize}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center font-head font-bold text-muted-foreground">
                        <span className={config.initials}>
                            {name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                    </div>
                )}
            </div>

            <h3 className={`${config.text} font-head font-bold leading-tight`}>
                {name}
            </h3>

            {role && (
                <p className="text-primary font-bold mt-1 text-sm md:text-base">
                    {role}
                </p>
            )}
        </div>
    );
};

export default function VisionariesPage() {
    const visionaries = [
        {
            name: "Saurabh Yadav",
            role: "RnD Lead",
            image: "/team/saurabh.jpg"
        },
        {
            name: "Daksh Srivastava",
            role: "AI & Research Co-lead",
            image: "/team/daksh.jpg"
        },
        {
            name: "Aaryan Kuchekar",
            role: "Development Lead",
            image: "/team/aaryan.jpg"
        }
    ];

    const specialThanks = [
        { name: "Anshuman Atrey", image: "/team/anshuman.jpg" },
        { name: "Prince Vaviya", image: "/team/prince.jpg" },
        { name: "Gaurav Patel", image: "/team/gaurav.jpg" },
        { name: "Danish Shaikh", image: "/team/danish.jpg" },
        { name: "Samarth Navale", image: "/team/samarth.jpg" },
        { name: "Kaushal Rajmandai", image: "/team/kaushal.jpg" },
        { name: "Prof. Vinaya Kulkarni", image: "/team/vinaya.jpg" }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navigation />
            <main className="container mx-auto px-4 py-20">
                <Link href="/">
                    <Button variant="ghost" className="mb-8 hover:bg-muted/50">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                    </Button>
                </Link>

                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="font-head text-4xl md:text-6xl font-black mb-6 tracking-tight">
                        The Visionaries
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        The minds behind the code, the design, and the vision.
                    </p>
                </div>

                {/* Core Team Section */}
                <section className="mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center max-w-6xl mx-auto">
                        {visionaries.map((member, index) => (
                            <MemberCard
                                key={index}
                                {...member}
                                size="lg"
                                className="w-full max-w-sm"
                            />
                        ))}
                    </div>
                </section>

                {/* Special Thanks Section */}
                <section className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block relative">
                            <h2 className="font-head text-3xl md:text-5xl font-bold relative z-10">
                                Special Thanks
                            </h2>
                            <div className="absolute -bottom-2 left-0 w-full h-3 bg-primary/20 -rotate-1 z-0 rounded-full"></div>
                        </div>
                        <p className="text-muted-foreground mt-4 text-lg">
                            Contributors who helped shape the journey
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
                        {specialThanks.map((member, index) => (
                            <MemberCard
                                key={index}
                                {...member}
                                size="md"
                            />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
