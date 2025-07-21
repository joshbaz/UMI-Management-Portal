# UMI Research Centre Portal 📱💼

A Progressive Web App (PWA) for the University Management Information System - Research Centre Portal. This application can be installed on desktop and mobile devices for a native app-like experience, providing comprehensive administrative control.

## 🚀 PWA Features

✅ **Desktop Installation** - Install on Windows, macOS, or Linux  
✅ **Mobile Installation** - Add to home screen on iOS and Android  
✅ **Offline Functionality** - Core features work without internet  
✅ **Service Worker** - Automatic caching and background updates  
✅ **Responsive Design** - Works perfectly on all screen sizes  
✅ **Native-like Experience** - Runs like a native application  
✅ **Large Bundle Support** - Optimized for comprehensive management features (2.7MB+)

## 📱 Quick Install

### Desktop (Chrome, Edge, Firefox)
1. Open the app in your browser
2. Look for the install prompt or click the install icon (⬇️) in the address bar
3. Click "Install" and launch from your desktop

### Mobile
- **Android**: Tap menu → "Add to Home Screen"
- **iOS**: Tap Share → "Add to Home Screen"

📖 **Detailed installation guide**: See [PWA-SETUP.md](./PWA-SETUP.md)

## 🏢 Management Features

- **Dashboard**: Comprehensive analytics and system overview
- **Student Management**: Complete student lifecycle management
- **Faculty Management**: Faculty profiles, assignments, and evaluations
- **Grade Management**: Academic performance monitoring across all programs
- **School Management**: Administrative settings, programs, and policies
- **Status Management**: System-wide status tracking and updates
- **Notifications**: Administrative alerts and announcements
- **Settings**: System configuration and user permissions
- **Table Builder**: Dynamic data management tools

## 🛠️ Development

### Commands

```bash
# Development server
yarn dev

# Build for production (generates PWA files)
yarn build

# Preview built PWA
yarn preview

# Lint code
yarn lint
```

### PWA Development

PWA features only work in the built version. Use `yarn build` followed by `yarn preview` to test PWA functionality locally.

## 🔧 Tech Stack

- **React 18** - UI framework
- **Vite 4** - Build tool and dev server
- **Vite PWA Plugin** - Progressive Web App capabilities
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Workbox** - Service worker and caching strategies
- **Headless UI** - Accessible UI components
- **Heroicons** - Icon library
- **Recharts** - Data visualization

## 📋 Browser Support

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Desktop Install | ✅ | ✅ | ✅ | ❌ |
| Mobile Install | ✅ | ✅ | ✅ | ✅ |
| Offline Support | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |

## 🎨 Customization

The PWA can be customized by modifying:
- Icons in the `public/` directory
- Manifest settings in `vite.config.js`
- Service worker behavior via Workbox configuration
- Theme colors and branding (currently green: `#059669`)

## 📊 Administrative Workflow

1. **Login** → Access administrative dashboard
2. **Monitor Dashboard** → View system analytics and key metrics
3. **Manage Students** → Oversee admissions, records, and progress
4. **Supervise Faculty** → Handle appointments, evaluations, and assignments
5. **Review Grades** → Monitor academic performance across programs
6. **Configure Schools** → Set up programs, policies, and structures
7. **System Administration** → Manage users, permissions, and settings

## 🔒 Security & Performance

- **Role-based Access Control** - Granular permission management
- **Data Validation** - Comprehensive input validation and sanitization
- **Optimized Caching** - Intelligent cache strategies for large datasets
- **Bundle Optimization** - Code splitting and lazy loading for better performance
- **Offline Resilience** - Critical features available without network connection

---

**Administrative Excellence!** Your UMI Research Centre Portal is now a fully functional Progressive Web App, providing comprehensive university management capabilities with the convenience of native app installation. 🎓💼
