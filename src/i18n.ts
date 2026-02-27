import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        topology: 'Topology',
        map: 'Network Map',
        lookup: 'IP Lookup'
      },
      stats: {
        asns: 'Total ASNs Registered',
        prefixes: 'IPv4 Prefixes Analyzed',
        locations: 'PoP Locations Mapping',
        datacenters: 'Data Centers Identified',
        isps: 'Home ISP Networks',
        cdns: 'CDN PoP Nodes'
      },
      home: {
        hero_tag: 'Real-time Network Analysis',
        hero_title: "Iran's Infrastructure Under the Microscope",
        hero_desc: "A comprehensive mapping of Iran's autonomous systems, BGP relationships, and geographical node distributions.",
        explore_btn: 'Explore Topology',
        lookup_btn: 'IP / Domain Lookup',
        tools_title: 'Infrastructure Tools',
        tools_desc: 'Everything you need to analyze the Iranian internet landscape',
        topology_title: 'Network Topology',
        topology_desc: 'Interactive BGP relationship mapping showing upstreams, downstreams, and deep transit interconnections.',
        lookup_title: 'IP / Domain Lookup',
        lookup_desc: 'Find exactly where any IP or domain sits within the infrastructure hierarchy, including provider and ASN.',
        map_title: 'Geographic Map',
        map_desc: 'Visual representation of network nodes and PoP locations across the globe focusing on Iranian connectivity.',
        about_title: 'Deep Infrastructure Insights',
        about_desc: "InfraScope provides a technical, data-driven window into Iran's sovereign internet architecture. We map the intricate web of peering relationships, prefix allocations, and upstream paths that form the backbone of connection for millions. From massive state-owned ISPs to private hosting farms, discover how Iran connects to itself and the world.",
        about_feature1: 'AS-Level mapping',
        about_feature2: 'Global Connectivity'
      },
      ui: {
        loading: 'Mapping Infrastructure...',
        search: 'Search ASNs, IPs, or domains...',
        language: 'EN'
      }
    }
  },
  fa: {
    translation: {
      nav: {
        home: 'خانه',
        topology: 'توپولوژی',
        map: 'نقشه شبکه',
        lookup: 'جستجوی آی‌پی'
      },
      stats: {
        asns: 'تعداد کل ASهای ثبت شده',
        prefixes: 'پیشوندهای IPv4 تحلیل شده',
        locations: 'نقشه مکان‌های PoP',
        datacenters: 'دیتاسنترهای شناسایی شده',
        isps: 'شبکه‌های ISP خانگی',
        cdns: 'گره‌های PoP شبکه CDN'
      },
      home: {
        hero_tag: 'تحلیل آنی شبکه',
        hero_title: 'زیرساخت ایران زیر ذره‌بین',
        hero_desc: 'نگاشت جامع سیستم‌های خودگردان ایران (AS)، روابط BGP و توزیع جغرافیایی گره‌های شبکه.',
        explore_btn: 'کاوش توپولوژی',
        lookup_btn: 'جستجوی آی‌پی / دامنه',
        tools_title: 'ابزارهای زیرساخت',
        tools_desc: 'تمام آنچه برای تحلیل چشم‌انداز اینترنت ایران نیاز دارید',
        topology_title: 'توپولوژی شبکه',
        topology_desc: 'نگاشت تعاملی روابط BGP شامل بالا‌دستی‌ها، پایین‌دستی‌ها و اتصالات ترانزیت عمیق.',
        lookup_title: 'جستجوی آی‌پی / دامنه',
        lookup_desc: 'محل دقیق هر آی‌پی یا دامنه را در سلسله مراتب زیرساخت، شامل سرویس‌دهنده و AS پیدا کنید.',
        map_title: 'نقشه جغرافیایی',
        map_desc: 'نمایش بصری گره‌های شبکه و مکان‌های PoP در سراسر جهان با تمرکز بر اتصالات ایران.',
        about_title: 'شناخت عمیق زیرساخت',
        about_desc: 'اینفرا‌اسکوپ یک پنجره فنی و داده‌محور به معماری اینترنت حاکمیتی ایران باز می‌کند. ما شبکه پیچیده روابط پیرینگ، تخصیص پیشوندها و مسیرهای بالادستی را که ستون فقرات اتصال میلیون‌ها نفر را تشکیل می‌دهند، ترسیم می‌کنیم. از سرویس‌دهندگان بزرگ دولتی تا مزارع میزبانی خصوصی، کشف کنید که چگونه ایران به خود و جهان متصل می‌شود.',
        about_feature1: 'نگاشت در سطح AS',
        about_feature2: 'اتصال جهانی'
      },
      ui: {
        loading: 'در حال نگاشت زیرساخت...',
        search: 'جستجوی AS، آی‌پی یا دامنه...',
        language: 'FA'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
