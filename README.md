# Ramanathan Murugappan – Portfolio Website

A modern, responsive portfolio website built with React, Vite, and Tailwind CSS. Showcasing projects, experience, and expertise in AI/ML and software engineering.

## 🌐 Live Demo

- **Custom Domain**: [https://ram96.com/](https://ram96.com/)
- **GitHub Pages**: [https://ramanathanmurugappan.github.io/protfolio/](https://ramanathanmurugappan.github.io/protfolio/)

## 🚀 Quick Start

### Prerequisites
- Node.js 22.12.0+ (managed with `.nvmrc`)
- npm or pnpm

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
nvm use && npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The development server will run at `http://localhost:3000/`

## 🏗️ Architecture

![Architecture Diagram](./architecture.png)

> Full diagram details in [ARCHITECTURE.md](./ARCHITECTURE.md)

## 📁 Project Structure

```
website_bot/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities
│   └── public/           # Static assets
├── shared/               # Shared code
├── server/              # Backend server
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies
```

## 🛠️ Technologies Used

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Build Tool**: Vite 7
- **UI Components**: Radix UI
- **Forms**: React Hook Form, Zod
- **Deployment**: GitHub Pages, GitHub Actions
- **Node Version**: 22.12.0

## 🚢 Deployment

This project is automatically deployed to GitHub Pages via GitHub Actions on every push to the `master` branch.

### GitHub Actions Workflow
- Triggers on: `push` to `master` branch
- Builds with: Node.js 22.12.0
- Deploys to: GitHub Pages with custom domain support

### Custom Domain Setup
The site is configured to deploy to `ram96.com`. To point your domain:
1. Add DNS A records pointing to GitHub's servers, or
2. Add a CNAME record pointing to `ramanathanmurugappan.github.io`

## 📝 Credits

**Design Inspiration**: [Bluren](https://bluren.webflow.io/)

This project draws design inspiration from the Bluren portfolio template, adapted and customized for a unique personal portfolio experience.

## 📄 License

MIT License - See LICENSE file for details

## 👤 Author

**Ramanathan Murugappan**
- Gen AI Architect & Data Scientist
- 6+ years of experience in enterprise-grade AI products
- [GitHub](https://github.com/ramanathanmurugappan)
- [LinkedIn](https://linkedin.com/in/ramanathanmurugappan)

---

Built with ❤️ using React, Vite, and Tailwind CSS
