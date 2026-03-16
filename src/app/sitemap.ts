import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase' // This points to the file you just showed me

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://findapro.co.za'

  // 1. Fetch all Approved Providers
  const { data: providers } = await supabase
    .from('providers')
    .select('id, updated_at')
    .eq('status', 'approved')

  // 2. Fetch all Active Categories
  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, updated_at')
    .eq('is_active', true)

  // 3. Create links for Providers
  const providerUrls = (providers || []).map((pro) => ({
    url: `${baseUrl}/pro/${pro.id}`, // Update this if your profile URL is different
    lastModified: pro.updated_at ? new Date(pro.updated_at) : new Date(),
    priority: 0.6,
  }))

  // 4. Create links for Categories (e.g., /category/plumbers)
  const categoryUrls = (categories || []).map((cat) => ({
    url: `${baseUrl}/category/${cat.id}`, // Update this if your category URL is different
    lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
    priority: 0.8,
  }))

  // 5. Combine everything with your main pages
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...categoryUrls,
    ...providerUrls,
  ]
}