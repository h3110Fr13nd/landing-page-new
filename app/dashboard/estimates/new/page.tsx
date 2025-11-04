"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Customer, COUNTRIES } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

import HeaderActions from './components/HeaderActions'
import EstimateDetailsCard from './components/EstimateDetailsCard'
import CustomerCard from './components/CustomerCard'
import ItemsCard from './components/ItemsCard'
import NotesCard from './components/NotesCard'
import BusinessInfoCard from './components/BusinessInfoCard'
import FinancialSummaryCard from './components/FinancialSummaryCard'

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
]

const TAX_PRESETS = [
  { label: 'No Tax', value: 0 },
  { label: 'GST 10%', value: 10 },
  { label: 'VAT 20%', value: 20 },
  { label: 'HST 13%', value: 13 },
  { label: 'Custom', value: null },
]

interface CustomerFormData {
  displayName: string
  firstName: string
  lastName: string
  businessName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  businessRegNumber: string
}

export default function NewEstimatePage() {
  const router = useRouter()
  const { user, userProfile, getAuthHeaders } = useAuth()
  const { toast } = useToast()
  
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [nextEstimateNumber, setNextEstimateNumber] = useState('')
  
  // Customer creation modal state
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    displayName: '',
    firstName: '',
    lastName: '',
    businessName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    businessRegNumber: '',
  })
  
  // Header Section State
  const [estimateNumber, setEstimateNumber] = useState('')
  const [estimateDate, setEstimateDate] = useState<Date>()
  const [validUntil, setValidUntil] = useState<Date>()
  
  // Customer Section State
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [businessInfo, setBusinessInfo] = useState('')
  
  // Items Section State
  const [items, setItems] = useState<Array<{
    itemName: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>>([
    { itemName: '', description: '', quantity: 1, unitPrice: 0, total: 0 }
  ])
  
  // Financial Section State
  const [currency, setCurrency] = useState('')
  const [taxPreset, setTaxPreset] = useState<number | null>(0)
  const [customTaxRate, setCustomTaxRate] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [total, setTotal] = useState(0)
  
  // Notes Section State
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')

  useEffect(() => {
    if (user && userProfile) {
      fetchCustomers()
      fetchNextEstimateNumber()
      initializeDefaults()
    }
  }, [user, userProfile])

  const initializeDefaults = () => {
    const today = new Date()
    const validDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    
    setEstimateDate(today)
    setValidUntil(validDate)
    setCurrency(userProfile?.currency || 'USD')
    
    // Set business information from user profile
    const businessLines: string[] = []
    if (userProfile?.businessName) businessLines.push(userProfile.businessName)
    if (userProfile?.displayName) businessLines.push(userProfile.displayName)
    if (userProfile?.address) businessLines.push(userProfile.address)
    if (userProfile?.city && userProfile?.state) {
      businessLines.push(`${userProfile.city}, ${userProfile.state} ${userProfile.zipCode || ''}`.trim())
    }
    if (userProfile?.phone) businessLines.push(`Phone: ${userProfile.phone}`)
    if (userProfile?.email) businessLines.push(`Email: ${userProfile.email}`)
    if (userProfile?.businessRegNumber) {
      const country = COUNTRIES.find(c => c.code === userProfile.country)
      const label = country?.businessRegLabel || 'Business Registration'
      businessLines.push(`${label}: ${userProfile.businessRegNumber}`)
    }
    
    setBusinessInfo(businessLines.join('\n'))
    
    setTerms('This estimate is valid for 30 days from the issue date. Prices are subject to change after expiration.')
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers', {
        headers: await getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchNextEstimateNumber = async () => {
    try {
      const response = await fetch('/api/estimates', {
        headers: await getAuthHeaders()
      })
      
      if (response.ok) {
        const estimates = await response.json()
        const highestNumber = estimates.reduce((max: number, estimate: any) => {
          const num = parseInt(estimate.number.replace('EST-', ''))
          return num > max ? num : max
        }, 0)
        
        const nextNum = `EST-${(highestNumber + 1).toString().padStart(4, '0')}`
        setNextEstimateNumber(nextNum)
        setEstimateNumber(nextNum)
      }
    } catch (error) {
      console.error('Error fetching next estimate number:', error)
      setNextEstimateNumber('EST-0001')
      setEstimateNumber('EST-0001')
    }
  }

  const calculateTotals = () => {
    const newSubtotal = items.reduce((sum, item) => sum + item.total, 0)
    const effectiveTaxRate = taxPreset === null ? customTaxRate : (taxPreset || 0)
    const newTaxAmount = (newSubtotal * effectiveTaxRate) / 100
    const newTotal = newSubtotal + newTaxAmount
    
    setSubtotal(newSubtotal)
    setTaxAmount(newTaxAmount)
    setTotal(newTotal)
  }

  useEffect(() => {
    calculateTotals()
  }, [items, taxPreset, customTaxRate])

  const addItem = () => {
    setItems([...items, { itemName: '', description: '', quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }
    
    setItems(newItems)
  }

  const createCustomer = async () => {
    if (!customerFormData.displayName) {
      toast({
        title: "Error",
        description: "Display name is required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(customerFormData),
      })

      if (response.ok) {
        const newCustomer = await response.json()
        setCustomers([...customers, newCustomer])
        setSelectedCustomerId(newCustomer.id)
        setShowCustomerDialog(false)
        
        // Reset form
        setCustomerFormData({
          displayName: '',
          firstName: '',
          lastName: '',
          businessName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          businessRegNumber: '',
        })
        
        toast({
          title: "Success",
          description: "Customer created successfully",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to create customer",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive",
      })
    }
  }

  const saveEstimate = async (isDraft = true) => {
    if (!selectedCustomerId) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      })
      return
    }

    if (!estimateDate || !validUntil) {
      toast({
        title: "Error",
        description: "Please set estimate and valid until dates",
        variant: "destructive",
      })
      return
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice < 0)) {
      toast({
        title: "Error",
        description: "Please fill in all item details correctly",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const estimateData = {
        customerId: selectedCustomerId,
        number: estimateNumber,
        issueDate: estimateDate,
        validUntil: validUntil,
        currency,
        notes,
        terms,
        items: items.map(item => ({
          itemName: item.itemName || undefined,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      }

      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(await getAuthHeaders()),
        },
        body: JSON.stringify(estimateData),
      })

      if (response.ok) {
        const estimate = await response.json()
        toast({
          title: "Success",
          description: `Estimate ${estimate.number} ${isDraft ? 'saved as draft' : 'created'} successfully`,
        })
        router.push('/dashboard/estimates')
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to create estimate",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating estimate:', error)
      toast({
        title: "Error",
        description: "Failed to create estimate",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode)
    return currency?.symbol || currencyCode
  }

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)
  const selectedCountry = COUNTRIES.find(c => c.code === customerFormData.country)

  return (
    <div className="container-mobile space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Link href="/dashboard/estimates">
              <a>
                <button className="p-0 h-auto text-sm text-gray-700 inline-flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Estimates
                </button>
              </a>
            </Link>
          </div>
          <h1 className="mobile-h1">New Estimate</h1>
          <p className="mobile-text text-gray-600">Create a new cost estimate for your client</p>
        </div>
        <HeaderActions saveEstimate={saveEstimate} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <EstimateDetailsCard
            estimateNumber={estimateNumber}
            setEstimateNumber={setEstimateNumber}
            currency={currency}
            setCurrency={setCurrency}
            estimateDate={estimateDate}
            setEstimateDate={setEstimateDate}
            validUntil={validUntil}
            setValidUntil={setValidUntil}
            CURRENCIES={CURRENCIES}
          />

          <CustomerCard
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            setSelectedCustomerId={setSelectedCustomerId}
            showCustomerDialog={showCustomerDialog}
            setShowCustomerDialog={setShowCustomerDialog}
            customerFormData={customerFormData}
            setCustomerFormData={setCustomerFormData}
            createCustomer={createCustomer}
            COUNTRIES={COUNTRIES}
            selectedCountry={selectedCountry}
          />

          <ItemsCard
            items={items}
            addItem={addItem}
            removeItem={removeItem}
            updateItem={updateItem}
            currency={currency}
            getCurrencySymbol={getCurrencySymbol}
          />

          <NotesCard notes={notes} setNotes={setNotes} terms={terms} setTerms={setTerms} />
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-4 sm:space-y-6">
          <BusinessInfoCard businessInfo={businessInfo} setBusinessInfo={setBusinessInfo} />

          <FinancialSummaryCard
            subtotal={subtotal}
            taxPreset={taxPreset}
            setTaxPreset={setTaxPreset}
            customTaxRate={customTaxRate}
            setCustomTaxRate={setCustomTaxRate}
            taxAmount={taxAmount}
            total={total}
            currency={currency}
            getCurrencySymbol={getCurrencySymbol}
            TAX_PRESETS={TAX_PRESETS}
          />
        </div>
      </div>
    </div>
  )
}