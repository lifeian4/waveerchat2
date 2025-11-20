# WaveerChat OAuth UI - Account Picker

A beautiful React + Vite + TypeScript account picker UI inspired by Google's account selection interface.

## Features

- 🎨 **Beautiful UI** - Dark theme with smooth animations
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Fast** - Built with Vite
- 🔐 **Secure** - OAuth 2.0 integration ready
- ♿ **Accessible** - Keyboard navigation support

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AccountCard.tsx      # Individual account card
│   │   ├── AccountPicker.tsx    # Account selection UI
│   │   └── LoginForm.tsx        # Login form
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

## Components

### AccountCard
Individual account card component showing:
- User avatar (or initials)
- User name
- Email address
- Hover effects with checkmark

### AccountPicker
Main account selection UI showing:
- List of accounts
- "Use another account" button
- Loading state
- Responsive layout

### LoginForm
Login form with:
- Email input
- Password input
- Error handling
- Loading state

## Usage

```tsx
import { AccountPicker } from './components/AccountPicker'

const accounts = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'User Name',
    avatar_url: 'https://...'
  }
]

<AccountPicker
  accounts={accounts}
  onAccountSelect={(account) => console.log(account)}
  onUseAnotherAccount={() => console.log('new account')}
/>
```

## Styling

Uses Tailwind CSS with custom Waveer color palette:
- `waveer-50` to `waveer-900`
- Dark theme optimized for OAuth flows
- Smooth animations and transitions

## Integration with OAuth Server

The UI connects to the OAuth server at `http://localhost:3000`:

1. User selects account → Auto-login
2. User clicks "Use another account" → Login form
3. Form submits to `/oauth/login`
4. On success → Redirect to dashboard

## Customization

### Change Colors
Edit `tailwind.config.js`:
```js
colors: {
  waveer: {
    // Your colors here
  }
}
```

### Change OAuth Server URL
Edit `src/App.tsx`:
```tsx
const response = await fetch('YOUR_OAUTH_SERVER/oauth/login', {
  // ...
})
```

### Add More Accounts
Update the `accounts` state in `src/App.tsx`

## Deployment

### Build
```bash
npm run build
```

### Deploy to Netlify
```bash
netlify deploy --prod
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT
