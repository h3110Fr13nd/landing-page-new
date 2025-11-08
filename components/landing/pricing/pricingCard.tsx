"use client"

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, Star } from 'lucide-react'
import { PricingPlan } from './pricingPlan'


const PricingCard = ({ plan, index, isAnnual }: {
  plan: PricingPlan
  index: number
  isAnnual: boolean
}) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const Icon = plan.icon
  
  // Get current price based on billing period
  const currentPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice
  const originalPrice = isAnnual ? plan.originalAnnualPrice : plan.originalMonthlyPrice
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative group ${plan.popular ? 'z-10' : ''}`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-vibrant-blue to-phthalo-green text-white text-sm font-semibold rounded-full z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Star className="w-4 h-4 inline mr-1" />
          Most Popular
        </motion.div>
      )}

      <div className={`relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border transition-all duration-300 ${
        plan.popular 
          ? 'border-sky-blue shadow-xl shadow-vibrant-blue/20 hover:shadow-2xl hover:shadow-vibrant-blue/30' 
          : 'border-white/50 shadow-lg hover:shadow-xl'
      }`}>
        {/* Background gradient on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        
        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.gradient} text-white shadow-lg`}>
              <Icon className="w-6 h-6" />
            </div>
            {originalPrice && (
              <div className="text-right">
                <motion.div 
                  className="text-sm text-slate-400 line-through"
                  key={`original-${isAnnual ? 'annual' : 'monthly'}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {originalPrice}/{isAnnual ? 'year' : 'mo'}
                </motion.div>
                <motion.div 
                  className="text-xs text-emerald-600 font-medium"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  Save {isAnnual ? '35%' : '34%'}
                </motion.div>
              </div>
            )}
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
          <p className="text-slate-600 mb-6">{plan.description}</p>

          {/* Animated Pricing */}
          <div className="mb-8">
            <div className="flex items-baseline gap-2">
              <motion.span 
                className="text-4xl font-bold text-slate-800"
                key={`price-${isAnnual ? 'annual' : 'monthly'}`}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }}
              >
                {currentPrice}
              </motion.span>
              {currentPrice !== "Free" && currentPrice !== "Custom" && (
                <motion.span 
                  className="text-slate-600"
                  key={`period-${isAnnual ? 'annual' : 'monthly'}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  /{isAnnual ? 'year' : 'month'}
                </motion.span>
              )}
            </div>
            {isAnnual && currentPrice !== "Free" && currentPrice !== "Custom" && (
              <motion.div 
                className="text-sm text-slate-500 mt-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                Billed annually (${Math.round(parseInt(currentPrice.replace('$', '')) * 12)}/year)
              </motion.div>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <span className="text-slate-700 text-sm">{feature}</span>
              </li>
            ))}
            {plan.limitations.map((limitation, i) => (
              <li key={`limit-${i}`} className="flex items-start gap-3 opacity-60">
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="w-3 h-0.5 bg-slate-400 rounded-full" />
                </div>
                <span className="text-slate-500 text-sm">{limitation}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link 
              href={plan.href}
              className={`block w-full text-center py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-r from-vibrant-blue to-phthalo-green text-white shadow-lg hover:shadow-xl'
                  : 'bg-navy-blue text-white hover:bg-navy-blue/90'
              }`}
            >
              {plan.cta}
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}


export default PricingCard