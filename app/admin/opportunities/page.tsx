"use client"

import { useState } from "react"
import { AdminOpportunities } from "@/components/admin-opportunities"
import type { Opportunity } from "@/components/OpportunityCard"

// Mock data for opportunities
const mockOpportunities: Opportunity[] = [
  {
    id: "1",
    title: "Global Innovation Scholarship",
    organization: "Tech Foundation",
    description: "A comprehensive scholarship program for innovative students pursuing technology degrees.",
    category: "Scholarships",
    location: "Global",
    deadline: "2024-12-15",
    url: "https://example.com/scholarship1",
    featured: true,
    funding: "$50,000",
    eligibility: "Open to all students",
  },
  {
    id: "2",
    title: "Research Fellowship Program",
    organization: "Science Institute",
    description: "Fellowship opportunity for graduate students in scientific research.",
    category: "Fellowships",
    location: "USA",
    deadline: "2025-01-30",
    url: "https://example.com/fellowship1",
    featured: false,
    funding: "$75,000",
    eligibility: "Graduate students only",
  },
  {
    id: "3",
    title: "Startup Competition 2024",
    organization: "Entrepreneur Hub",
    description: "Annual competition for innovative startup ideas with funding opportunities.",
    category: "Competitions",
    location: "San Francisco, CA",
    deadline: "2024-11-20",
    url: "https://example.com/competition1",
    featured: true,
    funding: "$100,000",
    eligibility: "Early-stage startups",
  },
]

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [opportunities, setOpportunities] = useState(mockOpportunities)

  return (
    <AdminOpportunities
      opportunities={opportunities}
      onUpdateOpportunities={setOpportunities}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    />
  )
}
