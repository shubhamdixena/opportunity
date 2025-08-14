/**
 * Validation utilities for AI extraction and campaign processing
 */

/**
 * Validate extracted opportunity data and calculate confidence score
 */
export function validateExtractionData(data: any): {
  isValid: boolean
  confidence: number
  errors: string[]
  extractedFields: string[]
} {
  const errors: string[] = []
  const extractedFields: string[] = []
  
  // Required fields
  const requiredFields = ['title', 'organization']
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim().length === 0)) {
      errors.push(`Missing required field: ${field}`)
    } else {
      extractedFields.push(field)
    }
  })

  // Important fields (affect confidence but not validity)
  const importantFields = [
    'description', 'deadline', 'aboutOpportunity', 'requirements', 
    'howToApply', 'whatYouGet', 'category', 'location'
  ]
  
  importantFields.forEach(field => {
    if (data[field] && typeof data[field] === 'string' && data[field].trim().length > 0) {
      extractedFields.push(field)
    }
  })

  // Bonus fields (increase confidence)
  const bonusFields = [
    'contactEmail', 'amount', 'fundingType', 'eligibleCountries',
    'programStartDate', 'programEndDate', 'eligibilityAge'
  ]
  
  bonusFields.forEach(field => {
    if (data[field] && typeof data[field] === 'string' && data[field].trim().length > 0) {
      extractedFields.push(field)
    }
  })

  // Validate field values
  if (data.category && !['Scholarships', 'Fellowships', 'Grants', 'Conferences', 'Competitions', 'Exchange Program', 'Forum', 'Misc'].includes(data.category)) {
    errors.push(`Invalid category: ${data.category}`)
  }

  if (data.fundingType && !['Full Funding', 'Partial Funding', 'Prize Money', 'Stipend', 'Grant', 'Variable Amount', 'No Funding'].includes(data.fundingType)) {
    errors.push(`Invalid funding type: ${data.fundingType}`)
  }

  // Validate dates
  if (data.deadline && data.deadline !== '') {
    const deadlineDate = new Date(data.deadline)
    if (isNaN(deadlineDate.getTime()) && !data.deadline.includes('ongoing') && !data.deadline.includes('rolling')) {
      // Allow descriptive deadlines, but check if it's a valid date
      const datePattern = /\d{4}-\d{2}-\d{2}/
      if (!datePattern.test(data.deadline)) {
        // It's okay, just a descriptive deadline
      }
    }
  }

  // Calculate confidence score
  let confidence = 0
  
  // Base score for required fields
  if (extractedFields.includes('title')) confidence += 0.2
  if (extractedFields.includes('organization')) confidence += 0.2
  
  // Important fields contribute to confidence
  const importantFieldsFound = extractedFields.filter(field => importantFields.includes(field)).length
  confidence += (importantFieldsFound / importantFields.length) * 0.4
  
  // Bonus fields
  const bonusFieldsFound = extractedFields.filter(field => bonusFields.includes(field)).length
  confidence += (bonusFieldsFound / bonusFields.length) * 0.2

  // Penalty for errors
  confidence -= errors.length * 0.1
  
  // Ensure confidence is between 0 and 1
  confidence = Math.max(0, Math.min(1, confidence))

  return {
    isValid: errors.length === 0 || !errors.some(error => error.includes('Missing required field')),
    confidence,
    errors,
    extractedFields
  }
}

/**
 * Validate campaign configuration
 */
export function validateCampaignConfig(campaign: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!campaign.name || campaign.name.trim().length === 0) {
    errors.push('Campaign name is required')
  }

  if (!campaign.source_ids || campaign.source_ids.length === 0) {
    errors.push('At least one source is required')
  }

  if (campaign.frequency && campaign.frequency < 1) {
    errors.push('Frequency must be at least 1')
  }

  if (campaign.max_posts && campaign.max_posts < 1) {
    errors.push('Max posts must be at least 1')
  }

  if (campaign.frequency_unit && !['minutes', 'hours', 'days'].includes(campaign.frequency_unit)) {
    errors.push('Invalid frequency unit')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate scraping source configuration
 */
export function validateSourceConfig(source: any): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!source.name || source.name.trim().length === 0) {
    errors.push('Source name is required')
  }

  if (!source.domain || source.domain.trim().length === 0) {
    errors.push('Domain is required')
  }

  // Validate domain format
  const domainPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
  if (source.domain && !domainPattern.test(source.domain)) {
    errors.push('Invalid domain format')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
