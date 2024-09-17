"use client"
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="rounded-lg top-0 sticky z-50 bg-white/50 shadow-md backdrop-blur-md border mx-20 py-0 text-secondary-foreground">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-3">
                    {/* Logo and App Name */}
                    <Link href="/">
                        <div className="flex items-center space-x-2">

                            <span className="text-2xl font-bold text-green-500 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">vaxmate</span>
                        </div>
                    </Link>


                    {/* User Profile */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">John Doe</span>
                    </div>
                </div>


            </div>
        </header>
    )
}