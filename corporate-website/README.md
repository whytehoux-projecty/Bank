# JP Heritage Bank - Corporate Website

The public-facing corporate website for JP Heritage Bank, designed to showcase our trusted private banking experience.

## 🏗️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Directory)
- **Styling**: Tailwind CSS
- **Deployment**: Netlify
- **Design**: Heritage Navy (#0D2545) + Soft Gold (#B8960C) brand palette

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
cd corporate-website
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser to see the result.
(Note: By default Next.js runs on 3000, but in the JP Heritage ecosystem, we assign it to 3002. Check your console output).

## 🔌 Integration

The Corporate Website interacts with the Backend API for:

- User Authentication (Login/Signup)
- Newsletter Subscription
- Contact Forms

### Environment Variables

See `.env.local` or `.env.example` in the root for required variables:

- `NEXT_PUBLIC_API_URL`: URL of the Backend API
- `NEXT_PUBLIC_PORTAL_URL`: URL of the E-Banking Portal
- `NEXT_PUBLIC_PORTAL_HEALTH_URL`: URL to check portal system status

## 📦 Deployment (Netlify)

This project is configured for deployment on Netlify.

```bash
# Build for production
npm run build

# Deploy (if Netlify CLI is installed)
netlify deploy --prod
```

## 📂 Project Structure

- `/app`: App router pages and layouts
- `/components`: Reusable UI components
- `/public`: Static assets (images, fonts)
- `/lib`: Utility functions and shared logic
