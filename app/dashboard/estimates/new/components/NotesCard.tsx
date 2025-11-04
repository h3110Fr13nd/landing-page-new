"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  notes: string
  setNotes: (s: string) => void
  terms: string
  setTerms: (s: string) => void
}

export default function NotesCard({ notes, setNotes, terms, setTerms }: Props) {
  return (
    <Card className="mobile-card">
      <CardHeader className="mobile-padding">
        <CardTitle className="mobile-h2">Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="mobile-padding">
        <div className="space-y-4">
          <div>
            <Label htmlFor="notes" className="mobile-label">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mobile-input"
              placeholder="Additional notes for the estimate"
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="terms" className="mobile-label">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="mobile-input"
              placeholder="Terms and conditions"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
