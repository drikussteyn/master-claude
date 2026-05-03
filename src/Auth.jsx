import { useState } from 'react'
import { supabase } from './supabase'

export default function AuthModal({ onClose, onSuccess, color = '#4ade80' }) {
  const [mode, setMode]       = useState('login')   // login | signup | forgot
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [message, setMessage] = useState('')

  const handleEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://master-claude.vercel.app',
      })
      setLoading(false)
      if (error) return setError(error.message)
      setMessage('Password reset email sent. Check your inbox.')
      return
    }

    const fn = mode === 'signup'
      ? supabase.auth.signUp({ email, password })
      : supabase.auth.signInWithPassword({ email, password })

    const { data, error } = await fn
    setLoading(false)

    if (error) return setError(error.message)

    if (mode === 'signup' && !data.session) {
      setMessage('Account created! Check your email to confirm before logging in.')
      return
    }

    onSuccess(data.user)
    onClose()
  }

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://master-claude.vercel.app' },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'#000000cc', backdropFilter:'blur(8px)',
      zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'#0e0e0e', border:'1px solid #1e1e1e', borderRadius:14,
        padding:'2rem 1.75rem', width:'100%', maxWidth:400, position:'relative',
        fontFamily:"'DM Mono',monospace",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap');
          .auth-input { width:100%; background:#080808; border:1px solid #1e1e1e; border-radius:7px; padding:0.7rem 0.9rem; color:#ddd; font-family:'DM Mono',monospace; font-size:0.82rem; outline:none; transition:border-color 0.2s; }
          .auth-input:focus { border-color: ${color}55; }
          .auth-input::placeholder { color:#333; }
          .auth-btn { width:100%; border:none; border-radius:8px; padding:0.8rem; cursor:pointer; font-family:'DM Mono',monospace; font-size:0.75rem; font-weight:500; letter-spacing:1.5px; text-transform:uppercase; transition:all 0.2s; }
          .auth-btn:hover { opacity:0.85; transform:scale(1.01); }
          .auth-link { background:none; border:none; color:${color}; font-family:'DM Mono',monospace; font-size:0.68rem; cursor:pointer; letter-spacing:1px; text-decoration:underline; padding:0; }
        `}</style>

        {/* Close */}
        <button onClick={onClose} style={{ position:'absolute', top:'1rem', right:'1rem', background:'none', border:'none', color:'#444', fontSize:'1.1rem', cursor:'pointer' }}>×</button>

        {/* Header */}
        <div style={{ marginBottom:'1.5rem' }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.6rem', letterSpacing:'3px', color:'#e0e0e0', marginBottom:'0.25rem' }}>
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </div>
          <div style={{ fontSize:'0.68rem', color:'#555' }}>
            {mode === 'login' ? 'Sign in to access your progress and unlocked steps' :
             mode === 'signup' ? 'Your progress and purchases sync across all devices' :
             'Enter your email and we\'ll send a reset link'}
          </div>
        </div>

        {/* Error / Message */}
        {error && (
          <div style={{ background:'#ff4d4d18', border:'1px solid #ff4d4d44', borderRadius:7, padding:'0.6rem 0.8rem', marginBottom:'1rem', fontSize:'0.72rem', color:'#ff8080' }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ background:`${color}15`, border:`1px solid ${color}44`, borderRadius:7, padding:'0.6rem 0.8rem', marginBottom:'1rem', fontSize:'0.72rem', color }}>
            {message}
          </div>
        )}

        {/* Google button */}
        {mode !== 'forgot' && (
          <>
            <button className="auth-btn" onClick={handleGoogle} disabled={loading}
              style={{ background:'#fff', color:'#111', marginBottom:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.75rem' }}>
              <div style={{ flex:1, height:1, background:'#1e1e1e' }} />
              <span style={{ fontSize:'0.62rem', color:'#444', letterSpacing:'1.5px' }}>OR</span>
              <div style={{ flex:1, height:1, background:'#1e1e1e' }} />
            </div>
          </>
        )}

        {/* Email form */}
        <form onSubmit={handleEmail}>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', marginBottom:'1rem' }}>
            <input className="auth-input" type="email" placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)} required />
            {mode !== 'forgot' && (
              <input className="auth-input" type="password" placeholder="Password"
                value={password} onChange={e => setPassword(e.target.value)}
                required minLength={6} />
            )}
          </div>

          <button className="auth-btn" type="submit" disabled={loading}
            style={{ background:`linear-gradient(135deg,${color},${color}bb)`, color:'#000', marginBottom:'1rem' }}>
            {loading ? '...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>

        {/* Mode switcher */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'0.5rem' }}>
          {mode === 'login' && (
            <>
              <div style={{ fontSize:'0.68rem', color:'#555' }}>
                Don't have an account?{' '}
                <button className="auth-link" onClick={() => { setMode('signup'); setError(''); setMessage(''); }}>Sign up</button>
              </div>
              <button className="auth-link" onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}>
                Forgot password?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <div style={{ fontSize:'0.68rem', color:'#555' }}>
              Already have an account?{' '}
              <button className="auth-link" onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Sign in</button>
            </div>
          )}
          {mode === 'forgot' && (
            <button className="auth-link" onClick={() => { setMode('login'); setError(''); setMessage(''); }}>
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
