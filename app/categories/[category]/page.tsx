import { Search, Calendar, MapPin, DollarSign, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

const categoryData = {
  scholarships: {
    title: "Scholarships",
    description: "Educational funding opportunities",
    opportunities: [
      {
        id: 1,
        title: "Merit-Based Excellence Scholarship",
        organization: "Global Education Fund",
        deadline: "March 1, 2025",
        prize: "$25,000",
        location: "Global",
      },
      {
        id: 2,
        title: "STEM Women Leadership Grant",
        organization: "Tech Diversity Initiative",
        deadline: "February 15, 2025",
        prize: "$15,000",
        location: "USA",
      },
      {
        id: 3,
        title: "International Student Support",
        organization: "University Alliance",
        deadline: "April 1, 2025",
        prize: "Full tuition",
        location: "Various",
      },
    ],
  },
  competitions: {
    title: "Competitions",
    description: "Innovation and skill-based competitions",
    opportunities: [
      {
        id: 4,
        title: "Global Innovation Challenge",
        organization: "Tech for Good Foundation",
        deadline: "March 15, 2025",
        prize: "$50,000",
        location: "Global",
      },
      {
        id: 5,
        title: "AI Startup Competition",
        organization: "Innovation Hub",
        deadline: "February 28, 2025",
        prize: "$30,000",
        location: "USA",
      },
    ],
  },
  internships: {
    title: "Internships",
    description: "Professional development and work experience",
    opportunities: [
      {
        id: 6,
        title: "Software Engineering Internship",
        organization: "Tech Corp",
        deadline: "March 10, 2025",
        prize: "$5,000/month",
        location: "Remote",
      },
    ],
  },
  fellowships: {
    title: "Fellowships",
    description: "Research and leadership development programs",
    opportunities: [],
  },
  exchange: {
    title: "Exchange Programs",
    description: "Cultural and academic exchange opportunities",
    opportunities: [],
  },
  innovation: {
    title: "Innovation Challenges",
    description: "Technology and startup competitions",
    opportunities: [],
  },
  volunteer: {
    title: "Volunteer Programs",
    description: "Community service and social impact opportunities",
    opportunities: [],
  },
  accelerators: {
    title: "Accelerators",
    description: "Startup incubation and mentorship programs",
    opportunities: [],
  },
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const category = categoryData[params.category as keyof typeof categoryData]

  if (!category) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation
          currentPage="categories"
          onPageChange={() => {}}
          showSearch={false}
          searchQuery=""
          onSearchChange={() => {}}
        />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-medium text-gray-900 mb-4">Category not found</h1>
          <Link href="/categories">
            <Button variant="outline">Back to Categories</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        currentPage="categories"
        onPageChange={() => {}}
        showSearch={false}
        searchQuery=""
        onSearchChange={() => {}}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-light text-gray-900 mb-2">{category.title}</h1>
          <p className="text-gray-600">{category.description}</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input placeholder="Search..." className="pl-10 border-gray-200 rounded-lg" />
          </div>
        </div>

        {category.opportunities.length > 0 ? (
          <div className="space-y-4">
            {category.opportunities.map((opportunity) => (
              <Link
                key={opportunity.id}
                href={`/opportunity/${opportunity.id}`}
                className="block border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{opportunity.title}</h3>
                    <p className="text-gray-600">{opportunity.organization}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {opportunity.prize}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {opportunity.deadline}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {opportunity.location}
                  </div>
                </div>
              </Link>
            ))}

            <div className="text-center mt-8">
              <Button variant="outline" className="px-8 bg-transparent">
                Load More
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No opportunities available in this category yet.</p>
            <Link href="/categories">
              <Button variant="outline">Explore Other Categories</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
