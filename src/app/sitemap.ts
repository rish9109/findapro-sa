import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

// This function turns "John's Plumbing" into "johns-plumbing"
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://findapro.co.za'

  // 1. Fetch Approved Providers (Matching your schema)
  const { data: providers } = await supabase
    .from('providers')
    .select('id, business_name, updated_at')
    .eq('status', 'approved')

  const providerEntries = (providers || []).map((pro) => {
    const slug = slugify(pro.business_name);
    return {
      // URL looks like: /pro/johns-plumbing-uuid
      url: `${baseUrl}/pro/${slug}-${pro.id}`,
      lastModified: pro.updated_at ? new Date(pro.updated_at) : new Date(),
      priority: 0.7,
    }
  })

  // 2. Fetch Active Categories (Matching your schema)
  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, name, updated_at')
    .eq('is_active', true)

  const categoryEntries = (categories || []).map((cat) => {
    const slug = slugify(cat.name);
    return {
      // URL looks like: /category/plumbers-uuid
      url: `${baseUrl}/category/${slug}-${cat.id}`,
      lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
      priority: 0.8,
    }
  })

  // 3. Static Pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.5 },
  ]

  return [...staticPages, ...categoryEntries, ...providerEntries]
}