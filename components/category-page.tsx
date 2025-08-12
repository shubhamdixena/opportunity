"use client"

import { useState, useMemo } from "react"
import { Search, SortAsc, Grid, List, Star } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card"
import { OpportunityCard, type Opportunity } from "./opportunity-card"
import { FilterModal } from "./filter-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

interface CategoryPageProps {
  category: string
  opportunities: Opportunity[]
  onOpportunityClick: (opportunity: Opportunity) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function CategoryPage({
  category,
  opportunities,
  onOpportunityClick,
  searchQuery,
  onSearchChange,
}: CategoryPageProps) {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedDeadlines, setSelectedDeadlines] = useState<string[]>([])
  const [selectedFundingTypes, setSelectedFundingTypes] = useState<string[]>([])
  const [selectedEligibility, setSelectedEligibility] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("deadline")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Filter opportunities by category
  const categoryOpportunities = useMemo(() => {
    return opportunities.filter((opp) => opp.category.toLowerCase() === category.toLowerCase())
  }, [opportunities, category])

  // Get unique locations for filters
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(categoryOpportunities.map((opp) => opp.location))]
    return uniqueLocations.sort()
  }, [categoryOpportunities])

  // Apply filters and search
  const filteredOpportunities = useMemo(() => {
    return categoryOpportunities.filter((opportunity) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opportunity.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opportunity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opportunity.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      // Location filter
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(opportunity.location)

      // Note: For demo purposes, we're only filtering by search and location
      // In a real app, you'd also filter by deadlines, funding types, etc.

      return matchesSearch && matchesLocation
    })
  }, [categoryOpportunities, searchQuery, selectedLocations])

  // Sort opportunities
  const sortedOpportunities = useMemo(() => {
    return [...filteredOpportunities].sort((a, b) => {
      switch (sortBy) {
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "organization":
          return a.organization.localeCompare(b.organization)
        case "featured":
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        default:
          return 0
      }
    })
  }, [filteredOpportunities, sortBy])

  const categoryInfo = {
    scholarships: {
      title: "Scholarships",
      description: "Educational funding opportunities for students at all levels",
      color: "blue",
    },
    fellowships: {
      title: "Fellowships",
      description: "Research and professional development programs",
      color: "purple",
    },
    grants: {
      title: "Grants",
      description: "Funding for projects, startups, and research initiatives",
      color: "green",
    },
    conferences: {
      title: "Conferences",
      description: "Professional networking and learning events worldwide",
      color: "orange",
    },
    competitions: {
      title: "Competitions",
      description: "Contests and challenges with prizes and recognition",
      color: "indigo",
    },
  }

  const currentCategory = categoryInfo[category as keyof typeof categoryInfo] || {
    title: category.charAt(0).toUpperCase() + category.slice(1),
    description: "Explore opportunities in this category",
    color: "gray",
  }

  const featuredOpportunities = sortedOpportunities.filter((opp) => opp.featured)
  const regularOpportunities = sortedOpportunities.filter((opp) => !opp.featured)

  const clearAllFilters = () => {
    setSelectedLocations([])
    setSelectedDeadlines([])
    setSelectedFundingTypes([])
    setSelectedEligibility([])
    setSelectedCountries([])
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/20 to-secondary/20 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-medium mb-4">{currentCategory.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{currentCategory.description}</p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                {filteredOpportunities.length} opportunities
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Updated daily
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={`Search ${category}...`}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <FilterModal
              locations={locations}
              selectedLocations={selectedLocations}
              onLocationChange={setSelectedLocations}
              selectedDeadlines={selectedDeadlines}
              onDeadlineChange={setSelectedDeadlines}
              selectedFundingTypes={selectedFundingTypes}
              onFundingTypeChange={setSelectedFundingTypes}
              selectedEligibility={selectedEligibility}
              onEligibilityChange={setSelectedEligibility}
              selectedCountries={selectedCountries}
              onCountryChange={setSelectedCountries}
              onClearAll={clearAllFilters}
            />

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SortAsc className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {searchQuery && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredOpportunities.length} results for "{searchQuery}"
              </p>
            </div>
          )}

          {sortedOpportunities.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="text-6xl mb-4">🔍</div>
                <CardTitle className="mb-2">No opportunities found</CardTitle>
                <CardDescription>Try adjusting your search terms or filters to find more results.</CardDescription>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="all">All ({sortedOpportunities.length})</TabsTrigger>
                <TabsTrigger value="featured">Featured ({featuredOpportunities.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {featuredOpportunities.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-amber-500" />
                      <h3 className="font-medium">Featured Opportunities</h3>
                    </div>
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"
                          : "space-y-4 mb-8"
                      }
                    >
                      {featuredOpportunities.map((opportunity) => (
                        <div
                          key={opportunity.id}
                          onClick={() => (window.location.href = `/opportunity/${opportunity.id}`)}
                          className="cursor-pointer"
                        >
                          {viewMode === "grid" ? (
                            <OpportunityCard opportunity={opportunity} />
                          ) : (
                            <Card className="hover:shadow-md transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="text-xs">
                                        {opportunity.category}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        Featured
                                      </Badge>
                                      {opportunity.amount && (
                                        <Badge variant="secondary" className="text-xs bg-secondary/30">
                                          {opportunity.amount}
                                        </Badge>
                                      )}
                                    </div>
                                    <h3 className="text-lg font-medium mb-1 line-clamp-1">{opportunity.title}</h3>
                                    <p className="text-muted-foreground text-sm mb-2">{opportunity.organization}</p>
                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                      {opportunity.description}
                                    </p>
                                  </div>
                                  <div className="text-right text-sm text-muted-foreground shrink-0">
                                    <div>Deadline:</div>
                                    <div className="font-medium">
                                      {new Date(opportunity.deadline).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {regularOpportunities.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">All Opportunities</h3>
                    </div>
                    <div
                      className={
                        viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"
                      }
                    >
                      {regularOpportunities.map((opportunity) => (
                        <div
                          key={opportunity.id}
                          onClick={() => (window.location.href = `/opportunity/${opportunity.id}`)}
                          className="cursor-pointer"
                        >
                          {viewMode === "grid" ? (
                            <OpportunityCard opportunity={opportunity} />
                          ) : (
                            <Card className="hover:shadow-md transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant="outline" className="text-xs">
                                        {opportunity.category}
                                      </Badge>
                                      {opportunity.amount && (
                                        <Badge variant="secondary" className="text-xs bg-secondary/30">
                                          {opportunity.amount}
                                        </Badge>
                                      )}
                                    </div>
                                    <h3 className="text-lg font-medium mb-1 line-clamp-1">{opportunity.title}</h3>
                                    <p className="text-muted-foreground text-sm mb-2">{opportunity.organization}</p>
                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                      {opportunity.description}
                                    </p>
                                  </div>
                                  <div className="text-right text-sm text-muted-foreground shrink-0">
                                    <div>Deadline:</div>
                                    <div className="font-medium">
                                      {new Date(opportunity.deadline).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="featured">
                <div
                  className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}
                >
                  {featuredOpportunities.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      onClick={() => (window.location.href = `/opportunity/${opportunity.id}`)}
                      className="cursor-pointer"
                    >
                      <OpportunityCard opportunity={opportunity} />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
