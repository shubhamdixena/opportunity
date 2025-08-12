"use client"

import { useState } from "react"
import { HomePage } from "@/components/home-page"
import { CategoryPage } from "@/components/category-page"
import { Navigation } from "@/components/navigation"
import type { Opportunity } from "@/components/opportunity-card"

// Sample data - in a real app, this would come from an API
const sampleOpportunities: Opportunity[] = [
  {
    id: "1",
    title: "Google Summer of Code 2024",
    organization: "Google",
    description: "Work with open source organizations on exciting projects during the summer",
    category: "Fellowships",
    location: "Remote",
    deadline: "2024-04-02",
    amount: "$6,000",
    tags: ["Programming", "Open Source", "Summer"],
    url: "https://summerofcode.withgoogle.com/",
    featured: true,
  },
  {
    id: "2",
    title: "Rhodes Scholarship",
    organization: "Rhodes Trust",
    description: "Fully funded postgraduate study at the University of Oxford",
    category: "Scholarships",
    location: "Oxford, UK",
    deadline: "2024-10-01",
    amount: "Full funding",
    tags: ["Graduate", "Oxford", "Leadership"],
    url: "https://www.rhodeshouse.ox.ac.uk/",
    featured: true,
  },
  {
    id: "3",
    title: "TechCrunch Disrupt Startup Battlefield",
    organization: "TechCrunch",
    description: "Compete for $100,000 and the chance to present at TechCrunch Disrupt",
    category: "Competitions",
    location: "San Francisco, CA",
    deadline: "2024-06-15",
    amount: "$100,000",
    tags: ["Startup", "Technology", "Pitch"],
    url: "https://techcrunch.com/startup-battlefield/",
    featured: true,
  },
  {
    id: "4",
    title: "Fulbright Student Program",
    organization: "U.S. Department of State",
    description: "Study, research, or teach abroad with full funding",
    category: "Scholarships",
    location: "Various Countries",
    deadline: "2024-10-15",
    amount: "Full funding",
    tags: ["International", "Research", "Teaching"],
    url: "https://us.fulbrightonline.org/",
  },
  {
    id: "5",
    title: "Y Combinator Startup School",
    organization: "Y Combinator",
    description: "Free online course for startup founders",
    category: "Fellowships",
    location: "Online",
    deadline: "2024-07-01",
    tags: ["Startup", "Entrepreneurship", "Online"],
    url: "https://www.startupschool.org/",
  },
  {
    id: "6",
    title: "Gates Cambridge Scholarship",
    organization: "Gates Cambridge Trust",
    description: "Full-cost scholarship for graduate study at Cambridge",
    category: "Scholarships",
    location: "Cambridge, UK",
    deadline: "2024-12-01",
    amount: "Full funding",
    tags: ["Graduate", "Cambridge", "Leadership"],
    url: "https://www.gatescambridge.org/",
  },
]

export default function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
    setSelectedOpportunity(null)
  }

  const handleOpportunityClick = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity)
    setCurrentPage("opportunity-detail")
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomePage
            onPageChange={handlePageChange}
            featuredOpportunities={sampleOpportunities}
            onOpportunityClick={handleOpportunityClick}
          />
        )
      case "scholarships":
      case "fellowships":
      case "grants":
      case "conferences":
      case "competitions":
        return (
          <CategoryPage
            category={currentPage}
            opportunities={sampleOpportunities}
            onOpportunityClick={handleOpportunityClick}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )
      case "opportunity-detail":
        if (selectedOpportunity) {
          return (
            <div className="min-h-screen bg-background p-8">
              <div className="max-w-4xl mx-auto">
                <button
                  onClick={() => setCurrentPage("home")}
                  className="mb-6 text-muted-foreground hover:text-foreground"
                >
                  ← Back to opportunities
                </button>
                <div className="bg-card rounded-lg p-8 border">
                  <h1 className="text-3xl font-bold mb-4">{selectedOpportunity.title}</h1>
                  <p className="text-xl text-muted-foreground mb-6">{selectedOpportunity.organization}</p>
                  <p className="text-lg mb-6">{selectedOpportunity.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <strong>Category:</strong> {selectedOpportunity.category}
                    </div>
                    <div>
                      <strong>Location:</strong> {selectedOpportunity.location}
                    </div>
                    <div>
                      <strong>Deadline:</strong> {selectedOpportunity.deadline}
                    </div>
                    {selectedOpportunity.amount && (
                      <div>
                        <strong>Amount:</strong> {selectedOpportunity.amount}
                      </div>
                    )}
                  </div>
                  <div className="mb-6">
                    <strong>Tags:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedOpportunity.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <a
                    href={selectedOpportunity.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            </div>
          )
        }
        return <div>Opportunity not found</div>
      default:
        return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
              <button onClick={() => setCurrentPage("home")} className="text-primary hover:text-primary/80 underline">
                Go back to home
              </button>
            </div>
          </div>
        )
    }
  }

  const showSearch = ["scholarships", "fellowships", "grants", "conferences", "competitions"].includes(currentPage)

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={showSearch}
      />
      {renderCurrentPage()}
    </div>
  )
}
