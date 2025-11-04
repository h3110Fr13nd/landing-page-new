"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface CurrencyItem { code: string; symbol: string; name: string }

interface Props {
  estimateNumber: string
  setEstimateNumber: (v: string) => void
  currency: string
  setCurrency: (v: string) => void
  estimateDate?: Date
  setEstimateDate: (d?: Date) => void
  validUntil?: Date
  setValidUntil: (d?: Date) => void
  CURRENCIES: CurrencyItem[]
}

export default function EstimateDetailsCard({
  estimateNumber,
  setEstimateNumber,
  currency,
  setCurrency,
  estimateDate,
  setEstimateDate,
  validUntil,
  setValidUntil,
  CURRENCIES,
}: Props) {
  return (
    <Card className="mobile-card">
      <CardHeader className="mobile-padding">
        <CardTitle className="mobile-h2">Estimate Details</CardTitle>
      </CardHeader>
      <CardContent className="mobile-padding">
        <div className="mobile-form-row">
          <div className="flex-1">
            <Label htmlFor="estimateNumber" className="mobile-label">Estimate Number</Label>
            <Input
              id="estimateNumber"
              value={estimateNumber}
              onChange={(e) => setEstimateNumber(e.target.value)}
              className="mobile-input"
              placeholder="EST-0001"
            />
          </div>
          <div className="flex-1">
            <Label className="mobile-label">Currency</Label>
            <div>
              {/* keep native Select component usage from project */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mobile-input"
              >
                <option value="">Select currency</option>
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mobile-form-row">
          <div className="flex-1">
            <Label className="mobile-label">Estimate Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "mobile-input justify-start text-left font-normal",
                    !estimateDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {estimateDate ? format(estimateDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={estimateDate}
                  onSelect={setEstimateDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex-1">
            <Label className="mobile-label">Valid Until</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "mobile-input justify-start text-left font-normal",
                    !validUntil && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {validUntil ? format(validUntil, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={validUntil}
                  onSelect={setValidUntil}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
