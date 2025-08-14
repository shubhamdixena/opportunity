"use client"

import { useState, useEffect } from "react"
import AdminHeader from "@/components/admin-header"
import SafeHydrate from "@/components/safe-hydrate"
import SearchInput from "@/components/search-input"
import { AdminOpportunities } from "@/components/admin-opportunities"
import type { Opportunity } from "@/components/opportunity-card"
import OpportunitiesLoading from "./loading"

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOpportunities = async (query = "") => {
    try {
      setLoading(true)
      const searchParam = query ? `&search=${encodeURIComponent(query)}` : ""
      const response = await fetch(`/api/opportunities?limit=100${searchParam}`)

      if (response.ok) {
        const data = await response.json()
        const transformedOpportunities = data.opportunities.map((opp: any) => ({
          id: opp.id,
          title: opp.title,
          organization: opp.organization,
          description: opp.about_opportunity || "",
          category: opp.category,
          location: opp.location || "",
          deadline: opp.application_deadline || "",
          url: opp.application_url || opp.website_url || "",
          featured: opp.featured || false,
          amount:
            opp.amounts?.min && opp.amounts?.max
              ? `$${opp.amounts.min} - $${opp.amounts.max}`
              : opp.amounts?.min || opp.amounts?.max || "Not specified",
          tags: opp.tags || [],
        }))
        setOpportunities(transformedOpportunities)
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOpportunities()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOpportunities(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  if (loading) {
    return <OpportunitiesLoading />
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <AdminHeader
          title="Opportunities"
          description="Manage all opportunity listings"
          buttonText="Add Opportunity"
          buttonLink="/admin/opportunities/add"
        />
      </div>
      <SafeHydrate>
        <div className="flex gap-4">
          <SearchInput
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search opportunities..."
            className="flex-1 max-w-sm"
          />
        </div>
      </SafeHydrate>
      <AdminOpportunities
        opportunities={opportunities}
        onUpdateOpportunities={setOpportunities}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </div>
  )
}
