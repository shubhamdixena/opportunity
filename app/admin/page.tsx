"use client"

import { AdminDashboard } from "@/components/admin-dashboard"

// Mock data for opportunities
const mockOpportunities = [
  {
    id: "1",
    title: "Global Innovation Scholarship",
    organization: "Tech Foundation",
    description: "A comprehensive scholarship program for innovative students pursuing technology degrees.",
    category: "Scholarships",
    location: "Global",
    deadline: "2024-12-15",
    amount: "$50,000",
    tags: ["Technology", "Innovation", "Global"],
    url: "https://example.com/scholarship1",
    featured: true,
  },
  {
    id: "2",
    title: "Research Fellowship Program",
    organization: "Science Institute",
    description: "Fellowship opportunity for graduate students in scientific research.",
    category: "Fellowships",
    location: "USA",
    deadline: "2025-01-30",
    amount: "$75,000",
    tags: ["Research", "Science", "Graduate"],
    url: "https://example.com/fellowship1",
    featured: false,
  },
  {
    id: "3",
    title: "Startup Competition 2024",
    organization: "Entrepreneur Hub",
    description: "Annual competition for innovative startup ideas with funding opportunities.",
    category: "Competitions",
    location: "San Francisco, CA",
    deadline: "2024-11-20",
    amount: "$100,000",
    tags: ["Startup", "Competition", "Funding"],
    url: "https://example.com/competition1",
    featured: true,
  },
]

export default function AdminPage() {
  const handlePageChange = (page: string) => {
    // This can be used for any navigation logic if needed
    console.log("Navigate to:", page)
  }

  return <AdminDashboard opportunities={mockOpportunities} onPageChange={handlePageChange} />
}
