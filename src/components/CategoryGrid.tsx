// File: src/components/CategoryGrid.tsx - EXPLICIT COLOR MAPPING
'use client'

import { motion, useAnimation, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Users, ChevronRight, RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCategoriesWithProviderCounts, CategoryWithCount } from '@/lib/supabase'

// Color palettes for categories - 27 COMPLETELY DIFFERENT colors
// Each color is distinct and cannot be confused with another
const colorPalettes = [
  { primary: '#FF0000', accent: '#FF3333', name: 'bright-red' },        // 0 - Pest Control
  { primary: '#FFA500', accent: '#FFB733', name: 'orange' },            // 1 - Air-con & Hvac
  { primary: '#FFFF00', accent: '#FFFF33', name: 'yellow' },            // 2 - Home Maintenance
  { primary: '#008000', accent: '#33A033', name: 'dark-green' },        // 3 - Gardening & Landscaping
  { primary: '#0000FF', accent: '#3333FF', name: 'pure-blue' },         // 4 - Other Services
  { primary: '#4B0082', accent: '#6A3B9A', name: 'indigo' },            // 5 - Cleaning Services
  { primary: '#EE82EE', accent: '#F09BF0', name: 'violet' },            // 6 - Automotive Care
  { primary: '#FF00FF', accent: '#FF33FF', name: 'magenta' },           // 7 - Transportation
  { primary: '#00FFFF', accent: '#33FFFF', name: 'cyan' },              // 8 - Medical & Healthcare
  { primary: '#FF1493', accent: '#FF47B3', name: 'deep-pink' },         // 9 - Tech & IT
  { primary: '#00FF00', accent: '#33FF33', name: 'lime' },              // 10 - Legal Services
  { primary: '#808000', accent: '#A0A033', name: 'olive' },             // 11 - Babysitting & Childcare
  { primary: '#800080', accent: '#A033A0', name: 'purple' },            // 12 - Food & Entertainment
  { primary: '#008080', accent: '#33A0A0', name: 'teal' },              // 13 - Pet Care
  { primary: '#000080', accent: '#3333A0', name: 'navy' },              // 14 - Event Planning
  { primary: '#9ACD32', accent: '#ADD966', name: 'yellow-green' },      // 15 - Financial Services
  { primary: '#FF4500', accent: '#FF6A33', name: 'orange-red' },        // 16 - Security
  { primary: '#DA70D6', accent: '#E093D6', name: 'orchid' },            // 17 - Education & Tutoring
  { primary: '#40E0D0', accent: '#66E6D6', name: 'turquoise' },         // 18 - Plumbing
  { primary: '#C0C0C0', accent: '#D0D0D0', name: 'silver' },            // 19 - Carpentry & Woodwork
  { primary: '#CD7F32', accent: '#D79B5C', name: 'bronze' },            // 20 - Building & Construction
  { primary: '#7CFC00', accent: '#96FD33', name: 'lawn-green' },        // 21 - Electrical
  { primary: '#FF6347', accent: '#FF836B', name: 'tomato' },            // 22 - Beauty & Wellness
  { primary: '#4682B4', accent: '#6B9BC4', name: 'steel-blue' },        // 23 - Venues & Hiring
  { primary: '#D2691E', accent: '#DB8847', name: 'chocolate' },         // 24 - Fashion & Jewellery
  { primary: '#2E8B57', accent: '#57A27C', name: 'sea-green' },         // 25 - Manufacturing & Engineering
  { primary: '#8A2BE2', accent: '#A155E8', name: 'blue-violet' },       // 26 - Reserve (if new category added)
]

// Icon mapping
const iconMap: Record<string, string> = {
  'pest': '🐜',
  'air-con': '🌡️', 'hvac': '🌡️',
  'home maintenance': '🛠️',
  'garden': '🌿', 'landscaping': '🌿',
  'other': '👔',
  'cleaning': '🧹',
  'automotive': '🚘', 'car': '🚗',
  'transport': '🚚',
  'medical': '➕', 'health': '➕',
  'tech': '💻', 'it': '💻',
  'legal': '⚖️',
  'baby': '🧸', 'childcare': '🧸',
  'food': '🥂', 'entertainment': '🥂',
  'pet': '🐶',
  'event': '🎉',
  'financial': '💰', 'accounting': '💰',
  'security': '🔒',
  'education': '📚', 'tutor': '📚',
  'plumbing': '🔧',
  'carpentry': '🪚', 'wood': '🪚',
  'building': '🏗️', 'construction': '🏗️',
  'electrical': '⚡',
  'beauty': '💅', 'wellness': '💆',
  'venue': '🪑', 'hiring': '🪑',
  'fashion': '💍', 'jewellery': '💍',
  'manufacturing': '⚙️', 'engineering': '⚙️',
}

// EXPLICIT color mapping - each category gets ONE specific color
function getCategoryColor(categoryName: string) {
  const nameLower = categoryName.toLowerCase()
  
  // Pest Control
  if (nameLower.includes('pest')) 
    return colorPalettes[0] // Bright Red
  
  // Air-con & Hvac
  if (nameLower.includes('air-con') || nameLower.includes('hvac')) 
    return colorPalettes[1] // Orange
  
  // Home Maintenance
  if (nameLower.includes('home maintenance')) 
    return colorPalettes[2] // Yellow
  
  // Gardening & Landscaping
  if (nameLower.includes('garden') || nameLower.includes('landscaping')) 
    return colorPalettes[3] // Dark Green
  
  // Other Services
  if (nameLower.includes('other')) 
    return colorPalettes[4] // Pure Blue
  
  // Cleaning Services
  if (nameLower.includes('cleaning')) 
    return colorPalettes[5] // Indigo
  
  // Automotive Care
  if (nameLower.includes('automotive') || nameLower.includes('car')) 
    return colorPalettes[6] // Violet
  
  // Transportation
  if (nameLower.includes('transport')) 
    return colorPalettes[7] // Magenta
  
  // Medical & Healthcare
  if (nameLower.includes('medical') || nameLower.includes('health')) 
    return colorPalettes[8] // Cyan
  
  // Tech & IT
  if (nameLower.includes('tech') || nameLower.includes('it')) 
    return colorPalettes[9] // Deep Pink
  
  // Legal Services
  if (nameLower.includes('legal')) 
    return colorPalettes[10] // Lime Green
  
  // Babysitting & Childcare
  if (nameLower.includes('baby') || nameLower.includes('child')) 
    return colorPalettes[11] // Olive
  
  // Food & Entertainment
  if (nameLower.includes('food') || nameLower.includes('entertainment')) 
    return colorPalettes[12] // Purple
  
  // Pet Care
  if (nameLower.includes('pet')) 
    return colorPalettes[13] // Teal
  
  // Event Planning
  if (nameLower.includes('event')) 
    return colorPalettes[14] // Navy
  
  // Financial Services
  if (nameLower.includes('financial') || nameLower.includes('accounting')) 
    return colorPalettes[15] // Yellow-Green
  
  // Security
  if (nameLower.includes('security')) 
    return colorPalettes[16] // Orange-Red
  
  // Education & Tutoring
  if (nameLower.includes('education') || nameLower.includes('tutor')) 
    return colorPalettes[17] // Orchid
  
  // Plumbing
  if (nameLower.includes('plumbing')) 
    return colorPalettes[18] // Turquoise
  
  // Carpentry & Woodwork
  if (nameLower.includes('carpentry') || nameLower.includes('wood')) 
    return colorPalettes[19] // Silver
  
  // Building & Construction
  if (nameLower.includes('building') || nameLower.includes('construction')) 
    return colorPalettes[20] // Bronze
  
  // Electrical
  if (nameLower.includes('electrical')) 
    return colorPalettes[21] // Lawn Green
  
  // Beauty & Wellness
  if (nameLower.includes('beauty') || nameLower.includes('wellness')) 
    return colorPalettes[22] // Tomato
  
  // Venues & Hiring
  if (nameLower.includes('venue') || nameLower.includes('hiring')) 
    return colorPalettes[23] // Steel Blue
  
  // Fashion & Jewellery
  if (nameLower.includes('fashion') || nameLower.includes('jewellery')) 
    return colorPalettes[24] // Chocolate
  
  // Manufacturing & Engineering
  if (nameLower.includes('manufacturing') || nameLower.includes('engineering')) 
    return colorPalettes[25] // Sea Green
  
  // Fallback for any new category
  return colorPalettes[26] // Blue-Violet
}

// Get icon
function getCategoryIcon(category: CategoryWithCount) {
  if (category.icon) return category.icon
  const nameLower = category.name.toLowerCase()
  for (const [key, emoji] of Object.entries(iconMap)) {
    if (nameLower.includes(key)) return emoji
  }
  return '📋'
}

export default function CategoryGrid() {
  const router = useRouter()
  const { user, showAuthModal } = useAuth()
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async (isBackgroundRefresh = false) => {
    if (isBackgroundRefresh) setIsRefreshing(true)
    
    try {
      const data = await getCategoriesWithProviderCounts()
      
      // Sort alphabetically
      const sortedData = [...data].sort((a, b) => 
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      )
      
      setCategories(sortedData)
      setError(null)
      
      // Cache the data
      sessionStorage.setItem('cachedCategories', JSON.stringify({
        data: sortedData,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      
      if (categories.length === 0) {
        const cached = sessionStorage.getItem('cachedCategories')
        if (cached) {
          const { data: cachedData } = JSON.parse(cached)
          setCategories(cachedData)
        } else {
          setError('Unable to load service categories. Please try again later.')
        }
      }
    } finally {
      setIsLoading(false)
      if (isBackgroundRefresh) setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const loadCategories = async () => {
      // Check cache first
      const cached = sessionStorage.getItem('cachedCategories')
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached)
        setCategories(cachedData)
        setIsLoading(false)
        
        // Refresh if cache is older than 5 minutes
        if (Date.now() - timestamp > 5 * 60 * 1000) {
          fetchCategories(true)
        }
        return
      }
      
      // No cache, fetch fresh
      await fetchCategories()
    }

    loadCategories()
  }, [])

  const handleCardClick = (categoryId: string, categoryName: string) => {
    if (!user) {
      showAuthModal('login')
    } else {
      router.push(`/providers?category=${categoryId}&name=${encodeURIComponent(categoryName)}`)
    }
  }

  if (isLoading) {
    return <CategoryGridSkeleton />
  }

  if (error && categories.length === 0) {
    return (
      <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-luxury-navy/50 to-luxury-midnight/50 border border-white/10">
        <div className="text-white/70 text-lg mb-4">{error}</div>
        <button
          onClick={() => fetchCategories()}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70 text-lg">No service categories available.</p>
        <p className="text-white/50 text-sm mt-2">
          Categories will appear here once they are added and activated.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => {
          // Get explicit color based on category name
          const palette = getCategoryColor(category.name)
          const icon = getCategoryIcon(category)
          
          return (
            <CategoryCard 
              key={category.id} 
              category={{
                id: category.id,
                icon,
                label: category.name,
                color: palette.primary,
                providers: category.provider_count,
                accent: palette.accent,
                description: category.description
              }} 
              onClick={() => handleCardClick(category.id, category.name)}
            />
          )
        })}
      </div>

      {isRefreshing && (
        <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-2 text-sm text-white/70 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Updating categories...</span>
        </div>
      )}
    </div>
  )
}

function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(12)].map((_, index) => (
        <div
          key={index}
          className="h-full rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 overflow-hidden"
        >
          <div className="p-6 h-full">
            <div className="flex items-center gap-4 mb-6 min-h-[56px]">
              <div className="w-14 h-14 rounded-xl bg-gray-700/50 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <div className="h-6 bg-gray-700/50 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-700/30 rounded animate-pulse w-3/4" />
              </div>
            </div>
            
            <div className="h-px w-full mb-6 bg-gray-700/30" />
            
            <div className="flex-1" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-700/50 w-10 h-10 animate-pulse" />
                <div>
                  <div className="h-7 w-12 bg-gray-700/50 rounded animate-pulse mb-1" />
                  <div className="h-4 w-16 bg-gray-700/30 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-700/50 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CategoryCard({ category, onClick }: { 
  category: any, 
  onClick: () => void 
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
      }}
      initial="hidden"
      animate={controls}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer h-full"
    >
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-luxury-navy to-luxury-midnight border border-white/20 hover:border-white/30 transition-all duration-300 p-6 h-full">
        
        <div 
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ background: `linear-gradient(90deg, ${category.accent}, ${category.color})` }}
        />
        
        <div 
          className="absolute top-0 right-0 w-16 h-16 opacity-20 lg:opacity-0 lg:group-hover:opacity-20 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at top right, ${category.color}, transparent 70%)` }}
        />
        
        <div className="relative z-10 h-full flex flex-col pt-2">
          <div className="flex items-center gap-4 mb-6 min-h-[56px]">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl relative flex-shrink-0"
              style={{ 
                backgroundColor: `${category.color}20`,
                border: `1px solid ${category.color}40`
              }}
            >
              {category.icon}
              <div 
                className="absolute inset-0 rounded-xl opacity-10 lg:opacity-0 lg:group-hover:opacity-20 transition-opacity duration-300"
                style={{ boxShadow: `0 0 20px ${category.color}` }}
              />
            </div>
            <h3 className="text-xl font-bold text-white flex-1 line-clamp-2">
              {category.label}
            </h3>
          </div>
          
          <div 
            className="h-px w-full mb-6 opacity-40"
            style={{ backgroundColor: category.color }}
          />
          
          <div className="flex-1"></div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ 
                  backgroundColor: `${category.color}20`,
                  border: `1px solid ${category.color}30`
                }}
              >
                <Users className="w-5 h-5" style={{ color: category.accent }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {category.providers.toLocaleString()}
                </div>
                <div className="text-sm" style={{ color: `${category.accent}90` }}>
                  Providers
                </div>
              </div>
            </div>
            
            <motion.div 
              className="lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-4 lg:group-hover:translate-x-0 transition-all duration-300"
              animate={{ x: [0, 4, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center relative"
                style={{ 
                  backgroundColor: `${category.color}25`,
                  border: `1px solid ${category.color}40`
                }}
              >
                <ChevronRight className="w-5 h-5" style={{ color: category.accent }} />
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0, 0.2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </div>
        </div>
        
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 opacity-30 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${category.color}, transparent)` }}
        />
      </div>
      
      <motion.div 
        className="absolute -inset-1 rounded-2xl blur-md -z-10"
        style={{ backgroundColor: category.color }}
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
      />
    </motion.div>
  )
}