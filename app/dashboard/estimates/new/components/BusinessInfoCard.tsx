"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  businessInfo: string
  setBusinessInfo: (s: string) => void
}

export default function BusinessInfoCard({ businessInfo, setBusinessInfo }: Props) {
  return (
    <Card className="mobile-card">
      <CardHeader className="mobile-padding">
        <CardTitle className="mobile-h2">Business Information</CardTitle>
      </CardHeader>
      <CardContent className="mobile-padding">
        <Textarea
          value={businessInfo}
          onChange={(e) => setBusinessInfo(e.target.value)}
          className="mobile-input"
          rows={6}
          placeholder="Your business information"
        />
      </CardContent>
    </Card>
  )
}
