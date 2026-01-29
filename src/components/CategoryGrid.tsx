// File: src/components/CategoryGrid.tsx - UPDATED VERSION
'use client'

import { motion, useAnimation, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Users, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getCategoriesWithProviderCounts, CategoryWithCount } from '@/lib/supabase'

// Color palettes for categories - you can extend these
const colorPalettes = [
  { primary: '#8B5CF6', accent: '#A78BFA', icon: '🏠' },
  { primary: '#F59E0B', accent: '#FBBF24', icon: '🔨' },
  { primary: '#3B82F6', accent: '#60A5FA', icon: '🚗' },
  { primary: '#EC4899', accent: '#F472B6', icon: '🎨' },
  { primary: '#06B6D4', accent: '#22D3EE', icon: '💧' },
  { primary: '#FBBF24', accent: '#FDE047', icon: '⚡' },
  { primary: '#10B981', accent: '#34D399', icon: '🌱' },
  { primary: '#7C3AED', accent: '#A78BFA', icon: '💻' },
  { primary: '#F43F5E', accent: '#FB7185', icon: '💆' },
  { primary: '#F97316', accent: '#FB923C', icon: '💪' },
  { primary: '#A855F7', accent: '#C084FC', icon: '🎭' },
  { primary: '#0EA5E9', accent: '#38BDF8', icon: '📈' },
]

// Extended icon mapping for database icon values
const iconMap: Record<string, string> = {
  'home': '🏠',
  'tools': '🔨',
  'car': '🚗',
  'automotive': '🚗',
  'paint': '🎨',
  'design': '🎨',
  'water': '💧',
  'plumbing': '💧',
  'bolt': '⚡',
  'electrical': '⚡',
  'plant': '🌱',
  'gardening': '🌱',
  'computer': '💻',
  'tech': '💻',
  'spa': '💆',
  'wellness': '💆',
  'dumbbell': '💪',
  'fitness': '💪',
  'mask': '🎭',
  'entertainment': '🎭',
  'chart': '📈',
  'accounting': '📈',
  'repair': '🔧',
  'cleaning': '🧹',
  'construction': '🏗️',
  'education': '📚',
  'health': '🏥',
  'legal': '⚖️',
  'event': '🎪',
  'photography': '📷',
  'consulting': '💼',
  'transport': '🚚',
}

// Helper function to get consistent color/icon for a category
function getCategoryStyling(categoryName: string, index: number) {
  const paletteIndex = index % colorPalettes.length
  const basePalette = colorPalettes[paletteIndex]
  
  // Try to find a palette based on category name
  const nameLower = categoryName.toLowerCase()
  
  // Check for keywords in category name to assign appropriate colors/icons
  if (nameLower.includes('home') || nameLower.includes('cleaning')) {
    return { ...colorPalettes[0], icon: '🏠' }
  }
  if (nameLower.includes('repair') || nameLower.includes('fix')) {
    return { ...colorPalettes[1], icon: '🔨' }
  }
  if (nameLower.includes('car') || nameLower.includes('auto')) {
    return { ...colorPalettes[2], icon: '🚗' }
  }
  if (nameLower.includes('design') || nameLower.includes('art')) {
    return { ...colorPalettes[3], icon: '🎨' }
  }
  if (nameLower.includes('plumb') || nameLower.includes('water')) {
    return { ...colorPalettes[4], icon: '💧' }
  }
  if (nameLower.includes('electric') || nameLower.includes('power')) {
    return { ...colorPalettes[5], icon: '⚡' }
  }
  if (nameLower.includes('garden') || nameLower.includes('plant')) {
    return { ...colorPalettes[6], icon: '🌱' }
  }
  if (nameLower.includes('tech') || nameLower.includes('computer')) {
    return { ...colorPalettes[7], icon: '💻' }
  }
  if (nameLower.includes('wellness') || nameLower.includes('spa')) {
    return { ...colorPalettes[8], icon: '💆' }
  }
  if (nameLower.includes('fitness') || nameLower.includes('gym')) {
    return { ...colorPalettes[9], icon: '💪' }
  }
  
  return basePalette
}

// Helper to get icon from database value or name
function getCategoryIcon(category: CategoryWithCount, index: number) {
  // First try database icon field
  if (category.icon) {
    const mappedIcon = iconMap[category.icon.toLowerCase()]
    if (mappedIcon) return mappedIcon
    
    // If it looks like an emoji (simple check), use it
    const isLikelyEmoji = (str: string) => {
      return str.length <= 3 && // Emojis are usually 1-3 characters
             str.codePointAt(0)! > 127 // Non-ASCII characters
    }
    
    if (isLikelyEmoji(category.icon)) {
      return category.icon
    }
  }
  
  // Try to map from category name
  const nameLower = category.name.toLowerCase()
  for (const [key, emoji] of Object.entries(iconMap)) {
    if (nameLower.includes(key)) {
      return emoji
    }
  }
  
  // Fallback to index-based icon
  return colorPalettes[index % colorPalettes.length].icon
}

export default function CategoryGrid() {
  const router = useRouter()
  const { user, showAuthModal } = useAuth()
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getCategoriesWithProviderCounts()
        setCategories(data)
        
        if (data.length === 0) {
          setError('No active service categories found. Please add categories in the admin panel.')
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setError('Unable to load service categories. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
    
    // Optional: Refresh data every 5 minutes for live updates
    const intervalId = setInterval(fetchCategories, 5 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, [])

  const handleCardClick = (categoryId: string, categoryName: string) => {
    if (!user) {
      showAuthModal('login')
    } else {
      router.push(`/providers?category=${categoryId}&name=${encodeURIComponent(categoryName)}`)
    }
  }

  // Loading skeleton
  if (isLoading) {
    return <CategoryGridSkeleton />
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12 rounded-2xl bg-gradient-to-br from-luxury-navy/50 to-luxury-midnight/50 border border-white/10">
        <div className="text-white/70 text-lg mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // Empty state
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category, index) => {
        const styling = getCategoryStyling(category.name, index)
        const icon = getCategoryIcon(category, index)
        
        return (
          <CategoryCard 
            key={category.id} 
            category={{
              id: category.id,
              icon,
              label: category.name,
              color: styling.primary,
              providers: category.provider_count,
              accent: styling.accent,
              description: category.description
            }} 
            index={index}
            onClick={() => handleCardClick(category.id, category.name)}
          />
        )
      })}
    </div>
  )
}

// Loading skeleton component
function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(12)].map((_, index) => (
        <div
          key={index}
          className="h-full rounded-2xl bg-gradient-to-br from-luxury-navy to-luxury-midnight border border-white/20 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-white/20 to-white/10" />
          
          <div className="p-6 h-full">
            <div className="flex items-center gap-4 mb-6 min-h-[56px]">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <div className="h-6 bg-white/10 rounded animate-pulse mb-2" />
                <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
              </div>
            </div>
            
            <div className="h-px w-full mb-6 bg-white/10" />
            
            <div className="flex-1" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 w-10 h-10 animate-pulse" />
                <div>
                  <div className="h-7 w-12 bg-white/10 rounded animate-pulse mb-1" />
                  <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      ))}
    </div>
  )
}

// CategoryCard component - Keep your original implementation
function CategoryCard({ category, index, onClick }: { 
  category: any, 
  index: number,
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
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.4, 
            delay: index * 0.08,
          }
        }
      }}
      initial="hidden"
      animate={controls}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer h-full"
    >
      {/* Main Card - Always show effects on mobile */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-luxury-navy to-luxury-midnight border border-white/20 hover:border-white/30 transition-all duration-300 p-6 h-full">
        
        {/* Top Color Accent Bar - Richer gradient with accent color */}
        <div 
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ 
            background: `linear-gradient(90deg, ${category.accent}, ${category.color})`,
          }}
        />
        
        {/* Corner Glow - Always visible on mobile, enhanced on hover */}
        <div 
          className="absolute top-0 right-0 w-16 h-16 opacity-20 lg:opacity-0 lg:group-hover:opacity-20 transition-opacity duration-500"
          style={{ 
            background: `radial-gradient(circle at top right, ${category.color}, transparent 70%)`,
          }}
        />
        
        {/* Content Layout - Consistent spacing */}
        <div className="relative z-10 h-full flex flex-col pt-2">
          {/* Top Row: Icon + Title - Fixed height */}
          <div className="flex items-center gap-4 mb-6 min-h-[56px]">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl relative flex-shrink-0"
              style={{ 
                backgroundColor: `${category.color}20`,
                border: `1px solid ${category.color}40`
              }}
            >
              {category.icon}
              {/* Icon Glow - Always visible but subtle */}
              <div 
                className="absolute inset-0 rounded-xl opacity-10 lg:opacity-0 lg:group-hover:opacity-20 transition-opacity duration-300"
                style={{ 
                  boxShadow: `0 0 20px ${category.color}`,
                }}
              />
            </div>
            <h3 className="text-xl font-bold text-white flex-1 line-clamp-2">
              {category.label}
            </h3>
          </div>
          
          {/* Separator Line - Always visible */}
          <div 
            className="h-px w-full mb-6 opacity-40"
            style={{ backgroundColor: category.color }}
          />
          
          {/* Spacer */}
          <div className="flex-1"></div>
          
          {/* Bottom Row: Provider Count + CTA */}
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
            
            {/* CTA Arrow - Always visible on mobile, animated */}
            <motion.div 
              className="lg:opacity-0 lg:group-hover:opacity-100 lg:translate-x-4 lg:group-hover:translate-x-0 transition-all duration-300"
              animate={{ 
                x: [0, 4, 0],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                delay: index * 0.3
              }}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center relative"
                style={{ 
                  backgroundColor: `${category.color}25`,
                  border: `1px solid ${category.color}40`
                }}
              >
                <ChevronRight className="w-5 h-5" style={{ color: category.accent }} />
                {/* Arrow Pulse Effect */}
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0, 0.2, 0] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.4
                  }}
                />
              </div>
            </motion.div>
          </div>
          
        </div>
        
        {/* Bottom Accent - Always visible on mobile, enhanced on hover */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 opacity-30 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${category.color}, transparent)`,
          }}
        />
        
      </div>
      
      {/* Card Glow Effect - Subtle on mobile, enhanced on hover */}
      <motion.div 
        className="absolute -inset-1 rounded-2xl blur-md -z-10"
        style={{ backgroundColor: category.color }}
        animate={{ opacity: [0.05, 0.1, 0.05] }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
          delay: index * 0.15
        }}
      />
      
    </motion.div>
  )
}