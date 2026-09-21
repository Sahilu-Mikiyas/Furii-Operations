export interface IncludedService {
  name: string;
  value: number;
  description: string[];
}

export interface PackageAddon {
  name: string;
  price: number;
}

export interface CuratedPackage {
  id: string;
  number: string;
  name: string;
  price: number;
  originalValue: number;
  savings: number;
  savingsPercent: number;
  tagline: string;
  coreGoal: string;
  includedServices: IncludedService[];
  addons: PackageAddon[];
}

export interface DevelopmentAddon {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface BrandingTier {
  id: string;
  tier: number;
  name: string;
  price: number;
  deliveryTime: string;
  deliverables: string[];
}

export interface ContentProductionItem {
  id: string;
  name: string;
  price: number;
  billingType: "monthly" | "per_event";
  features: string[];
}

export interface ALaCarteItem {
  id: string;
  category: "Development" | "Branding" | "Production" | "Marketing & SEO";
  name: string;
  price: number;
  description: string;
}

export const CURATED_PACKAGES: CuratedPackage[] = [
  {
    id: "pkg-real-estate",
    number: "01",
    name: "Real Estate Package",
    price: 120000,
    originalValue: 155000,
    savings: 35000,
    savingsPercent: 23,
    tagline: "Tailored showcase platform for property developers, interior designers, and architects.",
    coreGoal: "Present projects with authority, build buyer confidence, and capture high-value property inquiries.",
    includedServices: [
      {
        name: "Professional Company Website Platform",
        value: 75000,
        description: [
          "High-speed responsive web platform engineered for 4K imagery.",
          "Custom visual hierarchy highlighting structural and design excellence.",
          "Core pages: Home, About, Developments, and Contact.",
          "1 Free administrative account for personal data & invoice tracking."
        ]
      },
      {
        name: "Property & Project Showcase Engine",
        value: 25000,
        description: [
          "Categorized property filters (Residential, Commercial, Under Construction).",
          "Unit spec breakdown (Square meters, bedrooms, location maps).",
          "High-resolution interactive image and blueprint zoom lightbox.",
          "Project status badges (Available, Under Contract, Sold Out)."
        ]
      },
      {
        name: "Inquiry & Lead Capture Architecture",
        value: 15000,
        description: [
          "Context-aware inquiry form attached to each property unit.",
          "Phone number and WhatsApp click-to-chat routing.",
          "Automated email confirmation sent to prospective buyers."
        ]
      },
      {
        name: "Google Business Profile & Local Discovery",
        value: 15000,
        description: [
          "Verified Google Maps marker and office location setup.",
          "Standardized commercial phone, website, and operating hours.",
          "High-res showroom/office photo uploads and categorization."
        ]
      },
      {
        name: "Foundational Real Estate SEO",
        value: 25000,
        description: [
          "Metadata tags tailored to local real estate keyword intent.",
          "Structured XML sitemap submitted to Google for instant indexing.",
          "Core Web Vitals tuning for ultra-fast mobile loading."
        ]
      }
    ],
    addons: [
      { name: "CMS for Property Updates", price: 30000 },
      { name: "Viewing & Consultation Booking", price: 30000 },
      { name: "Advanced Architectural Animations", price: 20000 },
      { name: "Reservation / Online Payment", price: 40000 }
    ]
  },
  {
    id: "pkg-business-launch",
    number: "02",
    name: "Business Launch Package",
    price: 150000,
    originalValue: 185000,
    savings: 35000,
    savingsPercent: 19,
    tagline: "Establish your brand, professional website, and digital discoverability in one turnkey rollout.",
    coreGoal: "Build → Present → Establish → Get Discovered",
    includedServices: [
      {
        name: "Professional Business Website Platform",
        value: 75000,
        description: [
          "Clean responsive UI flows crafted to your target audience.",
          "Launch pages: Home, About, Services, Contact.",
          "Integrated inquiry form with immediate email routing.",
          "1 Free administrative account for personal details and bills."
        ]
      },
      {
        name: "Brand Identity Foundation System",
        value: 45000,
        description: [
          "Primary logo and responsive variations (monogram, horizontal).",
          "Curated color palette with RGB, CMYK, and HEX values.",
          "Typography system hierarchy & Brand Foundation Style Guide PDF."
        ]
      },
      {
        name: "Google Business Profile Setup & Verification",
        value: 15000,
        description: [
          "Claiming and configuring your business profile on Google Maps.",
          "Accurate category tagging and operating hours.",
          "Direct Google Review shortlink generation."
        ]
      },
      {
        name: "Professional Business Card with Dynamic QR",
        value: 10000,
        description: [
          "Double-sided luxury business card print design.",
          "Dynamic QR code linking directly to site or contact vCard."
        ]
      },
      {
        name: "Search & Discoverability Foundation",
        value: 40000,
        description: [
          "Industry keyword tagging across headings and metadata.",
          "Automated XML sitemap generation & Google Search Console setup."
        ]
      }
    ],
    addons: [
      { name: "Content Management System (CMS)", price: 30000 },
      { name: "Online Payment Integration", price: 40000 },
      { name: "Client Booking System", price: 30000 }
    ]
  },
  {
    id: "pkg-digital-commerce",
    number: "03",
    name: "Digital Commerce Package",
    price: 200000,
    originalValue: 260000,
    savings: 60000,
    savingsPercent: 23,
    tagline: "Turn your business into an automated online retail and transaction engine.",
    coreGoal: "Discover → Browse → Cart → Purchase",
    includedServices: [
      {
        name: "High-Conversion E-Commerce Storefront",
        value: 80000,
        description: [
          "Responsive storefront (home, catalog, product detail pages).",
          "Product variant selectors (Sizes, colors, materials, bundle pricing).",
          "Persistent shopping cart with slide-out drawer checkout."
        ]
      },
      {
        name: "Integrated Online Payment Gateway",
        value: 40000,
        description: [
          "Mobile money (Telebirr, CBE Birr) & card checkout modal.",
          "Automated receipt generation and customer email confirmation."
        ]
      },
      {
        name: "Order Management & Inventory Foundations",
        value: 35000,
        description: [
          "Back-office order dashboard with real-time status tracking.",
          "Automatic inventory count reduction upon successful payment."
        ]
      },
      {
        name: "Product Search & Filter Engine",
        value: 30000,
        description: [
          "Category taxonomy organization & live keyword search filters.",
          "Related product recommendation cross-sells."
        ]
      },
      {
        name: "Google Commerce & Local Store Optimization",
        value: 75000,
        description: [
          "Schema.org Product microdata for Google rich search results.",
          "Google Business Profile optimization with store hours & catalog link."
        ]
      }
    ],
    addons: [
      { name: "High-End E-Commerce Animations", price: 20000 },
      { name: "Product Content Retainer", price: 45000 }
    ]
  },
  {
    id: "pkg-professional-presence",
    number: "04",
    name: "Professional Presence Package",
    price: 125000,
    originalValue: 155000,
    savings: 30000,
    savingsPercent: 19,
    tagline: "Command trust offline and online with unified corporate assets.",
    coreGoal: "Look Professional → Be Discoverable → Be Easy to Contact",
    includedServices: [
      {
        name: "Professional Corporate Web Platform",
        value: 75000,
        description: [
          "Corporate layout with practice areas, leadership profiles, credentials.",
          "Direct consultation inquiry forms with document attachments."
        ]
      },
      {
        name: "High-Authority Digital Portfolio & Credentials",
        value: 25000,
        description: [
          "Practice area case study templates with outcome summaries.",
          "Certifications & client endorsement showcase module."
        ]
      },
      {
        name: "Google Business Profile Optimization",
        value: 15000,
        description: [
          "Verified firm location and office suite directions on Google Maps."
        ]
      },
      {
        name: "Physical Business Cards with Dynamic QR Connection",
        value: 10000,
        description: [
          "Executive print-ready double-sided corporate card design with QR."
        ]
      },
      {
        name: "Corporate Search Engine Optimization",
        value: 30000,
        description: [
          "Keyword hierarchy targeting corporate legal/medical/engineering terms."
        ]
      }
    ],
    addons: [
      { name: "Consultation Booking System", price: 30000 },
      { name: "CMS for Team & Article Updates", price: 30000 }
    ]
  },
  {
    id: "pkg-premium-brand-experience",
    number: "05",
    name: "Premium Brand Experience",
    price: 250000,
    originalValue: 320000,
    savings: 70000,
    savingsPercent: 22,
    tagline: "The definitive digital and brand flagship for ambitious market leaders.",
    coreGoal: "Brand → Experience → Trust → Premium Conversion",
    includedServices: [
      {
        name: "Comprehensive Brand Identity Architecture",
        value: 80000,
        description: [
          "Full positioning strategy, logo suite, color science, typography.",
          "Complete 45+ page Brand Guidelines Manual."
        ]
      },
      {
        name: "Flagship Digital Web Platform",
        value: 85000,
        description: [
          "Custom digital design system aligned with brand identity.",
          "High-speed WebGL and responsive image rendering."
        ]
      },
      {
        name: "Advanced Choreographed Motion & 3D WebGL",
        value: 35000,
        description: [
          "Smooth scroll kinematics and ambient interactive 3D WebGL canvas."
        ]
      },
      {
        name: "Google Business & Omnichannel Digital Presence",
        value: 30000,
        description: [
          "Verified Google Maps profile with luxury photography integration.",
          "Social media header and avatar kits across LinkedIn & Instagram."
        ]
      },
      {
        name: "Executive QR Business Cards & Corporate Collateral",
        value: 90000,
        description: [
          "Spot UV / foil-stamp ready cards with dynamic QR code.",
          "Corporate letterhead, presentation decks, invoice templates."
        ]
      }
    ],
    addons: [
      { name: "Enterprise Content Retainer", price: 45000 },
      { name: "Online Payment Integration", price: 40000 },
      { name: "VIP Booking / Scheduling", price: 30000 }
    ]
  }
];

export const BASE_WEBSITE_DEVELOPMENT = {
  name: "Professional Website Platform (Base)",
  price: 75000,
  deliveryTime: "3–5 weeks",
  deliverables: [
    "Custom responsive design & UI flows crafted to your audience",
    "Essential core pages & fluid navigation",
    "Contact functionality & inquiry handling with instant notifications",
    "1 Free User Account (personal details, tracking, bills)",
    "Speed, security & basic SEO baseline",
    "Production deployment, custom domain setup & hosting architecture"
  ]
};

export const DEVELOPMENT_ADDONS: DevelopmentAddon[] = [
  {
    id: "dev-g-business",
    name: "Google Business Profile",
    price: 15000,
    description: "Setup & verification on Google Search & Maps, category optimization, NAP standardization."
  },
  {
    id: "dev-card-qr",
    name: "Professional Business Card with QR",
    price: 10000,
    description: "Double-sided print-ready design + dynamic scannable QR connecting to digital portfolio/vCard."
  },
  {
    id: "dev-seo",
    name: "SEO (Search Engine Optimization)",
    price: 20000,
    description: "On-page keyword research, semantic HTML5 structure, metadata, XML sitemaps, Core Web Vitals."
  },
  {
    id: "dev-geo",
    name: "GEO (Generative Engine Optimization)",
    price: 20000,
    description: "Schema.org JSON-LD structured data and entity mapping for AI search models (ChatGPT, Gemini, Perplexity)."
  },
  {
    id: "dev-portfolio",
    name: "Portfolio Services",
    price: 15000,
    description: "Dedicated filterable project showcase with case-study templates, image lightbox, and metric highlights."
  },
  {
    id: "dev-files",
    name: "File Handling & Digital Assets",
    price: 15000,
    description: "Direct secure file uploads (PDF, ZIP, DWG) attached to contact forms + protected download links."
  },
  {
    id: "dev-cms",
    name: "CMS (Content Management System)",
    price: 30000,
    description: "Admin dashboard to independently manage posts, projects, services, and media without developers."
  },
  {
    id: "dev-auth",
    name: "User Accounts & Authentication (Multi-User)",
    price: 25000,
    description: "Upgrades free single account to multi-user registration, login (Google OAuth), password recovery, and protected pages."
  },
  {
    id: "dev-payment",
    name: "Online Payment Integration",
    price: 40000,
    description: "Direct website payments supporting Telebirr, CBE Birr, Chapa, or Stripe with automated receipt generation."
  },
  {
    id: "dev-booking",
    name: "Booking & Appointment System",
    price: 30000,
    description: "Interactive calendar for scheduling time slots, buffer times, automated email invites, and admin management."
  },
  {
    id: "dev-ecommerce",
    name: "E-Commerce Store Suite",
    price: 80000,
    description: "Complete storefront: product catalog, variant selectors (colors/sizes), shopping cart, drawer checkout & order manager."
  },
  {
    id: "dev-motion",
    name: "Advanced Interactive Motion & Animations",
    price: 20000,
    description: "Choreographed scroll animation (Framer Motion), micro-interactions, and hardware-accelerated 60 FPS motion."
  }
];

export const BRANDING_TIERS: BrandingTier[] = [
  {
    id: "brand-tier-1",
    tier: 1,
    name: "Brand Foundation",
    price: 45000,
    deliveryTime: "2–4 weeks",
    deliverables: [
      "Primary logo & secondary responsive marks",
      "Monogram / Icon for app icons & social avatars",
      "Color palette specification (RGB, CMYK, HEX)",
      "Font pairings & typographic hierarchy rules",
      "Brand Foundation PDF Guideline Book + Master vector export kit"
    ]
  },
  {
    id: "brand-tier-2",
    tier: 2,
    name: "Complete Brand Identity",
    price: 80000,
    deliveryTime: "4–6 weeks",
    deliverables: [
      "Strategic positioning direction & target audience analysis",
      "Full logo suite (primary, stacked, horizontal, emblem)",
      "Extended color system & supporting graphic devices/patterns",
      "Stationery suite (business cards, letterhead, email signature)",
      "Social media header kit + Expanded 30+ page Brand Guidelines manual"
    ]
  },
  {
    id: "brand-tier-3",
    tier: 3,
    name: "Premium Brand System",
    price: 120000,
    deliveryTime: "5–8 weeks",
    deliverables: [
      "Market research & competitive positioning matrix",
      "Enterprise brand architecture & sub-brand logic",
      "Corporate stationery, presentation folders, and invoice templates",
      "Social media brand kit & signage/vehicle wrap guidelines",
      "Complete 50+ page Brand Architecture Bible"
    ]
  },
  {
    id: "brand-tier-4",
    tier: 4,
    name: "Brand + Digital Presence",
    price: 150000,
    deliveryTime: "6–10 weeks",
    deliverables: [
      "Complete Brand Identity system",
      "Full responsive professional website development",
      "Verified Google Business Profile on Google Maps",
      "Professional business cards with dynamic QR code",
      "Digital portfolio integration & social media launch templates"
    ]
  }
];

export const CONTENT_PRODUCTION: ContentProductionItem[] = [
  {
    id: "prod-enterprise-retainer",
    name: "Professional Enterprise Retainer",
    price: 45000,
    billingType: "monthly",
    features: [
      "3–6 days of variant shots on demand / month",
      "16–20 edited high-engagement vertical videos / month (Reels / TikTok / Shorts)",
      "25 color-graded high-resolution photos / month",
      "Monthly content calendar, scriptwriting & viral hooks",
      "Custom sound design, dynamic animated subtitles & motion graphics",
      "Monthly reach, engagement & growth analytics report"
    ]
  },
  {
    id: "prod-scale-retainer",
    name: "Enterprise Scale Retainer",
    price: 100000,
    billingType: "monthly",
    features: [
      "3 to 4 full production shoot sessions / month with multi-camera crew",
      "24–30+ high-production vertical videos / month (daily omnipresent publishing)",
      "2 to 4 long-form cinematic YouTube / TV corporate episodes",
      "50+ professional commercial & executive photographs / month",
      "Licensed drone aerial cinematography & commercial sound design",
      "Dedicated creative director, producer, senior colorist/editor"
    ]
  },
  {
    id: "prod-event-campaign",
    name: "Event / Campaign Production",
    price: 65000,
    billingType: "per_event",
    features: [
      "Full-day multi-camera 4K event coverage with wireless audio & stabilizer rigs",
      "Cinematic 60–90 second event highlight trailer (48h turnaround)",
      "Full-length recorded keynotes & panel session edits",
      "16–20 vertical social media teasers & speaker cutdowns",
      "Complete gallery of 150+ color-graded high-res event photographs"
    ]
  }
];

export const A_LA_CARTE_CATALOG: ALaCarteItem[] = [
  {
    id: "alc-web-base",
    category: "Development",
    name: "Custom Website Base",
    price: 75000,
    description: "Responsive 4-page site with contact form and deployment."
  },
  {
    id: "alc-cms",
    category: "Development",
    name: "Content Management System (CMS)",
    price: 30000,
    description: "Self-service dashboard to manage posts, portfolio, and pages."
  },
  {
    id: "alc-payment-gateway",
    category: "Development",
    name: "Payment Gateway (Telebirr/CBE)",
    price: 40000,
    description: "Integrated checkout with automated receipt generation."
  },
  {
    id: "alc-booking",
    category: "Development",
    name: "Appointment & Booking Engine",
    price: 30000,
    description: "Interactive scheduling calendar with automated invites."
  },
  {
    id: "alc-ecommerce",
    category: "Development",
    name: "Full E-Commerce Store",
    price: 80000,
    description: "Catalog, product variants, shopping cart, and order manager."
  },
  {
    id: "alc-brand-found",
    category: "Branding",
    name: "Brand Foundation System",
    price: 45000,
    description: "Primary logo, color science, typography & style guide."
  },
  {
    id: "alc-brand-full",
    category: "Branding",
    name: "Complete Brand Identity",
    price: 80000,
    description: "Full logo suite, stationery, social kit & 30+ page manual."
  },
  {
    id: "alc-card-qr",
    category: "Branding",
    name: "Executive QR Business Cards",
    price: 10000,
    description: "Double-sided print design with dynamic scannable QR."
  },
  {
    id: "alc-prod-monthly",
    category: "Production",
    name: "Monthly Content Retainer (16-20 videos)",
    price: 45000,
    description: "2 shoots, 16-20 vertical videos, 25 photos & sound design."
  },
  {
    id: "alc-prod-event",
    category: "Production",
    name: "Full-Day Event Coverage (4K)",
    price: 65000,
    description: "Multi-camera shoot, 60s highlight trailer & 150+ photos."
  },
  {
    id: "alc-seo",
    category: "Marketing & SEO",
    name: "Foundational Search SEO",
    price: 20000,
    description: "Keyword indexing, meta tags, Core Web Vitals & sitemaps."
  },
  {
    id: "alc-geo",
    category: "Marketing & SEO",
    name: "Generative Engine Optimization (GEO)",
    price: 20000,
    description: "Schema.org entity mapping for ChatGPT, Gemini, and Perplexity."
  },
  {
    id: "alc-g-profile",
    category: "Marketing & SEO",
    name: "Google Business Profile Setup",
    price: 15000,
    description: "Verified Google Maps marker, photos, and review links."
  }
];
