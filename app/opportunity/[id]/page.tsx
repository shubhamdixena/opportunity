import { MapPin, Calendar, Globe, Award, CheckCircle, Users, TrendingUp, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { createClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

async function getOpportunity(id: string) {
  try {
    const { data: opportunity, error } = await supabase.from("opportunities").select("*").eq("id", id).single()

    if (error) {
      console.error("Database error:", error)
      return null
    }

    return opportunity
  } catch (error) {
    console.error("Unexpected error:", error)
    return null
  }
}

export default async function OpportunityPage({ params }: { params: { id: string } }) {
  const opportunity = await getOpportunity(params.id)

  if (!opportunity) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getAmountDisplay = () => {
    if (!opportunity.amounts) return "Not specified"

    if (typeof opportunity.amounts === "object") {
      if (opportunity.amounts.min && opportunity.amounts.max) {
        return `$${opportunity.amounts.min.toLocaleString()} - $${opportunity.amounts.max.toLocaleString()}`
      } else if (opportunity.amounts.amount) {
        return `$${opportunity.amounts.amount.toLocaleString()}`
      }
    } else if (typeof opportunity.amounts === "number") {
      return `$${opportunity.amounts.toLocaleString()}`
    } else if (typeof opportunity.amounts === "string") {
      return opportunity.amounts
    }

    return "Contact for details"
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
              {opportunity.category || "General"}
            </span>
            <div className="flex items-center text-sm text-slate-600 font-light">
              <Calendar className="h-4 w-4 mr-2" />
              Deadline:{" "}
              {opportunity.application_deadline ? formatDate(opportunity.application_deadline) : "Not specified"}
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-slate-800 mb-4 sm:mb-6 leading-tight">
            {opportunity.title || "Opportunity Title"}
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 mb-6 sm:mb-8 font-light">
            {opportunity.organization || "Organization"}
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex items-center text-slate-600 font-light">
              <MapPin className="h-5 w-5 mr-2 opacity-60" />
              {opportunity.location || "Location not specified"}
            </div>
            <div className="flex items-center text-slate-800 font-medium">
              <Award className="h-5 w-5 mr-2" />
              {getAmountDisplay()}
            </div>
            {opportunity.funding_type && (
              <div className="flex items-center text-slate-600 font-light">
                <span className="text-sm">Funding: {opportunity.funding_type}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {opportunity.tags &&
              Array.isArray(opportunity.tags) &&
              opportunity.tags.map((tag: string) => (
                <span key={tag} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            {opportunity.about_opportunity && (
              <div className="glass-card p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-medium text-slate-800 mb-6 flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-slate-600" />
                  About This Opportunity
                </h2>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-light whitespace-pre-line">
                  {opportunity.about_opportunity}
                </p>
              </div>
            )}

            {opportunity.how_to_apply && (
              <div className="glass-card p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-medium text-slate-800 mb-6 flex items-center gap-3">
                  <Users className="h-6 w-6 text-slate-600" />
                  How to Apply
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6 text-sm sm:text-base font-light whitespace-pre-line">
                  {opportunity.how_to_apply}
                </p>
                {opportunity.application_url && (
                  <Link href={opportunity.application_url} target="_blank" rel="noopener noreferrer">
                    <Button className="glass-card hover:bg-slate-100/80 text-slate-800 rounded-2xl px-8 w-full sm:w-auto">
                      Start Application
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Important Dates - moved to top as most critical info */}
            <div className="glass-card p-6">
              <h3 className="text-lg sm:text-xl font-medium text-slate-800 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-600" />
                Important Dates
              </h3>
              <div className="space-y-4">
                {opportunity.application_deadline && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Application Deadline</span>
                    <span className="text-sm text-slate-600 font-light">
                      {formatDate(opportunity.application_deadline)}
                    </span>
                  </div>
                )}
                {opportunity.start_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Program Starts</span>
                    <span className="text-sm text-slate-600 font-light">{formatDate(opportunity.start_date)}</span>
                  </div>
                )}
                {opportunity.end_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Program Ends</span>
                    <span className="text-sm text-slate-600 font-light">{formatDate(opportunity.end_date)}</span>
                  </div>
                )}
                {opportunity.announcement_date && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Results Announced</span>
                    <span className="text-sm text-slate-600 font-light">
                      {formatDate(opportunity.announcement_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements - moved to sidebar for better visibility */}
            {opportunity.requirements && (
              <div className="glass-card p-6">
                <h3 className="text-lg sm:text-xl font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-slate-600" />
                  Requirements
                </h3>
                <div className="text-sm text-slate-600 font-light whitespace-pre-line">{opportunity.requirements}</div>
              </div>
            )}

            {/* Contact Information */}
            {(opportunity.contact_email || opportunity.contact_phone || opportunity.website_url) && (
              <div className="glass-card p-6">
                <h3 className="text-lg sm:text-xl font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-slate-600" />
                  Contact
                </h3>
                <div className="space-y-3">
                  {opportunity.contact_email && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-slate-600 flex-shrink-0" />
                      <a
                        href={`mailto:${opportunity.contact_email}`}
                        className="text-sm text-slate-700 hover:text-slate-800 break-all font-light"
                      >
                        {opportunity.contact_email}
                      </a>
                    </div>
                  )}
                  {opportunity.website_url && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-slate-600 flex-shrink-0" />
                      <a
                        href={opportunity.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-700 hover:text-slate-800 break-all font-light"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* What You'll Get */}
            {opportunity.what_you_get && (
              <div className="glass-card p-6">
                <h3 className="text-lg sm:text-xl font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-slate-600" />
                  What You'll Get
                </h3>
                <div className="text-sm text-slate-600 font-light whitespace-pre-line">{opportunity.what_you_get}</div>
              </div>
            )}

            {/* Eligible Countries */}
            {opportunity.eligible_countries && opportunity.eligible_countries.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg sm:text-xl font-medium text-slate-800 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-slate-600" />
                  Eligible Countries
                </h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.eligible_countries.map((country: string) => (
                    <span key={country} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
