import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

// Helper to make names URL-friendly
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://findapro.co.za'

  // 1. Fetch Providers
  const { data: providers } = await supabase
    .from('providers')
    .select('id, business_name, updated_at')
    .eq('status', 'approved')

  const providerEntries = (providers || []).map((pro) => ({
    // Result: findapro.co.za/pro/super-plumbers-123-abc
    url: `${baseUrl}/pro/${slugify(pro.business_name)}-${pro.id}`,
    lastModified: pro.updated_at ? new Date(pro.updated_at) : new Date(),
    priority: 0.7,
  }))

  // 2. Fetch Categories
  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, name, updated_at')
    .eq('is_active', true)

  const categoryEntries = (categories || []).map((cat) => ({
    // Result: findapro.co.za/category/plumbing-456-def
    url: `${baseUrl}/category/${slugify(cat.name)}-${cat.id}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
    priority: 0.8,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.5 },
    ...categoryEntries,
    ...providerEntries,
  ]
}