import {
  Search,
  Calendar,
  ArrowRight,
  Award,
  BookOpen,
  Trophy,
  GraduationCap,
  Briefcase,
  Lightbulb,
  HomeIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Navbar from "@/components/floating-navbar"

const categories = [
  {
    name: "Scholarships",
    description: "Educational funding opportunities for students worldwide",
    count: 78,
    icon: GraduationCap,
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    opportunities: [
      {
        title: "Merit-Based Excellence Scholarship",
        organization: "Global Education Fund",
        deadline: "March 1, 2025",
        prize: "$25,000",
      },
      {
        title: "STEM Women Leadership Grant",
        organization: "Tech Diversity Initiative",
        deadline: "February 15, 2025",
        prize: "$15,000",
      },
      {
        title: "International Student Support",
        organization: "University Alliance",
        deadline: "April 1, 2025",
        prize: "Full tuition",
      },
    ],
  },
  {
    name: "Competitions",
    description: "Challenge yourself and showcase your skills globally",
    count: 45,
    icon: Trophy,
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    opportunities: [
      {
        title: "Global Innovation Challenge 2025",
        organization: "Tech for Good Foundation",
        deadline: "March 15, 2025",
        prize: "$50,000",
      },
      {
        title: "Sustainable Design Contest",
        organization: "Green Future Labs",
        deadline: "February 28, 2025",
        prize: "$30,000",
      },
      {
        title: "AI Ethics Challenge",
        organization: "Future Tech Institute",
        deadline: "March 30, 2025",
        prize: "$40,000",
      },
    ],
  },
  {
    name: "Fellowships",
    description: "Professional development and leadership programs",
    count: 32,
    icon: Briefcase,
    color: "bg-green-500/10 text-green-600 border-green-200",
    opportunities: [
      {
        title: "Young Leaders Fellowship",
        organization: "Future Leaders Institute",
        deadline: "February 28, 2025",
        prize: "Full funding",
      },
      {
        title: "Social Impact Fellowship",
        organization: "Change Makers Network",
        deadline: "March 10, 2025",
        prize: "$35,000 stipend",
      },
      {
        title: "Tech Innovation Fellowship",
        organization: "Silicon Valley Foundation",
        deadline: "April 5, 2025",
        prize: "$45,000",
      },
    ],
  },
  {
    name: "Grants",
    description: "Funding for research, projects, and innovative ideas",
    count: 23,
    icon: Lightbulb,
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
    opportunities: [
      {
        title: "Healthcare Innovation Grant",
        organization: "Medical Research Foundation",
        deadline: "February 15, 2025",
        prize: "$75,000",
      },
      {
        title: "Climate Action Research Grant",
        organization: "Environmental Institute",
        deadline: "March 20, 2025",
        prize: "$60,000",
      },
      {
        title: "Community Development Grant",
        organization: "Local Impact Fund",
        deadline: "April 15, 2025",
        prize: "$25,000",
      },
    ],
  },
  {
    name: "Accelerators",
    description: "Business acceleration and startup incubation programs",
    count: 15,
    icon: BookOpen,
    color: "bg-pink-500/10 text-pink-600 border-pink-200",
    opportunities: [
      {
        title: "Sustainable Business Accelerator",
        organization: "Green Ventures",
        deadline: "April 10, 2025",
        prize: "€100,000",
      },
      {
        title: "FinTech Startup Accelerator",
        organization: "Digital Finance Hub",
        deadline: "March 25, 2025",
        prize: "$80,000",
      },
      {
        title: "Social Enterprise Accelerator",
        organization: "Impact Ventures",
        deadline: "February 20, 2025",
        prize: "$50,000",
      },
    ],
  },
]

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-6">
          <Link href="/" className="hover:text-slate-800 transition-colors flex items-center">
            <HomeIcon className="h-4 w-4 mr-1" />
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Categories</span>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-light text-slate-800 mb-4 tracking-tight">
            Explore by <span className="text-blue-600">Category</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">
            Find opportunities that match your interests and career goals
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              placeholder="Search categories..."
              className="pl-12 pr-4 py-3 text-base border-slate-200 rounded-xl shadow-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-8">
          {categories.map((category, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-slate-200/60 rounded-2xl overflow-hidden">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${category.color}`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-medium text-slate-800">{category.name}</CardTitle>
                      <p className="text-slate-600 mt-1">{category.description}</p>
                    </div>
                  </div>
                  <Badge className={`${category.color} text-sm px-3 py-1`}>{category.count} opportunities</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {category.opportunities.map((opp, oppIndex) => (
                    <div
                      key={oppIndex}
                      className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 hover:shadow-md transition-all group"
                    >
                      <h4 className="font-medium text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {opp.title}
                      </h4>
                      <p className="text-sm text-slate-600 mb-3">{opp.organization}</p>
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-slate-600">
                          <Calendar className="h-3 w-3 mr-2" />
                          Deadline: {opp.deadline}
                        </div>
                        <div className="flex items-center text-xs font-medium text-blue-600">
                          <Award className="h-3 w-3 mr-2" />
                          {opp.prize}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
                      >
                        View Details
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-slate-200 rounded-lg px-6">
                    View All {category.name}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
