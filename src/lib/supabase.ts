// File: src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// ==================== ENVIRONMENT VALIDATION ====================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables')
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables')
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

// ==================== MAIN CLIENT ====================
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// ==================== CATEGORY TYPES ====================
export interface ServiceCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CategoryWithCount extends ServiceCategory {
  provider_count: number
}

// ==================== CATEGORY FUNCTIONS ====================
export async function getCategoriesWithProviderCounts(): Promise<CategoryWithCount[]> {
  try {
    // Get all active categories
    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (categoriesError) throw categoriesError
    if (!categories || categories.length === 0) return []

    // Get only approved providers (status = 'approved')
    const { data: providerCounts, error: countsError } = await supabase
      .from('providers')
      .select('main_service_id')
      .eq('status', 'approved')

    if (countsError) {
      console.error('Error fetching provider counts:', countsError)
      // Continue with zero counts if query fails
    }

    // Count providers per category
    const countMap = new Map<string, number>()
    if (providerCounts) {
      providerCounts.forEach(provider => {
        if (provider.main_service_id) {
          countMap.set(
            provider.main_service_id,
            (countMap.get(provider.main_service_id) || 0) + 1
          )
        }
      })
    }

    // Merge counts with categories
    const categoriesWithCounts = categories.map(category => ({
      ...category,
      provider_count: countMap.get(category.id) || 0
    }))

    return categoriesWithCounts
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Get a single category by ID with provider count
export async function getCategoryByIdWithCount(id: string): Promise<CategoryWithCount | null> {
  try {
    // Get category
    const { data: category, error: categoryError } = await supabase
      .from('service_categories')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (categoryError) throw categoryError
    if (!category) return null

    // Get provider count (only approved providers)
    const { count, error: countError } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('main_service_id', id)
      .eq('status', 'approved')

    if (countError) {
      console.error('Error counting providers:', countError)
    }

    return {
      ...category,
      provider_count: count || 0
    }
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}