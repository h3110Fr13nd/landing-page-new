import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Mail } from 'lucide-react'
import { Invoice } from '@/lib/types'

interface Props {
  invoice: Invoice
  emailForm: { recipientEmail: string; ccEmails: string; message: string }
  setEmailForm: (v: any) => void
  setShowEmailModal: (v: boolean) => void
  sendInvoiceEmail: () => Promise<void>
}

export default function EmailModal({ invoice, emailForm, setEmailForm, setShowEmailModal, sendInvoiceEmail }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Email Invoice
            <Button variant="ghost" size="sm" onClick={() => setShowEmailModal(false)}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipientEmail">Recipient Email</Label>
            <input id="recipientEmail" type="email" value={emailForm.recipientEmail} onChange={(e) => setEmailForm((p: any) => ({ ...p, recipientEmail: e.target.value }))} placeholder="customer@example.com" className="input mt-1" />
          </div>

          <div>
            <Label htmlFor="ccEmails">CC (Optional)</Label>
            <input id="ccEmails" type="text" value={emailForm.ccEmails} onChange={(e) => setEmailForm((p: any) => ({ ...p, ccEmails: e.target.value }))} placeholder="email1@example.com, email2@example.com" className="input mt-1" />
            <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
          </div>

          <div>
            <Label htmlFor="emailMessage">Message (Optional)</Label>
            <textarea id="emailMessage" value={emailForm.message} onChange={(e) => setEmailForm((p: any) => ({ ...p, message: e.target.value }))} placeholder="Add a personal message to include with the invoice..." rows={3} className="textarea mt-1" />
          </div>

          <div className="flex space-x-4 pt-3">
            <Button variant="outline" onClick={() => setShowEmailModal(false)} className="flex-1">Cancel</Button>
            <Button onClick={sendInvoiceEmail} className="flex-1" disabled={!emailForm.recipientEmail}><Mail className="w-4 h-4 mr-2" />Send Email</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
