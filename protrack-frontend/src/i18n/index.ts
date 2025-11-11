/**
 * Internationalization Configuration
 * Multi-language support for ProTrack
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      'nav.overview': 'Overview',
      'nav.products': 'Products',
      'nav.create': 'Create Product',
      'nav.scan': 'Scan & Verify',
      'nav.tracking': 'GPS Tracking',
      'nav.iot': 'IoT Dashboard',
      'nav.analytics': 'Analytics',
      'nav.recalls': 'Recalls',
      'nav.notifications': 'Notifications',
      'nav.admin': 'Admin Tools',
      'nav.certificates': 'Certificates',
      'nav.blockchain': 'Blockchain',
      'nav.inventory': 'Inventory',
      'nav.compliance': 'Compliance',
      'nav.audit': 'Audit Logs',
      'nav.settings': 'Settings',

      // Authentication
      'auth.login': 'Sign In',
      'auth.register': 'Sign Up',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.confirmPassword': 'Confirm Password',
      'auth.role': 'Role',
      'auth.companyName': 'Company Name',
      'auth.signInButton': 'Sign In',
      'auth.signUpButton': 'Create Account',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.noAccount': "Don't have an account?",
      'auth.hasAccount': 'Already have an account?',

      // Roles
      'role.manufacturer': 'Manufacturer',
      'role.packager': 'Packager',
      'role.wholesaler': 'Wholesaler',
      'role.seller': 'Seller',
      'role.inspector': 'Inspector',
      'role.customer': 'Customer',
      'role.admin': 'Admin',

      // Dashboard
      'dashboard.title': 'ProTrack Dashboard',
      'dashboard.totalProducts': 'Total Products',
      'dashboard.verifiedItems': 'Verified Items',
      'dashboard.activeShipments': 'Active Shipments',
      'dashboard.iotAlerts': 'IoT Alerts',
      'dashboard.recentActivity': 'Recent Activity',
      'dashboard.quickActions': 'Quick Actions',

      // Products
      'product.name': 'Product Name',
      'product.sku': 'SKU',
      'product.batch': 'Batch Number',
      'product.category': 'Category',
      'product.description': 'Description',
      'product.expiry': 'Expiry Date',
      'product.create': 'Create Product',
      'product.scan': 'Scan Product',
      'product.verify': 'Verify Product',
      'product.authentic': 'Authentic Product',
      'product.compromised': 'Compromised Product',

      // Blockchain
      'blockchain.hash': 'Blockchain Hash',
      'blockchain.mint': 'Mint NFT Proof',
      'blockchain.verify': 'Verify on Blockchain',
      'blockchain.transaction': 'Transaction Hash',

      // IoT
      'iot.temperature': 'Temperature',
      'iot.humidity': 'Humidity',
      'iot.vibration': 'Vibration',
      'iot.location': 'Location',
      'iot.alerts': 'IoT Alerts',
      'iot.devices': 'Connected Devices',

      // Common
      'common.search': 'Search products, batches...',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.view': 'View',
      'common.connectWallet': 'Connect Wallet',
      'common.notifications': 'Notifications'
    }
  },
  es: {
    translation: {
      // Navigation
      'nav.overview': 'Resumen',
      'nav.products': 'Productos',
      'nav.create': 'Crear Producto',
      'nav.scan': 'Escanear y Verificar',
      'nav.tracking': 'Seguimiento GPS',
      'nav.iot': 'Panel IoT',
      'nav.analytics': 'Analíticas',
      'nav.recalls': 'Retiradas',
      'nav.notifications': 'Notificaciones',
      'nav.admin': 'Herramientas Admin',

      // Authentication
      'auth.login': 'Iniciar Sesión',
      'auth.register': 'Registrarse',
      'auth.email': 'Correo Electrónico',
      'auth.password': 'Contraseña',
      'auth.role': 'Rol',
      'auth.signInButton': 'Iniciar Sesión',
      'auth.signUpButton': 'Crear Cuenta',

      // Roles
      'role.manufacturer': 'Fabricante',
      'role.packager': 'Empaquetador',
      'role.wholesaler': 'Mayorista',
      'role.seller': 'Vendedor',
      'role.inspector': 'Inspector',
      'role.customer': 'Cliente',
      'role.admin': 'Administrador',

      // Common
      'common.search': 'Buscar productos, lotes...',
      'common.loading': 'Cargando...',
      'common.connectWallet': 'Conectar Billetera'
    }
  },
  fr: {
    translation: {
      // Navigation
      'nav.overview': 'Aperçu',
      'nav.products': 'Produits',
      'nav.create': 'Créer Produit',
      'nav.scan': 'Scanner et Vérifier',
      'nav.tracking': 'Suivi GPS',
      'nav.iot': 'Tableau IoT',

      // Authentication
      'auth.login': 'Se Connecter',
      'auth.register': "S'inscrire",
      'auth.email': 'Email',
      'auth.password': 'Mot de Passe',

      // Common
      'common.search': 'Rechercher produits, lots...',
      'common.connectWallet': 'Connecter Portefeuille'
    }
  },
  de: {
    translation: {
      // Navigation
      'nav.overview': 'Übersicht',
      'nav.products': 'Produkte',
      'nav.create': 'Produkt Erstellen',
      'nav.scan': 'Scannen & Verifizieren',

      // Authentication
      'auth.login': 'Anmelden',
      'auth.register': 'Registrieren',

      // Common
      'common.search': 'Produkte, Chargen suchen...',
      'common.connectWallet': 'Wallet Verbinden'
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  })

export default i18n
