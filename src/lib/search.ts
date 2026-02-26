import { supabase } from './supabase'
import Fuse from 'fuse.js'

export interface SearchResult {
  id: string
  business_name: string
  main_service: string
  main_service_id?: string
  service_areas: string[]
  fees_pricing?: string | null
  callout_fee?: string | null
  rating: number
  total_reviews: number
  details?: string
  experience_years: number
  emergency_service: boolean
  insurance: boolean
  accepts_card: boolean
  accepts_cash: boolean
  verified: boolean
  provider_accreditations?: any[]
  business_features?: any[]
}

export interface SearchFilters {
  category?: string
  city?: string
  province?: string
  verified?: boolean
  emergency?: boolean
  minRating?: number
}

export interface ServiceCategory {
  id: string
  name: string
  icon?: string
}

export interface CityOption {
  city: string
  province: string
}

// Cache for providers data
let providersCache: SearchResult[] | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Load all approved providers (cached)
export async function loadAllProviders(): Promise<SearchResult[]> {
  // Check if cache is still valid
  if (providersCache && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
    console.log('Returning cached providers')
    return providersCache
  }

  try {
    console.log('Fetching fresh providers data...')
    
    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        provider_accreditations (
          id, 
          custom_name, 
          is_custom, 
          accreditation_id
        ),
        business_features:provider_business_features(
          *,
          feature:business_features(*)
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }
    
    console.log(`Fetched ${data?.length || 0} providers`)
    
    const transformedData: SearchResult[] = (data || []).map(provider => ({
      id: provider.id,
      business_name: provider.business_name,
      main_service: provider.main_service || '',
      main_service_id: provider.main_service_id,
      service_areas: provider.service_areas 
        ? provider.service_areas.split(',').map((s: string) => s.trim())
        : [],
      fees_pricing: provider.fees_pricing,
      callout_fee: provider.callout_fee,
      rating: provider.rating || 4.5,
      total_reviews: provider.total_reviews || 0,
      details: provider.details,
      experience_years: provider.experience_years || 0,
      emergency_service: provider.emergency_service || false,
      insurance: provider.insurance || false,
      accepts_card: provider.accepts_card || false,
      accepts_cash: provider.accepts_cash || true,
      verified: provider.verified || false,
      provider_accreditations: provider.provider_accreditations || [],
      business_features: provider.business_features || []
    }))
    
    // Update cache
    providersCache = transformedData
    cacheTimestamp = Date.now()
    
    return transformedData
  } catch (error) {
    console.error('Error loading providers:', error)
    return []
  }
}

// Database search function - for initial search
export async function searchProvidersInDB(
  query: string,
  filters?: SearchFilters
): Promise<SearchResult[]> {
  try {
    console.log('Searching in DB for:', query)
    
    let dbQuery = supabase
      .from('providers')
      .select(`
        *,
        provider_accreditations (
          id, 
          custom_name, 
          is_custom, 
          accreditation_id
        ),
        business_features:provider_business_features(
          *,
          feature:business_features(*)
        )
      `)
      .eq('status', 'approved')

    // Add text search if query exists
    if (query && query.trim()) {
      const searchTerm = query.trim()
      dbQuery = dbQuery.or(
        `business_name.ilike.%${searchTerm}%,` +
        `main_service.ilike.%${searchTerm}%,` +
        `details.ilike.%${searchTerm}%`
      )
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        dbQuery = dbQuery.eq('main_service_id', filters.category)
      }
      
      if (filters.city) {
        dbQuery = dbQuery.ilike('service_areas', `%${filters.city}%`)
      }
      
      if (filters.province) {
        dbQuery = dbQuery.ilike('service_areas', `%${filters.province}%`)
      }
      
      if (filters.verified) {
        dbQuery = dbQuery.eq('verified', true)
      }
      
      if (filters.emergency) {
        dbQuery = dbQuery.eq('emergency_service', true)
      }
      
      if (filters.minRating) {
        dbQuery = dbQuery.gte('rating', filters.minRating)
      }
    }

    const { data, error } = await dbQuery

    if (error) throw error

    // Transform the data
    return (data || []).map(provider => ({
      id: provider.id,
      business_name: provider.business_name,
      main_service: provider.main_service || '',
      main_service_id: provider.main_service_id,
      service_areas: provider.service_areas 
        ? provider.service_areas.split(',').map((s: string) => s.trim())
        : [],
      fees_pricing: provider.fees_pricing,
      callout_fee: provider.callout_fee,
      rating: provider.rating || 4.5,
      total_reviews: provider.total_reviews || 0,
      details: provider.details,
      experience_years: provider.experience_years || 0,
      emergency_service: provider.emergency_service || false,
      insurance: provider.insurance || false,
      accepts_card: provider.accepts_card || false,
      accepts_cash: provider.accepts_cash || true,
      verified: provider.verified || false,
      provider_accreditations: provider.provider_accreditations || [],
      business_features: provider.business_features || []
    }))
  } catch (error) {
    console.error('Error searching providers in DB:', error)
    return []
  }
}

// Client-side filtering function (for live search)
export function filterProvidersLocally(
  providers: SearchResult[],
  query: string
): SearchResult[] {
  if (!query.trim() || !providers.length) return providers
  
  const fuse = new Fuse(providers, {
    keys: [
      { name: 'business_name', weight: 2 },
      { name: 'main_service', weight: 1.5 },
      { name: 'details', weight: 1 },
      { name: 'service_areas', weight: 1 }
    ],
    threshold: 0.4,
    ignoreLocation: true,
  })
  
  return fuse.search(query).map(result => result.item)
}

// Keep original searchProviders for backward compatibility
export async function searchProviders(
  query: string,
  filters?: SearchFilters
): Promise<SearchResult[]> {
  return searchProvidersInDB(query, filters)
}

// Get unique service categories from providers
export async function getServiceCategories(): Promise<ServiceCategory[]> {
  try {
    // First try to get from service_categories table
    const { data: categoryData, error: categoryError } = await supabase
      .from('service_categories')
      .select('id, name, icon')
      .order('name')
    
    if (!categoryError && categoryData && categoryData.length > 0) {
      return categoryData
    }
    
    // Fallback: extract from providers
    const providers = await loadAllProviders()
    const categoryMap = new Map<string, ServiceCategory>()
    
    providers.forEach(provider => {
      if (provider.main_service_id && !categoryMap.has(provider.main_service_id)) {
        categoryMap.set(provider.main_service_id, {
          id: provider.main_service_id,
          name: provider.main_service
        })
      }
    })
    
    return Array.from(categoryMap.values())
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Get unique cities from providers
export async function getCities(): Promise<CityOption[]> {
  try {
    const providers = await loadAllProviders()
    const cityMap = new Map<string, string>()
    
    providers.forEach(provider => {
      provider.service_areas.forEach(area => {
        const parts = area.split(',').map(s => s.trim())
        if (parts.length >= 1) {
          const city = parts[0]
          const province = parts.length >= 2 ? parts[1] : 'Unknown'
          
          if (!cityMap.has(city)) {
            cityMap.set(city, province)
          }
        }
      })
    })
    
    return Array.from(cityMap.entries()).map(([city, province]) => ({
      city,
      province
    })).sort((a, b) => a.city.localeCompare(b.city))
  } catch (error) {
    console.error('Error fetching cities:', error)
    return []
  }
}

// Get unique provinces from providers
export async function getProvinces(): Promise<string[]> {
  try {
    const providers = await loadAllProviders()
    const provinceSet = new Set<string>()
    
    providers.forEach(provider => {
      provider.service_areas.forEach(area => {
        const parts = area.split(',').map(s => s.trim())
        if (parts.length >= 2) {
          provinceSet.add(parts[1])
        }
      })
    })
    
    return Array.from(provinceSet).sort()
  } catch (error) {
    console.error('Error fetching provinces:', error)
    return []
  }
}

// Clear cache
export function clearProviderCache() {
  providersCache = null
  cacheTimestamp = null
  console.log('Provider cache cleared')
}