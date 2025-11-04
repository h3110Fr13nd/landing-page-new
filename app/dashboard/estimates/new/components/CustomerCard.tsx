"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserPlus } from 'lucide-react'
import { Customer } from '@/lib/types'

interface Props {
  customers: Customer[]
  selectedCustomerId: string
  setSelectedCustomerId: (v: string) => void
  showCustomerDialog: boolean
  setShowCustomerDialog: (v: boolean) => void
  customerFormData: any
  setCustomerFormData: (fn: any) => void
  createCustomer: () => Promise<void>
  COUNTRIES: any[]
  selectedCountry: any
}

export default function CustomerCard({
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
  showCustomerDialog,
  setShowCustomerDialog,
  customerFormData,
  setCustomerFormData,
  createCustomer,
  COUNTRIES,
  selectedCountry,
}: Props) {
  return (
    <Card className="mobile-card">
      <CardHeader className="mobile-padding">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="mobile-h2">Customer</CardTitle>
          <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mobile-button">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="mobile-form-row">
                  <div className="flex-1">
                    <Label htmlFor="displayName" className="mobile-label">Display Name *</Label>
                    <Input
                      id="displayName"
                      value={customerFormData.displayName}
                      onChange={(e) => setCustomerFormData((prev: any) => ({ ...prev, displayName: e.target.value }))}
                      className="mobile-input"
                      placeholder="Customer display name"
                    />
                  </div>
                </div>

                <div className="mobile-form-row">
                  <div className="flex-1">
                    <Label htmlFor="firstName" className="mobile-label">First Name</Label>
                    <Input
                      id="firstName"
                      value={customerFormData.firstName}
                      onChange={(e) => setCustomerFormData((prev: any) => ({ ...prev, firstName: e.target.value }))}
                      className="mobile-input"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="lastName" className="mobile-label">Last Name</Label>
                    <Input
                      id="lastName"
                      value={customerFormData.lastName}
                      onChange={(e) => setCustomerFormData((prev: any) => ({ ...prev, lastName: e.target.value }))}
                      className="mobile-input"
                    />
                  </div>
                </div>

                <div className="mobile-form-row">
                  <div className="flex-1">
                    <Label htmlFor="businessName" className="mobile-label">Business Name</Label>
                    <Input
                      id="businessName"
                      value={customerFormData.businessName}
                      onChange={(e) => setCustomerFormData((prev: any) => ({ ...prev, businessName: e.target.value }))}
                      className="mobile-input"
                    />
                  </div>
                </div>

                <div className="mobile-form-row">
                  <div className="flex-1">
                    <Label htmlFor="email" className="mobile-label">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerFormData.email}
                      onChange={(e) => setCustomerFormData((prev: any) => ({ ...prev, email: e.target.value }))}
                      className="mobile-input"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="phone" className="mobile-label">Phone</Label>
                    <Input
                      id="phone"
                      value={customerFormData.phone}
                      onChange={(e) => setCustomerFormData((prev: any) => ({ ...prev, phone: e.target.value }))}
                      className="mobile-input"
                    />
                  </div>
                </div>

                <div className="mobile-form-row">
                  <div className="flex-1">
                    <Label htmlFor="country" className="mobile-label">Country</Label>
                    <Select 
                      value={customerFormData.country} 
                      onValueChange={(value) => setCustomerFormData((prev: any) => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger className="mobile-input">
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
                </div>

                {selectedCountry && (
                  <div className="mobile-form-row">
                    <div className="flex-1">
                      <Label htmlFor="businessRegNumber" className="mobile-label">
                        {selectedCountry.businessRegLabel}
                      </Label>
                      <Input
                        id="businessRegNumber"
                        value={customerFormData.businessRegNumber}
                        onChange={(e) => setCustomerFormData((prev: any) => ({ ...prev, businessRegNumber: e.target.value }))}
                        className="mobile-input"
                        pattern={selectedCountry.businessRegPattern}
                      />
                    </div>
                  </div>
                )}

                <div className="mobile-form-row">
                  <div className="flex-1">
                    <Label htmlFor="address" className="mobile-label">Address</Label>
                    <Input
                      id="address"
                      value={customerFormData.address}
                      onChange={(e) => setCustomerFormData((prev: any) => ({ ...prev, address: e.target.value }))}
                      className="mobile-input"
                    />
                  </div>
                </div>

                <div className="mobile-form-row">
                  <div className="flex-1">
                    <Label htmlFor="city" className="mobile-label">City</Label>
                    <Input
                      id="city"
                      value={customerFormData.city}
                      onChange={(e) => setCustomerFormData((prev: any) => ({ ...prev, city: e.target.value }))}
                      className="mobile-input"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="state" className="mobile-label">State/Province</Label>
                    <Input
                      id="state"
                      value={customerFormData.state}
                      onChange={(e) => setCustomerFormData((prev: any) => ({ ...prev, state: e.target.value }))}
                      className="mobile-input"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="zipCode" className="mobile-label">Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={customerFormData.zipCode}
                      onChange={(e) => setCustomerFormData((prev: any) => ({ ...prev, zipCode: e.target.value }))}
                      className="mobile-input"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCustomerDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createCustomer}>
                  Create Customer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="mobile-padding">
        <div className="space-y-4">
          <div>
            <Label className="mobile-label">Select Customer</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="mobile-input">
                <SelectValue placeholder="Choose a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {customers.find(c => c.id === selectedCustomerId) && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="mobile-text">
                <strong>{customers.find(c => c.id === selectedCustomerId)?.displayName}</strong>
                {customers.find(c => c.id === selectedCustomerId)?.businessName && (
                  <div className="text-gray-600">{customers.find(c => c.id === selectedCustomerId)?.businessName}</div>
                )}
                {customers.find(c => c.id === selectedCustomerId)?.email && (
                  <div className="text-gray-600">{customers.find(c => c.id === selectedCustomerId)?.email}</div>
                )}
                {customers.find(c => c.id === selectedCustomerId)?.phone && (
                  <div className="text-gray-600">{customers.find(c => c.id === selectedCustomerId)?.phone}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
