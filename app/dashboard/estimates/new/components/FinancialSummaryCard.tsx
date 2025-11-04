"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React from 'react'

interface TaxPreset { label: string; value: number | null }

interface Props {
  subtotal: number
  taxPreset: number | null
  setTaxPreset: (n: number | null) => void
  customTaxRate: number
  setCustomTaxRate: (n: number) => void
  taxAmount: number
  total: number
  currency: string
  getCurrencySymbol: (code: string) => string
  TAX_PRESETS: TaxPreset[]
}

export default function FinancialSummaryCard({
  subtotal,
  taxPreset,
  setTaxPreset,
  customTaxRate,
  setCustomTaxRate,
  taxAmount,
  total,
  currency,
  getCurrencySymbol,
  TAX_PRESETS,
}: Props) {
  return (
    <Card className="mobile-card">
      <CardHeader className="mobile-padding">
        <CardTitle className="mobile-h2">Total</CardTitle>
      </CardHeader>
      <CardContent className="mobile-padding">
        <div className="space-y-3">
          <div className="flex justify-between mobile-text">
            <span>Subtotal:</span>
            <span>{getCurrencySymbol(currency)} {subtotal.toFixed(2)}</span>
          </div>
          
          <div className="space-y-2">
            <Label className="mobile-label">Tax</Label>
            <Select 
              value={taxPreset === null ? 'custom' : taxPreset.toString()} 
              onValueChange={(value) => {
                if (value === 'custom') {
                  setTaxPreset(null)
                } else {
                  setTaxPreset(parseFloat(value))
                }
              }}
            >
              <SelectTrigger className="mobile-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                  {TAX_PRESETS.map((preset) => (
                    <SelectItem 
                      key={preset.label} 
                      value={preset.value === null ? 'custom' : preset.value.toString()}
                    >
                      {preset.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {taxPreset === null && (
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={customTaxRate}
                onChange={(e) => setCustomTaxRate(parseFloat(e.target.value) || 0)}
                className="mobile-input"
                placeholder="Enter tax rate (%)"
              />
            )}
          </div>
          
          <div className="flex justify-between mobile-text">
            <span>Tax ({taxPreset === null ? customTaxRate : (taxPreset || 0)}%):</span>
            <span>{getCurrencySymbol(currency)} {taxAmount.toFixed(2)}</span>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>{getCurrencySymbol(currency)} {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
