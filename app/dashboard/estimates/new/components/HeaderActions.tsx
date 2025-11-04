"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Calculator } from 'lucide-react'

interface Props {
  saveEstimate: (isDraft?: boolean) => Promise<void>
  loading: boolean
}

export default function HeaderActions({ saveEstimate, loading }: Props) {
  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
      <Button 
        variant="outline" 
        onClick={() => saveEstimate(true)}
        disabled={loading}
        className="mobile-button"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Draft
      </Button>
      <Button 
        onClick={() => saveEstimate(false)}
        disabled={loading}
        className="mobile-button"
      >
        <Calculator className="w-4 h-4 mr-2" />
        Create Estimate
      </Button>
    </div>
  )
}
