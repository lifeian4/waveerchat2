const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Check required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.JWT_SECRET) {
  console.error('❌ Missing required environment variables:')
  if (!process.env.SUPABASE_URL) console.error('  - SUPABASE_URL')
  if (!process.env.SUPABASE_ANON_KEY) console.error('  - SUPABASE_ANON_KEY')
  if (!process.env.JWT_SECRET) console.error('  - JWT_SECRET')
  console.error('\nPlease set these in .env.local')
  process.exit(1)
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://waveerchat.netlify.app',
    'https://waveerchat2.netlify.app'
  ],
  credentials: true
}))
app.use(express.json())

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// OAuth state storage (in-memory, use Redis in production)
const oauthStates = new Map()

// Helper: Generate JWT Token
const generateToken = (user, expiresIn = '1h') => {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000)
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn })
}

// Helper: Generate Refresh Token
const generateRefreshToken = (userId) => {
  const payload = {
    sub: userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000)
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// Helper: Verify Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

// 1. Authorization Endpoint (GET)
app.get('/oauth/authorize', (req, res) => {
  try {
    const { client_id, redirect_uri, response_type, state, scope } = req.query

    // Validate client
    if (client_id !== 'waveerchat_client_123') {
      return res.status(400).json({
        error: 'invalid_client',
        error_description: 'Invalid client_id'
      })
    }

    // Store state (in production, use Redis with expiry)
    const stateData = {
      clientId: client_id,
      redirectUri: redirect_uri,
      scope: scope || 'profile email',
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    }
    oauthStates.set(state, stateData)

    // Redirect to login page
    res.redirect(`/login?state=${state}&client_id=${client_id}`)
  } catch (error) {
    console.error('Authorization error:', error)
    res.status(500).json({ error: 'server_error' })
  }
})

// 2. Login Page (GET)
app.get('/login', (req, res) => {
  const { state, client_id } = req.query

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>WaveerChat Login</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f1f5f9;
        }
        .container {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 25px rgba(0, 0, 0, 0.3);
        }
        .header {
          margin-bottom: 30px;
          text-align: center;
        }
        .logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3b82f6, #a855f7);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
        }
        h1 { font-size: 28px; margin-bottom: 10px; }
        .subtitle { color: #94a3b8; font-size: 14px; }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #cbd5e1;
          font-weight: 500;
        }
        input {
          width: 100%;
          padding: 10px 12px;
          background: #0f172a;
          border: 1px solid #475569;
          border-radius: 6px;
          color: #f1f5f9;
          font-size: 14px;
          transition: all 0.2s;
        }
        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #3b82f6, #a855f7);
          border: none;
          border-radius: 6px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 20px;
        }
        button:hover { opacity: 0.9; }
        button:active { transform: scale(0.98); }
        .error {
          display: none;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #dc2626;
          color: #fca5a5;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
            <div class="logo-icon">W</div>
            <span style="font-size: 20px; font-weight: bold;">Waveer</span>
          </div>
          <h1>Sign in</h1>
          <p class="subtitle">to continue to waveerchat</p>
        </div>

        <form id="loginForm">
          <input type="hidden" name="state" value="${state}">
          <input type="hidden" name="client_id" value="${client_id}">
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="your@email.com">
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required placeholder="••••••••">
          </div>
          
          <button type="submit">Sign in</button>
          <div class="error" id="error"></div>
        </form>
      </div>
      
      <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const data = Object.fromEntries(formData);
          
          try {
            const response = await fetch('/oauth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            
            if (!response.ok) {
              const error = await response.json();
              document.getElementById('error').textContent = error.error_description || 'Login failed';
              document.getElementById('error').style.display = 'block';
            }
          } catch (err) {
            document.getElementById('error').textContent = 'An error occurred';
            document.getElementById('error').style.display = 'block';
          }
        });
      </script>
    </body>
    </html>
  `

  res.setHeader('Content-Type', 'text/html')
  res.send(html)
})

// 3. Login Handler (POST)
app.post('/oauth/login', async (req, res) => {
  try {
    const { email, password, state, client_id } = req.body

    // Validate state
    const oauthState = oauthStates.get(state)
    if (!oauthState) {
      return res.status(400).json({
        error: 'invalid_state',
        error_description: 'Invalid or expired state parameter'
      })
    }

    // Check if user exists in Supabase profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()

    if (profileError || !profileData) {
      return res.status(401).json({
        error: 'invalid_credentials',
        error_description: 'Invalid email or password'
      })
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, profileData.password_hash)
    if (!passwordMatch) {
      return res.status(401).json({
        error: 'invalid_credentials',
        error_description: 'Invalid email or password'
      })
    }

    // Generate authorization code
    const authCode = crypto.randomBytes(32).toString('hex')
    
    // Store authorization code (in production, use Redis with expiry)
    const codeData = {
      userId: profileData.id,
      clientId: client_id,
      redirectUri: oauthState.redirectUri,
      scope: oauthState.scope,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    }

    // For now, store in memory (use Redis in production)
    global.authCodes = global.authCodes || {}
    global.authCodes[authCode] = codeData

    // Redirect back to client with authorization code
    const redirectUrl = new URL(oauthState.redirectUri)
    redirectUrl.searchParams.append('code', authCode)
    redirectUrl.searchParams.append('state', state)

    res.redirect(redirectUrl.toString())
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'server_error' })
  }
})

// 4. Token Endpoint (POST)
app.post('/oauth/token', async (req, res) => {
  try {
    const { code, client_id, client_secret, redirect_uri, grant_type, refresh_token } = req.body

    // Validate client credentials
    if (client_id !== 'waveerchat_client_123' || client_secret !== 'waveerchat_secret_xyz') {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Invalid client credentials'
      })
    }

    // Handle authorization code flow
    if (grant_type === 'authorization_code') {
      if (!code) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Missing authorization code'
        })
      }

      // Retrieve authorization code data
      const codeData = global.authCodes?.[code]
      if (!codeData) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Invalid or expired authorization code'
        })
      }

      // Check code expiry
      if (codeData.expiresAt < Date.now()) {
        delete global.authCodes[code]
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Authorization code has expired'
        })
      }

      // Validate redirect_uri
      if (codeData.redirectUri !== redirect_uri) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Redirect URI mismatch'
        })
      }

      // Get user data from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', codeData.userId)
        .single()

      if (!profileData) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'User not found'
        })
      }

      // Generate tokens
      const accessToken = generateToken({
        id: profileData.id,
        email: profileData.email,
        name: profileData.full_name || profileData.name
      })

      const refreshTokenValue = generateRefreshToken(profileData.id)

      // Clean up used code
      delete global.authCodes[code]

      return res.json({
        access_token: accessToken,
        refresh_token: refreshTokenValue,
        token_type: 'Bearer',
        expires_in: 3600
      })
    }

    // Handle refresh token flow
    if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return res.status(400).json({
          error: 'invalid_request',
          error_description: 'Missing refresh token'
        })
      }

      try {
        const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET)

        if (decoded.type !== 'refresh') {
          throw new Error('Invalid token type')
        }

        // Get user data from profiles table
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', decoded.sub)
          .single()

        if (!profileData) {
          return res.status(400).json({
            error: 'invalid_grant',
            error_description: 'User not found'
          })
        }

        // Generate new access token
        const newAccessToken = generateToken({
          id: profileData.id,
          email: profileData.email,
          name: profileData.full_name || profileData.name
        })

        return res.json({
          access_token: newAccessToken,
          token_type: 'Bearer',
          expires_in: 3600
        })
      } catch (error) {
        return res.status(400).json({
          error: 'invalid_grant',
          error_description: 'Invalid refresh token'
        })
      }
    }

    res.status(400).json({
      error: 'unsupported_grant_type',
      error_description: 'Unsupported grant type'
    })
  } catch (error) {
    console.error('Token error:', error)
    res.status(500).json({ error: 'server_error' })
  }
})

// 5. User Info Endpoint (GET)
app.get('/api/user', (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Missing or invalid authorization header'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        error: 'invalid_token',
        error_description: 'Invalid or expired token'
      })
    }

    res.json({
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.name)}&background=random`
    })
  } catch (error) {
    console.error('User info error:', error)
    res.status(500).json({ error: 'server_error' })
  }
})

// 6. Token Refresh Endpoint (POST)
app.post('/api/auth/refresh', (req, res) => {
  try {
    const { refresh_token, client_id } = req.body

    if (client_id !== 'waveerchat_client_123') {
      return res.status(401).json({
        error: 'invalid_client',
        error_description: 'Invalid client_id'
      })
    }

    if (!refresh_token) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Missing refresh token'
      })
    }

    try {
      const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET)

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type')
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        {
          sub: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )

      res.json({
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: 3600
      })
    } catch (error) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Invalid refresh token'
      })
    }
  } catch (error) {
    console.error('Refresh error:', error)
    res.status(500).json({ error: 'server_error' })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WaveerChat OAuth Server running on port ${PORT}`)
  console.log(`📍 Authorization endpoint: http://localhost:${PORT}/oauth/authorize`)
  console.log(`📍 Token endpoint: http://localhost:${PORT}/oauth/token`)
})
