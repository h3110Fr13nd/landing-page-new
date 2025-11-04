"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

interface Item {
  itemName: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Props {
  items: Item[]
  addItem: () => void
  removeItem: (index: number) => void
  updateItem: (index: number, field: string, value: string | number) => void
  currency: string
  getCurrencySymbol: (code: string) => string
}

export default function ItemsCard({ items, addItem, removeItem, updateItem, currency, getCurrencySymbol }: Props) {
  return (
    <Card className="mobile-card">
      <CardHeader className="mobile-padding">
        <CardTitle className="mobile-h2">Items</CardTitle>
      </CardHeader>
      <CardContent className="mobile-padding">
        <div className="space-y-4">
          <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-sm font-medium text-gray-700 pb-2 border-b">
            <div className="col-span-3">Item Name</div>
            <div className="col-span-4">Description</div>
            <div className="col-span-1">Qty</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-1"></div>
          </div>

          {items.map((item, index) => (
            <div key={index} className="space-y-3 sm:space-y-0">
              <div className="block sm:hidden space-y-3 p-3 border rounded-lg">
                <div>
                  <Label className="mobile-label">Item Name</Label>
                  <Input
                    value={item.itemName}
                    onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                    className="mobile-input"
                    placeholder="Optional item name"
                  />
                </div>
                <div>
                  <Label className="mobile-label">Description *</Label>
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="mobile-input"
                    placeholder="Describe the item or service"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mobile-label">Quantity</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="mobile-input"
                    />
                  </div>
                  <div>
                    <Label className="mobile-label">Unit Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="mobile-input"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="mobile-text font-medium">
                    Total: {getCurrencySymbol(currency)} {item.total.toFixed(2)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-start">
                <div className="col-span-3">
                  <Input
                    value={item.itemName}
                    onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                    className="mobile-input"
                    placeholder="Item name"
                  />
                </div>
                <div className="col-span-4">
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="mobile-input"
                    placeholder="Description"
                    rows={1}
                  />
                </div>
                <div className="col-span-1">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="mobile-input"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="mobile-input"
                  />
                </div>
                <div className="col-span-1 flex items-center justify-between">
                  <span className="mobile-text font-medium">
                    {getCurrencySymbol(currency)} {item.total.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full mobile-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
