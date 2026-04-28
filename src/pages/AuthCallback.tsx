import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for access token in URL hash (OAuth response)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        console.log('Auth callback - has access_token:', !!accessToken)
        
        // If OAuth sent tokens in URL, set the session
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (sessionError) {
            console.error('Session error:', sessionError.message)
            navigate('/login', { replace: true })
            return
          }
          
          // Clear the hash from URL
          window.location.hash = ''
        }
        
        // Check if we have a session now
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          navigate('/dashboard', { replace: true })
        } else {
          navigate('/login', { replace: true })
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        navigate('/login', { replace: true })
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-universe-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-universe-foreground/30 border-t-universe-foreground rounded-full animate-spin" />
    </div>
  )
}