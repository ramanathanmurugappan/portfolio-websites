# GitHub Pages Deployment Setup

This project is configured to automatically deploy to GitHub Pages.

## How it works

1. **Automatic Deployment**: Every push to the `main` branch triggers a GitHub Actions workflow that:
   - Builds the project with `npm run build`
   - Deploys the output to GitHub Pages

2. **GitHub Pages Settings**:
   - Your site is deployed at: `https://ramanathanmurugappan.github.io/protfolio/`
   - The base URL is set to `/protfolio/` in `vite.config.ts`

3. **To Deploy**:
   - Simply push to the `main` branch
   - GitHub Actions will automatically build and deploy
   - Check the "Actions" tab in your GitHub repository to see deployment status

## Local Development

```bash
# Install dependencies
npm install

# Start development server
nvm use && npm run dev

# Build for production
npm run build

# Preview the build
npm run preview
```

## Configuration

- **Vite Config**: `vite.config.ts` - Contains the base URL for GitHub Pages
- **GitHub Actions**: `.github/workflows/deploy.yml` - Handles automatic deployment
- **Build Output**: Builds to `dist/public/` which is deployed to GitHub Pages
