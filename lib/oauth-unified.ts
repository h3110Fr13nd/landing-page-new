/**
 * Unified OAuth Provider Integration
 * Eliminates provider-specific code duplication
 */

import { createClient } from '@/utils/supabase/client'

export type OAuthProvider = 'google' | 'github' | 'microsoft' | 'apple'

interface OAuthConfig {
  provider: OAuthProvider
  scopes?: string[]
  redirectTo?: string
}

/**
 * Universal OAuth sign-in
 * Supabase automatically handles callback to /auth/callback
 */
export async function signInWithOAuth({ provider, scopes, redirectTo }: OAuthConfig) {
  const supabase = createClient()
  
  // Get the base URL for redirect
  const getURL = () => {
    let url = 
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.NEXT_PUBLIC_VERCEL_URL ??
      'http://localhost:3000'
    
    // Ensure URL includes protocol
    url = url.startsWith('http') ? url : `https://${url}`
    // Ensure URL ends with /
    url = url.endsWith('/') ? url : `${url}/`
    return url
  }

  const finalRedirect = redirectTo ? `${getURL()}${redirectTo.replace(/^\//, '')}` : `${getURL()}dashboard`

  // Map provider names to Supabase provider names
  const providerMap: Record<OAuthProvider, any> = {
    'google': 'google',
    'microsoft': 'azure', // Microsoft is 'azure' in Supabase
    'apple': 'apple',
    'github': 'github'
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: providerMap[provider],
    options: {
      redirectTo: finalRedirect,
      scopes: scopes?.join(' '),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    }
  })

  if (error) {
    console.error(`OAuth ${provider} error:`, error)
    return { url: null, error }
  }

  return { url: data.url, error: null }
}

/**
 * Handle OAuth callback
 */
export async function handleOAuthCallback() {
  const supabase = createClient()
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('OAuth callback error:', error)
    return { user: null, error }
  }

  return { user: session?.user || null, error: null }
}

/**
 * Link OAuth provider to existing account
 */
export async function linkOAuthProvider(provider: OAuthProvider) {
  const supabase = createClient()
  
  const providerMap: Record<OAuthProvider, any> = {
    'google': 'google',
    'microsoft': 'azure',
    'apple': 'apple',
    'github': 'github'
  }

  const { data, error } = await supabase.auth.linkIdentity({
    provider: providerMap[provider]
  })

  if (error) {
    console.error(`Failed to link ${provider}:`, error)
    return { error }
  }

  return { error: null }
}

/**
 * Unlink OAuth provider
 */
export async function unlinkOAuthProvider(provider: OAuthProvider) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const identity = user.identities?.find(i => i.provider === provider || (provider === 'microsoft' && i.provider === 'azure'))
  
  if (!identity) {
    return { error: 'Provider not linked' }
  }

  const { error } = await supabase.auth.unlinkIdentity(identity)

  if (error) {
    console.error(`Failed to unlink ${provider}:`, error)
    return { error }
  }

  return { error: null }
}
