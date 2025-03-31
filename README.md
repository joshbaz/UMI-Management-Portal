# UMI Management System

A comprehensive management system for Uganda Management Institute (UMI) built with React and Tailwind CSS.

## Features

- **Authentication System**
  - Secure login for administrators and staff
  - Role-based access control
  - Password management

- **Dashboard Interface**
  - Interactive analytics
  - Quick access to key features
  - Activity summaries

- **Student Management**
  - Student registration and profiles
  - Academic records tracking
  - Batch operations support
  - Advanced filtering and search

- **Faculty Management**
  - Staff profiles and credentials
  - Department assignments
  - Performance tracking

- **Schools Management**
  - Course and program administration
  - Department organization
  - Resource allocation

- **User Roles & Permissions**
  - Role-based access control
  - Permission management
  - Access level configuration

- **Settings & Configuration**
  - System preferences
  - User interface customization
  - Notification preferences
  - Profile management

## Tech Stack

- **Frontend Framework:** React 18.2.0 with Vite
- **Styling:** Tailwind CSS 3.4.1
- **UI Components:**
  - @headlessui/react 1.7.18
  - @heroicons/react 2.1.1
  - react-icons 5.0.1
- **Routing:** React Router DOM 6.22.0
- **Table Management:** @tanstack/react-table 8.11.6
- **Date Handling:** date-fns 2.30.0

## Color System

The application uses a consistent color system defined in `tailwind.config.js`:

- **Primary Colors:** Blues (#23388F, with various shades)
- **Accent Colors:** 
  - Accent2: Warm (#FEF0D7, #CA922D)
  - Accent1: Cool (#D9EDF7)
- **Semantic Colors:**
  - Text: Primary (#070B1D), Secondary (#939495)
  - Error: #B91C1C
  - Borders: #E5E7EB, #D3D7E9

## Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable components
│   ├── common/      # Shared components
│   └── layout/      # Layout components
├── context/         # React context providers
├── pages/          # Application pages
│   ├── auth/       # Authentication
│   ├── dashboard/  # Main dashboard
│   ├── faculty/    # Faculty management
│   ├── notifications/
│   ├── roles/      # User roles
│   ├── schools/    # Schools management
│   ├── settings/   # App settings
│   ├── student/    # Student management
│   └── tables/     # Table builder
└── config/         # Configuration files
```

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/charlesaroma/UMI-Management.git
```

2. Install dependencies:
```bash
cd umi-management
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Browser Support

The application is optimized for modern browsers and uses features from React 18 and modern CSS. For best experience, use the latest versions of:

- Chrome
- Firefox
- Safari
- Edge
