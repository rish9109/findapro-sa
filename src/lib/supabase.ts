// File: src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// ==================== ENVIRONMENT VALIDATION ====================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate required environment variables
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables')
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in environment variables')
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
}

// ==================== CLIENTS CREATION ====================
// Main client for client-side operations (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Admin client for server-side operations (uses service role key)
// Only create if service key exists
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Check if we're using mock data
export const useMockData = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

if (useMockData) {
  console.log('⚠️ Using mock data mode - Supabase connections are mocked')
}

// ==================== MOCK DATA ====================
export const mockProviders = [
  {
    id: 'mock-1',
    business_name: 'John Plumbing Services',
    contact_person: 'John Smith',
    contact_email: 'john@plumbing.co.za',
    contact_phone: '+27 11 123 4567',
    city: 'Johannesburg',
    province: 'Gauteng',
    main_service: 'Plumbing',
    status: 'approved',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    hourly_rate: '450',
    other_services: 'Leak repairs, installations, maintenance'
  },
  {
    id: 'mock-2',
    business_name: 'Sparky Electrical',
    contact_person: 'Mike Johnson',
    contact_email: 'mike@sparky.co.za',
    contact_phone: '+27 21 987 6543',
    city: 'Cape Town',
    province: 'Western Cape',
    main_service: 'Electrical',
    status: 'approved',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    hourly_rate: '550',
    other_services: 'Residential and commercial electrical work'
  }
]

// ==================== HELPER FUNCTIONS ====================
export interface Provider {
  id: string
  business_name: string
  contact_person: string
  contact_email: string
  contact_phone?: string
  city: string
  province: string
  main_service: string
  status: 'pending' | 'approved' | 'rejected' | 'paused' | 'deleted'
  verified: boolean
  created_at: string
  updated_at: string
  hourly_rate?: string
  other_services?: string
  rejection_reason?: string
  pause_reason?: string
  deletion_reason?: string
}

// Helper function to get providers
export async function fetchProviders(options?: {
  status?: Provider['status'] | Provider['status'][]
  limit?: number
  offset?: number
}) {
  if (useMockData) {
    console.log('📦 Using mock providers data')
    let filtered = [...mockProviders]
    
    if (options?.status) {
      const statuses = Array.isArray(options.status) ? options.status : [options.status]
      filtered = filtered.filter(p => statuses.includes(p.status))
    }
    
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit)
    }
    
    return { data: filtered, error: null, count: filtered.length }
  }

  try {
    console.log('🌐 Fetching providers from Supabase...')
    
    let query = supabase
      .from('providers')
      .select('*', { count: 'exact' })
    
    // Apply status filter if provided
    if (options?.status) {
      if (Array.isArray(options.status)) {
        query = query.in('status', options.status)
      } else {
        query = query.eq('status', options.status)
      }
    }
    
    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('❌ Supabase query error:', error)
      return { data: null, error, count: 0 }
    }
    
    console.log(`✅ Found ${count || data?.length || 0} providers`)
    return { data, error, count }
    
  } catch (error: any) {
    console.error('❌ Unexpected error fetching providers:', error)
    return { data: null, error, count: 0 }
  }
}

// Helper function to insert a provider
export async function insertProvider(providerData: Omit<Provider, 'id' | 'created_at' | 'updated_at'>) {
  if (useMockData) {
    console.log('📝 Mock provider insert:', providerData)
    const mockId = 'mock-' + Date.now()
    const newProvider = {
      id: mockId,
      ...providerData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    return { 
      data: [newProvider], 
      error: null 
    }
  }

  try {
    const { data, error } = await supabase
      .from('providers')
      .insert([{
        ...providerData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
    
    if (error) {
      console.error('❌ Insert error:', error)
    } else {
      console.log('✅ Provider inserted successfully:', data?.[0]?.id)
    }
    
    return { data, error }
  } catch (error: any) {
    console.error('❌ Unexpected insert error:', error)
    return { data: null, error }
  }
}

// Get single provider by ID
export async function getProviderById(id: string) {
  if (useMockData) {
    console.log('📦 Fetching mock provider by ID:', id)
    const provider = mockProviders.find(p => p.id === id)
    return { 
      data: provider || null, 
      error: provider ? null : { message: 'Provider not found' }
    }
  }

  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('❌ Get provider error:', error)
    }
    
    return { data, error }
  } catch (error: any) {
    console.error('❌ Unexpected error getting provider:', error)
    return { data: null, error }
  }
}

// Update provider status
export async function updateProviderStatus(
  id: string, 
  status: Provider['status'], 
  options?: {
    reason?: string
    adminEmail?: string
  }
) {
  if (useMockData) {
    console.log('📝 Mock status update:', { id, status, ...options })
    const provider = mockProviders.find(p => p.id === id)
    if (provider) {
      provider.status = status
      provider.updated_at = new Date().toISOString()
      
      // Add reason based on status
      if (status === 'rejected' && options?.reason) {
        provider.rejection_reason = options.reason
      } else if (status === 'paused' && options?.reason) {
        provider.pause_reason = options.reason
      } else if (status === 'deleted' && options?.reason) {
        provider.deletion_reason = options.reason
      }
    }
    return { data: provider ? [provider] : null, error: null }
  }

  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString()
    }
    
    // Add reason based on status
    if (status === 'rejected') {
      updateData.rejection_reason = options?.reason
    } else if (status === 'paused') {
      updateData.pause_reason = options?.reason
    } else if (status === 'deleted') {
      updateData.deletion_reason = options?.reason
      updateData.deleted_at = new Date().toISOString()
    } else if (status === 'approved') {
      // Clear any previous rejection/pause reasons
      updateData.rejection_reason = null
      updateData.pause_reason = null
    }
    
    const { data, error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('❌ Update status error:', error)
    } else {
      console.log(`✅ Provider ${id} status updated to: ${status}`)
    }
    
    return { data, error }
  } catch (error: any) {
    console.error('❌ Unexpected error updating status:', error)
    return { data: null, error }
  }
}

// ==================== CONNECTION TESTING ====================
export async function testConnection() {
  if (useMockData) {
    return { 
      success: true, 
      message: 'Using mock data mode', 
      data: [],
      timestamp: new Date().toISOString()
    }
  }

  try {
    // Test basic query
    const { data, error } = await supabase
      .from('providers')
      .select('count')
      .limit(1)
      .single()
    
    if (error) {
      console.error('❌ Database connection test failed:', error)
      return { 
        success: false, 
        message: `Database error: ${error.message}`,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
    
    // Test admin connection if available
    let adminTest = { success: false, message: 'Service key not configured' }
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.from('email_templates').select('count').limit(1)
        adminTest = { success: true, message: 'Admin connection OK' }
      } catch (adminError: any) {
        adminTest = { success: false, message: `Admin connection failed: ${adminError.message}` }
      }
    }
    
    return { 
      success: true, 
      message: 'Connected to Supabase successfully!',
      data,
      adminTest,
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('❌ Connection test failed:', error)
    return { 
      success: false, 
      message: `Connection failed: ${error.message}`,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

// Get database statistics
export async function getDatabaseStats() {
  if (useMockData) {
    return {
      providers: mockProviders.length,
      templates: 6, // Mock template count
      environment: 'mock'
    }
  }

  try {
    const [
      providersCount,
      templatesCount
    ] = await Promise.all([
      supabase.from('providers').select('*', { count: 'exact', head: true }),
      supabase.from('email_templates').select('*', { count: 'exact', head: true })
    ])
    
    return {
      providers: providersCount.count || 0,
      templates: templatesCount.count || 0,
      environment: process.env.NODE_ENV
    }
  } catch (error) {
    console.error('Error getting stats:', error)
    return {
      providers: 0,
      templates: 0,
      environment: 'error'
    }
  }
}

// ==================== EMAIL TEMPLATES ====================
export async function getEmailTemplate(name: string) {
  if (useMockData) {
    console.log('📦 Using mock email template:', name)
    // Return mock template structure
    return {
      data: {
        id: 'mock-template',
        name,
        subject: `Mock subject for ${name}`,
        body: `Mock body for ${name} with {{variables}}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      error: null
    }
  }

  try {
    // Use admin client if available (bypasses RLS)
    const client = supabaseAdmin || supabase
    
    const { data, error } = await client
      .from('email_templates')
      .select('*')
      .eq('name', name)
      .single()
    
    if (error) {
      console.error(`❌ Error fetching template "${name}":`, error)
    }
    
    return { data, error }
  } catch (error: any) {
    console.error(`❌ Unexpected error fetching template "${name}":`, error)
    return { data: null, error }
  }
}

// ==================== HEALTH CHECK ENDPOINT ====================
export async function healthCheck() {
  const connectionTest = await testConnection()
  const stats = await getDatabaseStats()
  
  return {
    status: connectionTest.success ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mockMode: useMockData,
    connection: connectionTest,
    stats,
    services: {
      supabase: connectionTest.success,
      resend: !!process.env.RESEND_API_KEY,
      adminClient: !!supabaseAdmin
    }
  }
}