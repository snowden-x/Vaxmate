"use client"
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Syringe, Menu, X } from 'lucide-react'

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="rounded-lg top-0 sticky z-50 bg-white border mx-56 text-secondary-foreground">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-3">
                    {/* Logo and App Name */}
                    <div className="flex items-center space-x-2">
                        
                        <span className="text-2xl font-bold text-green-500 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">vaxmate</span>
                    </div>

                    {/* Navigation for larger screens */}
                    <nav className="hidden md:flex space-x-4">
                        <Button variant="ghost">Dashboard</Button>
                        <Button variant="ghost">Appointments</Button>
                        <Button variant="ghost">Records</Button>
                        <Button variant="ghost">Resources</Button>
                    </nav>

                    {/* User Profile */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">John Doe</span>
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        className="md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </Button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="md:hidden py-4">
                        <div className="flex flex-col space-y-2">
                            <Button variant="ghost">Dashboard</Button>
                            <Button variant="ghost">Appointments</Button>
                            <Button variant="ghost">Records</Button>
                            <Button variant="ghost">Resources</Button>
                        </div>
                        <div className="flex items-center space-x-4 mt-4">
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">John Doe</span>
                        </div>
                    </nav>
                )}
            </div>
        </header>
    )
}