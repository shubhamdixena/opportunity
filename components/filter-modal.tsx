"use client"

import { useState } from "react"
import { Filter } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Separator } from "./ui/separator"

interface FilterModalProps {
  locations: string[]
  selectedLocations: string[]
  onLocationChange: (locations: string[]) => void
  selectedDeadlines: string[]
  onDeadlineChange: (deadlines: string[]) => void
  selectedFundingTypes: string[]
  onFundingTypeChange: (types: string[]) => void
  selectedEligibility: string[]
  onEligibilityChange: (eligibility: string[]) => void
  selectedCountries: string[]
  onCountryChange: (countries: string[]) => void
  onClearAll: () => void
}

export function FilterModal({
  locations,
  selectedLocations,
  onLocationChange,
  selectedDeadlines,
  onDeadlineChange,
  selectedFundingTypes,
  onFundingTypeChange,
  selectedEligibility,
  onEligibilityChange,
  selectedCountries,
  onCountryChange,
  onClearAll,
}: FilterModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  const deadlineOptions = ["Next 7 days", "Next 30 days", "Next 3 months", "Next 6 months", "More than 6 months"]

  const fundingTypeOptions = ["Full funding", "Partial funding", "Stipend only", "No funding"]

  const eligibilityOptions = ["Undergraduate", "Graduate", "PhD", "Postdoc", "Professional", "Any level"]

  const countryOptions = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Netherlands",
    "Switzerland",
    "Singapore",
    "Japan",
  ]

  const handleLocationToggle = (location: string) => {
    const updated = selectedLocations.includes(location)
      ? selectedLocations.filter((l) => l !== location)
      : [...selectedLocations, location]
    onLocationChange(updated)
  }

  const handleDeadlineToggle = (deadline: string) => {
    const updated = selectedDeadlines.includes(deadline)
      ? selectedDeadlines.filter((d) => d !== deadline)
      : [...selectedDeadlines, deadline]
    onDeadlineChange(updated)
  }

  const handleFundingTypeToggle = (type: string) => {
    const updated = selectedFundingTypes.includes(type)
      ? selectedFundingTypes.filter((t) => t !== type)
      : [...selectedFundingTypes, type]
    onFundingTypeChange(updated)
  }

  const handleEligibilityToggle = (eligibility: string) => {
    const updated = selectedEligibility.includes(eligibility)
      ? selectedEligibility.filter((e) => e !== eligibility)
      : [...selectedEligibility, eligibility]
    onEligibilityChange(updated)
  }

  const handleCountryToggle = (country: string) => {
    const updated = selectedCountries.includes(country)
      ? selectedCountries.filter((c) => c !== country)
      : [...selectedCountries, country]
    onCountryChange(updated)
  }

  const totalFilters =
    selectedLocations.length +
    selectedDeadlines.length +
    selectedFundingTypes.length +
    selectedEligibility.length +
    selectedCountries.length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative bg-transparent">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {totalFilters > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalFilters}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Filter Opportunities
            {totalFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={onClearAll}>
                Clear All
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location Filter */}
          <div>
            <h4 className="font-medium mb-3">Location</h4>
            <div className="grid grid-cols-2 gap-2">
              {locations.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox
                    id={`location-${location}`}
                    checked={selectedLocations.includes(location)}
                    onCheckedChange={() => handleLocationToggle(location)}
                  />
                  <Label htmlFor={`location-${location}`} className="text-sm">
                    {location}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Deadline Filter */}
          <div>
            <h4 className="font-medium mb-3">Deadline</h4>
            <div className="grid grid-cols-1 gap-2">
              {deadlineOptions.map((deadline) => (
                <div key={deadline} className="flex items-center space-x-2">
                  <Checkbox
                    id={`deadline-${deadline}`}
                    checked={selectedDeadlines.includes(deadline)}
                    onCheckedChange={() => handleDeadlineToggle(deadline)}
                  />
                  <Label htmlFor={`deadline-${deadline}`} className="text-sm">
                    {deadline}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Funding Type Filter */}
          <div>
            <h4 className="font-medium mb-3">Funding Type</h4>
            <div className="grid grid-cols-2 gap-2">
              {fundingTypeOptions.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`funding-${type}`}
                    checked={selectedFundingTypes.includes(type)}
                    onCheckedChange={() => handleFundingTypeToggle(type)}
                  />
                  <Label htmlFor={`funding-${type}`} className="text-sm">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Eligibility Filter */}
          <div>
            <h4 className="font-medium mb-3">Eligibility</h4>
            <div className="grid grid-cols-2 gap-2">
              {eligibilityOptions.map((eligibility) => (
                <div key={eligibility} className="flex items-center space-x-2">
                  <Checkbox
                    id={`eligibility-${eligibility}`}
                    checked={selectedEligibility.includes(eligibility)}
                    onCheckedChange={() => handleEligibilityToggle(eligibility)}
                  />
                  <Label htmlFor={`eligibility-${eligibility}`} className="text-sm">
                    {eligibility}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Country Filter */}
          <div>
            <h4 className="font-medium mb-3">Country</h4>
            <div className="grid grid-cols-2 gap-2">
              {countryOptions.map((country) => (
                <div key={country} className="flex items-center space-x-2">
                  <Checkbox
                    id={`country-${country}`}
                    checked={selectedCountries.includes(country)}
                    onCheckedChange={() => handleCountryToggle(country)}
                  />
                  <Label htmlFor={`country-${country}`} className="text-sm">
                    {country}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
