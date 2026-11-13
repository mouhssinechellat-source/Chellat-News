(function () {
    const FEEDS = [
        /* International News */
        { url: 'https://rss.cnn.com/rss/edition_world.rss', category: 'international' },
        { url: 'https://feeds.bbci.co.uk/arabic/rss.xml', category: 'international' },
        /* Economy */
        { url: 'https://www.reutersagency.com/feed/?best-regions=middle-east&post_type=best', category: 'economy' },
        /* Technology */
        { url: 'https://techcrunch.com/feed/', category: 'tech' },
        /* Sports - national & international */
        { url: 'https://www.kooora.com/rss.aspx', category: 'sports' }
    ];

    /* ==========================================
       1. TRANSLATION DICTIONARIES & LOGIC
       ========================================== */
    const translations = {
        ar: {
            home: "الرئيسية",
            national: "أخبار وطنية",
            international: "أخبار دولية",
            economy: "اقتصاد",
            tech: "تكنولوجيا",
            sports: "رياضة",
            contact: "اتصل بنا",
            hubTitle: "الأخبار العاجلة الآن",
            hubHint: "اضغط على أي خبر للانتقال إلى القصة الكاملة",
            trending: "الأكثر قراءة",
            latest: "آخر الأخبار",
            badgeAr: "عاجل",
            badgeEn: "BREAKING",
            searchPlaceholder: "ابحث في الأخبار...",
            footerDesc: "نقدم أخبارًا دقيقة وفي الوقت المناسب وغير متحيزة من جميع أنحاء العالم. مصدرك الموثوق للرؤى حول السياسة والأعمال والتكنولوجيا والثقافة.",
            quickLinks: "روابط سريعة",
            about: "من نحن",
            privacy: "سياسة الخصوصية",
            terms: "شروط الخدمة",
            categories: "التصنيفات",
            contactUs: "تواصل معنا"
        },
        en: {
            home: "Home",
            national: "National",
            international: "International",
            economy: "Economy",
            tech: "Technology",
            sports: "Sports",
            contact: "Contact",
            hubTitle: "Breaking News Now",
            hubHint: "Click any news item to read the full story",
            trending: "Trending",
            latest: "Latest News",
            badgeAr: "URGENT",
            badgeEn: "BREAKING",
            searchPlaceholder: "Search news...",
            footerDesc: "Delivering accurate, timely, and unbiased news from around the globe. Your trusted source for insights on politics, business, tech, and culture.",
            quickLinks: "Quick Links",
            about: "About Us",
            privacy: "Privacy Policy",
            terms: "Terms of Service",
            categories: "Categories",
            contactUs: "Contact Us"
        },
        fr: {
            home: "Accueil",
            national: "National",
            international: "International",
            economy: "Économie",
            tech: "Technologie",
            sports: "Sports",
            contact: "Contact",
            hubTitle: "Dernières Actualités",
            hubHint: "Cliquez sur n'importe quelle actualité pour lire l'histoire complète",
            trending: "Tendances",
            latest: "Dernières Nouvelles",
            badgeAr: "URGENT",
            badgeEn: "FLASH",
            searchPlaceholder: "Rechercher des actualités...",
            footerDesc: "Fournir des actualités précises, opportunes et impartiales du monde entier. Votre source de confiance pour la politique, l'économie, la techno et la culture.",
            quickLinks: "Liens Rapides",
            about: "À propos",
            privacy: "Politique de Confidentialité",
            terms: "Conditions d'Utilisation",
            categories: "Catégories",
            contactUs: "Contactez-nous"
        }
    };

    let currentLang = 'ar';

    function changeLanguage(lang) {
        currentLang = lang;
        const html = document.documentElement;
        
        if (lang === 'ar') {
            html.setAttribute('dir', 'rtl');
            html.setAttribute('lang', 'ar');
        } else {
            html.setAttribute('dir', 'ltr');
            html.setAttribute('lang', lang);
        }

        // Translate text elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        // Translate placeholders with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang] && translations[lang][key]) {
                el.setAttribute('placeholder', translations[lang][key]);
            }
        });

        updateDate(lang);
    }

    /* ==========================================
       2. DATE & THEME MANAGEMENT
       ========================================== */
    function updateDate(lang) {
        const localeMap = { en: 'en-US', ar: 'ar-EG', fr: 'fr-FR' };
        const el = document.getElementById('current-date');
        if (el) {
            el.textContent = new Date().toLocaleDateString(localeMap[lang] || 'ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('CHELLAT_NEWS_THEME', theme);
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    function initTheme() {
        const savedTheme = localStorage.getItem('CHELLAT_NEWS_THEME') || 'dark';
        applyTheme(savedTheme);
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                applyTheme(current === 'dark' ? 'light' : 'dark');
            });
        }
    }

    /* ==========================================
       3. RSS FETCHING & INITIALIZATION
       ========================================== */
    let lastUpdatedTime = null;

    function formatClock(d) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    async function fetchAllFeeds() {
        // Core automated news logic setup
        updateDate(currentLang);
    }

    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        fetchAllFeeds();
        setInterval(fetchAllFeeds, 300000); // 5 minutes refresh cycle
    });

    // Language Selector Event Listener
    document.getElementById('language-selector').addEventListener('change', (e) => {
        changeLanguage(e.target.value);
    });

})();