"use client"

import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import Link from "next/link"

export interface Opportunity {
  id?: string
  title: string
  organization: string
  description: string
  category: string
  location: string
  deadline?: string
  amount?: string
  fundingType?: string
  singleAmount?: string
  minAmount?: string
  maxAmount?: string
  eligibleRegions?: string
  about?: string
  applyLink?: string
  whatYouGet?: string
  startDate?: string
  endDate?: string
  contactEmail?: string
  eligibility?: string
  ageRequirement?: string
  languageRequirement?: string
  tags: string[]
  url: string
  featured?: boolean
}

interface OpportunityCardProps {
  opportunity: Opportunity
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getDaysUntilDeadline = (dateString: string) => {
    const deadline = new Date(dateString)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysLeft = getDaysUntilDeadline(opportunity.deadline)
  const isUrgent = daysLeft <= 7 && daysLeft > 0
  const isExpired = daysLeft < 0

  return (
    <Link href={`/opportunity/${opportunity.id}`} className="block h-full">
      <Card
        className={`h-full transition-all duration-200 hover:shadow-md border-border/50 hover:border-border cursor-pointer ${opportunity.featured ? "ring-1 ring-primary/20" : ""}`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {opportunity.category}
              </Badge>
              {opportunity.featured && (
                <Badge variant="secondary" className="bg-accent/50 text-accent-foreground text-xs">
                  Featured
                </Badge>
              )}
            </div>
            {opportunity.amount && (
              <Badge variant="secondary" className="text-xs bg-secondary/30 shrink-0">
                {opportunity.amount}
              </Badge>
            )}
          </div>

          <CardTitle className="text-lg leading-tight mb-2 line-clamp-2">{opportunity.title}</CardTitle>

          <p className="text-sm text-muted-foreground mb-4">{opportunity.organization}</p>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{opportunity.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">Deadline: </span>
              <span
                className={`font-medium ${isExpired ? "text-destructive" : isUrgent ? "text-orange-600" : "text-foreground"}`}
              >
                {formatDate(opportunity.deadline)}
              </span>
            </div>

            {!isExpired && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 shrink-0 text-muted-foreground" />
                <span className={`${isUrgent ? "text-orange-600 font-medium" : "text-muted-foreground"}`}>
                  {daysLeft === 0 ? "Due today" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {opportunity.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-muted/50">
                {tag}
              </Badge>
            ))}
            {opportunity.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs bg-muted/50">
                +{opportunity.tags.length - 2}
              </Badge>
            )}
          </div>

          <Button variant="outline" size="sm" className="w-full bg-transparent">
            <ArrowRight className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
