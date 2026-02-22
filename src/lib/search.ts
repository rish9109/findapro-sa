import { supabase } from '@/lib/supabase'

// Types
export interface Provider {
  id: string
  business_name: string
  contact_person: string | null
  contact_phone: string | null
  main_service: string
  main_service_id: string
  service_areas: string[]
  rating: number
  logo_url: string | null
  experience_years: number | null
  fees_pricing: string | null
  callout_fee: string | null
  emergency_service: boolean
  details: string | null
  certifications: string | null
  contact_email?: string | null
  verified: boolean
  insurance: boolean
  insurance_details: string | null
  accepts_card: boolean
  accepts_cash: boolean
  total_reviews: number
  provider_accreditations?: Array<{
    id: string
    custom_name: string | null
    is_custom: boolean
    accreditation_id: string | null
  }>
}

export interface Accreditation {
  id: string
  name: string
  description: string | null
  sector: string
}

export interface ServiceCategory {
  id: string
  name: string
  icon: string
  description?: string
}

export interface CityOption {
  city: string
  province: string
  provinceCode: string
}

export interface SearchFilters {
  categoryId?: string
  city?: string
  minRating?: number
  emergencyOnly?: boolean
  province?: string
}

export interface SearchResult extends Provider {
  relevanceScore: number
  matchedAccreditations?: Accreditation[] // Add this to track which accreditations matched
}

// Cache for filter options
let categoriesCache: ServiceCategory[] | null = null
let citiesCache: CityOption[] | null = null
let provincesCache: string[] | null = null
let providersCache: SearchResult[] | null = null
let accreditationsCache: Accreditation[] | null = null // Add cache for accreditations
let lastProviderFetch: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Load all accreditations
 */
async function loadAccreditations(): Promise<Accreditation[]> {
  if (accreditationsCache) {
    return accreditationsCache
  }

  const { data, error } = await supabase
    .from('accreditations')
    .select('id, name, description, sector')
    .eq('is_global', true)

  if (error) {
    console.error('Error loading accreditations:', error)
    return []
  }

  accreditationsCache = data || []
  return accreditationsCache
}

/**
 * Helper function to parse service_areas which might be stored as JSON strings
 */
function parseServiceAreas(serviceAreas: any): string[] {
  if (!serviceAreas) return []
  
  if (Array.isArray(serviceAreas)) {
    return serviceAreas
  }
  
  if (typeof serviceAreas === 'string') {
    try {
      const parsed = JSON.parse(serviceAreas)
      return Array.isArray(parsed) ? parsed : [serviceAreas]
    } catch {
      return [serviceAreas]
    }
  }
  
  return []
}

/**
 * Load all providers (with caching)
 */
async function loadAllProviders(): Promise<SearchResult[]> {
  const now = Date.now()
  if (providersCache && (now - lastProviderFetch) < CACHE_DURATION) {
    return providersCache
  }

  const { data, error } = await supabase
    .from('providers')
    .select(`
      id,
      business_name,
      contact_person,
      contact_phone,
      contact_email,
      main_service,
      main_service_id,
      service_areas,
      rating,
      logo_url,
      experience_years,
      fees_pricing,
      callout_fee,
      emergency_service,
      details,
      certifications,
      verified,
      insurance,
      insurance_details,
      accepts_card,
      accepts_cash,
      total_reviews,
      provider_accreditations (
        id,
        custom_name,
        is_custom,
        accreditation_id
      )
    `)
    .eq('status', 'approved')
    .order('business_name')

  if (error) {
    console.error('Supabase error details:', error)
    return []
  }
  
  const parsedData: SearchResult[] = data?.map(provider => ({
    ...provider,
    service_areas: parseServiceAreas(provider.service_areas),
    emergency_service: provider.emergency_service || false,
    verified: provider.verified || false,
    insurance: provider.insurance || false,
    accepts_card: provider.accepts_card || false,
    accepts_cash: provider.accepts_cash || true,
    rating: provider.rating || 0,
    total_reviews: provider.total_reviews || 0,
    experience_years: provider.experience_years || 0,
    provider_accreditations: provider.provider_accreditations || [],
    relevanceScore: 0
  })) || []

  providersCache = parsedData
  lastProviderFetch = now
  return providersCache
}

/**
 * Search providers with filters - NOW INCLUDES ACCREDITATIONS
 */
export async function searchProviders(
  searchTerm: string = '',
  filters: SearchFilters = {}
): Promise<SearchResult[]> {
  console.log('🔍 SEARCH CALLED WITH:', { searchTerm, filters })
  
  // Load all providers AND accreditations
  const [allProviders, allAccreditations] = await Promise.all([
    loadAllProviders(),
    loadAccreditations()
  ])
  
  if (allProviders.length === 0) {
    return []
  }

  const term = searchTerm.toLowerCase().trim()
  
  // Create a map of accreditation IDs to names for quick lookup
  const accreditationMap = new Map(allAccreditations.map(acc => [acc.id, acc]))
  
  // Filter providers based on search term and filters
  const filtered = allProviders.filter(provider => {
    // Apply category filter
    if (filters.categoryId && provider.main_service_id !== filters.categoryId) {
      return false
    }

    // Apply city filter
    if (filters.city) {
      const servesCity = provider.service_areas?.some(
        area => area.toLowerCase() === filters.city!.toLowerCase()
      )
      if (!servesCity) return false
    }

    // Apply minimum rating
    if (filters.minRating && (provider.rating || 0) < filters.minRating) {
      return false
    }

    // Apply emergency only
    if (filters.emergencyOnly && !provider.emergency_service) {
      return false
    }

    // If no search term, include all filtered providers
    if (!term) {
      return true
    }

    // Build searchable fields array
    const searchableFields = [
      provider.business_name?.toLowerCase() || '',
      provider.main_service?.toLowerCase() || '',
      provider.details?.toLowerCase() || '',
      provider.certifications?.toLowerCase() || '',
      ...(provider.service_areas?.map(area => area.toLowerCase()) || [])
    ]

    // Add accreditation names from provider_accreditations
    if (provider.provider_accreditations && provider.provider_accreditations.length > 0) {
      provider.provider_accreditations.forEach(pa => {
        if (pa.is_custom && pa.custom_name) {
          searchableFields.push(pa.custom_name.toLowerCase())
        } else if (pa.accreditation_id) {
          const accreditation = accreditationMap.get(pa.accreditation_id)
          if (accreditation) {
            searchableFields.push(accreditation.name.toLowerCase())
            if (accreditation.description) {
              searchableFields.push(accreditation.description.toLowerCase())
            }
          }
        }
      })
    }

    // Check if any field contains the search term
    return searchableFields.some(field => field.includes(term))
  })

  // Calculate relevance scores including accreditation matches
  const results: SearchResult[] = filtered.map(provider => {
    let score = 0
    const matchedAccreditations: Accreditation[] = []
    
    if (term) {
      const name = provider.business_name?.toLowerCase() || ''
      const service = provider.main_service?.toLowerCase() || ''
      
      // Business name matches
      if (name === term) score += 100
      else if (name.startsWith(term)) score += 80
      else if (name.includes(term)) score += 60
      
      // Service category match
      if (service.includes(term)) score += 40
      
      // Details match
      if (provider.details?.toLowerCase().includes(term)) score += 30
      
      // Service areas match
      if (provider.service_areas?.some(area => area.toLowerCase().includes(term))) {
        score += 25
      }
      
      // Certifications text match
      if (provider.certifications?.toLowerCase().includes(term)) score += 20
      
      // Accreditation matches - check each accreditation the provider has
      if (provider.provider_accreditations && provider.provider_accreditations.length > 0) {
        provider.provider_accreditations.forEach(pa => {
          if (pa.is_custom && pa.custom_name) {
            if (pa.custom_name.toLowerCase().includes(term)) {
              score += 35 // Higher score for custom accreditation match
              matchedAccreditations.push({
                id: pa.id,
                name: pa.custom_name,
                description: null,
                sector: 'Custom'
              })
            }
          } else if (pa.accreditation_id) {
            const accreditation = accreditationMap.get(pa.accreditation_id)
            if (accreditation) {
              const nameMatch = accreditation.name.toLowerCase().includes(term)
              const descMatch = accreditation.description?.toLowerCase().includes(term)
              
              if (nameMatch || descMatch) {
                score += 35 // Higher score for accreditation match
                matchedAccreditations.push(accreditation)
              }
            }
          }
        })
      }
    }

    return {
      ...provider,
      relevanceScore: score,
      matchedAccreditations: matchedAccreditations.length > 0 ? matchedAccreditations : undefined
    }
  })

  // Sort by relevance score (if search term), then by rating
  if (term) {
    results.sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }
      return (b.rating || 0) - (a.rating || 0)
    })
  } else {
    results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }

  return results
}

// Keep all your existing helper functions (getServiceCategories, getCities, getProvinces, clearCaches)
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  if (categoriesCache) {
    return categoriesCache
  }

  const { data, error } = await supabase
    .from('service_categories')
    .select('id, name, icon, description')
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    console.error('Error loading categories:', error)
    return []
  }

  categoriesCache = data || []
  return categoriesCache
}

export async function getCities(): Promise<CityOption[]> {
  if (citiesCache) {
    return citiesCache
  }

  const { data, error } = await supabase
    .from('provinces')
    .select('name, code, cities')

  if (error) {
    console.error('Error loading cities:', error)
    return []
  }

  const allCities: CityOption[] = []
  data?.forEach(province => {
    if (province.cities && Array.isArray(province.cities)) {
      province.cities.forEach(city => {
        allCities.push({
          city,
          province: province.name,
          provinceCode: province.code
        })
      })
    }
  })

  allCities.sort((a, b) => a.city.localeCompare(b.city))
  citiesCache = allCities
  return citiesCache
}

export async function getProvinces(): Promise<string[]> {
  if (provincesCache) {
    return provincesCache
  }

  const { data, error } = await supabase
    .from('provinces')
    .select('name')
    .order('name')

  if (error) {
    console.error('Error loading provinces:', error)
    return []
  }

  provincesCache = data?.map(p => p.name) || []
  return provincesCache
}

export function clearCaches() {
  categoriesCache = null
  citiesCache = null
  provincesCache = null
  providersCache = null
  accreditationsCache = null
  lastProviderFetch = 0
}