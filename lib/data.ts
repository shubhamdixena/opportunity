import { z } from "zod"
import { getOpportunities } from "@/app/api/opportunities/route"

export const opportunitiesData = [
  {
    id: 1,
    title: "Global Innovation Challenge 2025",
    organization: "Tech for Good Foundation",
    type: "Competition",
    location: "Global",
    deadline: "March 15, 2025",
    prize: "$50,000",
    tags: ["Technology", "Climate", "Innovation"],
    featured: true,
    status: "Active",
    applications: 245,
    views: 1250,
    datePosted: "January 10, 2025",
  },
  {
    id: 2,
    title: "Young Leaders Fellowship",
    organization: "Future Leaders Institute",
    type: "Fellowship",
    location: "New York, USA",
    deadline: "February 28, 2025",
    prize: "Full funding",
    tags: ["Leadership", "Development", "Networking"],
    featured: false,
    status: "Draft",
    applications: 89,
    views: 567,
    datePosted: "January 8, 2025",
  },
  {
    id: 3,
    title: "Sustainable Business Accelerator",
    organization: "Green Ventures",
    type: "Accelerator",
    location: "London, UK",
    deadline: "April 10, 2025",
    prize: "€100,000",
    tags: ["Sustainability", "Business", "Startups"],
    featured: true,
    status: "Active",
    applications: 156,
    views: 892,
    datePosted: "January 5, 2025",
  },
  {
    id: 4,
    title: "Digital Arts Residency Program",
    organization: "Creative Hub",
    type: "Residency",
    location: "Berlin, Germany",
    deadline: "January 30, 2025",
    prize: "Studio space + stipend",
    tags: ["Arts", "Digital", "Creative"],
    featured: false,
    status: "Closed",
    applications: 234,
    views: 1100,
    datePosted: "November 15, 2024",
  },
  {
    id: 5,
    title: "Social Impact Scholarship",
    organization: "Impact University",
    type: "Scholarship",
    location: "Various",
    deadline: "March 1, 2025",
    prize: "Full tuition",
    tags: ["Education", "Social Impact", "Scholarship"],
    featured: false,
    status: "Active",
    applications: 78,
    views: 445,
    datePosted: "December 20, 2024",
  },
  {
    id: 6,
    title: "Healthcare Innovation Grant",
    organization: "Medical Research Foundation",
    type: "Grant",
    location: "Global",
    deadline: "February 15, 2025",
    prize: "$75,000",
    tags: ["Healthcare", "Innovation", "Global Health"],
    featured: false,
    status: "Active",
    applications: 156,
    views: 892,
    datePosted: "January 5, 2025",
  },
]

export const categoriesData = [
  { name: "Scholarships", href: "/categories/scholarships" },
  { name: "Competitions", href: "/categories/competitions" },
  { name: "Fellowships", href: "/categories/fellowships" },
  { name: "Grants", href: "/categories/grants" },
  { name: "Accelerators", href: "/categories/accelerators" },
  { name: "Residencies", href: "/categories/residencies" },
]

export const opportunitySchema = z.object({
  id: z.number(),
  title: z.string(),
  organization: z.string(),
  category: z.string(),
  location: z.string().optional(),
  application_deadline: z.string().optional(),
  application_url: z.string().optional(),
  website_url: z.string().optional(),
  featured: z.boolean().optional(),
  about_opportunity: z.string().optional(),
  requirements: z.string().optional(),
  amounts: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().optional(),
    })
    .optional(),
})
export type Opportunity = z.infer<typeof opportunitySchema>
export type Category = {
  id: string
  title: string
  description: string
  count: string
  gradient: string
  border: string
}
export async function getCategories() {
  const categories = [
    {
      id: "scholarships",
      title: "Scholarships",
      description: "Educational funding for students worldwide",
      count: "850+",
      gradient: "from-blue-500/10 to-cyan-500/10",
      border: "border-blue-200/50",
    },
    {
      id: "fellowships",
      title: "Fellowships",
      description: "Research and professional development programs",
      count: "420+",
      gradient: "from-purple-500/10 to-pink-500/10",
      border: "border-purple-200/50",
    },
    {
      id: "grants",
      title: "Grants",
      description: "Funding for projects and startups",
      count: "650+",
      gradient: "from-green-500/10 to-emerald-500/10",
      border: "border-green-200/50",
    },
    {
      id: "conferences",
      title: "Conferences",
      description: "Professional networking and learning events",
      count: "320+",
      gradient: "from-orange-500/10 to-red-500/10",
      border: "border-orange-200/50",
    },
    {
      id: "competitions",
      title: "Competitions",
      description: "Contests with prizes and recognition",
      count: "280+",
      gradient: "from-indigo-500/10 to-blue-500/10",
      border: "border-indigo-200/50",
    },
  ]
  return categories
}
export async function getFeaturedOpportunities() {
  const { opportunities } = await getOpportunities({ featured: true, limit: 3 })
  return opportunities
}
