import type { LocalizedLocale, LocalizedPath } from "@/lib/i18n";

type LocalizedPageCopy = {
  eyebrow: string;
  title: string;
  text: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

type LocalizedContent = {
  localeName: string;
  htmlLang: string;
  dir: "ltr" | "rtl";
  nav: Record<LocalizedPath, string>;
  home: {
    eyebrow: string;
    title: string;
    text: string;
    proof: string[];
    productsTitle: string;
    applicationsTitle: string;
    evidenceTitle: string;
    contactTitle: string;
  };
  pages: Record<LocalizedPath, LocalizedPageCopy>;
  labels: {
    viewProducts: string;
    viewApplications: string;
    viewProjects: string;
    contactSales: string;
    downloadCatalog: string;
    whatsapp: string;
    email: string;
    browseEnglishDetails: string;
  };
};

const esPages = {
  "/": {
    eyebrow: "GRIMM PUMP",
    title: "Bombas contra incendios para proyectos internacionales.",
    text: "Paquetes de bombas diésel, eléctricas y jockey con pruebas, documentos técnicos y soporte rápido para exportación.",
  },
  "/about": {
    eyebrow: "Empresa",
    title: "Un fabricante de bombas contra incendios para compradores internacionales.",
    text: "Conozca cómo GRIMM PUMP organiza productos, pruebas, evidencia de fábrica y soporte de cotización para contratistas EPC y distribuidores.",
  },
  "/products": {
    eyebrow: "Productos",
    title: "Bombas contra incendios, bombas diésel, bombas eléctricas y equipos de agua.",
    text: "Revise las principales familias de productos y continúe a las páginas técnicas en inglés para datos de modelo y formularios de consulta.",
  },
  "/applications": {
    eyebrow: "Aplicaciones",
    title: "Soluciones de bombeo contra incendios por tipo de instalación.",
    text: "Consulte requisitos típicos para almacenes, centros de datos, aeropuertos, hospitales, petróleo y gas y plantas industriales.",
  },
  "/projects": {
    eyebrow: "Proyectos",
    title: "Evidencia de proyectos para compradores globales.",
    text: "Use los casos para revisar país, industria, configuración del producto y evidencia de entrega antes de solicitar una cotización.",
  },
  "/factory": {
    eyebrow: "Fábrica",
    title: "Capacidad de fabricación, montaje y pruebas.",
    text: "Vea cómo la producción, el montaje de paquetes, las pruebas y la documentación respaldan proyectos de exportación.",
  },
  "/testing": {
    eyebrow: "Pruebas",
    title: "Evidencia de pruebas antes del envío.",
    text: "Conozca el proceso de inspección de paquetes montados, controladores, presión y revisión documental.",
  },
  "/certificates": {
    eyebrow: "Certificados",
    title: "Certificados y documentos para revisión del comprador.",
    text: "Revise documentos CE, evidencia de calidad, informes de prueba y paquetes de documentos para proyectos.",
  },
  "/downloads": {
    eyebrow: "Descargas",
    title: "Catálogos, fichas técnicas y certificados.",
    text: "Solicite catálogos, tablas de modelos EDJ, guías de instalación y paquetes de presentación de proyecto.",
  },
  "/news": {
    eyebrow: "Noticias del sector",
    title: "Noticias recientes sobre bombas contra incendios y protección contra incendios.",
    text: "Actualizaciones públicas recientes con contexto técnico de GRIMM para compradores de proyectos.",
  },
  "/blog": {
    eyebrow: "Noticias",
    title: "Noticias de la empresa y actualizaciones del sector.",
    text: "Lea actualizaciones de entrega, noticias industriales y temas de protección contra incendios orientados a proyectos.",
  },
  "/knowledge": {
    eyebrow: "Guías",
    title: "Guías de selección y conocimiento técnico de bombas contra incendios.",
    text: "Prepare caudal, presión, aplicación, voltaje y datos de sala de bombas antes de enviar una consulta.",
  },
  "/contact": {
    eyebrow: "Contacto",
    title: "Envíe su requisito de bomba contra incendios.",
    text: "Contacte con GRIMM PUMP por WhatsApp o email para selección de modelo, catálogo y cotización.",
  },
  "/search": {
    eyebrow: "Buscar",
    title: "Busque productos, noticias y artículos técnicos.",
    text: "Encuentre bombas, aplicaciones, noticias y contenido de conocimiento de GRIMM PUMP.",
  },
  "/tools/fire-pump-selector": {
    eyebrow: "Herramientas",
    title: "Selector de bomba contra incendios y calculadora de potencia.",
    text: "Use la herramienta en inglés para estimar caudal, presión, altura y configuración recomendada.",
  },
} satisfies Record<LocalizedPath, Omit<LocalizedPageCopy, "ctaPrimary" | "ctaSecondary">>;

const ruPages = {
  "/": {
    eyebrow: "GRIMM PUMP",
    title: "Пожарные насосные установки для международных проектов.",
    text: "Комплектные дизельные, электрические и jockey pump системы с испытаниями, документами и экспортной поддержкой.",
  },
  "/about": {
    eyebrow: "Компания",
    title: "Производитель пожарных насосов для международных закупок.",
    text: "Узнайте, как GRIMM PUMP готовит продукцию, испытания, заводские доказательства и поддержку коммерческих предложений для EPC и дилеров.",
  },
  "/products": {
    eyebrow: "Продукция",
    title: "Пожарные насосные установки, дизельные и электрические насосы, оборудование водоснабжения.",
    text: "Ознакомьтесь с основными сериями продукции и перейдите к английским техническим страницам для моделей и формы запроса.",
  },
  "/applications": {
    eyebrow: "Применение",
    title: "Решения пожарного водоснабжения по типу объекта.",
    text: "Посмотрите типовые требования для складов, дата-центров, аэропортов, больниц, нефтегазовых объектов и заводов.",
  },
  "/projects": {
    eyebrow: "Проекты",
    title: "Проектные доказательства для глобальных покупателей.",
    text: "Изучите страну, отрасль, конфигурацию оборудования и фото поставки перед запросом цены.",
  },
  "/factory": {
    eyebrow: "Завод",
    title: "Производство, сборка и испытания.",
    text: "Посмотрите, как цех, сборка насосных пакетов, испытания и документация поддерживают экспортные проекты.",
  },
  "/testing": {
    eyebrow: "Испытания",
    title: "Доказательства испытаний перед отгрузкой.",
    text: "Проверьте путь контроля собранной установки, шкафов управления, давления и документов.",
  },
  "/certificates": {
    eyebrow: "Сертификаты",
    title: "Сертификаты и документы для проверки покупателем.",
    text: "Просмотрите CE, документы качества, отчеты испытаний и пакеты документов для проекта.",
  },
  "/downloads": {
    eyebrow: "Загрузки",
    title: "Каталоги, технические листы и сертификаты.",
    text: "Запросите каталоги, таблицы моделей EDJ, инструкции по монтажу и проектные пакеты.",
  },
  "/news": {
    eyebrow: "Отраслевые новости",
    title: "Свежие новости о пожарных насосах и противопожарной защите.",
    text: "Недавние публичные новости с техническим контекстом GRIMM для проектных покупателей.",
  },
  "/blog": {
    eyebrow: "Новости",
    title: "Новости компании и обновления отрасли пожарных насосов.",
    text: "Читайте новости поставок, отраслевые материалы и темы по противопожарной защите для проектов.",
  },
  "/knowledge": {
    eyebrow: "База знаний",
    title: "Руководства по подбору и технические знания.",
    text: "Подготовьте расход, давление, применение, напряжение и данные насосной комнаты перед запросом.",
  },
  "/contact": {
    eyebrow: "Контакты",
    title: "Отправьте требования к пожарному насосу.",
    text: "Свяжитесь с GRIMM PUMP через WhatsApp или email для подбора модели, каталога и предложения.",
  },
  "/search": {
    eyebrow: "Поиск",
    title: "Ищите продукты, новости и технические статьи.",
    text: "Найдите насосы, применения, новости и знания GRIMM PUMP.",
  },
  "/tools/fire-pump-selector": {
    eyebrow: "Инженерные инструменты",
    title: "Подбор пожарного насоса и расчет мощности.",
    text: "Используйте английский инструмент для оценки расхода, давления, напора и рекомендуемой конфигурации.",
  },
} satisfies Record<LocalizedPath, Omit<LocalizedPageCopy, "ctaPrimary" | "ctaSecondary">>;

const arPages = {
  "/": {
    eyebrow: "GRIMM PUMP",
    title: "حزم مضخات حريق للمشاريع الدولية.",
    text: "أنظمة ديزل وكهرباء وجوكي مجمعة مع اختبارات ووثائق فنية ودعم سريع للتصدير.",
  },
  "/about": {
    eyebrow: "الشركة",
    title: "مصنع مضخات حريق للمشترين الدوليين.",
    text: "تعرف على كيفية تنظيم GRIMM PUMP للمنتجات والاختبارات وأدلة المصنع ودعم عروض الأسعار للمقاولين والموزعين.",
  },
  "/products": {
    eyebrow: "المنتجات",
    title: "حزم مضخات حريق ومضخات ديزل وكهرباء ومعدات مياه.",
    text: "استعرض عائلات المنتجات الرئيسية وانتقل إلى الصفحات الفنية الإنجليزية لبيانات النماذج ونماذج الاستفسار.",
  },
  "/applications": {
    eyebrow: "التطبيقات",
    title: "حلول مضخات الحريق حسب نوع المنشأة.",
    text: "راجع المتطلبات النموذجية للمستودعات ومراكز البيانات والمطارات والمستشفيات والنفط والغاز والمصانع.",
  },
  "/projects": {
    eyebrow: "المشاريع",
    title: "أدلة مشاريع للمشترين العالميين.",
    text: "استخدم الحالات لمعرفة البلد والقطاع وتكوين المنتج وأدلة التسليم قبل طلب السعر.",
  },
  "/factory": {
    eyebrow: "المصنع",
    title: "قدرة التصنيع والتجميع والاختبار.",
    text: "شاهد كيف يدعم الإنتاج وتجميع الحزم والاختبار والوثائق مشاريع التصدير.",
  },
  "/testing": {
    eyebrow: "الاختبار",
    title: "أدلة الاختبار قبل الشحن.",
    text: "افهم مسار فحص الحزم المجمعة ولوحات التحكم والتحقق من الضغط ومراجعة الوثائق.",
  },
  "/certificates": {
    eyebrow: "الشهادات",
    title: "شهادات ووثائق لمراجعة المشتري.",
    text: "راجع وثائق CE وأدلة الجودة وتقارير الاختبار وحزم مستندات المشاريع.",
  },
  "/downloads": {
    eyebrow: "التحميلات",
    title: "كتالوجات وبيانات فنية وشهادات.",
    text: "اطلب الكتالوجات وجداول نماذج EDJ وأدلة التركيب وحزم تقديم المشاريع مع بيانات فنية مناسبة للمراجعة.",
  },
  "/news": {
    eyebrow: "أخبار الصناعة",
    title: "أخبار حديثة عن مضخات الحريق وأنظمة الحماية.",
    text: "أخبار عامة حديثة مع سياق هندسي من GRIMM لمشتري المشاريع.",
  },
  "/blog": {
    eyebrow: "الأخبار",
    title: "أخبار الشركة وتحديثات صناعة مضخات الحريق.",
    text: "اقرأ تحديثات التسليم وأخبار الصناعة وموضوعات الحماية من الحريق للمشاريع.",
  },
  "/knowledge": {
    eyebrow: "المعرفة",
    title: "أدلة اختيار مضخات الحريق والمعرفة الفنية.",
    text: "جهز التدفق والضغط والتطبيق والجهد ومعلومات غرفة المضخة قبل الاستفسار.",
  },
  "/contact": {
    eyebrow: "اتصل بنا",
    title: "أرسل متطلبات مضخة الحريق الخاصة بك.",
    text: "تواصل مع GRIMM PUMP عبر واتساب أو البريد الإلكتروني لاختيار النموذج والكتالوج وعرض السعر.",
  },
  "/search": {
    eyebrow: "بحث",
    title: "ابحث عن المنتجات والأخبار والمقالات الفنية.",
    text: "اعثر على المضخات والتطبيقات والأخبار ومحتوى المعرفة من GRIMM PUMP.",
  },
  "/tools/fire-pump-selector": {
    eyebrow: "أدوات هندسية",
    title: "اختيار مضخة الحريق وحساب القدرة.",
    text: "استخدم الأداة الإنجليزية لتقدير التدفق والضغط والارتفاع والتكوين المقترح.",
  },
} satisfies Record<LocalizedPath, Omit<LocalizedPageCopy, "ctaPrimary" | "ctaSecondary">>;

const frPages = {
  "/": {
    eyebrow: "GRIMM PUMP",
    title: "Groupes de pompes incendie pour projets internationaux.",
    text: "Systèmes diesel, électriques et jockey pump avec essais, documents techniques et support export rapide.",
  },
  "/about": {
    eyebrow: "Entreprise",
    title: "Un fabricant de pompes incendie pour acheteurs internationaux.",
    text: "Découvrez comment GRIMM PUMP organise produits, essais, preuves usine et support de devis pour EPC et distributeurs.",
  },
  "/products": {
    eyebrow: "Produits",
    title: "Groupes incendie, pompes diesel, pompes électriques et équipements d'eau.",
    text: "Parcourez les principales familles de produits et ouvrez les pages techniques anglaises pour les données modèles et formulaires.",
  },
  "/applications": {
    eyebrow: "Applications",
    title: "Solutions de pompage incendie par type de site.",
    text: "Consultez les besoins typiques pour entrepôts, data centers, aéroports, hôpitaux, pétrole et gaz et usines.",
  },
  "/projects": {
    eyebrow: "Projets",
    title: "Preuves de projets pour acheteurs mondiaux.",
    text: "Analysez pays, industrie, configuration produit et preuves de livraison avant de demander un devis.",
  },
  "/factory": {
    eyebrow: "Usine",
    title: "Capacité de fabrication, assemblage et essais.",
    text: "Voyez comment atelier, assemblage, essais et documents soutiennent les projets export.",
  },
  "/testing": {
    eyebrow: "Essais",
    title: "Preuves d'essais avant expédition.",
    text: "Comprenez le contrôle des groupes assemblés, armoires, pression et dossiers techniques.",
  },
  "/certificates": {
    eyebrow: "Certificats",
    title: "Certificats et documents pour revue acheteur.",
    text: "Consultez documents CE, preuves qualité, rapports d'essais et dossiers de projet.",
  },
  "/downloads": {
    eyebrow: "Téléchargements",
    title: "Catalogues, fiches techniques et certificats.",
    text: "Demandez catalogues, tableaux EDJ, guides d'installation et dossiers de soumission.",
  },
  "/news": {
    eyebrow: "Actualités secteur",
    title: "Actualités récentes sur les pompes incendie et la protection incendie.",
    text: "Actualités publiques récentes enrichies par le contexte technique de GRIMM pour les acheteurs projet.",
  },
  "/blog": {
    eyebrow: "Actualités",
    title: "Actualités de l'entreprise et du secteur incendie.",
    text: "Lisez livraisons, nouvelles industrie et sujets protection incendie orientés projet.",
  },
  "/knowledge": {
    eyebrow: "Guides",
    title: "Guides de sélection et connaissances techniques.",
    text: "Préparez débit, pression, application, tension et informations local pompes avant demande.",
  },
  "/contact": {
    eyebrow: "Contact",
    title: "Envoyez votre besoin de pompe incendie.",
    text: "Contactez GRIMM PUMP par WhatsApp ou email pour sélection, catalogue et devis.",
  },
  "/search": {
    eyebrow: "Recherche",
    title: "Recherchez produits, actualités et articles techniques.",
    text: "Trouvez pompes, applications, actualités et contenus techniques de GRIMM PUMP.",
  },
  "/tools/fire-pump-selector": {
    eyebrow: "Outils",
    title: "Sélecteur de pompe incendie et calcul de puissance.",
    text: "Utilisez l'outil anglais pour estimer débit, pression, hauteur et configuration recommandée.",
  },
} satisfies Record<LocalizedPath, Omit<LocalizedPageCopy, "ctaPrimary" | "ctaSecondary">>;

const ptPages = {
  "/": {
    eyebrow: "GRIMM PUMP",
    title: "Conjuntos de bombas de incêndio para projetos internacionais.",
    text: "Pacotes diesel, elétricos e jockey pump com testes, documentos técnicos e suporte rápido de exportação.",
  },
  "/about": {
    eyebrow: "Empresa",
    title: "Fabricante de bombas de incêndio para compradores internacionais.",
    text: "Veja como a GRIMM PUMP organiza produtos, testes, evidências de fábrica e suporte de cotação para EPCs e distribuidores.",
  },
  "/products": {
    eyebrow: "Produtos",
    title: "Conjuntos de incêndio, bombas diesel, bombas elétricas e equipamentos de água.",
    text: "Navegue pelas principais famílias e abra as páginas técnicas em inglês para dados de modelos e formulários.",
  },
  "/applications": {
    eyebrow: "Aplicações",
    title: "Soluções de bomba de incêndio por tipo de instalação.",
    text: "Confira requisitos para armazéns, data centers, aeroportos, hospitais, óleo e gás e plantas industriais.",
  },
  "/projects": {
    eyebrow: "Projetos",
    title: "Provas de projeto para compradores globais.",
    text: "Use os casos para avaliar país, indústria, configuração do produto e evidências de entrega antes da cotação.",
  },
  "/factory": {
    eyebrow: "Fábrica",
    title: "Capacidade de fabricação, montagem e testes.",
    text: "Veja como produção, montagem, testes e documentação apoiam projetos de exportação.",
  },
  "/testing": {
    eyebrow: "Testes",
    title: "Evidências de teste antes do envio.",
    text: "Entenda a inspeção dos pacotes montados, controladores, pressão e documentos.",
  },
  "/certificates": {
    eyebrow: "Certificados",
    title: "Certificados e documentos para revisão do comprador.",
    text: "Revise documentos CE, evidências de qualidade, relatórios de teste e pacotes do projeto.",
  },
  "/downloads": {
    eyebrow: "Downloads",
    title: "Catálogos, fichas técnicas e certificados.",
    text: "Solicite catálogos, tabelas EDJ, guias de instalação e pacotes de submissão.",
  },
  "/news": {
    eyebrow: "Notícias do setor",
    title: "Notícias recentes sobre bombas de incêndio e proteção contra incêndio.",
    text: "Atualizações públicas recentes com contexto técnico da GRIMM para compradores de projetos.",
  },
  "/blog": {
    eyebrow: "Notícias",
    title: "Notícias da empresa e atualizações do setor.",
    text: "Leia entregas, notícias industriais e temas de proteção contra incêndio para projetos.",
  },
  "/knowledge": {
    eyebrow: "Guias",
    title: "Guias de seleção e conhecimento técnico.",
    text: "Prepare vazão, pressão, aplicação, tensão e dados da casa de bombas antes da consulta.",
  },
  "/contact": {
    eyebrow: "Contato",
    title: "Envie seu requisito de bomba de incêndio.",
    text: "Fale com a GRIMM PUMP por WhatsApp ou email para seleção, catálogo e cotação.",
  },
  "/search": {
    eyebrow: "Busca",
    title: "Pesquise produtos, notícias e artigos técnicos.",
    text: "Encontre bombas, aplicações, notícias e conteúdos técnicos da GRIMM PUMP.",
  },
  "/tools/fire-pump-selector": {
    eyebrow: "Ferramentas",
    title: "Seletor de bomba de incêndio e calculadora de potência.",
    text: "Use a ferramenta em inglês para estimar vazão, pressão, altura e configuração recomendada.",
  },
} satisfies Record<LocalizedPath, Omit<LocalizedPageCopy, "ctaPrimary" | "ctaSecondary">>;

function withCta(
  pages: Record<LocalizedPath, Omit<LocalizedPageCopy, "ctaPrimary" | "ctaSecondary">>,
  ctaPrimary: string,
  ctaSecondary: string,
) {
  return Object.fromEntries(
    Object.entries(pages).map(([path, copy]) => [path, { ...copy, ctaPrimary, ctaSecondary }]),
  ) as Record<LocalizedPath, LocalizedPageCopy>;
}

export const localizedSite: Record<LocalizedLocale, LocalizedContent> = {
  es: {
    localeName: "Español",
    htmlLang: "es",
    dir: "ltr",
    nav: {
      "/": "Inicio",
      "/about": "Empresa",
      "/products": "Productos",
      "/applications": "Aplicaciones",
      "/projects": "Proyectos",
      "/factory": "Fábrica",
      "/testing": "Pruebas",
      "/certificates": "Certificados",
      "/downloads": "Descargas",
      "/news": "Noticias sector",
      "/blog": "Noticias",
      "/knowledge": "Guías",
      "/contact": "Contacto",
      "/search": "Buscar",
      "/tools/fire-pump-selector": "Selector",
    },
    home: {
      eyebrow: "Fabricante de sistemas contra incendios",
      title: "Bombas contra incendios para proyectos internacionales",
      text: "Paquetes con bomba eléctrica, bomba diésel, jockey pump, controladores, pruebas y soporte técnico para contratistas EPC.",
      proof: ["Selección por caudal y presión", "Documentos técnicos para compradores", "Soporte rápido por WhatsApp"],
      productsTitle: "Productos principales",
      applicationsTitle: "Aplicaciones industriales",
      evidenceTitle: "Evidencia de fábrica y pruebas",
      contactTitle: "Solicite catálogo o cotización",
    },
    pages: withCta(esPages, "Solicitar cotización", "Descargar catálogo"),
    labels: {
      viewProducts: "Ver productos",
      viewApplications: "Ver aplicaciones",
      viewProjects: "Ver proyectos",
      contactSales: "Contactar ventas",
      downloadCatalog: "Descargar catálogo",
      whatsapp: "WhatsApp",
      email: "Correo",
      browseEnglishDetails: "Ver detalles técnicos en inglés",
    },
  },
  ru: {
    localeName: "Русский",
    htmlLang: "ru",
    dir: "ltr",
    nav: {
      "/": "Главная",
      "/about": "О компании",
      "/products": "Продукция",
      "/applications": "Применение",
      "/projects": "Проекты",
      "/factory": "Завод",
      "/testing": "Испытания",
      "/certificates": "Сертификаты",
      "/downloads": "Загрузки",
      "/news": "Отраслевые новости",
      "/blog": "Новости",
      "/knowledge": "База знаний",
      "/contact": "Контакты",
      "/search": "Поиск",
      "/tools/fire-pump-selector": "Подбор",
    },
    home: {
      eyebrow: "Производитель пожарных насосных систем",
      title: "Пожарные насосные установки для международных проектов",
      text: "Комплектные системы с электрическим насосом, дизельным резервом, jockey pump, шкафами управления, испытаниями и экспортной документацией.",
      proof: ["Подбор по расходу и давлению", "Технические документы для закупки", "Быстрая связь через WhatsApp"],
      productsTitle: "Основные продукты",
      applicationsTitle: "Отрасли применения",
      evidenceTitle: "Производство и испытания",
      contactTitle: "Запросите каталог или предложение",
    },
    pages: withCta(ruPages, "Запросить цену", "Скачать каталог"),
    labels: {
      viewProducts: "Смотреть продукты",
      viewApplications: "Смотреть применения",
      viewProjects: "Смотреть проекты",
      contactSales: "Связаться с отделом продаж",
      downloadCatalog: "Скачать каталог",
      whatsapp: "WhatsApp",
      email: "Email",
      browseEnglishDetails: "Открыть технические детали на английском",
    },
  },
  ar: {
    localeName: "العربية",
    htmlLang: "ar",
    dir: "rtl",
    nav: {
      "/": "الرئيسية",
      "/about": "عن الشركة",
      "/products": "المنتجات",
      "/applications": "التطبيقات",
      "/projects": "المشاريع",
      "/factory": "المصنع",
      "/testing": "الاختبار",
      "/certificates": "الشهادات",
      "/downloads": "التحميلات",
      "/news": "أخبار الصناعة",
      "/blog": "الأخبار",
      "/knowledge": "المعرفة",
      "/contact": "اتصل بنا",
      "/search": "بحث",
      "/tools/fire-pump-selector": "اختيار المضخة",
    },
    home: {
      eyebrow: "مصنع أنظمة مضخات الحريق",
      title: "حزم مضخات حريق للمشاريع الدولية",
      text: "أنظمة مجمعة تشمل مضخة كهربائية، مضخة ديزل، مضخة جوكي، لوحات تحكم، اختبارات ووثائق فنية للمقاولين والموزعين.",
      proof: ["اختيار حسب التدفق والضغط", "وثائق فنية للمشتريات", "دعم سريع عبر واتساب"],
      productsTitle: "المنتجات الرئيسية",
      applicationsTitle: "تطبيقات المشاريع",
      evidenceTitle: "إثبات المصنع والاختبارات",
      contactTitle: "اطلب الكتالوج أو عرض السعر",
    },
    pages: withCta(arPages, "طلب عرض سعر", "تحميل الكتالوج"),
    labels: {
      viewProducts: "عرض المنتجات",
      viewApplications: "عرض التطبيقات",
      viewProjects: "عرض المشاريع",
      contactSales: "التواصل مع المبيعات",
      downloadCatalog: "تحميل الكتالوج",
      whatsapp: "واتساب",
      email: "البريد الإلكتروني",
      browseEnglishDetails: "عرض التفاصيل الفنية باللغة الإنجليزية",
    },
  },
  fr: {
    localeName: "Français",
    htmlLang: "fr",
    dir: "ltr",
    nav: {
      "/": "Accueil",
      "/about": "Entreprise",
      "/products": "Produits",
      "/applications": "Applications",
      "/projects": "Projets",
      "/factory": "Usine",
      "/testing": "Essais",
      "/certificates": "Certificats",
      "/downloads": "Téléchargements",
      "/news": "Actualités secteur",
      "/blog": "Actualités",
      "/knowledge": "Guides",
      "/contact": "Contact",
      "/search": "Recherche",
      "/tools/fire-pump-selector": "Sélecteur",
    },
    home: {
      eyebrow: "Fabricant de systèmes de pompes incendie",
      title: "Groupes de pompes incendie pour projets internationaux",
      text: "Systèmes complets avec pompe électrique, pompe diesel, jockey pump, armoires de commande, essais et documents techniques.",
      proof: ["Sélection par débit et pression", "Dossiers techniques pour acheteurs", "Réponse rapide par WhatsApp"],
      productsTitle: "Produits principaux",
      applicationsTitle: "Applications industrielles",
      evidenceTitle: "Preuves usine et essais",
      contactTitle: "Demander catalogue ou devis",
    },
    pages: withCta(frPages, "Demander un devis", "Télécharger le catalogue"),
    labels: {
      viewProducts: "Voir les produits",
      viewApplications: "Voir les applications",
      viewProjects: "Voir les projets",
      contactSales: "Contacter les ventes",
      downloadCatalog: "Télécharger le catalogue",
      whatsapp: "WhatsApp",
      email: "Email",
      browseEnglishDetails: "Voir les détails techniques en anglais",
    },
  },
  pt: {
    localeName: "Português",
    htmlLang: "pt",
    dir: "ltr",
    nav: {
      "/": "Início",
      "/about": "Empresa",
      "/products": "Produtos",
      "/applications": "Aplicações",
      "/projects": "Projetos",
      "/factory": "Fábrica",
      "/testing": "Testes",
      "/certificates": "Certificados",
      "/downloads": "Downloads",
      "/news": "Notícias setor",
      "/blog": "Notícias",
      "/knowledge": "Guias",
      "/contact": "Contato",
      "/search": "Busca",
      "/tools/fire-pump-selector": "Seletor",
    },
    home: {
      eyebrow: "Fabricante de sistemas de bomba de incêndio",
      title: "Conjuntos de bombas de incêndio para projetos internacionais",
      text: "Pacotes com bomba elétrica, bomba diesel, jockey pump, controladores, testes e documentação técnica para compradores de projetos.",
      proof: ["Seleção por vazão e pressão", "Documentos técnicos para compra", "Suporte rápido por WhatsApp"],
      productsTitle: "Produtos principais",
      applicationsTitle: "Aplicações industriais",
      evidenceTitle: "Evidência de fábrica e testes",
      contactTitle: "Solicite catálogo ou cotação",
    },
    pages: withCta(ptPages, "Solicitar cotação", "Baixar catálogo"),
    labels: {
      viewProducts: "Ver produtos",
      viewApplications: "Ver aplicações",
      viewProjects: "Ver projetos",
      contactSales: "Falar com vendas",
      downloadCatalog: "Baixar catálogo",
      whatsapp: "WhatsApp",
      email: "Email",
      browseEnglishDetails: "Ver detalhes técnicos em inglês",
    },
  },
};
