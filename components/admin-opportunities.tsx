"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import type { Opportunity } from "./opportunity-card"
import AdminOpportunitiesTable from "./admin-opportunities-table"
import OpportunityForm from "./opportunity-form"

interface AdminOpportunitiesProps {
  opportunities: Opportunity[]
  onUpdateOpportunities: (opportunities: Opportunity[]) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function AdminOpportunities({
  opportunities,
  onUpdateOpportunities,
  searchQuery,
  onSearchChange,
}: AdminOpportunitiesProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        searchQuery === "" ||
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.organization.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = categoryFilter === "all" || opp.category.toLowerCase() === categoryFilter.toLowerCase()

      return matchesSearch && matchesCategory
    })
  }, [opportunities, searchQuery, categoryFilter])

  const handleEditOpportunity = (updatedOpportunity: Opportunity) => {
    const updatedOpportunities = opportunities.map((opp) =>
      opp.id === updatedOpportunity.id ? updatedOpportunity : opp
    )

    onUpdateOpportunities(updatedOpportunities)
    setSelectedOpportunity(null)
    setIsEditModalOpen(false)
  }

  const handleDeleteOpportunity = (id: string) => {
    if (confirm("Are you sure you want to delete this opportunity?")) {
      const updatedOpportunities = opportunities.filter((opp) => opp.id !== id)
      onUpdateOpportunities(updatedOpportunities)
    }
  }

  const handleEditClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    setIsEditModalOpen(true)
  }

  const toggleFeatured = (id: string) => {
    const updatedOpportunities = opportunities.map((opp) => (opp.id === id ? { ...opp, featured: !opp.featured } : opp))
    onUpdateOpportunities(updatedOpportunities)
  }

  return (
    <div className="space-y-6">
      <AdminOpportunitiesTable
        opportunities={filteredOpportunities}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteOpportunity}
        onToggleFeaturedClick={toggleFeatured}
      />

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Opportunity</DialogTitle>
          </DialogHeader>
          {selectedOpportunity && (
            <OpportunityForm
              opportunity={selectedOpportunity}
              onSubmit={handleEditOpportunity}
              onCancel={() => setIsEditModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
