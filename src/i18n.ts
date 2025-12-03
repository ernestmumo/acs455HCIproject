import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "market_overview": "Market Overview",
            "trending_now": "Trending Now 🔥",
            "market_sentiment": "Market Sentiment",
            "your_watchlist": "Your Watchlist",
            "search_placeholder": "Search crypto...",
            "market_cap": "Market Cap",
            "btc_dominance": "BTC Dominance",
            "eth_dominance": "ETH Dominance",
            "next_update": "Next Update",
            "loading_live_data": "Loading live market data...",
            "loading_sentiment": "Loading Sentiment...",
            "loading_trending": "Loading Trending...",
            "vol": "Vol",
            "add": "Add",
            "added": "Added",
            "theme_western": "Western",
            "theme_east_asia": "East Asia",
            "theme_middle_east": "Middle East",
            "timeframe": "Timeframe",
            "indicators": "Indicators"
        }
    },
    zh: {
        translation: {
            "market_overview": "市场概览",
            "trending_now": "热门趋势 🔥",
            "market_sentiment": "市场情绪",
            "your_watchlist": "您的关注列表",
            "search_placeholder": "搜索加密货币...",
            "market_cap": "总市值",
            "btc_dominance": "比特币占比",
            "eth_dominance": "以太坊占比",
            "next_update": "下次更新",
            "loading_live_data": "正在加载实时数据...",
            "loading_sentiment": "正在加载情绪...",
            "loading_trending": "正在加载趋势...",
            "vol": "量",
            "add": "添加",
            "added": "已添加",
            "theme_western": "西方模式",
            "theme_east_asia": "东亚模式",
            "theme_middle_east": "中东模式",
            "timeframe": "时间范围",
            "indicators": "指标"
        }
    },
    ar: {
        translation: {
            "market_overview": "نظرة عامة على السوق",
            "trending_now": "الأكثر تداولاً الآن 🔥",
            "market_sentiment": "معنويات السوق",
            "your_watchlist": "قائمة المراقبة الخاصة بك",
            "search_placeholder": "بحث عن عملة...",
            "market_cap": "القيمة السوقية",
            "btc_dominance": "هيمنة بيتكوين",
            "eth_dominance": "هيمنة إيثريوم",
            "next_update": "التحديث القادم",
            "loading_live_data": "جاري تحميل بيانات السوق...",
            "loading_sentiment": "جاري تحميل المعنويات...",
            "loading_trending": "جاري تحميل الاتجاهات...",
            "vol": "حجم",
            "add": "إضافة",
            "added": "تمت الإضافة",
            "theme_western": "النمط الغربي",
            "theme_east_asia": "شرق آسيا",
            "theme_middle_east": "الشرق الأوسط",
            "timeframe": "الإطار الزمني",
            "indicators": "المؤشرات"
        }
    },
    es: {
        translation: {
            "market_overview": "Resumen del Mercado",
            "trending_now": "Tendencias 🔥",
            "market_sentiment": "Sentimiento del Mercado",
            "your_watchlist": "Tu Lista de Seguimiento",
            "search_placeholder": "Buscar cripto...",
            "market_cap": "Cap. de Mercado",
            "btc_dominance": "Dominio BTC",
            "eth_dominance": "Dominio ETH",
            "next_update": "Próxima Actualización",
            "loading_live_data": "Cargando datos en vivo...",
            "loading_sentiment": "Cargando sentimiento...",
            "loading_trending": "Cargando tendencias...",
            "vol": "Vol",
            "add": "Añadir",
            "added": "Añadido",
            "theme_western": "Occidental",
            "theme_east_asia": "Asia Oriental",
            "theme_middle_east": "Medio Oriente",
            "timeframe": "Marco de Tiempo",
            "indicators": "Indicadores"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
