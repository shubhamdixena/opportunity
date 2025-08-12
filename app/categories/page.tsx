import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, BookOpen, Trophy, Briefcase, Users, Globe, Lightbulb, Heart, Zap } from "lucide-react"

const categories = [
  {
    name: "Scholarships",
    description: "Educational funding opportunities for students worldwide",
    count: 78,
    icon: BookOpen,
    href: "/categories/scholarships",
    featured: true,
  },
  {
    name: "Competitions",
    description: "Innovation and skill-based competitions",
    count: 45,
    icon: Trophy,
    href: "/categories/competitions",
    featured: true,
  },
  {
    name: "Internships",
    description: "Professional development and work experience",
    count: 32,
    icon: Briefcase,
    href: "/categories/internships",
    featured: true,
  },
  {
    name: "Fellowships",
    description: "Research and leadership development programs",
    count: 28,
    icon: Users,
    href: "/categories/fellowships",
  },
  {
    name: "Exchange Programs",
    description: "Cultural and academic exchange opportunities",
    count: 19,
    icon: Globe,
    href: "/categories/exchange",
  },
  {
    name: "Innovation Challenges",
    description: "Technology and startup competitions",
    count: 24,
    icon: Lightbulb,
    href: "/categories/innovation",
  },
  {
    name: "Volunteer Programs",
    description: "Community service and social impact opportunities",
    count: 15,
    icon: Heart,
    href: "/categories/volunteer",
  },
  {
    name: "Accelerators",
    description: "Startup incubation and mentorship programs",
    count: 12,
    icon: Zap,
    href: "/categories/accelerators",
  },
]

export default function CategoriesPage() {
  const featuredCategories = categories.filter((cat) => cat.featured)
  const otherCategories = categories.filter((cat) => !cat.featured)

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-background via-muted/30 to-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-light text-foreground mb-4">
              Explore <span className="font-medium text-primary">Opportunities</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover amazing opportunities across different categories and find your next big break
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
                <span>{categories.reduce((sum, cat) => sum + cat.count, 0)} Total Opportunities</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                <span>{categories.length} Categories</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-medium text-foreground mb-2">Featured Categories</h2>
              <p className="text-muted-foreground">Most popular opportunity categories</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCategories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <Card
                  key={index}
                  className="glass-card hover:shadow-lg transition-all duration-300 group border-0 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-chart-1/5 via-transparent to-chart-2/5"></div>
                  <CardHeader className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {category.count} opportunities
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-medium text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                    <p className="text-muted-foreground line-clamp-2">{category.description}</p>
                  </CardHeader>
                  <CardContent className="relative">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                      <Link href={category.href}>
                        Explore {category.name}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-foreground mb-2">All Categories</h2>
            <p className="text-muted-foreground">Browse all available opportunity categories</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherCategories.map((category, index) => {
              const IconComponent = category.icon
              return (
                <Card key={index} className="glass-card hover:shadow-md transition-all duration-300 group border-0 p-4">
                  <Link href={category.href} className="block">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                        <IconComponent className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{category.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{category.count} opportunities</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
