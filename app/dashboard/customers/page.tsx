"use client"

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { useFetchOnce } from '@/hooks/use-fetch-once'
import { Customer, COUNTRIES } from '@/lib/types'
import { Plus, Edit, Trash2, User, Building } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { FadeIn, AnimatedCard, GradientText } from '@/components/dashboard/animated-components'

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

export default function CustomersPage() {
  const { user, getAuthHeaders } = useAuth()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>({
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

  const fetchCustomers = useCallback(async () => {
    if (!user) return
    try {
      const headers = await getAuthHeaders()
      const response = await fetch('/api/customers', { headers })
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }, [user, getAuthHeaders])

  useFetchOnce(fetchCustomers, [fetchCustomers])

  const resetForm = () => {
    setFormData({
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
    setEditingCustomer(null)
  }

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        displayName: customer.displayName,
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        businessName: customer.businessName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || '',
        country: customer.country || '',
        businessRegNumber: customer.businessRegNumber || '',
      })
    } else {
      resetForm()
    }
    setShowDialog(true)
  }

  const handleCloseDialog = () => {
    setShowDialog(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Frontend validation
    const trimmedDisplayName = formData.displayName.trim()
    if (!trimmedDisplayName) {
      toast({
        title: 'Validation Error',
        description: 'Display name is required',
        variant: 'destructive',
      })
      return
    }
    
    // Update formData with trimmed values
    const cleanFormData = {
      ...formData,
      displayName: trimmedDisplayName,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      businessName: formData.businessName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zipCode: formData.zipCode.trim(),
      country: formData.country.trim(),
      businessRegNumber: formData.businessRegNumber.trim(),
    }

    try {
      const url = editingCustomer 
        ? `/api/customers/${editingCustomer.id}`
        : '/api/customers'
      
      const method = editingCustomer ? 'PUT' : 'POST'
      
      const payload = editingCustomer 
        ? cleanFormData
        : cleanFormData

      const headers = await getAuthHeaders()
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        await fetchCustomers()
        handleCloseDialog()
        toast({
          title: editingCustomer ? 'Customer updated' : 'Customer created',
          description: `${cleanFormData.displayName} has been ${editingCustomer ? 'updated' : 'added'} successfully.`,
        })
      } else {
        const errorData = await response.json()
        console.error('Customer save error:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to save customer')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save customer. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Are you sure you want to delete ${customer.displayName}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchCustomers()
        toast({
          title: 'Customer deleted',
          description: `${customer.displayName} has been deleted successfully.`,
        })
      } else {
        throw new Error('Failed to delete customer')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete customer. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const getCountryConfig = (countryCode: string) => {
    return COUNTRIES.find(c => c.code === countryCode)
  }

  if (loading) {
    return (
      <FadeIn className="container-mobile">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
          <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
        </div>
      </FadeIn>
    )
  }

  return (
    <FadeIn className="container-mobile space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold">
          <GradientText variant="primary">Customers</GradientText>
        </h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()} 
              className="w-full sm:w-auto touch-target bg-gradient-to-r from-vibrant-blue to-phthalo-green hover:from-vibrant-blue/90 hover:to-phthalo-green/90 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Add Customer</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    required
                    placeholder="Name shown on invoices"
                    className={!formData.displayName.trim() && formData.displayName.length > 0 ? 'border-red-500' : ''}
                  />
                  {!formData.displayName.trim() && formData.displayName.length > 0 && (
                    <p className="text-sm text-red-500">Display name cannot be empty</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select 
                    value={formData.country} 
                    onValueChange={(value) => setFormData({ ...formData, country: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.country && (
                  <div className="space-y-2">
                    <Label htmlFor="businessRegNumber">
                      {getCountryConfig(formData.country)?.businessRegLabel}
                    </Label>
                    <Input
                      id="businessRegNumber"
                      value={formData.businessRegNumber}
                      onChange={(e) => setFormData({ ...formData, businessRegNumber: e.target.value })}
                      placeholder={getCountryConfig(formData.country)?.businessRegLabel}
                    />
                  </div>
                )}

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main St"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="NY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="order-2 sm:order-1">
                  Cancel
                </Button>
                <Button type="submit" className="order-1 sm:order-2">
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <AnimatedCard className="bg-white/80 backdrop-blur-md shadow-lg border border-gray-200/50 rounded-xl">
        <CardHeader className="border-b border-gray-200/50">
          <CardTitle className="text-navy-blue">All Customers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500">
              <div className="relative inline-block mb-4">
                <User className="w-12 h-12 sm:w-16 sm:w-16 mx-auto text-vibrant-blue opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-r from-vibrant-blue/20 to-phthalo-green/20 blur-xl" />
              </div>
              <p className="text-sm sm:text-base font-medium text-navy-blue">No customers yet</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Add your first customer to get started</p>
            </div>
          ) : (
            <div className="responsive-table">
              <div className="block sm:hidden">
                {/* Mobile Card Layout */}
                <div className="space-y-3 p-3">
                  {customers.map((customer) => (
                    <div key={customer.id} className="bg-white/90 border border-gray-200/50 rounded-lg p-3 space-y-2 shadow-sm hover:shadow-md hover:bg-gradient-to-r hover:from-sky-blue/10 hover:to-transparent hover:border-vibrant-blue/30 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 p-2 rounded-full bg-gradient-to-br from-vibrant-blue/10 to-phthalo-green/10">
                            {customer.businessName ? (
                              <Building className="w-5 h-5 text-phthalo-green" />
                            ) : (
                              <User className="w-5 h-5 text-vibrant-blue" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-navy-blue truncate">{customer.displayName}</div>
                            {customer.firstName && customer.lastName && (
                              <div className="text-sm text-gray-500 truncate">
                                {customer.firstName} {customer.lastName}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(customer)}
                            className="touch-target p-1 h-8 w-8 border-vibrant-blue/30 hover:bg-vibrant-blue/10 hover:border-vibrant-blue/50"
                          >
                            <Edit className="w-3 h-3 text-vibrant-blue" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(customer)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 touch-target p-1 h-8 w-8"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        {customer.email && <div className="text-blue-600">{customer.email}</div>}
                        {customer.phone && <div className="text-gray-600">{customer.phone}</div>}
                        {customer.city && customer.state && (
                          <div className="text-gray-500">{customer.city}, {customer.state}</div>
                        )}
                        {customer.businessName && (
                          <div className="text-gray-700">{customer.businessName}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden sm:block">
                {/* Desktop Table Layout */}
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Business Info</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-gradient-to-r hover:from-sky-blue/10 hover:to-transparent transition-all duration-300">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 p-2 rounded-full bg-gradient-to-br from-vibrant-blue/10 to-phthalo-green/10">
                          {customer.businessName ? (
                            <Building className="w-6 h-6 text-phthalo-green" />
                          ) : (
                            <User className="w-6 h-6 text-vibrant-blue" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-navy-blue">{customer.displayName}</div>
                          {customer.firstName && customer.lastName && (
                            <div className="text-sm text-gray-500">
                              {customer.firstName} {customer.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.email && <div>{customer.email}</div>}
                        {customer.phone && <div className="text-gray-500">{customer.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.city && customer.state && (
                          <div>{customer.city}, {customer.state}</div>
                        )}
                        {customer.country && (
                          <div className="text-gray-500">
                            {COUNTRIES.find(c => c.code === customer.country)?.name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {customer.businessName && <div>{customer.businessName}</div>}
                        {customer.businessRegNumber && (
                          <div className="text-gray-500">{customer.businessRegNumber}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(customer)}
                          className="border-vibrant-blue/30 hover:bg-vibrant-blue/10 hover:border-vibrant-blue/50 transition-all"
                        >
                          <Edit className="w-4 h-4 text-vibrant-blue" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(customer)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </AnimatedCard>
    </FadeIn>
  )
}