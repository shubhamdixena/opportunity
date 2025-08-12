"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"

interface AdminStatsCardProps {
  value: string | number
  label: string
  color?: string
}

export function AdminStatsCard({ value, label, color = "text-slate-800" }: AdminStatsCardProps) {
  return (
    <Card className="glass-card p-6">
      <div className="text-center">
        <div className={`text-2xl font-semibold ${color}`}>{value}</div>
        <div className="text-sm text-slate-600">{label}</div>
      </div>
    </Card>
  )
}

interface AdminHeaderProps {
  title: string
  description: string
  buttonText: string
  onButtonClick?: () => void
}

export function AdminHeader({ title, description, buttonText, onButtonClick }: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        <p className="text-slate-600 mt-1">{description}</p>
      </div>
      <Button className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-4" onClick={onButtonClick}>
        <Plus className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    </div>
  )
}

interface AdminSearchProps {
  placeholder: string
  onSearch?: (value: string) => void
}

export function AdminSearch({ placeholder, onSearch }: AdminSearchProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
      <Input placeholder={placeholder} className="pl-10 glass-input" onChange={(e) => onSearch?.(e.target.value)} />
    </div>
  )
}
