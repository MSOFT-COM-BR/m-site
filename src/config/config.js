// Configurações do Framework
/**
 * API local: http://127.0.0.1:3000. O site não deve rodar na mesma porta (use 8082 etc.).
 * Override: window.__MSOFT_API_BASE__
 */
function resolveApiBaseUrl() {
  if (typeof window === 'undefined') return 'https://api.mirandasoft.com.br';
  const custom = window.__MSOFT_API_BASE__;
  if (typeof custom === 'string' && custom.trim()) {
    return custom.replace(/\/+$/, '');
  }
  const h = window.location.hostname;
  const isLocal = h === 'localhost' || h === '127.0.0.1';
  if (!isLocal) return 'https://api.mirandasoft.com.br';
  return `http://${h}:3000`;
}

const config = {
  app: {
    name: "Miranda Soft",
    version: "0.11.68",
    environment: "production",
    debug: false
  },
  api: {
    baseUrl: resolveApiBaseUrl(),
    fallbackUrl: "https://api.mirandasoft.com.br",
    timeout: 30000,
    retryAttempts: 3,
    useProxy: false,
    proxyUrl: ""
  },
  routes: {
    defaultPage: "home",
    page404: "404",
    validPages: [
      'home',
      'blog',
      'apps',
      'login',
      'premium',
      'admin',
      'blog-ads',
      'blog-review',
      'blogs',
      'blog-custom',
      'games',
      'about',
      'contact',
      'materials',
      'privacy',
      'terms',
      'lgpd',
      'cookies',
      '404',
      'marketplace',
      'expertise',
      'criacao-de-sites',
      'desenvolvimento-de-sistemas',
      'ecossistema',
      'cotacoes',
      'mercado',
      'mcredential',
      'profile',
      'support',
    ]
  },
  components: {
    path: "/src/components",
    defaultSkeleton: true,
    skeletonDelay: 400
  },
  assets: {
    images: "/assets/images",
    css: "/assets/css",
    js: "/assets/js"
  },
  cdn: [
    "/src/assets/vendor/marked/marked.min.js",
    "/src/assets/vendor/bootstrap/js/bootstrap.bundle.min.js",
    "/src/assets/vendor/bootstrap/css/bootstrap.min.css",
    "/src/assets/vendor/swiper/swiper-bundle.min.js",
    "/src/assets/vendor/swiper/swiper-bundle.min.css",
    "/src/assets/vendor/jquery/jquery-3.7.1.min.js",
    "/src/assets/vendor/papaparse/papaparse.min.js",
    "/src/assets/vendor/animate/animate.min.css",
    "/src/assets/vendor/bootstrap-icons/font/bootstrap-icons.css"
  ],
  analytics: {
    enabled: false,
    ga4MeasurementId: "G-XXXXXXXXXX",
    consentRequired: true
  },
  cache: {
    enabled: true,
    duration: 3600
  },
  security: {
    cors: {
      enabled: true,
      allowedOrigins: ["*"]
    },
    headers: {
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff"
    }
  },
  performance: {
    lazyLoad: true,
    preload: true,
    minify: false
  },
  theme: {
    primary: "#000000",
    secondary: "#6c757d",
    success: "#28a745",
    danger: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8"
  }
};

if (typeof window !== 'undefined') {
  window.config = config;
}
