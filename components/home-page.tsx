"use client"

import { ArrowRight, TrendingUp } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { OpportunityCard, type Opportunity } from "./opportunity-card"
import { useRouter } from "next/navigation"

interface HomePageProps {
  onPageChange?: (page: string) => void
  featuredOpportunities: Opportunity[]
  onOpportunityClick?: (opportunity: Opportunity) => void
}

export function HomePage({ onPageChange, featuredOpportunities, onOpportunityClick }: HomePageProps) {
  const router = useRouter()

  const handlePageChange = (page: string) => {
    if (onPageChange) {
      onPageChange(page)
    } else {
      router.push(`/categories/${page}`)
    }
  }

  const handleOpportunityClick = (opportunity: Opportunity) => {
    if (onOpportunityClick) {
      onOpportunityClick(opportunity)
    } else {
      router.push(`/opportunity/${opportunity.id}`)
    }
  }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Gradient Styles */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animated-gradient {
          background: linear-gradient(-45deg, #000000, #374151, #6b7280, #9ca3af, #d1d5db, #000000);
          background-size: 400% 400%;
          animation: gradient-x 6s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/20 to-secondary/30">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Updated daily with new opportunities
              </Badge>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-medium mb-4 leading-tight">
              Discover Your Next
              <br />
              <span className="animated-gradient">Big Opportunity</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
              Find scholarships, fellowships, grants, conferences, and competitions from around the world. All in one
              place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="px-6 py-4 text-base h-auto" onClick={() => handlePageChange("scholarships")}>
                Explore Opportunities
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="px-6 py-4 text-base h-auto bg-transparent"
                onClick={() => handlePageChange("about")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">Explore by Category</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse opportunities tailored to your goals and interests
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br ${category.gradient} ${category.border} border`}
                onClick={() => handlePageChange(category.id)}
              >
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl mb-2">{category.title}</CardTitle>
                  <div className="text-2xl font-medium text-primary">{category.count}</div>
                </CardHeader>
                <CardContent className="pt-0 text-center">
                  <CardDescription className="text-sm">{category.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-medium mb-4">Featured Opportunities</h2>
              <p className="text-xl text-muted-foreground">Hand-picked opportunities with approaching deadlines</p>
            </div>

            <Button variant="outline" onClick={() => handlePageChange("scholarships")} className="hidden md:flex">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredOpportunities.slice(0, 3).map((opportunity) => (
              <div key={opportunity.id} onClick={() => handleOpportunityClick(opportunity)} className="cursor-pointer">
                <OpportunityCard opportunity={opportunity} />
              </div>
            ))}
          </div>

          <div className="text-center md:hidden">
            <Button variant="outline" onClick={() => handlePageChange("scholarships")}>
              View All Opportunities
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Opportunities */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">Latest Opportunities</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Recently added opportunities across all categories
            </p>
          </div>

          <div className="space-y-3 max-w-4xl mx-auto">
            {featuredOpportunities.slice(0, 6).map((opportunity, index) => (
              <div
                key={opportunity.id}
                className="bg-card border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-300 group"
                onClick={() => (window.location.href = `/opportunity/${opportunity.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {opportunity.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{opportunity.organization}</span>
                      {opportunity.amount && (
                        <>
                          <span className="text-sm text-muted-foreground">•</span>
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            {opportunity.amount}
                          </Badge>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {opportunity.title}
                    </h3>
                  </div>

                  <div className="flex flex-col md:items-end gap-1 md:min-w-[120px]">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Deadline: </span>
                      <span className="font-medium">
                        {new Date(opportunity.deadline).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">{opportunity.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" onClick={() => handlePageChange("scholarships")}>
              View All Opportunities
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-accent/20 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-medium mb-4">Ready to Find Your Opportunity?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of successful applicants who have found their perfect opportunities through our platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-6 text-lg h-auto" onClick={() => handlePageChange("scholarships")}>
              Start Exploring
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg h-auto bg-transparent"
              onClick={() => handlePageChange("about")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
