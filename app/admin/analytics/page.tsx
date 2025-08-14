"use client"

import { useEffect, useState } from "react"
import { AdminAnalytics } from "@/components/admin-analytics"
import type { Opportunity } from "@/components/OpportunityCard"

export default function AnalyticsPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await fetch('/api/opportunities?limit=1000')
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

    fetchOpportunities()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <h1 className="text-2xl mb-6">Analytics</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return <AdminAnalytics opportunities={opportunities} />
}
