import { MapPin, Calendar, Globe, Award, CheckCircle, Users, TrendingUp, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

// Restored inline opportunity data instead of importing from non-existent file
const opportunityData = {
  1: {
    title: "Global Innovation Challenge 2025",
    organization: "Tech for Good Foundation",
    type: "Competition",
    location: "Global",
    deadline: "March 15, 2025",
    startDate: "April 1, 2025",
    endDate: "May 15, 2025",
    prize: "$50,000",
    tags: ["Technology", "Climate", "Innovation"],
    description:
      "Join the world's most prestigious innovation challenge focused on developing cutting-edge solutions for climate change. This global competition brings together the brightest minds to tackle one of humanity's greatest challenges using emerging technologies like AI, blockchain, and IoT.",
    requirements: [
      "Must be 18-35 years old",
      "Team of 2-5 members",
      "Working prototype required",
      "English proficiency required",
    ],
    benefits: [
      "$50,000 grand prize",
      "Mentorship from industry leaders",
      "Access to investor network",
      "Global media exposure",
      "Incubation program opportunity",
    ],
    applicationProcess:
      "Submit your application through our online portal including your team information, project proposal, prototype demo video, and impact statement. Selected teams will be invited to present their solutions to our panel of expert judges.",
    contact: "innovation@techforgood.org",
  },
}

export default function OpportunityPage({ params }: { params: { id: string } }) {
  const opportunity = opportunityData[params.id as keyof typeof opportunityData]

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Navigation
          currentPage="opportunity-detail"
          onPageChange={() => {}}
          showSearch={false}
          searchQuery=""
          onSearchChange={() => {}}
        />
        <div className="text-center">
          <h1 className="text-2xl font-medium text-slate-800 mb-4">Opportunity not found</h1>
          <Link href="/">
            <Button className="glass-card hover:bg-slate-100/80 text-slate-800 rounded-2xl px-6">
              Back to Opportunities
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation
        currentPage="opportunity-detail"
        onPageChange={() => {}}
        showSearch={false}
        searchQuery=""
        onSearchChange={() => {}}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Opportunities
        </Link>

        <div className="mb-12 sm:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
            <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium self-start">
              {opportunity.type}
            </span>
            <div className="flex items-center text-sm text-slate-600 font-light">
              <Calendar className="h-4 w-4 mr-2" />
              Deadline: {opportunity.deadline}
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-800 mb-4 sm:mb-6 leading-tight">
            {opportunity.title}
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 mb-6 sm:mb-8 font-light">{opportunity.organization}</p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex items-center text-slate-600 font-light">
              <MapPin className="h-5 w-5 mr-2 opacity-60" />
              {opportunity.location}
            </div>
            <div className="flex items-center text-slate-800 font-medium">
              <Award className="h-5 w-5 mr-2" />
              {opportunity.prize}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {opportunity.tags.map((tag) => (
              <span key={tag} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-medium text-slate-800 mb-6 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-slate-600" />
                About This Opportunity
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-light">
                {opportunity.description}
              </p>
            </div>

            <div className="glass-card p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-medium text-slate-800 mb-6 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-slate-600" />
                Requirements
              </h2>
              <ul className="space-y-4">
                {opportunity.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-slate-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-600 text-sm sm:text-base font-light">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-medium text-slate-800 mb-6 flex items-center gap-3">
                <Users className="h-6 w-6 text-slate-600" />
                How to Apply
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6 text-sm sm:text-base font-light">
                {opportunity.applicationProcess}
              </p>
              <Button className="glass-card hover:bg-slate-100/80 text-slate-800 rounded-2xl px-8 w-full sm:w-auto">
                Start Application
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="text-lg sm:text-xl font-medium text-slate-800 mb-4">What You'll Get</h3>
              <ul className="space-y-3">
                {opportunity.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-600 font-light">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg sm:text-xl font-medium text-slate-800 mb-4">Important Dates</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Application Deadline</span>
                  <span className="text-sm text-slate-600 font-light">{opportunity.deadline}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Program Starts</span>
                  <span className="text-sm text-slate-600 font-light">{opportunity.startDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Program Ends</span>
                  <span className="text-sm text-slate-600 font-light">{opportunity.endDate}</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg sm:text-xl font-medium text-slate-800 mb-4">Contact</h3>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-slate-600 flex-shrink-0" />
                <a
                  href={`mailto:${opportunity.contact}`}
                  className="text-sm text-slate-700 hover:text-slate-800 break-all font-light"
                >
                  {opportunity.contact}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
