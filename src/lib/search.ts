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

// Database search function - BALANCED
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

    // Text search with good balance
    if (query && query.trim()) {
      const searchTerm = query.trim()
      const words = searchTerm.split(/\s+/).filter(word => word.length > 1)
      
      if (words.length > 1) {
        // OR condition for multi-word (more flexible)
        const conditions = words.map(word => 
          `business_name.ilike.%${word}%,` +
          `main_service.ilike.%${word}%,` +
          `details.ilike.%${word}%,` +
          `service_areas.ilike.%${word}%`
        ).join(',')
        
        dbQuery = dbQuery.or(conditions)
      } else {
        const singleWord = words[0] || searchTerm
        dbQuery = dbQuery.or(
          `business_name.ilike.%${singleWord}%,` +
          `main_service.ilike.%${singleWord}%,` +
          `details.ilike.%${singleWord}%,` +
          `service_areas.ilike.%${singleWord}%`
        )
      }
    }

    // Apply filters
    if (filters) {
      if (filters.category) dbQuery = dbQuery.eq('main_service_id', filters.category)
      if (filters.city) dbQuery = dbQuery.ilike('service_areas', `%${filters.city}%`)
      if (filters.province) dbQuery = dbQuery.ilike('service_areas', `%${filters.province}%`)
      if (filters.verified) dbQuery = dbQuery.eq('verified', true)
      if (filters.emergency) dbQuery = dbQuery.eq('emergency_service', true)
      if (filters.minRating) dbQuery = dbQuery.gte('rating', filters.minRating)
    }

    const { data, error } = await dbQuery
    if (error) throw error

    // Transform and score results
    let results = (data || []).map(provider => ({
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

    // Score and sort for relevance
    if (query && query.trim() && results.length > 0) {
      const searchTerm = query.trim().toLowerCase()
      const searchWords = searchTerm.split(/\s+/)
      
      results = results
        .map(provider => {
          let score = 0
          const name = provider.business_name.toLowerCase()
          const service = provider.main_service.toLowerCase()
          const details = (provider.details || '').toLowerCase()
          const areas = provider.service_areas.join(' ').toLowerCase()
          
          let nameMatches = 0, serviceMatches = 0, detailsMatches = 0, areasMatches = 0
          
          for (const word of searchWords) {
            if (name.includes(word)) nameMatches++
            if (service.includes(word)) serviceMatches++
            if (details.includes(word)) detailsMatches++
            if (areas.includes(word)) areasMatches++
          }
          
          const wordCount = searchWords.length
          score += (nameMatches / wordCount) * 40
          score += (serviceMatches / wordCount) * 25
          score += (areasMatches / wordCount) * 20
          score += (detailsMatches / wordCount) * 30
          
          if (name.includes(searchTerm)) score += 15
          if (provider.verified) score += 5
          if (nameMatches + serviceMatches + areasMatches >= wordCount) score += 10
          
          return { ...provider, _score: Math.round(score) }
        })
        .filter(provider => provider._score > (searchTerm.length <= 3 ? 10 : 15))
        .sort((a, b) => (b._score || 0) - (a._score || 0))
        .map(({ _score, ...provider }) => provider)
    }

    return results
  } catch (error) {
    console.error('Error searching providers in DB:', error)
    return []
  }
}
// Client-side filtering function (for live search) - BALANCED
export function filterProvidersLocally(
  providers: SearchResult[],
  query: string
): SearchResult[] {
  if (!query.trim() || !providers.length) return providers
  
  const searchTerm = query.trim().toLowerCase()
  const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0)
  
  if (searchWords.length === 0) return providers
  
  const scoredResults = providers.map(provider => {
    let score = 0
    const name = provider.business_name.toLowerCase()
    const service = provider.main_service.toLowerCase()
    const details = (provider.details || '').toLowerCase()
    const areas = provider.service_areas.join(' ').toLowerCase()
    
    // Additional fields for better coverage
    const feesInfo = (provider.fees_pricing || provider.callout_fee || '').toLowerCase()
    const accreditationInfo = provider.provider_accreditations
      ?.map(a => a.custom_name || '')
      .join(' ')
      .toLowerCase() || ''
    
    let nameMatches = 0
    let serviceMatches = 0
    let detailsMatches = 0
    let areasMatches = 0
    let otherMatches = 0
    
    // Count matches for each word
    for (const word of searchWords) {
      if (name.includes(word)) {
        nameMatches++
        if (name.startsWith(word) || name.includes(' ' + word)) {
          score += 4 // Word boundary bonus
        }
      }
      if (service.includes(word)) {
        serviceMatches++
        if (service.startsWith(word) || service.includes(' ' + word)) {
          score += 3
        }
      }
      if (areas.includes(word)) {
        areasMatches++
        score += 2
      }
      if (details.includes(word)) {
        detailsMatches++
        score += 1.5
      }
      if (feesInfo.includes(word) || accreditationInfo.includes(word)) {
        otherMatches++
        score += 1
      }
    }
    
    const wordCount = searchWords.length
    
    // Base score from matches (more weight on meaningful matches)
    if (nameMatches > 0) score += (nameMatches / wordCount) * 35
    if (serviceMatches > 0) score += (serviceMatches / wordCount) * 25
    if (areasMatches > 0) score += (areasMatches / wordCount) * 20
    if (detailsMatches > 0) score += (detailsMatches / wordCount) * 12
    if (otherMatches > 0) score += (otherMatches / wordCount) * 8
    
    // Bonus for exact matches or good coverage
    if (nameMatches === wordCount) score += 20
    if (serviceMatches === wordCount) score += 15
    if (areasMatches === wordCount) score += 10
    
    // For short queries (2-4 chars), be helpful but not overwhelming
    if (searchTerm.length >= 2 && searchTerm.length <= 4) {
      // Prioritize name and area matches for short queries
      if (name.startsWith(searchTerm)) score += 15
      if (areas.includes(searchTerm)) score += 10
      if (service.startsWith(searchTerm)) score += 8
      
      // Ensure some results show for short queries
      if (name.includes(searchTerm) || areas.includes(searchTerm)) {
        score += 10 // Boost to ensure visibility
      }
    }
    
    // For longer queries (5+ chars), be more precise
    if (searchTerm.length >= 5) {
      if (name.includes(searchTerm)) score += 10
      if (areas.includes(searchTerm)) score += 8
      
      // Higher standard for longer queries
      if (nameMatches + serviceMatches + areasMatches === 0) {
        score *= 0.5 // Reduce score if no main field matches
      }
    }
    
    return { provider, score: Math.round(score) }
  })
  
  // Dynamic threshold based on query length
  // - 2-3 chars: lower threshold to show suggestions
  // - 4+ chars: higher threshold for relevance
  let threshold = 12 // default
  if (searchTerm.length <= 4) {
    threshold = 8 // Show more for very short queries
  } else if (searchTerm.length >= 6) {
    threshold = 15 // Stricter for longer queries
  }
  
  return scoredResults
    .filter(item => item.score > threshold)
    .sort((a, b) => b.score - a.score)
    .map(item => item.provider)
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