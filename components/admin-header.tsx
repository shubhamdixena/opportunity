"use client"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"

interface AdminHeaderProps {
  title: string
  description: string
  buttonText?: string
  buttonLink?: string
  onButtonClick?: () => void
}

export default function AdminHeader({
  title,
  description,
  buttonText,
  buttonLink,
  onButtonClick,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold text-foreground">
          {title}
        </h1>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {buttonLink && buttonText && (
          <Link href={buttonLink}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {buttonText}
            </Button>
          </Link>
        )}
        {onButtonClick && buttonText && (
          <Button onClick={onButtonClick}>
            <Plus className="mr-2 h-4 w-4" />
            {buttonText}
          </Button>
        )}
        <ThemeToggle />
      </div>
    </div>
  )
}
