# ProTrack Project Structure

## 📁 **Project Overview**

ProTrack is a comprehensive Supply Chain Management System built with React 18, TypeScript, and Vite. This document outlines the complete project structure and organization.

## 🏗️ **Root Directory Structure**

```
protrack-frontend/
├── public/                    # Static assets
├── src/                       # Source code
├── node_modules/              # Dependencies
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML template
├── package.json              # Project dependencies and scripts
├── package-lock.json         # Dependency lock file
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # App-specific TypeScript config
├── tsconfig.node.json        # Node-specific TypeScript config
├── vite.config.ts            # Vite build configuration
├── README.md                 # Project documentation
├── VS_CODE_SETUP.md          # VS Code setup guide
├── SIMPLE_EXPLANATION.md     # Simple explanation for presentation
└── ENHANCED_UI_COMPONENTS.md # UI components documentation
```

## 📂 **Source Directory (`src/`)**

```
src/
├── main.tsx                  # Application entry point
├── index.css                 # Global styles and Tailwind imports
├── App.tsx                   # Alternative app component (Web3 version)
├── App.css                   # App-specific styles
├── ProTrackDark.tsx          # Main dashboard component (primary)
├── SignInPage.tsx            # Standalone sign-in component
├── SimpleProTrack.tsx        # Simplified version for demos
├── DemoApp.tsx               # Demo application component
├── SimpleDemo.tsx            # Simple demo component
├── assets/                   # Static assets (images, icons)
├── components/               # Reusable UI components
├── contexts/                 # React context providers
├── features/                 # Feature-specific components
├── hooks/                    # Custom React hooks
├── i18n/                     # Internationalization
├── layouts/                  # Layout components
├── lib/                      # Utility libraries
├── pages/                    # Page components
├── services/                 # API and external services
└── styles/                   # Additional stylesheets
```

## 🎯 **Main Components**

### **Primary Application Files**

#### **`main.tsx`** - Application Entry Point
```typescript
import { createRoot } from 'react-dom/client'
import ProTrackDarkDashboard from './ProTrackDark'
import './index.css'

const root = createRoot(document.getElementById('root')!)
root.render(<ProTrackDarkDashboard />)
```

#### **`ProTrackDark.tsx`** - Main Dashboard (Primary)
- Complete supply chain management dashboard
- Login system with theme switching
- 9 functional sections: Overview, Products, Create Product, Scan & Verify, GPS Tracking, IoT Dashboard, Analytics, Recalls, Notifications
- Glass morphism design with dark/light themes
- Responsive design for all devices

#### **`App.tsx`** - Web3 Version (Alternative)
- Blockchain-integrated version
- Web3 wallet connectivity
- Smart contract interactions
- Advanced authentication system

### **Alternative Components**

#### **`SimpleProTrack.tsx`** - Simplified Version
- Streamlined dashboard for easy explanation
- Basic login and navigation
- Essential features only
- Perfect for demonstrations

#### **`SignInPage.tsx`** - Standalone Login
- Beautiful glass morphism login page
- Theme switching capability
- Loading animations
- Demo credentials display

#### **`DemoApp.tsx`** - Demo Application
- Quick demo version
- Basic functionality showcase
- Simple navigation
- Theme switching

## 📁 **Component Organization**

### **`components/` Directory**
```
components/
├── ui/                       # Basic UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── Modal.tsx
├── forms/                    # Form components
│   ├── ProductForm.tsx
│   ├── LoginForm.tsx
│   └── SearchForm.tsx
├── charts/                   # Data visualization
│   ├── AnalyticsChart.tsx
│   ├── PerformanceChart.tsx
│   └── TrendChart.tsx
├── navigation/               # Navigation components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── TabNavigation.tsx
├── blockchain/               # Blockchain-specific components
│   ├── WalletConnect.tsx
│   ├── TransactionStatus.tsx
│   └── SmartContractInterface.tsx
└── dashboard/                # Dashboard-specific components
    ├── StatsCard.tsx
    ├── ActivityFeed.tsx
    └── QuickActions.tsx
```

### **`contexts/` Directory**
```
contexts/
├── AuthContext.tsx          # Authentication state management
├── ThemeContext.tsx         # Theme switching logic
├── Web3Context.tsx          # Blockchain connectivity
├── NotificationContext.tsx  # Notification system
└── BlockchainContext.tsx    # Blockchain state management
```

### **`pages/` Directory**
```
pages/
├── auth/                    # Authentication pages
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── ForgotPasswordPage.tsx
├── dashboard/               # Dashboard pages
│   ├── OverviewPage.tsx
│   ├── ProductsPage.tsx
│   ├── TrackingPage.tsx
│   └── AnalyticsPage.tsx
├── products/                # Product management
│   ├── ProductListPage.tsx
│   ├── ProductDetailPage.tsx
│   └── CreateProductPage.tsx
└── settings/                # Settings pages
    ├── ProfilePage.tsx
    ├── PreferencesPage.tsx
    └── SecurityPage.tsx
```

## ⚙️ **Configuration Files**

### **`package.json`** - Dependencies and Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "~5.9.3",
    "vite": "^7.1.7"
  }
}
```

### **`vite.config.ts`** - Build Configuration
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### **`tailwind.config.js`** - Styling Configuration
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
      animation: {
        // Custom animations
      }
    },
  },
  plugins: [],
}
```

## 🎨 **Styling Architecture**

### **Global Styles (`index.css`)**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles */
@layer base {
  html {
    @apply scroll-smooth;
  }
  
  body {
    @apply font-sans antialiased;
  }
}

@layer components {
  .glass-card {
    @apply bg-white/10 backdrop-blur-xl border border-white/20;
  }
}
```

### **Component-Specific Styles**
- Each major component has its own styling
- Tailwind CSS utility classes for consistency
- Custom CSS classes for complex effects
- Responsive design patterns

## 🚀 **Development Workflow**

### **Available Scripts**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run code quality checks
npm run preview  # Preview production build
```

### **Development Server**
- **URL**: `http://localhost:5173`
- **Hot Module Replacement**: Instant updates
- **TypeScript**: Real-time type checking
- **ESLint**: Code quality validation

## 📱 **Feature Organization**

### **Core Features**
1. **Authentication System** - Login/logout with theme switching
2. **Dashboard Overview** - KPIs, stats, quick actions
3. **Product Management** - CRUD operations, search, filtering
4. **Supply Chain Tracking** - GPS tracking, shipment monitoring
5. **IoT Integration** - Sensor data, real-time monitoring
6. **Analytics** - Business intelligence, reporting
7. **Notification System** - Real-time alerts, activity feed

### **Advanced Features**
1. **Blockchain Integration** - Web3 wallet connectivity
2. **Smart Contracts** - Automated supply chain processes
3. **QR Code Scanning** - Product verification
4. **Recall Management** - Product recall workflows
5. **Multi-language Support** - Internationalization
6. **Offline Support** - PWA capabilities

## 🎯 **Architecture Patterns**

### **Component Architecture**
- **Functional Components**: Modern React patterns
- **Custom Hooks**: Reusable logic extraction
- **Context API**: Global state management
- **TypeScript**: Type safety and better DX

### **State Management**
- **Local State**: useState for component-specific data
- **Global State**: Context API for shared data
- **Server State**: Custom hooks for API data
- **Form State**: Controlled components pattern

### **Styling Patterns**
- **Utility-First**: Tailwind CSS approach
- **Component Variants**: Consistent design system
- **Responsive Design**: Mobile-first methodology
- **Theme System**: Dark/light mode support

This structure provides a scalable, maintainable, and professional foundation for the ProTrack supply chain management system.
