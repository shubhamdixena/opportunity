"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { MoreHorizontal, Star, MapPin, ExternalLink, Edit, Trash2 } from "lucide-react"
import { Opportunity } from "@/lib/data"

interface AdminOpportunitiesTableProps {
  opportunities: Opportunity[]
  onEditClick: (opportunity: Opportunity) => void
  onDeleteClick: (id: string) => void
  onToggleFeaturedClick: (id: string) => void
}

export default function AdminOpportunitiesTable({
  opportunities,
  onEditClick,
  onDeleteClick,
  onToggleFeaturedClick,
}: AdminOpportunitiesTableProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {opportunities.length} {opportunities.length === 1 ? "opportunity" : "opportunities"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead>Opportunity</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity.id} className="border-b">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {opportunity.featured && <Star className="w-4 h-4 text-amber-500 fill-current" />}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{opportunity.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{opportunity.organization}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {opportunity.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {opportunity.location}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(opportunity.application_deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const deadline = new Date(opportunity.application_deadline)
                      const now = new Date()
                      const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                      if (diffDays < 0) {
                        return <div className="w-2 h-2 bg-red-500 rounded-full" title="Expired"></div>
                      } else if (diffDays <= 7) {
                        return <div className="w-2 h-2 bg-orange-500 rounded-full" title="Closing soon"></div>
                      } else {
                        return <div className="w-2 h-2 bg-green-500 rounded-full" title="Active"></div>
                      }
                    })()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a
                            href={opportunity.application_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center w-full"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditClick(opportunity)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleFeaturedClick(opportunity.id)}>
                          <Star className="w-4 h-4 mr-2" />
                          {opportunity.featured ? "Unfeature" : "Feature"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteClick(opportunity.id.toString())} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
