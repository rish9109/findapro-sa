// File: src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create the real Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if we're using mock data
export const useMockData = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

// Mock data for development when needed
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
    hourly_rate: '550',
    other_services: 'Residential and commercial electrical work'
  }
]

// Helper function to get data (mocks or real)
export async function fetchProviders() {
  if (useMockData) {
    console.log('📦 Using mock data')
    return { data: mockProviders, error: null }
  }

  try {
    console.log('🌐 Fetching from Supabase...')
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('status', 'approved')
      .limit(10)
    
    return { data, error }
  } catch (error: any) {
    console.error('Supabase error:', error)
    return { data: null, error }
  }
}

// Helper function to insert data
export async function insertProvider(providerData: any) {
  if (useMockData) {
    console.log('📝 Mock insert:', providerData)
    const mockId = 'mock-' + Date.now()
    return { 
      data: [{ id: mockId, ...providerData }], 
      error: null 
    }
  }

  try {
    const { data, error } = await supabase
      .from('providers')
      .insert([providerData])
      .select()
    
    return { data, error }
  } catch (error: any) {
    console.error('Insert error:', error)
    return { data: null, error }
  }
}

// Test connection
export async function testConnection() {
  if (useMockData) {
    return { 
      success: true, 
      message: 'Using mock data mode', 
      data: [] 
    }
  }

  try {
    const { data, error } = await supabase
      .from('providers')
      .select('count')
      .limit(1)
    
    if (error) {
      return { 
        success: false, 
        message: `Database error: ${error.message}`,
        data: null 
      }
    }
    
    return { 
      success: true, 
      message: 'Connected to Supabase successfully!',
      data 
    }
  } catch (error: any) {
    return { 
      success: false, 
      message: `Connection failed: ${error.message}`,
      data: null 
    }
  }
}