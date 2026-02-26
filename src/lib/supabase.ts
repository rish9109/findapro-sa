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

// ==================== ADMIN CLIENT ====================
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase // Fallback to regular client if no service key

if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not set. Admin operations may be limited.')
}

// ==================== BUSINESS FEATURES TYPES ====================
export interface BusinessFeature {
  id: string
  name: string
  category: string | null
  // Removed: description, icon, is_global, sort_order, created_at
}

export interface ProviderBusinessFeature {
  id: string
  provider_id: string
  feature_id: string | null
  custom_name: string | null
  custom_description: string | null
  is_custom: boolean
  position: number
  is_verified: boolean
  created_at: string
  updated_at: string
  // Joined fields
  feature?: BusinessFeature
}

// ==================== TYPE DEFINITIONS ====================
export interface Provider {
  id: string
  user_id: string
  business_name: string
  contact_person: string
  contact_email: string
  contact_phone?: string
  alternate_phone?: string
  main_service: string
  main_service_id?: string
  service_area?: string
  other_services?: string
  experience_years?: string
  certifications?: string
  physical_address?: string
  city: string
  province: string
  province_id?: string
  service_areas?: string  // ✅ KEEP THIS - it's your JSON field
  hourly_rate?: string
  callout_fee?: string
  accepts_card: boolean
  accepts_cash: boolean
  deposit_required: boolean
  emergency_service: boolean
  insurance: boolean
  insurance_details?: string
  status: 'pending' | 'approved' | 'rejected' | 'pause' | 'deleted' | 'suspended'
  verified: boolean
  launch_trial: boolean
  created_at: string
  updated_at?: string
  rejection_reason?: string
  pause_reason?: string
  deletion_reason?: string
  logo_url?: string
  // Relations
  business_features?: ProviderBusinessFeature[]
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  created_at: string
  updated_at: string
}

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

// ==================== SAFE PROVIDER HELPER ====================
export type SafeProvider = {
  id: string
  business_name: string
  contact_person: string
  contact_email: string
  contact_phone: string
  alternate_phone?: string
  main_service: string
  service_areas: any
  status: string
  created_at: string
  submitted_at: string
  rejection_reason?: string
  pause_reason?: string
  deletion_reason?: string
  fees_pricing?: string
  callout_fee?: string
  // Relations
  business_features?: ProviderBusinessFeature[]
}

export function extractProviderData(provider: any): SafeProvider {
  return {
    id: provider.id || '',
    business_name: provider.business_name || '',
    contact_person: provider.contact_person || '',
    contact_email: provider.contact_email || '',
    contact_phone: provider.contact_phone || 'Not provided',
    alternate_phone: provider.alternate_phone || '',
    main_service: provider.main_service || '',
    service_areas: provider.service_areas || [],
    status: provider.status || 'pending',
    created_at: provider.created_at || new Date().toISOString(),
    submitted_at: provider.submitted_at || provider.created_at || new Date().toISOString(),
    rejection_reason: provider.rejection_reason || '',
    pause_reason: provider.pause_reason || '',
    deletion_reason: provider.deletion_reason || '',
    fees_pricing: provider.fees_pricing || '',
    callout_fee: provider.callout_fee || '',
    business_features: provider.business_features || []
  }
}

// ==================== BUSINESS FEATURES HELPER FUNCTIONS ====================
export function getFeatureDisplayName(feature: ProviderBusinessFeature): string {
  if (feature.is_custom) {
    return feature.custom_name || 'Custom Feature'
  }
  return feature.feature?.name || 'Business Feature'
}

export function getFeatureDescription(feature: ProviderBusinessFeature): string {
  if (feature.is_custom) {
    return feature.custom_description || ''
  }
  return '' // No description for global features
}

// Fetch all business features (now sorted alphabetically by name)
export async function getBusinessFeatures(category?: string): Promise<BusinessFeature[]> {
  try {
    let query = supabase
      .from('business_features')
      .select('*')
      .order('name'); // Sort alphabetically
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching business features:', error);
    return [];
  }
}

// Get all unique business feature categories
export async function getBusinessFeatureCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('business_features')
      .select('category')
      .not('category', 'is', null)
      .order('category');
    
    if (error) throw error;
    
    // Get unique categories
    const categories = [...new Set(data.map(item => item.category))];
    return categories;
  } catch (error) {
    console.error('Error fetching business feature categories:', error);
    return [];
  }
}

// Get provider's business features
export async function getProviderBusinessFeatures(providerId: string): Promise<ProviderBusinessFeature[]> {
  try {
    const { data, error } = await supabase
      .from('provider_business_features')
      .select(`
        *,
        feature:business_features(*)
      `)
      .eq('provider_id', providerId)
      .order('position');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching provider business features:', error);
    return [];
  }
}

// Save provider's business features
export async function saveProviderBusinessFeatures(
  providerId: string, 
  features: any[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, delete existing features
    const { error: deleteError } = await supabase
      .from('provider_business_features')
      .delete()
      .eq('provider_id', providerId)
    
    if (deleteError) throw deleteError
    
    if (features.length === 0) {
      return { success: true }
    }
    
    // Prepare new features for insertion
    const featuresToInsert = features.map((feat, index) => ({
      provider_id: providerId,
      feature_id: feat.is_custom ? null : feat.feature_id,
      custom_name: feat.is_custom ? feat.custom_name : null,
      custom_description: feat.is_custom ? feat.custom_description : null,
      is_custom: feat.is_custom || false,
      position: index,
      is_verified: false
    }))
    
    const { error: insertError } = await supabase
      .from('provider_business_features')
      .insert(featuresToInsert)
    
    if (insertError) throw insertError
    
    return { success: true }
  } catch (error: any) {
    console.error('Error saving provider business features:', error)
    return { success: false, error: error.message }
  }
}

// ==================== EMAIL TEMPLATE FUNCTIONS ====================
export async function getEmailTemplate(name: string): Promise<{
  data: EmailTemplate | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', name)
      .single()

    if (error) {
      console.error(`Error fetching email template "${name}":`, error)
      return { data: null, error }
    }

    if (!data) {
      console.warn(`Email template "${name}" not found in database`)
      return { data: null, error: new Error(`Template "${name}" not found`) }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error(`Unexpected error fetching template "${name}":`, error)
    return { data: null, error }
  }
}

export async function getFallbackEmailTemplate(): Promise<EmailTemplate | null> {
  try {
    const { data } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', 'listing_submitted')
      .single()

    return data
  } catch (error) {
    console.error('Error fetching fallback email template:', error)
    return null
  }
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

// ==================== PROVIDER FUNCTIONS ====================

// Get ALL user listings including rejected, paused, etc.
export const getUserListings = async (userId: string): Promise<Provider[]> => {
  const { data, error } = await supabase
    .from('providers')
    .select(`
      *,
      business_features:provider_business_features(
        *,
        feature:business_features(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Transform or filter out unwanted statuses
  const validListings = (data || [])
    .filter(provider => 
      provider.status !== 'deleted' && 
      provider.status !== 'suspended'
    )
    .map(provider => ({
      ...provider,
      status: provider.status === 'deleted' ? 'pause' : provider.status,
    }));

  return validListings;
};

// Get single provider by ID with all relations
export async function getProviderById(providerId: string): Promise<Provider | null> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        provider_accreditations(*),
        business_features:provider_business_features(
          *,
          feature:business_features(*)
        )
      `)
      .eq('id', providerId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching provider:', error);
    return null;
  }
}

// Delete a provider listing
export async function deleteProviderListing(listingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('providers')
      .delete()
      .eq('id', listingId)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting listing:', error)
    return { success: false, error: error.message }
  }
}

// ==================== EMAIL UPDATE FUNCTIONS ====================
export async function updateUserEmailWithVerification(newEmail: string): Promise<{ 
  success: boolean; 
  error?: string; 
  verificationSent?: boolean 
}> {
  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail
    })

    if (error) {
      console.error('Email update error:', error)
      return { 
        success: false, 
        error: error.message,
        verificationSent: false
      }
    }

    return { 
      success: true,
      verificationSent: true 
    }
  } catch (error: any) {
    console.error('Unexpected error updating email:', error)
    return { 
      success: false, 
      error: error.message,
      verificationSent: false
    }
  }
}

export async function refreshAuthSession(): Promise<{ 
  success: boolean; 
  user?: any; 
  error?: string 
}> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ==================== FAVORITE FUNCTIONS ====================
export interface UserFavorite {
  id: string
  user_id: string
  provider_id: string
  created_at: string
}

// Get user's favorite provider IDs
export async function getUserFavorites(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('provider_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data?.map(item => item.provider_id) || []
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return []
  }
}

// Add a favorite
export async function addFavorite(userId: string, providerId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        provider_id: providerId
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error adding favorite:', error)
    return false
  }
}

// Remove a favorite
export async function removeFavorite(userId: string, providerId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('provider_id', providerId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error removing favorite:', error)
    return false
  }
}

// Toggle favorite status
export async function toggleFavoriteSupabase(userId: string, providerId: string): Promise<boolean> {
  try {
    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('provider_id', providerId)
      .single()

    if (existing) {
      return await removeFavorite(userId, providerId)
    } else {
      return await addFavorite(userId, providerId)
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return false
  }
}

// Check if a provider is favorited
export async function isProviderFavorited(userId: string, providerId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('provider_id', providerId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }
    
    return !!data
  } catch (error) {
    console.error('Error checking favorite status:', error)
    return false
  }
}

// Get favorite providers with full details
export async function getFavoriteProviders(userId: string): Promise<any[]> {
  try {
    const { data: favorites, error: favError } = await supabase
      .from('user_favorites')
      .select('provider_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (favError) throw favError
    
    if (!favorites || favorites.length === 0) {
      return []
    }

    const providerIds = favorites.map(fav => fav.provider_id)
    
    const { data: providers, error: providerError } = await supabase
      .from('providers')
      .select(`
        *,
        business_features:provider_business_features(
          *,
          feature:business_features(*)
        )
      `)
      .in('id', providerIds)
      .eq('status', 'approved')

    if (providerError) throw providerError
    
    // Preserve favorite order
    return providers?.sort((a, b) => {
      const indexA = providerIds.indexOf(a.id)
      const indexB = providerIds.indexOf(b.id)
      return indexA - indexB
    }) || []
  } catch (error) {
    console.error('Error fetching favorite providers:', error)
    return []
  }
}