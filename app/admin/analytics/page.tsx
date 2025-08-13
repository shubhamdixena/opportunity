"use client"

import { AdminAnalytics } from "@/components/admin-analytics"
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
]

export default function AnalyticsPage() {
  return <AdminAnalytics opportunities={mockOpportunities} />
}
