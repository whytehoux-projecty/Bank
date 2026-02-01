# UHI Admin Portal - Next.js

A modern, responsive admin interface for the UHI Staff Portal, built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

1. Navigate to the project directory:

   ```bash
   cd nextjs-admin-portal
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3001](http://localhost:3001) in your browser (Next.js will automatically use the next available port if 3000 is busy).

## 📂 Project Structure

- `src/app`: App Router pages and layouts
  - `login/`: Admin login page
  - `page.tsx`: Main Dashboard
- `src/components`: Reusable components
  - `layout/`: AdminHeader, Sidebar, ProtectedRoute
- `src/contexts`: React Contexts (AuthContext)
- `src/lib`: Utilities and API clients
- `src/types`: TypeScript type definitions

## 🛠 Features

- **Secure Authentication**: Admin-only login access
- **Dashboard**: Overview of key metrics
- **Management Modules**: (Placeholders) Staff, Applications, Loans, Payroll
- **Responsive Design**: Works on desktop and mobile

## 🎨 Styling

Uses Tailwind CSS v4 with custom color variables defined in `src/app/globals.css`.
