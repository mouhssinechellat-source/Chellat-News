/* ==========================================================================
   CHELLAT-NEWS — script.js  (HARDENED v4)
   --------------------------------------------------------------------------
   1) Arabic RTL is the DEFAULT locale; EN/FR switcher fully preserved
   2) Category navigation: clicking Home / National / International / Economy /
      Technology / Sports dynamically shows that category's real RSS news
      (National = Moroccan sources: Hespress, BBC Arabic, Al Jazeera;
       Sports = BBC Sport + ESPN)
   3) Breaking News Hub: interactive cards built from the newest live items
   4) Slow, readable ticker with Breaking/عاجل badge + pause on hover
   5) Dark / Light mode toggle (navbar button, CSS variables, localStorage)
   6) HD images: largest available rendition requested from every feed,
      object-fit handled in CSS, crisp placeholder when a feed has no image
   7) Hardened RSS engine preserved: per-feed timeout + retry, configurable
      refresh interval, skeleton loading states, static fallback
   8) Locale-aware date + header search bar (Google News)
   ========================================================================== */

(function () {
    'use strict';

    /* ======================================================================
       CONFIG — tweak everything from here
       ====================================================================== */
    const CONFIG = {
        /** Auto-refresh interval in milliseconds. Default: 5 minutes. */
        REFRESH_INTERVAL_MS: 5 * 60 * 1000,

        /** Per-request timeout in milliseconds (default: 8 seconds). */
        FETCH_TIMEOUT_MS: 8000,

        /** How many extra attempts per feed after a failure (default: 1). */
        MAX_RETRIES: 1,

        /** Pause before retrying a failed feed, in milliseconds. */
        RETRY_DELAY_MS: 1200,

        /** CORS-friendly public RSS-to-JSON service (no API key needed). */
        RSS_PROXY: 'https://api.rss2json.com/v1/api.json?rss_url=',

        /** Max items kept per feed. */
        ITEMS_PER_FEED: 8,

        /** localStorage key for the dark/light theme. */
        THEME_STORAGE_KEY: 'chellat-theme',

        /** HD placeholder used when a feed item has no usable image. */
        FALLBACK_IMAGE: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=85&w=1600&auto=format&fit=crop'
    };

    /* Feed registry. `section` drives category navigation, `lang` drives
       locale-aware rendering (ar items preferred for the AR locale). */
    const FEEDS = [
        /* National — Moroccan sources */
        { url: 'https://www.hespress.com/feed', section: 'national', lang: 'ar' },
        { url: 'https://feeds.bbci.co.uk/arabic/rss.xml', section: 'national', lang: 'ar' },
        { url: 'https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9', section: 'national', lang: 'ar' },
        /* International */
        { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', section: 'international', lang: 'en' },
        { url: 'https://www.lemonde.fr/rss/une.xml', section: 'international', lang: 'fr' },
        /* Economy */
        { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', section: 'economy', lang: 'en' },
        /* Technology */
        { url: 'https://www.theverge.com/rss/index.xml', section: 'tech', lang: 'en' },
        /* Sports — national & international */
        { url: 'https://feeds.bbci.co.uk/sport/rss.xml', section: 'sports', lang: 'en' },
        { url: 'https://www.espn.com/espn/rss/news', section: 'sports', lang: 'en' }
    ];

    /* ======================================================================
       1. TRANSLATION DICTIONARIES
       ====================================================================== */
    const translations = {
        ar: {
            home: "الرئيسية",
            national: "أخبار وطنية",
            international: "أخبار دولية",
            economy: "اقتصاد",
            tech: "تكنولوجيا",
            sports: "رياضة",
            contact: "اتصل بنا",
            breaking: "عاجل",
            badgeAr: "عاجل",
            badgeEn: "BREAKING",
            hubTitle: "الأخبار العاجلة الآن",
            hubHint: "اضغط على أي خبر للانتقال إلى القصة الكاملة",
            trending: "الأكثر قراءة",
            latest: "آخر الأخبار",
            read: "اقرأ المزيد",
            by: "بقلم",
            searchPlaceholder: "ابحث في الأخبار...",
            footerDesc: "نقدم أخبارًا دقيقة وفي الوقت المناسب وغير متحيزة من جميع أنحاء العالم. مصدرك الموثوق للرؤى حول السياسة والأعمال والتكنولوجيا والثقافة.",
            quickLinks: "روابط سريعة",
            about: "من نحن",
            privacy: "سياسة الخصوصية",
            terms: "شروط الخدمة",
            categories: "التصنيفات",
            contactUs: "تواصل معنا",
            editorName: "م. شلات",
            editorRole: "رئيس التحرير",
            liveLabel: "مباشر",
            agoMinutes: "دقيقة مضت",
            agoHours: "ساعة مضت",
            agoDays: "يوم مضى",
            justNow: "الآن",
            lastUpdated: "آخر تحديث",
            refresh: "تحديث الآن",
            allNews: "جميع الأخبار"
        },
        en: {
            home: "Home",
            national: "National News",
            international: "International News",
            economy: "Economy",
            tech: "Technology",
            sports: "Sports",
            contact: "Contact Us",
            breaking: "BREAKING NEWS",
            badgeAr: "عاجل",
            badgeEn: "BREAKING",
            hubTitle: "Breaking News — Live Now",
            hubHint: "Click any story to open the full article",
            trending: "Trending Now",
            latest: "Latest Stories",
            read: "Read More",
            by: "By",
            searchPlaceholder: "Search news...",
            footerDesc: "Delivering accurate, timely, and unbiased news from around the globe. Your trusted source for insights on politics, business, technology, and culture.",
            quickLinks: "Quick Links",
            about: "About Us",
            privacy: "Privacy Policy",
            terms: "Terms of Service",
            categories: "Categories",
            contactUs: "Contact Us",
            editorName: "M. Chellat",
            editorRole: "Editor-in-Chief",
            liveLabel: "LIVE",
            agoMinutes: "min ago",
            agoHours: "h ago",
            agoDays: "d ago",
            justNow: "Just now",
            lastUpdated: "Updated",
            refresh: "Refresh now",
            allNews: "All News"
        },
        fr: {
            home: "Accueil",
            national: "Actualité Nationale",
            international: "Actualité Internationale",
            economy: "Économie",
            tech: "Technologie",
            sports: "Sport",
            contact: "Contactez-nous",
            breaking: "DERNIÈRE HEURE",
            badgeAr: "عاجل",
            badgeEn: "BREAKING",
            hubTitle: "Dernières nouvelles — En direct",
            hubHint: "Cliquez sur un article pour ouvrir le contenu complet",
            trending: "Tendances",
            latest: "Dernières Nouvelles",
            read: "Lire la suite",
            by: "Par",
            searchPlaceholder: "Rechercher...",
            footerDesc: "Fournir des informations précises, opportunes et impartiales du monde entier. Votre source fiable pour la politique, les affaires, la technologie et la culture.",
            quickLinks: "Liens Rapides",
            about: "À Propos",
            privacy: "Confidentialité",
            terms: "Conditions d'utilisation",
            categories: "Catégories",
            contactUs: "Nous Contacter",
            editorName: "M. Chellat",
            editorRole: "Rédacteur en chef",
            liveLabel: "EN DIRECT",
            agoMinutes: "min",
            agoHours: "h",
            agoDays: "j",
            justNow: "À l'instant",
            lastUpdated: "Mis à jour",
            refresh: "Actualiser",
            allNews: "Toutes les actualités"
        }
    };

    let currentLang = 'ar';          // Arabic RTL is the default locale
    let currentSection = 'home';     // active nav category

    /* ======================================================================
       2. LANGUAGE SWITCHER (with RTL support)
       ====================================================================== */
    function applyTranslations(lang) {
        const t = translations[lang];
        if (!t) return;

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            const key = el.getAttribute('data-i18n');
            if (t[key]) el.textContent = t[key];
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key]) el.setAttribute('placeholder', t[key]);
        });

        const lu = document.getElementById('last-updated-label');
        if (lu && lastUpdatedTime) lu.textContent = t.lastUpdated + ' ' + formatClock(lastUpdatedTime);
        const rb = document.getElementById('manual-refresh');
        if (rb) rb.title = t.refresh;
    }

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

        applyTranslations(lang);
        updateDate(lang);
        // Re-render live news so headlines/timestamps switch language
        if (lastNewsItems && lastNewsItems.length) {
            renderAll(lastNewsItems);
        }
    }

    /* ======================================================================
       3. LOCALE-AWARE DATE + "LAST UPDATED" CLOCK
       ====================================================================== */
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    function updateDate(lang) {
        const localeMap = { en: 'en-US', ar: 'ar-EG', fr: 'fr-FR' };
        const el = document.getElementById('current-date');
        if (el) {
            el.textContent = new Date().toLocaleDateString(localeMap[lang] || 'ar-EG', dateOptions);
        }
    }

    let lastUpdatedTime = null;
    function formatClock(d) {
        const localeMap = { en: 'en-US', ar: 'ar-EG', fr: 'fr-FR' };
        try {
            return d.toLocaleTimeString(localeMap[currentLang] || 'ar-EG',
                { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return d.toTimeString().slice(0, 5);
        }
    }

    /* "Updated HH:MM" chip + manual refresh button, injected into the top bar
       so index.html stays minimal. */
    function initTopBarChrome() {
        const bar = document.querySelector('.top-bar .container');
        if (!bar || document.getElementById('last-updated')) return;

        const wrap = document.createElement('div');
        wrap.className = 'topbar-right';

        const chip = document.createElement('span');
        chip.id = 'last-updated';
        chip.innerHTML = '<span id="last-updated-label"></span>';
        chip.style.display = 'none';

        const btn = document.createElement('button');
        btn.id = 'manual-refresh';
        btn.type = 'button';
        btn.textContent = '↻';
        btn.title = translations[currentLang].refresh;
        btn.addEventListener('click', function () {
            if (!isLoading) loadNews(true);
        });

        wrap.appendChild(chip);
        wrap.appendChild(btn);

        const dateEl = document.getElementById('current-date');
        const langEl = document.querySelector('.lang-switcher');
        bar.innerHTML = '';
        if (dateEl) bar.appendChild(dateEl);
        bar.appendChild(wrap);
        if (langEl) bar.appendChild(langEl);
    }

    function markUpdated() {
        lastUpdatedTime = new Date();
        const chip = document.getElementById('last-updated');
        const label = document.getElementById('last-updated-label');
        if (chip && label) {
            label.textContent = translations[currentLang].lastUpdated + ' ' + formatClock(lastUpdatedTime);
            chip.style.display = '';
        }
    }

    /* ======================================================================
       4. DARK / LIGHT THEME TOGGLE
       ====================================================================== */
    function initTheme() {
        let saved = null;
        try { saved = localStorage.getItem(CONFIG.THEME_STORAGE_KEY); } catch (e) { /* file:// may block */ }
        applyTheme(saved === 'dark' ? 'dark' : 'light');

        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.addEventListener('click', function () {
                const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                applyTheme(next);
            });
        }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem(CONFIG.THEME_STORAGE_KEY, theme); } catch (e) { /* ignore */ }
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
})();
