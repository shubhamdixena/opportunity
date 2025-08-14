"use client"

import { useState, useEffect } from "react"
import { AdminOpportunities } from "@/components/admin-opportunities"
import type { Opportunity } from "@/components/OpportunityCard"

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOpportunities = async () => {
    try {
      setLoading(true)
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''
      const response = await fetch(`/api/opportunities?limit=100${searchParam}`)
      
      if (response.ok) {
        const data = await response.json()
        // Transform data to match expected interface
        const transformedOpportunities = data.opportunities.map((opp: any) => ({
          id: opp.id,
          title: opp.title,
          organization: opp.organization,
          description: opp.about_opportunity || '',
          category: opp.category,
          location: opp.location || '',
          deadline: opp.application_deadline || '',
          url: opp.application_url || opp.website_url || '',
          featured: opp.featured || false,
          funding: opp.amounts?.min && opp.amounts?.max 
            ? `$${opp.amounts.min} - $${opp.amounts.max}`
            : opp.amounts?.min || opp.amounts?.max || 'Not specified',
          eligibility: opp.requirements || 'See details'
        }))
        setOpportunities(transformedOpportunities)
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOpportunities()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOpportunities()
    }, 500) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <h1 className="text-2xl mb-6">Opportunities</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminOpportunities
      opportunities={opportunities}
      onUpdateOpportunities={setOpportunities}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    />
  )
}
