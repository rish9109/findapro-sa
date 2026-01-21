// File: src/components/CategoryGrid.tsx - FINAL VERSION WITH ORIGINAL ANIMATIONS
'use client'

import { motion, useAnimation, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Users, ChevronRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

const categories = [
  { 
    id: 'home-services',
    icon: '🏠', 
    label: 'Home Services', 
    color: '#8B5CF6',
    providers: 1250,
    accent: '#A78BFA'
  },
  { 
    id: 'repairs',
    icon: '🔨', 
    label: 'Repairs', 
    color: '#F59E0B',
    providers: 892,
    accent: '#FBBF24'
  },
  { 
    id: 'automotive',
    icon: '🚗', 
    label: 'Automotive', 
    color: '#3B82F6',
    providers: 721,
    accent: '#60A5FA'
  },
  { 
    id: 'design',
    icon: '🎨', 
    label: 'Design', 
    color: '#EC4899',
    providers: 543,
    accent: '#F472B6'
  },
  { 
    id: 'plumbing',
    icon: '💧', 
    label: 'Plumbing', 
    color: '#06B6D4',
    providers: 824,
    accent: '#22D3EE'
  },
  { 
    id: 'electrical',
    icon: '⚡', 
    label: 'Electrical', 
    color: '#FBBF24',
    providers: 945,
    accent: '#FDE047'
  },
  { 
    id: 'gardening',
    icon: '🌱', 
    label: 'Gardening', 
    color: '#10B981',
    providers: 621,
    accent: '#34D399'
  },
  { 
    id: 'tech-support',
    icon: '💻', 
    label: 'Tech Support', 
    color: '#7C3AED',
    providers: 487,
    accent: '#A78BFA'
  },
  { 
    id: 'wellness',
    icon: '💆', 
    label: 'Wellness', 
    color: '#F43F5E',
    providers: 365,
    accent: '#FB7185'
  },
  { 
    id: 'fitness',
    icon: '💪', 
    label: 'Fitness', 
    color: '#F97316',
    providers: 278,
    accent: '#FB923C'
  },
  { 
    id: 'entertainment',
    icon: '🎭', 
    label: 'Entertainment', 
    color: '#A855F7',
    providers: 213,
    accent: '#C084FC'
  },
  { 
    id: 'accounting',
    icon: '📈', 
    label: 'Accounting', 
    color: '#0EA5E9',
    providers: 412,
    accent: '#38BDF8'
  },
]

export default function CategoryGrid() {
  const router = useRouter()

  const handleCardClick = (categoryId: string) => {
    router.push(`/providers?category=${categoryId}`)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category, index) => (
        <CategoryCard 
          key={category.id} 
          category={category} 
          index={index}
          onClick={handleCardClick}
        />
      ))}
    </div>
  )
}

function CategoryCard({ category, index, onClick }: { 
  category: any, 
  index: number,
  onClick: (id: string) => void 
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
      onClick={() => onClick(category.id)}
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