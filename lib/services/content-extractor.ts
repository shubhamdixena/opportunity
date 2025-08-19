import { ScrapedOpportunity } from '@/lib/types/scraping';

interface ExtractedData {
  eligibility?: string;
  benefits?: string;
  deadline?: string;
  category?: string;
  author?: string;
  howToApply?: string;
}

export interface ProcessedOpportunity {
  id: string;
  title: string;
  type?: string;
  organization?: string;
  location?: string;
  salaryStipend?: string;
  eligibility?: string;
  benefits?: string;
  howToApply?: string;
  deadline?: string;
  additionalInfo?: string;
  originalUrl: string;
  scrapedAt: Date;
}

interface SectionData {
  type?: string;
  organization?: string;
  location?: string;
  salaryStipend?: string;
  eligibility?: string;
  benefits?: string;
  howToApply?: string;
  deadline?: string;
  additionalInfo?: string;
}

export class ContentExtractor {
  
  static extractStructuredData(contentText: string, contentHtml: string): ExtractedData {
    const data: ExtractedData = {};

    // Extract sections using heading and keyword heuristics
    const sections = this.findSections(contentText, contentHtml);

    // Extract eligibility
    data.eligibility = this.extractEligibility(sections);

    // Extract benefits
    data.benefits = this.extractBenefits(sections);

    // Extract deadline
    data.deadline = this.extractDeadline(contentText);

    // Extract category
    data.category = this.extractCategory(contentText, contentHtml);

    return data;
  }

  static processOpportunity(opportunity: ScrapedOpportunity): ProcessedOpportunity {
    const sectionData = this.extractSectionData(opportunity.content_text || '', opportunity.content_html || '');
    
    return {
      id: `processed-${opportunity.id}`,
      title: opportunity.name || 'Untitled Opportunity',
      type: sectionData.type,
      organization: sectionData.organization,
      location: sectionData.location,
      salaryStipend: sectionData.salaryStipend,
      eligibility: sectionData.eligibility,
      benefits: sectionData.benefits,
      howToApply: sectionData.howToApply,
      deadline: sectionData.deadline,
      additionalInfo: sectionData.additionalInfo,
      originalUrl: opportunity.post_url || opportunity.application_url || '',
      scrapedAt: new Date(opportunity.scraped_at),
    };
  }

  private static extractSectionData(contentText: string, contentHtml: string): SectionData {
    const sections = this.findAdvancedSections(contentHtml, contentText);
    
    return {
      type: this.extractType(sections, contentText),
      organization: this.extractOrganization(sections, contentText),
      location: this.extractLocation(sections, contentText),
      salaryStipend: this.extractSalaryStipend(sections, contentText),
      eligibility: this.extractAdvancedEligibility(sections),
      benefits: this.extractAdvancedBenefits(sections),
      howToApply: this.extractHowToApply(sections),
      deadline: this.extractAdvancedDeadline(sections, contentText),
      additionalInfo: this.extractAdditionalInfo(sections),
    };
  }

  private static findAdvancedSections(html: string, text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    
    // Enhanced section patterns
    const sectionPatterns = {
      type: /(?:type|category|position|role|opportunity type)/i,
      organization: /(?:organization|company|institution|host|sponsor|offered by|about)/i,
      location: /(?:location|country|countries|place|venue|where)/i,
      salaryStipend: /(?:salary|stipend|compensation|payment|financial|funding|allowance|remuneration)/i,
      eligibility: /(?:eligibility|requirements?|criteria|who can apply|qualification)/i,
      benefits: /(?:benefits?|coverage|what[^.]*cover|perks|advantages|includes?)/i,
      howToApply: /(?:how to apply|application|apply|submission|process)/i,
      deadline: /(?:deadline|date|when|timeline|due|closing)/i,
      additionalInfo: /(?:additional|other|important|note|contact|further)/i,
    };

    // Extract content between headings with better parsing
    const headingRegex = /<(h[1-6])[^>]*>([^<]+)<\/\1>|<(strong|b)[^>]*>([^<]+)<\/\3>/gi;
    const headings: Array<{text: string, index: number}> = [];
    let match;
    
    while ((match = headingRegex.exec(html)) !== null) {
      const headingText = (match[2] || match[4]).trim();
      headings.push({
        text: headingText,
        index: match.index
      });
    }

    // Extract content between headings
    for (let i = 0; i < headings.length; i++) {
      const currentHeading = headings[i];
      const nextHeading = headings[i + 1];
      
      const startIndex = currentHeading.index;
      const endIndex = nextHeading ? nextHeading.index : html.length;
      
      let sectionHtml = html.substring(startIndex, endIndex);
      
      // Remove the heading itself and clean content
      sectionHtml = sectionHtml.replace(/<(h[1-6]|strong|b)[^>]*>[^<]+<\/\1>/i, '');
      const sectionText = this.cleanSectionContent(sectionHtml);
      
      // Match heading to section type
      for (const [key, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(currentHeading.text)) {
          sections[key] = sectionText;
          break;
        }
      }
    }

    return sections;
  }

  private static cleanSectionContent(html: string): string {
    let cleaned = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<!--.*?-->/g, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Remove common unwanted phrases
    const unwantedPatterns = [
      /also check:?.*$/i,
      /related:?.*$/i,
      /see also:?.*$/i,
      /author:?.*$/i,
      /posted by:?.*$/i,
      /share this:?.*$/i,
      /tags:?.*$/i,
    ];

    unwantedPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    return cleaned.substring(0, 800).trim();
  }

  private static extractType(sections: Record<string, string>, text: string): string | undefined {
    if (sections.type) return sections.type;
    
    const typeKeywords = {
      'Scholarship': /scholarship|study grant|educational/i,
      'Job': /job|employment|position|career|vacancy/i,
      'Internship': /internship|intern|training|work experience/i,
      'Fellowship': /fellowship|research|fellow/i,
      'Conference': /conference|summit|symposium|workshop/i,
      'Volunteer': /volunteer|community service/i,
      'Competition': /competition|contest|award|prize/i,
      'Exchange Program': /exchange|study abroad/i,
    };

    for (const [type, pattern] of Object.entries(typeKeywords)) {
      if (pattern.test(text)) return type;
    }
    
    return undefined;
  }

  private static extractOrganization(sections: Record<string, string>, text: string): string | undefined {
    if (sections.organization) return sections.organization;
    
    // Look for organization patterns in text
    const orgMatch = text.match(/(?:by|from|at|with)\s+([A-Z][^.]{10,60})/);
    return orgMatch ? orgMatch[1].trim() : undefined;
  }

  private static extractLocation(sections: Record<string, string>, text: string): string | undefined {
    if (sections.location) return sections.location;
    
    // Look for location patterns
    const locationMatch = text.match(/(?:in|at|located in)\s+([A-Z][^,.]{3,40})/);
    return locationMatch ? locationMatch[1].trim() : undefined;
  }

  private static extractSalaryStipend(sections: Record<string, string>, text: string): string | undefined {
    if (sections.salaryStipend) return sections.salaryStipend;
    
    // Look for salary/stipend patterns
    const salaryMatch = text.match(/(?:\$|€|£|₹|USD|EUR|GBP)\s*[\d,]+(?:[.-]\d+)?/i) ||
                       text.match(/(?:salary|stipend|paid|compensation):\s*([^.]{10,100})/i);
    return salaryMatch ? salaryMatch[0].trim() : undefined;
  }

  private static extractAdvancedEligibility(sections: Record<string, string>): string | undefined {
    return sections.eligibility || undefined;
  }

  private static extractAdvancedBenefits(sections: Record<string, string>): string | undefined {
    return sections.benefits || undefined;
  }

  private static extractHowToApply(sections: Record<string, string>): string | undefined {
    return sections.howToApply || undefined;
  }

  private static extractAdvancedDeadline(sections: Record<string, string>, text: string): string | undefined {
    if (sections.deadline) return sections.deadline;
    
    // Enhanced deadline extraction
    const datePatterns = [
      /(?:deadline|due|apply by|last date)[:\s]*([^.]*\d{1,2}[^.]*(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[^.]*\d{4})/i,
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/,
      /\b((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})\b/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) return match[1] || match[0];
    }
    
    return undefined;
  }

  private static extractAdditionalInfo(sections: Record<string, string>): string | undefined {
    return sections.additionalInfo || undefined;
  }

  private static findSections(text: string, html: string): Record<string, string> {
    const sections: Record<string, string> = {};
    
    // Common heading patterns for different sections
    const sectionPatterns = {
      eligibility: /(?:eligibility|requirements?|criteria|who can apply)/i,
      benefits: /(?:benefits?|coverage|funding|financial|what[^.]*cover)/i,
      deadline: /(?:deadline|date|when|timeline|application period)/i,
      howToApply: /(?:how to apply|application|apply)/i,
    };

    // Split content by headings
    const headingRegex = /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi;
    const headings = [];
    let match;
    
    while ((match = headingRegex.exec(html)) !== null) {
      headings.push({
        text: match[1].trim(),
        index: match.index
      });
    }

    // Extract content between headings
    for (let i = 0; i < headings.length; i++) {
      const currentHeading = headings[i];
      const nextHeading = headings[i + 1];
      
      const startIndex = currentHeading.index;
      const endIndex = nextHeading ? nextHeading.index : html.length;
      
      const sectionHtml = html.substring(startIndex, endIndex);
      const sectionText = sectionHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Match heading to section type
      for (const [key, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(currentHeading.text)) {
          sections[key] = sectionText.substring(0, 500); // Limit length
          break;
        }
      }
    }

    return sections;
  }

  private static extractEligibility(sections: Record<string, string>): string | undefined {
    // Check if we found an eligibility section
    if (sections.eligibility) {
      return this.cleanExtractedText(sections.eligibility);
    }

    // Fallback: look for common eligibility keywords
    const allText = Object.values(sections).join(' ');
    const eligibilityMatch = allText.match(/(?:age[:\s]*\d+[^.]*|students?[^.]*|citizens?[^.]*|must be[^.]*)/i);
    
    return eligibilityMatch ? this.cleanExtractedText(eligibilityMatch[0]) : undefined;
  }

  private static extractBenefits(sections: Record<string, string>): string | undefined {
    if (sections.benefits) {
      return this.cleanExtractedText(sections.benefits);
    }

    // Look for benefit keywords
    const allText = Object.values(sections).join(' ');
    const benefitMatch = allText.match(/(?:fully funded|covers?[^.]*|includes?[^.]*|provides?[^.]*)/i);
    
    return benefitMatch ? this.cleanExtractedText(benefitMatch[0]) : undefined;
  }

  private static extractDeadline(text: string): string | undefined {
    // Look for date patterns
    const datePatterns = [
      /(?:deadline|due)[:\s]*([^.]*\d{1,2}[^.]*(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[^.]*\d{4})/i,
      /(?:deadline|due)[:\s]*([^.]*\d{4}[^.]*(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[^.]*\d{1,2})/i,
      /\b(\d{1,2}[\s\/-]\d{1,2}[\s\/-]\d{4})\b/,
      /\b((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})\b/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        return this.cleanExtractedText(match[1] || match[0]);
      }
    }

    return undefined;
  }

  private static extractCategory(text: string, html: string): string | undefined {
    const categoryKeywords = {
      'Scholarships': /scholarship|study|education|university|academic/i,
      'Jobs': /job|employment|career|position|work|hiring/i,
      'Internships': /internship|intern|training|placement/i,
      'Fellowships': /fellowship|research|fellow/i,
      'Conferences': /conference|summit|event|workshop/i,
      'Volunteering': /volunteer|community|service/i,
      'Competitions': /competition|contest|award|prize/i,
    };

    for (const [category, pattern] of Object.entries(categoryKeywords)) {
      if (pattern.test(text) || pattern.test(html)) {
        return category;
      }
    }

    return undefined;
  }

  private static cleanExtractedText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/^[:\s-]+/, '')
      .trim()
      .substring(0, 300); // Limit length
  }

  static enhanceOpportunityData(
    opportunity: ScrapedOpportunity, 
    contentText: string, 
    contentHtml: string
  ): ScrapedOpportunity {
    const extracted = this.extractStructuredData(contentText, contentHtml);
    
    return {
      ...opportunity,
      eligibility: extracted.eligibility || opportunity.eligibility,
      benefits: extracted.benefits || opportunity.benefits,
      deadline: extracted.deadline || opportunity.deadline,
      category: extracted.category || opportunity.category,
      author: extracted.author || opportunity.author,
      content_text: contentText,
      content_html: contentHtml,
    };
  }
}
