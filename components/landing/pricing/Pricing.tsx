"use client"

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { Zap, Crown, Rocket, Users, TrendingUp } from 'lucide-react'
import PricingCard from './pricingCard'

const pricingPlans = [
  {
    name: "Starter",
    monthlyPrice: "Free",
    annualPrice: "Free",
    originalMonthlyPrice: null,
    originalAnnualPrice: null,
    description: "Perfect for freelancers just getting started",
    icon: Zap,
    gradient: "from-vibrant-blue to-sky-blue",
    popular: false,
    features: [
      "Up to 5 invoices per month",
      "Basic templates",
      "Email delivery",
      "Payment tracking",
      "Mobile app access",
      "Standard support"
    ],
    limitations: [
      "No recurring invoices",
      "Basic reporting only"
    ],
    cta: "Get Started Free",
    href: "/signup"
  },
  {
    name: "Professional",
    monthlyPrice: "$15",
    annualPrice: "$19",
    originalMonthlyPrice: "$29",
    originalAnnualPrice: "$23",
    description: "Best for growing businesses and teams",
    icon: Crown,
    gradient: "from-vibrant-blue to-phthalo-green",
    popular: true,
    features: [
      "Unlimited invoices",
      "Custom branding & templates",
      "Automated payment reminders",
      "Recurring invoices",
      "Advanced analytics",
      "Multi-currency support",
      "API access",
      "Priority support",
      "Team collaboration",
      "Export to QuickBooks"
    ],
    limitations: [],
    cta: "Start Free Trial",
    href: "/signup?plan=professional"
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    originalMonthlyPrice: null,
    originalAnnualPrice: null,
    description: "For large organizations with complex needs",
    icon: Rocket,
    gradient: "from-emerald-500 to-teal-500",
    popular: false,
    features: [
      "Everything in Professional",
      "White-label solution",
      "Advanced integrations",
      "Custom workflows",
      "Dedicated account manager",
      "SLA guarantee",
      "Advanced security",
      "Custom reporting",
      "SSO integration",
      "On-premise option"
    ],
    limitations: [],
    cta: "Contact Sales",
    href: "/contact"
  }
]

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-200px" })

  return (
    <section id="pricing" className="relative py-32 overflow-hidden">
      {/* Background with new professional palette */}
      <div className="absolute inset-0 bg-gradient-to-br from-soft-white via-sky-blue/30 to-phthalo-green/20" />
      
      {/* Animated background dots with new colors */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Small dots pattern */}
        <div className="absolute inset-0 opacity-30">
            {[...Array(50)].map((_, i) => {
              // deterministic placement so server and client render match
              const left = `${(i * 73) % 100}%`
              const top = `${(i * 37) % 100}%`
              const duration = 3 + (i % 3) * 0.8
              const delay = (i % 5) * 0.2
              return (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gradient-to-r from-vibrant-blue to-phthalo-green rounded-full"
                  style={{ left, top }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration,
                    repeat: Infinity,
                    delay,
                  }}
                />
              )
            })}
        </div>

        {/* Larger gradient blobs with new colors */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-32 h-32 bg-gradient-to-br from-vibrant-blue/30 to-sky-blue/40 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/5 w-24 h-24 bg-gradient-to-br from-phthalo-green/30 to-navy-blue/40 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, -25, 0],
            y: [0, 15, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-br from-sky-blue/30 to-vibrant-blue/40 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.5, 0.2],
            x: [0, 20, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 4 }}
        />
      </div>

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 rounded-full text-blue-700 text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TrendingUp className="w-4 h-4" />
            Pricing for Invoicing
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-navy-blue via-vibrant-blue to-phthalo-green bg-clip-text text-transparent">
              Plans for Solo Operators
            </span>
            <br />
            <span className="bg-gradient-to-r from-vibrant-blue via-phthalo-green to-navy-blue bg-clip-text text-transparent">
              and Growing Businesses
            </span>
          </h2>
          
          <p className="text-lg text-navy-blue/80 max-w-3xl mx-auto leading-relaxed mb-8">
            Fair, transparent pricing built around invoices: templates, automated reminders, payment processing fees, and team collaboration. Start free and scale as your billing needs grow.
          </p>

          {/* Billing toggle */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.span 
              className={`text-sm transition-all duration-300 ${!isAnnual ? 'text-navy-blue font-medium scale-110' : 'text-navy-blue/60'}`}
              animate={{ scale: !isAnnual ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            >
              Monthly
            </motion.span>
            <motion.button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                isAnnual ? 'bg-vibrant-blue shadow-lg shadow-vibrant-blue/30' : 'bg-sky-blue/60'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute w-5 h-5 bg-white rounded-full top-1 shadow-md"
                animate={{ x: isAnnual ? 32 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
            <motion.span 
              className={`text-sm transition-all duration-300 ${isAnnual ? 'text-slate-800 font-medium scale-110' : 'text-slate-500'}`}
              animate={{ scale: isAnnual ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
            >
              Annual
            </motion.span>
            <motion.span
              className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full"
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ 
                opacity: isAnnual ? 1 : 0, 
                scale: isAnnual ? 1 : 0.8,
                x: isAnnual ? 0 : -10
              }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            >
              Save up to 35%
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              index={index}
              isAnnual={isAnnual}
            />
          ))}
        </div>

        {/* Bottom section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Still have questions?
            </h3>
            <p className="text-slate-600 mb-6">
              Our team is here to help you find the perfect plan for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors duration-300"
              >
                <Users className="w-4 h-4" />
                Talk to Sales
              </Link>
              <Link 
                href="/help"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-300"
              >
                View FAQ
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Pricing