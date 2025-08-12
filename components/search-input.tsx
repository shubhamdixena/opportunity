import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchInputProps {
  placeholder?: string
  className?: string
}

export default function SearchInput({ placeholder = "Search opportunities...", className = "" }: SearchInputProps) {
  return (
    <div className={`relative group ${className}`}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
      <Input
        placeholder={placeholder}
        className="pl-12 pr-4 py-3 text-base border-slate-200 rounded-xl shadow-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
      />
    </div>
  )
}
