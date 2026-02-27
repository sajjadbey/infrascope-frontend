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
      },
      footer: {
        title: "InfraScope — Iran's Network Infrastructure Analysis",
        rights: "All rights reserved."
      },
      asn_detail: {
        fetching: "Fetching ASN Intel...",
        not_found: "ASN Not Found",
        not_found_desc: "The requested Autonomous System could not be found in our database.",
        return_btn: "Return to Topology",
        registration: "Registration",
        registered_to: "Registered To",
        registrar: "Registrar",
        registered_on: "Registered On",
        peering_graph: "Peering Graph",
        upstreams: "Upstreams",
        downstreams: "Downstreams",
        no_upstreams: "No upstream data available",
        no_downstreams: "No downstream dependencies",
        prefix_inventory: "Prefix Inventory",
        prefix_desc: "Publicly announced IPv4 blocks",
        total: "Total",
        table_prefix: "IPv4 Prefix",
        table_desc: "Broadcast Description",
        generic_desc: "Generic local assignment",
        no_prefixes: "No direct prefixes announced from this AS."
      },
      topology: {
        dest_placeholder: "Destination (Optional)",
        find_path: "Find Path",
        clear: "Clear",
        legend: "Legend",
        mapping: "Mapping National Infrastructure...",
        legend_title: "Infrastructure Node Types",
        node_tier1: "Tier-1 / Backbone",
        node_transit: "Transit / Provider",
        node_access: "Access / Origin",
        node_standalone: "Standalone Node",
        intel_unavailable: "Intel unavailable for this Node",
        type: "Type",
        status: "Status",
        owner: "Owner",
        peers: "Peers (U/D)",
        deep_intel: "Deep Intelligence",
        origin_point: "Origin Point",
        destination: "Destination",
        same_node: "Same Node",
        no_path: "No path found between these two ASNs.",
        tier1_status: "This ASN is already a Tier-1 provider.",
        no_tier1: "No path to Tier-1 found for this ASN."
      },
      map: {
        asn_network: "ASN Network",
        asn_intel: "ASN Intelligence"
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
        prefixes: 'آیپی های IPv4 تحلیل شده',
        locations: 'نقشه مکانهای PoP',
        datacenters: 'دیتاسنترهای شناسایی شده',
        isps: 'شبکه های ارائه دهنده اینترنت خانگی',
        cdns: 'گرههای PoP شبکه CDN'
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
      },
      footer: {
        title: "اینفرا اسکوپ — تحلیل زیرساخت شبکه ایران",
        rights: "تمامی حقوق محفوظ است."
      },
      asn_detail: {
        fetching: "در حال دریافت اطلاعات AS...",
        not_found: "AS یافت نشد",
        not_found_desc: "سیستم خودگردان مورد نظر در پایگاه داده یافت نشد.",
        return_btn: "بازگشت به توپولوژی",
        registration: "اطلاعات ثبت",
        registered_to: "ثبت شده به نام",
        registrar: "ثبت‌کننده (Registrar)",
        registered_on: "تاریخ ثبت",
        peering_graph: "گراف تعاملی",
        upstreams: "بالادستی‌ها",
        downstreams: "پایین‌دستی‌ها",
        no_upstreams: "اطلاعاتی برای بالادستی‌ها موجود نیست",
        no_downstreams: "فاقد وابستگی پایین‌دستی",
        prefix_inventory: "فهرست پیشوندها",
        prefix_desc: "بلاک‌های IPv4 اعلام شده عمومی",
        total: "کل",
        table_prefix: "پیشوند IPv4",
        table_desc: "توضیح انتشار",
        generic_desc: "تخصیص محلی عمومی",
        no_prefixes: "هیچ پیشوند مستقیمی از این AS اعلام نشده است."
      },
      topology: {
        dest_placeholder: "مقصد (اختیاری)",
        find_path: "یافتن مسیر",
        clear: "پاک کردن",
        legend: "راهنما",
        mapping: "در حال نگاشت زیرساخت ملی...",
        legend_title: "انواع گره‌های زیرساخت",
        node_tier1: "شبکه اصلی / Tier-1",
        node_transit: "ترانزیت / سرویس‌دهنده",
        node_access: "دسترسی / مبدا",
        node_standalone: "گره مستقل",
        intel_unavailable: "اطلاعاتی برای این گره موجود نیست",
        type: "نوع",
        status: "وضعیت",
        owner: "مالک",
        peers: "همسایگان (U/D)",
        deep_intel: "جزئیات عمیق",
        origin_point: "نقطه مبدا",
        destination: "مقصد",
        same_node: "گره مشابه",
        no_path: "هیچ مسیری بین این دو AS یافت نشد.",
        tier1_status: "این AS خود یک سرویس‌دهنده Tier-1 است.",
        no_tier1: "هیچ مسیری به Tier-1 برای این AS یافت نشد."
      },
      map: {
        asn_network: "شبکه AS",
        asn_intel: "جزئیات تحلیل AS"
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
