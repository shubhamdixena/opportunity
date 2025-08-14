"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface Opportunity {
  id: string
  title: string
  organization: string
  category: string
  location: string
  deadline: string
  description: string
  url: string
  featured?: boolean
  funding?: string
  eligibility?: string
}

interface OpportunityCardProps {
  opportunity: Opportunity
  onClick?: (opportunity: Opportunity) => void
}

export function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onClick?.(opportunity)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{opportunity.title}</CardTitle>
          {opportunity.featured && <Badge variant="default">Featured</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{opportunity.organization}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{opportunity.category}</Badge>
            <span className="text-sm text-muted-foreground">{opportunity.location}</span>
          </div>
          <p className="text-sm line-clamp-2">{opportunity.description}</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Deadline: {opportunity.deadline}</span>
            {opportunity.funding && <Badge variant="outline">{opportunity.funding}</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OpportunityCard
