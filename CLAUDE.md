# Texel Rating

Rating-app voor Texel — [later: doel specifiek bepalen]

## Stack
- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **VCS**: GitHub

## Folder structure
```
src/
  components/     # Reusable components
  pages/          # Page components
  App.jsx
  main.jsx
  index.css
```

## Development
```bash
npm install
npm run dev      # Vite dev server (localhost:5173)
npm run build    # Production build
```

## Deployment
Connected to GitHub, auto-deploys main → Vercel.

## Conventies
- React functional components + hooks
- Tailwind CSS classes (geen inline styles tenzij dynamisch)
- Commits in het Engels
