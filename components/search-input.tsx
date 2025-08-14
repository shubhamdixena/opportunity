"use client"

import { Search } from "lucide-react"
import { Input } from "./ui/input"

interface SearchInputProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  placeholder: string
  className?: string
}

export default function SearchInput({ searchQuery, onSearchChange, placeholder, className }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 w-full"
      />
    </div>
  )
}
