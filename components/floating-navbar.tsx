"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Settings, ChevronDown } from "lucide-react"
import { categoriesData } from "@/lib/data"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isBrowseOpen, setIsBrowseOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-semibold text-slate-800 text-lg">
            Opportunity for you
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium">
              Home
            </Link>

            <div className="relative">
              <button
                onClick={() => setIsBrowseOpen(!isBrowseOpen)}
                className="flex items-center text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
              >
                Browse
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {isBrowseOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/60 py-2">
                  <Link
                    href="/categories"
                    className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50/80 transition-colors"
                    onClick={() => setIsBrowseOpen(false)}
                  >
                    All Categories
                  </Link>
                  <div className="border-t border-slate-200/60 my-2"></div>
                  {categoriesData.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="block px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50/80 transition-colors"
                      onClick={() => setIsBrowseOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/about" className="text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium">
              About
            </Link>
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-white/20">
            <div className="flex flex-col space-y-3 pt-4">
              <Link href="/" className="text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium">
                Home
              </Link>
              <Link
                href="/categories"
                className="text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
              >
                All Categories
              </Link>
              {categoriesData.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium pl-4"
                >
                  {category.name}
                </Link>
              ))}
              <Link href="/about" className="text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium">
                About
              </Link>
              <Link
                href="/admin"
                className="text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
