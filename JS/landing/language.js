// Language Switcher for Landing Page

const translations = {
  es: {
    // Hero Section
    'hero-title-1': 'Sistema de ',
    'hero-title-2': 'Inventario',
    'hero-subtitle': 'Gestión inteligente y eficiente de tu inventario. Controla productos, categorías y estadísticas en tiempo real con una interfaz moderna y fácil de usar.',
    'hero-cta': 'Comenzar Ahora',
    
    // Features Section
    'features-title': 'Funcionalidades',
    'features-subtitle': 'Descubre todo lo que puedes hacer con nuestro sistema',
    'feature-1-title': 'Gestión de Productos',
    'feature-1-desc': 'Crea, edita y elimina productos con información detallada. Controla stock, precios y categorías de manera intuitiva.',
    'feature-2-title': 'Categorías',
    'feature-2-desc': 'Organiza tus productos en categorías personalizadas para una mejor gestión y búsqueda.',
    'feature-3-title': 'Dashboard Estadístico',
    'feature-3-desc': 'Visualiza estadísticas en tiempo real: total de productos, valor del inventario y alertas de stock bajo.',
    'feature-4-title': 'Búsqueda Avanzada',
    'feature-4-desc': 'Encuentra productos rápidamente por nombre, categoría o descripción con búsqueda en tiempo real.',
    'feature-5-title': 'Edición Rápida',
    'feature-5-desc': 'Actualiza el stock de productos directamente desde la tabla con edición inline rápida y eficiente.',
    'feature-6-title': 'Seguridad',
    'feature-6-desc': 'Autenticación segura con Supabase. Cada usuario gestiona su propio inventario de forma privada.',
    
    // Roadmap Section
    'roadmap-title': 'Estado del Proyecto',
    'roadmap-subtitle': 'Versión Beta - Características implementadas y próximas actualizaciones',
    'roadmap-tab-implemented': 'Implementado',
    'roadmap-tab-pending': 'Próximamente',
    'roadmap-implemented-title': 'Características Actuales',
    'roadmap-pending-title': 'En Desarrollo',
    
    // Roadmap Items - Implemented
    'roadmap-impl-1': 'CRUD completo de productos',
    'roadmap-impl-2': 'CRUD completo de categorías',
    'roadmap-impl-3': 'Dashboard con estadísticas en tiempo real',
    'roadmap-impl-4': 'Búsqueda de productos en tiempo real',
    'roadmap-impl-5': 'Edición rápida de stock inline',
    'roadmap-impl-6': 'Autenticación segura con Supabase',
    'roadmap-impl-7': 'Sistema de cache para mejor rendimiento',
    'roadmap-impl-8': 'Alertas de stock bajo',
    'roadmap-impl-9': 'Interfaz responsive (móvil y desktop)',
    'roadmap-impl-10': 'Navegación SPA (Single Page Application)',
    
    // Roadmap Items - Pending
    'roadmap-pend-1': 'Historial de movimientos de inventario',
    'roadmap-pend-2': 'Exportar reportes a PDF/Excel',
    'roadmap-pend-3': 'Subir imágenes de productos',
    'roadmap-pend-4': 'Gestión de proveedores',
    'roadmap-pend-5': 'Gráficos y visualizaciones avanzadas',
    'roadmap-pend-6': 'Códigos de barras',
    'roadmap-pend-7': 'Múltiples almacenes/ubicaciones',
    'roadmap-pend-8': 'Entradas y salidas de productos',
    'roadmap-pend-9': 'Notificaciones por email',
    'roadmap-pend-10': 'Roles y permisos de usuario',
    'roadmap-pend-11': 'Importar/Exportar datos (CSV/Excel)',
    'roadmap-pend-12': 'Filtros avanzados de búsqueda',
    
    // CTA Section
    'cta-title': '¿Listo para optimizar tu inventario?',
    'cta-subtitle': 'Únete ahora y comienza a gestionar tu inventario de manera profesional',
    'cta-button': 'Acceder al Sistema',
    
    // Footer
    'footer-dev': 'Desarrollado con pasión por',
    'footer-github': 'GitHub: Sunshide12'
  },
  en: {
    // Hero Section
    'hero-title-1': 'Inventory ',
    'hero-title-2': 'System',
    'hero-subtitle': 'Smart and efficient inventory management. Control products, categories and real-time statistics with a modern and easy-to-use interface.',
    'hero-cta': 'Get Started',
    
    // Features Section
    'features-title': 'Features',
    'features-subtitle': 'Discover everything you can do with our system',
    'feature-1-title': 'Product Management',
    'feature-1-desc': 'Create, edit and delete products with detailed information. Control stock, prices and categories intuitively.',
    'feature-2-title': 'Categories',
    'feature-2-desc': 'Organize your products into custom categories for better management and search.',
    'feature-3-title': 'Statistical Dashboard',
    'feature-3-desc': 'View real-time statistics: total products, inventory value and low stock alerts.',
    'feature-4-title': 'Advanced Search',
    'feature-4-desc': 'Find products quickly by name, category or description with real-time search.',
    'feature-5-title': 'Quick Edit',
    'feature-5-desc': 'Update product stock directly from the table with fast and efficient inline editing.',
    'feature-6-title': 'Security',
    'feature-6-desc': 'Secure authentication with Supabase. Each user manages their own inventory privately.',
    
    // Roadmap Section
    'roadmap-title': 'Project Status',
    'roadmap-subtitle': 'Beta Version - Implemented features and upcoming updates',
    'roadmap-tab-implemented': 'Implemented',
    'roadmap-tab-pending': 'Coming Soon',
    'roadmap-implemented-title': 'Current Features',
    'roadmap-pending-title': 'In Development',
    
    // Roadmap Items - Implemented
    'roadmap-impl-1': 'Complete product CRUD',
    'roadmap-impl-2': 'Complete category CRUD',
    'roadmap-impl-3': 'Dashboard with real-time statistics',
    'roadmap-impl-4': 'Real-time product search',
    'roadmap-impl-5': 'Quick inline stock editing',
    'roadmap-impl-6': 'Secure authentication with Supabase',
    'roadmap-impl-7': 'Cache system for better performance',
    'roadmap-impl-8': 'Low stock alerts',
    'roadmap-impl-9': 'Responsive interface (mobile and desktop)',
    'roadmap-impl-10': 'SPA Navigation (Single Page Application)',
    
    // Roadmap Items - Pending
    'roadmap-pend-1': 'Inventory movement history',
    'roadmap-pend-2': 'Export reports to PDF/Excel',
    'roadmap-pend-3': 'Upload product images',
    'roadmap-pend-4': 'Supplier management',
    'roadmap-pend-5': 'Advanced charts and visualizations',
    'roadmap-pend-6': 'Barcodes',
    'roadmap-pend-7': 'Multiple warehouses/locations',
    'roadmap-pend-8': 'Product entries and exits',
    'roadmap-pend-9': 'Email notifications',
    'roadmap-pend-10': 'User roles and permissions',
    'roadmap-pend-11': 'Import/Export data (CSV/Excel)',
    'roadmap-pend-12': 'Advanced search filters',
    
    // CTA Section
    'cta-title': 'Ready to optimize your inventory?',
    'cta-subtitle': 'Join now and start managing your inventory professionally',
    'cta-button': 'Access System',
    
    // Footer
    'footer-dev': 'Developed with passion by',
    'footer-github': 'GitHub: Sunshide12'
  }
};

let currentLanguage = localStorage.getItem('language') || 'es';

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });
  
  // Special handling for hero title (two parts)
  const heroTitle1 = document.querySelector('[data-i18n="hero-title-1"]');
  const heroTitle2 = document.querySelector('[data-i18n="hero-title-2"]');
  if (heroTitle1 && heroTitle2 && translations[lang]) {
    // Both languages use the same order: title-1 first, then title-2
    heroTitle1.textContent = translations[lang]['hero-title-1'];
    heroTitle2.textContent = translations[lang]['hero-title-2'];
  }
  
  // Update HTML lang attribute
  document.documentElement.lang = lang;
  
  // Update language button text
  const langButton = document.getElementById('language-toggle');
  if (langButton) {
    langButton.textContent = lang === 'es' ? 'EN' : 'ES';
  }
}

function toggleLanguage() {
  const newLang = currentLanguage === 'es' ? 'en' : 'es';
  setLanguage(newLang);
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLanguage);
  
  // Add click event to language button
  const langButton = document.getElementById('language-toggle');
  if (langButton) {
    langButton.addEventListener('click', toggleLanguage);
  }
});
