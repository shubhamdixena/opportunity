"use client"

import { Search, Menu, X, ChevronDown, Settings } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useState } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import Link from "next/link"

interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  showSearch?: boolean
}

export function Navigation({
  currentPage,
  onPageChange,
  searchQuery,
  onSearchChange,
  showSearch = false,
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const categories = [
    {
      id: "scholarships",
      label: "Scholarships",
      description: "Financial aid opportunities for students and researchers",
    },
    { id: "fellowships", label: "Fellowships", description: "Professional development and research fellowships" },
    { id: "grants", label: "Grants", description: "Funding opportunities for projects and research" },
    { id: "conferences", label: "Conferences", description: "Professional networking and learning events" },
    { id: "competitions", label: "Competitions", description: "Academic and professional competitions with prizes" },
  ]

  const navItems: { id: string; label: string }[] = []

  const isBrowseActive = ["scholarships", "fellowships", "grants", "conferences", "competitions"].includes(currentPage)

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onPageChange("home")}
              className="text-xl font-medium text-foreground hover:opacity-80 transition-opacity"
            >
              Opportunity for you
            </button>

            <nav className="hidden md:flex items-center space-x-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isBrowseActive ? "secondary" : "ghost"}
                    className={`text-sm ${
                      isBrowseActive
                        ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        : "hover:bg-accent hover:text-accent-foreground"
                    } h-10 px-4 py-2`}
                  >
                    Browse
                    <ChevronDown className="ml-1 w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80 p-2">
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => onPageChange(category.id)}
                      className="flex flex-col items-start p-3 cursor-pointer"
                    >
                      <div className="font-medium text-sm">{category.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{category.description}</div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  className="text-sm"
                  onClick={() => onPageChange(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {showSearch && (
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            )}

            <div className="hidden md:flex items-center space-x-2">
              <Link href="/auth">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-2 mb-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">Categories</div>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={currentPage === category.id ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    onPageChange(category.id)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  {category.label}
                </Button>
              ))}
            </div>

            <div className="flex flex-col space-y-2 mb-4">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    onPageChange(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="flex flex-col space-y-2 mb-4">
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="justify-start">
                  Log In
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="justify-start text-slate-600 hover:text-slate-800">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            </div>

            {showSearch && (
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
