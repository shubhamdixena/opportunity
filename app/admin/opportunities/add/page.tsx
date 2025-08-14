"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AdminHeader from "@/components/admin-header"
import OpportunityForm from "@/components/opportunity-form"
import type { Opportunity } from "@/components/opportunity-card"

export default function AddOpportunityPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (opportunity: Opportunity) => {
    setIsSubmitting(true)
    console.log("Creating opportunity:", opportunity)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    router.push("/admin/opportunities")
  }

  const handleCancel = () => {
    router.push("/admin/opportunities")
  }

  return (
    <div className="p-6 space-y-6">
      <AdminHeader
        title="Add New Opportunity"
        description="Create a comprehensive opportunity listing"
        buttonText="Back to Opportunities"
        buttonLink="/admin/opportunities"
      />
      <OpportunityForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}
