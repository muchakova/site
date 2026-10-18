/* =============================================
   Marina Muchakova — main.js
   Handles: language, theme, navbar, mobile menu, share, filters, video, post extras
   ============================================= */

// ============ TRANSLATIONS ============
const translations = {
  bg: {
    // Name
    full_name:      'Марина Мучакова',

    // Navigation
    nav_about:      'За мен',
    nav_projects:   'Проекти',
    nav_blog:       'Блог',
    nav_contact:    'Контакти',
    nav_game:       'Игра',
    nav_booking:    'Запази час',
    lang_btn:       'EN',

    // Hero
    hero_greeting:  'Здравейте, Данъчни Хакери, аз съм',
    hero_title:     'Данъчен консултант',
    hero_desc:      'Помагам на хора и бизнеси да минат НАП без НАП да ги мине, чрез законни данъчни оптимизации и стратегии.',
    hero_cta_about: 'За мен',
    hero_cta_contact: 'Свържи се с мен',

    // About
    about_title:    'За мен',
    about_bio_1:    'Казвам се Марина Мучакова и съм данъчен консултант с юридическо образование и над 15 години опит в данъчното право.',
    about_bio_2:    'Тясната ми специализация са крипто данъци, данъци върху доходи от инвестиции, прилагане на Спогодби за избягване на двойното данъчно облагане, бизнес структуриране и планиране с цел постигане на максимално висок марж и минимални данъчни ставки — което води до максимално висока печалба.',
    about_bio_3:    'Основната ми цел е колкото се може повече капитали да останат съсредоточени в бизнеса. Постигам я чрез задълбочен анализ на данъчните правила и законодателство и намиране на гъвкави, ефективни решения.',
    about_bio_4:    'Реализирам се в три проекта: Веста Консулт — счетоводна кантора и консултантска къща с фокус върху корпоративни клиенти и частни лица, специализирана в крипто счетоводство, осчетоводяване на инвестиционни дружества, преводи и легализация на документи. Крипто Академията — образователен проект в сферата на крипто и блокчейн консултирането, с редица семинари в партньорство с УНСС, Експерт Ивентс, Обучителен център Темида, Китов Център, Финанс Академи, Инвест Про, Инвест Клуб и други. НАБИ (Национална Асоциация по Блокчейн и Иновации) — сдружение с нестопанска цел с мисия да изгради мост между бизнеса и администрацията в технологичния сектор и да създаде благоприятна среда за инвестиции и технологичен крипто хъб в България.',
    about_contact:  'Свържи се с мен',

    // Projects
    projects_title:    'Проекти',
    projects_subtitle: 'Професионални проекти и лични експерименти',
    proj_cat_1:        'Корпоративен сайт',
    proj_cat_2:        'Образователна платформа',
    proj_cat_3:        'Асоциация',
    proj_title_1:      'Веста Консулт',
    proj_title_2:      'Крипто Академията',
    proj_title_3:      'НАБИ - Национална Асоциация по Блокчейн и Иновации',
    proj_desc_1:       'Онлайн присъствие на Веста Консулт с ясно представяне на услуги, бизнес профил и контактна информация.',
    proj_desc_2:       'Образователен проект за крипто и блокчейн с фокус върху достъпно съдържание и практическо обучение.',
    proj_desc_3:       'Сдружение с нестопанска цел, което изгражда мост между бизнеса и администрацията в технологичния сектор. Официалният сайт предстои.',
    proj_link:         'Виж повече →',

    // Blog
    blog_title:      'Блог',
    blog_see_all:    'Всички статии →',
    blog_post_8_date:    '29 май 2026',
    blog_post_8_tag:     'ДДС',
    blog_post_8_title:   'Кога сделките с ценни книжа СА икономическа дейност?',
    blog_post_8_excerpt: 'Анализ на практиката на Съда на ЕС относно сделките с ценни книжа като икономическа дейност и приложението й в България.',
    blog_post_7_date:    '28 май 2026',
    blog_post_7_tag:     'MiCA',
    blog_post_7_title:   'Затрудненията пред CASP-овете при MiCA лиценз пред КФН',
    blog_post_7_excerpt: 'Практически преглед на най-честите препъни камъни пред CASP компаниите в България при кандидатстване за MiCA лиценз.',
    blog_post_6_date:    '28 май 2026',
    blog_post_6_tag:     'Криптоикономика',
    blog_post_6_title:   'Какво не пише в white paper-ите',
    blog_post_6_excerpt: 'Защо Bitcoin, Ethereum, DeFi, Layer 2 и bridge-овете са нова инфраструктура за стари икономически закони.',
    blog_post_0_tag:     'ДДС',
    blog_post_0_title:   'Обобщение на промените в режима на ДДС след 1.1.2026',
    blog_post_0_excerpt: 'Пълен практически преглед на новите режими SME/OSS, EX номера, отчетността и ефекта върху регистрациите по ЗДДС след 1 януари 2026 г.',
    blog_post_1_tag:     'ДДС',
    blog_post_1_title:   'Промени в ДДС при електронна търговия и онлайн събития',
    blog_post_1_excerpt: 'Какво се променя за онлайн бизнеса, дигиталните услуги и трансграничните продажби в ЕС от 1 януари 2026 г.',
    blog_post_2_tag:     'Данъци',
    blog_post_2_title:   'ДЦК и как не се облагат с данъци',
    blog_post_2_excerpt: 'Купони, отстъпки и капиталови печалби — пълното данъчно ръководство за физически лица, инвестиращи в ДЦК и облигации.',
    blog_post_3_tag:     'Бизнес',
    blog_post_3_title:   'Размерът има значение!',
    blog_post_3_excerpt: 'Истината, която финансистите няма да ти разкрият безвъзмездно — размерът на стартовия капитал понякога е границата между фалита и успеха.',
    blog_post_4_tag:     'ДДС',
    blog_post_4_title:   'Натрупване на оборот за регистрация по ДДС след 01.01.2026 г.',
    blog_post_4_excerpt: 'Прагът е 51 130 евро, но регистрацията възниква автоматично след преминаването му и носи задължения още преди издаване на акта.',
    blog_post_5_tag:     'Данъчно право',
    blog_post_5_title:   'Какво е „субстанция“ на една компания и защо това е важно?',
    blog_post_5_excerpt: 'Реалната субстанция на бизнеса определя къде може да се дължат данъци, независимо къде е формално регистрирана компанията.',
    read_more:       'Прочети →',

    // Contact
    contact_title:          'Контакти',
    contact_subtitle:       'Свържете се с мен',
    contact_text:           'Имате въпроси или искате да се свържете? Изпратете ми имейл или ме намерете в социалните мрежи.',
    contact_group_direct:   'Директен контакт',
    contact_group_messaging:'Съобщения',
    contact_group_social:   'Социални мрежи',
    contact_group_booking:  'Онлайн консултация',
    contact_booking_link:   'Запази час за консултация',
    contact_booking_sub:    'Изберете удобен ден и час за лична онлайн среща.',
    contact_cta_action:     'Запази час',
    contact_group_donate:   'Подкрепа',
    contact_donate_link:    'Подкрепи работата ми',

    // Booking page
    booking_page_title:    'Запази час',
    booking_page_subtitle: 'Изберете удобен ден и час за лична консултация с Марина Мучакова.',

    // Donate page
    donate_page_title:    'Подкрепи ме',
    donate_page_subtitle: 'Ако статиите и материалите в блога са ви полезни, можете да подкрепите работата ми с доброволно дарение.',
    donate_stripe_title:  'С банкова карта',
    donate_stripe_desc:   'Еднократно дарение с дебитна или кредитна карта. Сигурно плащане, обработвано от Stripe.',
    donate_stripe_btn:    'Дари с карта',
    donate_revolut_title: 'Чрез Revolut',
    donate_revolut_desc:  'Бързо дарение през Revolut — без такси между Revolut потребители.',
    donate_revolut_btn:   'Дари през Revolut',
    donate_note:          'Дарението е напълно доброволно и не представлява заплащане за консултантска услуга. Благодаря ви за подкрепата! 💛',

    // Footer
    footer_donate: '💛 Подкрепи ме',
    footer_text: '© 2026 Марина Мучакова. Всички права запазени.',

    // Blog page
    blog_page_title:    'Блог',
    blog_page_subtitle: 'Анализи на данъчни, инвестиционни и крипто теми — на български и английски.',
    filter_all:          'Всички',
    filter_taxes:        'Данъци',
    filter_crypto:       'Крипто и MiCA',
    filter_invest:       'Инвестиции',
    filter_economy:      'Икономика',
    filter_business:     'Предприемачество и бизнес',
    filter_institutions: 'Какво знаят институциите',
    sort_newest:         'Най-нови',
    sort_oldest:         'Най-стари',
    sort_popular:        'Популярни',
    blog_page_post_8_title: 'Кога сделките с ценни книжа СА икономическа дейност?',
    blog_page_post_7_title: 'Затрудненията пред CASP-овете при MiCA лиценз пред КФН',
    blog_page_post_6_title: 'Какво не пише в white paper-ите',
    blog_page_post_5_title: 'Какво е „субстанция“ на една компания и защо това е важно?',
    blog_page_post_4_title: 'Натрупване на оборот за регистрация по ДДС след 01.01.2026 г.',
    blog_page_post_0_title: 'Обобщение на промените в режима на ДДС след 1.1.2026',
    blog_page_post_1_title: 'Промени в ДДС при електронна търговия и онлайн събития',

    // Post: CASP MiCA
    casp_mica_tag:       'MiCA',
    casp_mica_title:     'Затрудненията пред CASP-овете при MiCA лиценз пред КФН',
    casp_mica_date:      '28 май 2026',
    casp_mica_read_time: '12 мин четене',

    // Post: Cryptoeconomics
    cryptoeco_tag:       'Криптоикономика',
    cryptoeco_title:     'Какво не пише в white paper-ите',
    cryptoeco_date:      '28 май 2026',
    cryptoeco_read_time: '14 мин четене',

    // Post: Securities and VAT
    securities_vat_tag:       'ДДС',
    securities_vat_title:     'Кога сделките с ценни книжа СА икономическа дейност?',
    securities_vat_date:      '29 май 2026',
    securities_vat_read_time: '10 мин четене',

    // Post: Substance
    substance_tag:       'Данъчно право',
    substance_title:     'Какво е „субстанция“ на една компания и защо това е важно?',
    substance_read_time: '6 мин четене',

    // Post: VAT Turnover 2026
    vatturnover2026_tag:       'ДДС',
    vatturnover2026_title:     'Натрупване на оборот за регистрация по ДДС след 01.01.2026 г.',
    vatturnover2026_read_time: '7 мин четене',

    // Post: ZDDS 2026 Summary
    zdds2026_tag:       'ДДС',
    zdds2026_title:     'Обобщение на промените в режима на ДДС след 1.1.2026',
    zdds2026_read_time: '6 мин четене',

    // Post: DCK
    dck_tag:       'Данъци',
    dck_title:     'ДЦК и как не се облагат с данъци',
    dck_read_time: '8 мин четене',

    // Post: DDS 2026
    dds2026_tag:       'ДДС',
    dds2026_title:     'Промени в ДДС при електронна търговия и онлайн събития',
    dds2026_read_time: '3 мин четене',

    // Post: Razmer
    razmer_tag:       'Бизнес',
    razmer_title:     'Размерът има значение!',
    razmer_read_time: '4 мин четене',

    // Post page
    post_back:       '← Обратно към блога',
    share_label:     'Сподели',
    share_copy:      'Копирай линк',
    share_copied:    '✓ Копирано!',
    share_native:    'Сподели',

    // Navigation (2026-10 redesign)
    nav_vlog:       'Влог',
    nav_partners:   'Партньори',
    skip_link:      'Към съдържанието',

    // Home — hero
    hero_cta_book:  'Запази консултация',
    hero_cta_blog:  'Прочети блога',
    stat_1_label:   'години опит в данъчното право',
    stat_2_label:   'статии за данъци, инвестиции и крипто',
    stat_3_label:   'крипто регулации и данъци',
    hero_badge_title: 'Онлайн консултации',
    hero_badge_sub: 'Запазете час директно от сайта',
    logos_label:    'Партньори',

    // Home — services
    services_eyebrow:  'Експертиза',
    services_title:    'С какво помагам',
    services_subtitle: 'Законни решения, които оставят повече капитал в бизнеса и в портфейла ви.',
    svc_crypto_title:  'Крипто данъци и MiCA',
    svc_crypto_desc:   'Облагане на криптоактиви, AML проверки, CASP лицензи и всичко, което MiCA промени.',
    svc_invest_title:  'Доходи от инвестиции',
    svc_invest_desc:   'Акции, ETF, облигации и дивиденти — кога се дължи данък, колко е и къде се декларира.',
    svc_treaty_title:  'Международно облагане',
    svc_treaty_desc:   'Спогодби за избягване на двойното данъчно облагане, местно лице и чуждестранни брокери.',
    svc_business_title:'Бизнес структуриране',
    svc_business_desc: 'Субстанция, ДДС и планиране, с което маржът расте, а данъчната тежест — не.',
    svc_articles:      'Статии →',
    svc_book:          'Консултация →',

    // Home — blog / vlog / projects / partners teasers
    blog_eyebrow:      'Блог',
    blog_latest_title: 'Последни статии',
    featured_label:    'Най-ново',
    vlog_eyebrow:      'Влог',
    vlog_home_title:   'Видео отговори на въпросите на инвеститорите',
    vlog_see_all:      'Всички видеа',
    about_eyebrow:     'За мен',
    venture_vesta:     'Счетоводна кантора и консултантска къща',
    venture_academy:   'Обучения по крипто и блокчейн',
    venture_nabi:      'Асоциация по блокчейн и иновации',
    projects_eyebrow:  'Проекти',
    projects_see_all:  'Всички проекти',
    pet_label:         'Pet project',
    proj_open:         'Отвори',
    proj_play:         'Играй',
    soon:              'Скоро',
    partners_eyebrow:  'Партньори',
    partners_home_title: 'С кого работя',
    partners_see_all:  'Всички партньори',
    contact_eyebrow:   'Контакти',

    // Vlog / video cards
    video_soon:        'Видеото идва скоро',
    video_play:        'Пусни видеото',
    video_watch_yt:    'Гледай в YouTube',
    video_read_article:'Прочети статията →',

    // Blog page tools
    search_placeholder:'Търси в статиите…',
    blog_empty:        'Няма статии, които отговарят на търсенето.',
    search_videos:     'Търси във въпросите…',
    vlog_empty:        'Няма видеа, които отговарят на търсенето.',

    // Post page extras
    toc_title:         'Съдържание',
    post_consult_title:'Имате конкретен казус?',
    post_consult_sub:  'Всяка ситуация е различна. Запазете онлайн консултация и ще я разгледаме заедно.',
    post_consult_btn:  'Запази час',
    related_title:     'Още по темата',

    // Footer (2026-10 redesign)
    footer_tagline:    'Данъчен консултант. Помагам на хора и бизнеси да минат НАП без НАП да ги мине.',
    footer_nav:        'Навигация',
    footer_resources:  'Ресурси',
    footer_contact:    'Контакт',
    footer_synth:      'Синтезатор',
  },

  en: {
    // Name
    full_name:      'Marina Muchakova',

    // Navigation
    nav_about:      'About',
    nav_projects:   'Projects',
    nav_blog:       'Blog',
    nav_contact:    'Contact',
    nav_game:       'Game',
    nav_booking:    'Book a Meeting',
    lang_btn:       'BG',

    // Hero
    hero_greeting:  "Hello, Tax Hackers, I'm",
    hero_title:     'Tax Consultant',
    hero_desc:      'I help individuals and businesses to hack their taxes through legal optimisations and strategies.',
    hero_cta_about: 'About me',
    hero_cta_contact: 'Get in touch',

    // About
    about_title:    'About me',
    about_bio_1:    'My name is Marina Muchakova and I am a tax consultant with a law degree and over 15 years of experience in tax law.',
    about_bio_2:    'My specialisations include crypto taxation, investment income taxation, application of Double Taxation Avoidance Treaties, business structuring and planning aimed at achieving the highest possible profit margin and minimum tax rates — leading to maximum profitability.',
    about_bio_3:    'My primary goal is to keep as much capital concentrated within the business as possible. I achieve this through in-depth analysis of tax rules and legislation and finding flexible, effective solutions.',
    about_bio_4:    'I work across three projects: Vesta Consult — an accounting firm and consultancy focused on corporate clients and individuals, specialising in crypto accounting, investment fund bookkeeping, translations and document legalisation. The Crypto Academy — an educational crypto and blockchain project running seminars in partnership with UNWE, Expert Events, Themida Training Centre, Kitov Centre, Finance Academy, Invest Pro, Invest Club and others. NABI (National Association for Blockchain and Innovation) — a non-profit organisation bridging the gap between business and public administration in the technology sector, with a mission to create a favourable environment for investment and a technology crypto hub in Bulgaria.',
    about_contact:  'Get in touch',

    // Projects
    projects_title:    'Projects',
    projects_subtitle: 'Professional ventures and personal experiments',
    proj_cat_1:        'Corporate website',
    proj_cat_2:        'Educational platform',
    proj_cat_3:        'Association',
    proj_title_1:      'Vesta Consult',
    proj_title_2:      'The Crypto Academy',
    proj_title_3:      'NABI - National Association for Blockchain and Innovation',
    proj_desc_1:       'Online presence for Vesta Consult with clear presentation of services, company profile, and contact details.',
    proj_desc_2:       'Educational crypto and blockchain project focused on accessible content and practical learning.',
    proj_desc_3:       'A non-profit bridging business and public administration in the technology sector. The official website is on its way.',
    proj_link:         'View more →',

    // Blog
    blog_title:      'Blog',
    blog_see_all:    'All articles →',
    blog_post_8_date:    'May 29, 2026',
    blog_post_8_tag:     'VAT',
    blog_post_8_title:   'When Are Securities Transactions an Economic Activity?',
    blog_post_8_excerpt: 'An analysis of CJEU case law on securities transactions as an economic activity and its application in Bulgaria.',
    blog_post_7_date:    'May 28, 2026',
    blog_post_7_tag:     'MiCA',
    blog_post_7_title:   'CASP Challenges in Bulgaria During MiCA Licensing Before the FSC',
    blog_post_7_excerpt: 'A practical overview of the common stumbling blocks Bulgarian CASP companies face when applying for a MiCA licence.',
    blog_post_6_date:    'May 28, 2026',
    blog_post_6_tag:     'Cryptoeconomics',
    blog_post_6_title:   'What White Papers Do Not Say',
    blog_post_6_excerpt: 'Why Bitcoin, Ethereum, DeFi, Layer 2, and bridges are new infrastructure for old economic laws.',
    blog_post_0_tag:     'VAT',
    blog_post_0_title:   'Summary of VAT Regime Changes After 1.1.2026',
    blog_post_0_excerpt: 'A practical overview of the new SME/OSS regimes, EX number, reporting changes, and VAT registration effects after January 1, 2026.',
    blog_post_1_tag:     'VAT',
    blog_post_1_title:   'VAT Changes for E-commerce and Online Events',
    blog_post_1_excerpt: 'What changes for online businesses, digital services, and cross-border EU sales as of January 1, 2026.',
    blog_post_2_tag:     'Taxes',
    blog_post_2_title:   'Government bonds and how they are not taxed',
    blog_post_2_excerpt: 'Coupons, discounts and capital gains — a complete tax guide for individual investors in government bonds and corporate bonds.',
    blog_post_3_tag:     'Business',
    blog_post_3_title:   'Size matters!',
    blog_post_3_excerpt: 'The truth that financial advisors won\'t share for free — the size of your starting capital can be the difference between failure and success.',
    blog_post_4_tag:     'VAT',
    blog_post_4_title:   'VAT Registration Turnover Accumulation After 01.01.2026',
    blog_post_4_excerpt: 'The threshold remains EUR 51,130, but registration arises automatically after crossing it, with obligations before the formal act is issued.',
    blog_post_5_tag:     'Tax Law',
    blog_post_5_title:   'What Is Company Substance and Why Does It Matter?',
    blog_post_5_excerpt: 'Real business substance determines where taxes may be due, regardless of where the company is formally incorporated.',
    read_more:       'Read more →',

    // Contact
    contact_title:          'Contact',
    contact_subtitle:       'Get in touch',
    contact_text:           'Have questions or want to connect? Send me an email or find me on social media.',
    contact_group_direct:   'Direct contact',
    contact_group_messaging:'Messaging',
    contact_group_social:   'Social media',
    contact_group_booking:  'Online consultation',
    contact_booking_link:   'Book a consultation',
    contact_booking_sub:    'Pick a convenient day and time for a personal online meeting.',
    contact_cta_action:     'Book now',
    contact_group_donate:   'Support',
    contact_donate_link:    'Support my work',

    // Booking page
    booking_page_title:    'Book a Meeting',
    booking_page_subtitle: 'Pick a convenient day and time for a personal consultation with Marina Muchakova.',

    // Donate page
    donate_page_title:    'Support Me',
    donate_page_subtitle: 'If the articles and materials on this blog are useful to you, you can support my work with a voluntary donation.',
    donate_stripe_title:  'By card',
    donate_stripe_desc:   'A one-off donation with a debit or credit card. Secure payment processed by Stripe.',
    donate_stripe_btn:    'Donate by card',
    donate_revolut_title: 'Via Revolut',
    donate_revolut_desc:  'A quick donation via Revolut — free of charge between Revolut users.',
    donate_revolut_btn:   'Donate via Revolut',
    donate_note:          'Donations are entirely voluntary and do not constitute payment for consulting services. Thank you for your support! 💛',

    // Footer
    footer_donate: '💛 Support me',
    footer_text: '© 2026 Marina Muchakova. All rights reserved.',

    // Blog page
    blog_page_title:    'Blog',
    blog_page_subtitle: 'In-depth analysis of tax, investing and crypto — in Bulgarian and English.',
    filter_all:          'All',
    filter_taxes:        'Taxes',
    filter_crypto:       'Crypto & MiCA',
    filter_invest:       'Investing',
    filter_economy:      'Economy',
    filter_business:     'Business & Entrepreneurship',
    filter_institutions: 'What the Authorities Know',
    sort_newest:         'Newest',
    sort_oldest:         'Oldest',
    sort_popular:        'Popular',
    blog_page_post_8_title: 'When Are Securities Transactions an Economic Activity?',
    blog_page_post_7_title: 'CASP Challenges in Bulgaria During MiCA Licensing Before the FSC',
    blog_page_post_6_title: 'What White Papers Do Not Say',
    blog_page_post_5_title: 'What Is Company Substance and Why Does It Matter?',
    blog_page_post_4_title: 'VAT Registration Turnover Accumulation After 01.01.2026',
    blog_page_post_0_title: 'Summary of VAT Regime Changes After 1.1.2026',
    blog_page_post_1_title: 'VAT Changes for E-commerce and Online Events',

    // Post: CASP MiCA
    casp_mica_tag:       'MiCA',
    casp_mica_title:     'CASP Challenges in Bulgaria During MiCA Licensing Before the FSC',
    casp_mica_date:      'May 28, 2026',
    casp_mica_read_time: '12 min read',

    // Post: Cryptoeconomics
    cryptoeco_tag:       'Cryptoeconomics',
    cryptoeco_title:     'What White Papers Do Not Say',
    cryptoeco_date:      'May 28, 2026',
    cryptoeco_read_time: '14 min read',

    // Post: Securities and VAT
    securities_vat_tag:       'VAT',
    securities_vat_title:     'When Are Securities Transactions an Economic Activity?',
    securities_vat_date:      'May 29, 2026',
    securities_vat_read_time: '10 min read',

    // Post: Substance
    substance_tag:       'Tax Law',
    substance_title:     'What Is Company Substance and Why Does It Matter?',
    substance_read_time: '6 min read',

    // Post: VAT Turnover 2026
    vatturnover2026_tag:       'VAT',
    vatturnover2026_title:     'VAT Registration Turnover Accumulation After 01.01.2026',
    vatturnover2026_read_time: '7 min read',

    // Post: ZDDS 2026 Summary
    zdds2026_tag:       'VAT',
    zdds2026_title:     'Summary of VAT Regime Changes After 1.1.2026',
    zdds2026_read_time: '6 min read',

    // Post: DCK
    dck_tag:       'Taxes',
    dck_title:     'Government Bonds and How They Are NOT Taxed',
    dck_read_time: '8 min read',

    // Post: DDS 2026
    dds2026_tag:       'VAT',
    dds2026_title:     'VAT Changes for E-commerce and Online Events',
    dds2026_read_time: '3 min read',

    // Post: Razmer
    razmer_tag:       'Business',
    razmer_title:     'Size Matters!',
    razmer_read_time: '4 min read',

    // Post page
    post_back:       '← Back to blog',
    share_label:     'Share',
    share_copy:      'Copy link',
    share_copied:    '✓ Copied!',
    share_native:    'Share',

    // Navigation (2026-10 redesign)
    nav_vlog:       'Vlog',
    nav_partners:   'Partners',
    skip_link:      'Skip to content',

    // Home — hero
    hero_cta_book:  'Book a consultation',
    hero_cta_blog:  'Read the blog',
    stat_1_label:   'years of experience in tax law',
    stat_2_label:   'articles on tax, investing and crypto',
    stat_3_label:   'crypto regulation and tax',
    hero_badge_title: 'Online consultations',
    hero_badge_sub: 'Book a slot right on the site',
    logos_label:    'Partners',

    // Home — services
    services_eyebrow:  'Expertise',
    services_title:    'How I can help',
    services_subtitle: 'Lawful solutions that keep more capital in your business and your portfolio.',
    svc_crypto_title:  'Crypto tax & MiCA',
    svc_crypto_desc:   'Taxation of crypto-assets, AML checks, CASP licensing and everything MiCA changed.',
    svc_invest_title:  'Investment income',
    svc_invest_desc:   'Stocks, ETFs, bonds and dividends — when tax is due, how much, and where to declare it.',
    svc_treaty_title:  'International tax',
    svc_treaty_desc:   'Double tax treaties, tax residence and foreign brokers.',
    svc_business_title:'Business structuring',
    svc_business_desc: 'Substance, VAT and planning that grows your margin — not your tax burden.',
    svc_articles:      'Articles →',
    svc_book:          'Consultation →',

    // Home — blog / vlog / projects / partners teasers
    blog_eyebrow:      'Blog',
    blog_latest_title: 'Latest articles',
    featured_label:    'Latest',
    vlog_eyebrow:      'Vlog',
    vlog_home_title:   'Video answers to investors’ questions',
    vlog_see_all:      'All videos',
    about_eyebrow:     'About',
    venture_vesta:     'Accounting firm and consultancy',
    venture_academy:   'Crypto and blockchain education',
    venture_nabi:      'Blockchain and innovation association',
    projects_eyebrow:  'Projects',
    projects_see_all:  'All projects',
    pet_label:         'Pet project',
    proj_open:         'Open',
    proj_play:         'Play',
    soon:              'Coming soon',
    partners_eyebrow:  'Partners',
    partners_home_title: 'Who I work with',
    partners_see_all:  'All partners',
    contact_eyebrow:   'Contact',

    // Vlog / video cards
    video_soon:        'Video coming soon',
    video_play:        'Play the video',
    video_watch_yt:    'Watch on YouTube',
    video_read_article:'Read the article →',

    // Blog page tools
    search_placeholder:'Search articles…',
    blog_empty:        'No articles match your search.',
    search_videos:     'Search the questions…',
    vlog_empty:        'No videos match your search.',

    // Post page extras
    toc_title:         'Contents',
    post_consult_title:'Have a specific case?',
    post_consult_sub:  'Every situation is different. Book an online consultation and we will go through it together.',
    post_consult_btn:  'Book a meeting',
    related_title:     'Related reading',

    // Footer (2026-10 redesign)
    footer_tagline:    'Tax consultant. I help individuals and businesses hack their taxes — legally.',
    footer_nav:        'Navigation',
    footer_resources:  'Resources',
    footer_contact:    'Contact',
    footer_synth:      'Synthesizer',
  }
};

// ============ STATE ============
let currentLang = 'bg';
try { currentLang = localStorage.getItem('mm-lang') || 'bg'; } catch (e) { /* storage blocked */ }

// ============ APPLY LANGUAGE ============
// Translate one subtree (used for the page and for content injected later)
function applyTranslations(scope, lang) {
  const t = translations[lang];
  if (!t) return;

  // Text of elements with data-key
  scope.querySelectorAll('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (t[key] !== undefined) {
      el.textContent = t[key];
    }
  });

  // Placeholders / aria-labels with data-key-placeholder / data-key-aria
  scope.querySelectorAll('[data-key-placeholder]').forEach(el => {
    const v = t[el.getAttribute('data-key-placeholder')];
    if (v !== undefined) el.setAttribute('placeholder', v);
  });
  scope.querySelectorAll('[data-key-aria]').forEach(el => {
    const v = t[el.getAttribute('data-key-aria')];
    if (v !== undefined) el.setAttribute('aria-label', v);
  });

  // Show/hide bilingual content blocks
  scope.querySelectorAll('.lang-content').forEach(el => {
    el.style.display = el.getAttribute('data-lang') === lang ? '' : 'none';
  });
}

function applyLanguage(lang) {
  currentLang = lang;
  try { localStorage.setItem('mm-lang', lang); } catch (e) { /* storage blocked */ }
  document.documentElement.setAttribute('lang', lang);

  const t = translations[lang];
  if (!t) return;

  applyTranslations(document, lang);

  // Update language toggle button text
  const langBtn = document.getElementById('langToggle');
  if (langBtn && t.lang_btn) {
    langBtn.textContent = t.lang_btn;
  }

  // Update share button labels if they exist
  const shareCopyBtn = document.getElementById('shareCopy');
  if (shareCopyBtn && !shareCopyBtn.classList.contains('success')) {
    shareCopyBtn.textContent = t.share_copy;
  }
  const shareNativeBtn = document.getElementById('shareNative');
  if (shareNativeBtn) {
    shareNativeBtn.textContent = t.share_native;
  }

  // Optional per-page document title by language.
  const titleByLang = lang === 'bg' ? document.body?.dataset?.titleBg : document.body?.dataset?.titleEn;
  if (titleByLang) {
    document.title = titleByLang;
  }

  // Let page-specific scripts (e.g. the game) follow the language toggle.
  document.dispatchEvent(new CustomEvent('mm:lang', { detail: lang }));
}

// ============ THEME (light / dark) ============
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const systemDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = () => document.documentElement.getAttribute('data-theme') || (systemDark() ? 'dark' : 'light');

  btn.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('mm-theme', next); } catch (e) { /* storage blocked */ }
  });
}

// ============ SCROLL REVEAL ============
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length || !('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('js-reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(el => io.observe(el));
}

// ============ NAVBAR SCROLL EFFECT ============
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

// ============ HAMBURGER MENU ============
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close when clicking a nav link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    }
  });
}

// ============ SHARE BUTTONS ============
function initShare() {
  const shareNative = document.getElementById('shareNative');
  const shareCopy   = document.getElementById('shareCopy');

  // Native Web Share API (mobile & supported browsers)
  if (shareNative) {
    if (navigator.share) {
      shareNative.style.display = 'inline-flex';
      shareNative.addEventListener('click', async () => {
        try {
          await navigator.share({
            title: document.title,
            url:   window.location.href,
          });
        } catch (e) {
          // User cancelled share — no action needed
        }
      });
    } else {
      shareNative.style.display = 'none';
    }
  }

  // Copy link to clipboard
  if (shareCopy) {
    shareCopy.addEventListener('click', async () => {
      const t = translations[currentLang];
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      // Visual feedback
      const original = shareCopy.textContent;
      shareCopy.textContent = t.share_copied;
      shareCopy.classList.add('success');
      setTimeout(() => {
        shareCopy.textContent = t.share_copy;
        shareCopy.classList.remove('success');
      }, 2200);
    });
  }

  // Social share links — set URLs dynamically
  const url   = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);

  const twitterBtn  = document.getElementById('shareTwitter');
  const facebookBtn = document.getElementById('shareFacebook');
  const linkedinBtn = document.getElementById('shareLinkedIn');

  if (twitterBtn)  twitterBtn.href  = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
  if (facebookBtn) facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  if (linkedinBtn) linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
}


// ============ FILTER / SORT / SEARCH GRIDS (blog.html, vlog/) ============
// Markup: a toolbar with data-filter-toolbar="<grid selector>" containing
// .filter-chip[data-cat], optional .sort-btn[data-sort] and input[type=search].
// Grid items carry data-cats (space separated), data-date and data-pop.
// ?cat=<name> in the URL preselects a category chip.
function initFilterGrid(toolbar, grid) {
  if (!toolbar || !grid) return;

  // Original DOM order is the tie-breaker for equal dates/ranks
  const cards  = Array.from(grid.children).filter(el => el.dataset.cats !== undefined);
  const search = toolbar.querySelector('input[type="search"]');
  const empty  = document.querySelector(toolbar.dataset.empty || '.blog-empty');
  const chips  = toolbar.querySelectorAll('.filter-chip');

  let activeCat  = 'all';
  let activeSort = 'newest';
  let query      = '';

  const wanted = new URLSearchParams(window.location.search).get('cat');
  if (wanted && toolbar.querySelector(`.filter-chip[data-cat="${CSS.escape(wanted)}"]`)) {
    activeCat = wanted;
  }

  const normalize = s => s.toLowerCase().replace(/\s+/g, ' ');

  function apply() {
    const sorted = [...cards].sort((a, b) => {
      if (activeSort === 'oldest') {
        return (a.dataset.date || '').localeCompare(b.dataset.date || '');
      }
      if (activeSort === 'popular') {
        return (parseInt(a.dataset.pop, 10) || 999) - (parseInt(b.dataset.pop, 10) || 999);
      }
      // newest (default)
      return (b.dataset.date || '').localeCompare(a.dataset.date || '');
    });

    let shown = 0;
    sorted.forEach(card => {
      const cats = (card.dataset.cats || '').split(/\s+/);
      const catOk = activeCat === 'all' || cats.includes(activeCat);
      const textOk = !query || normalize(card.textContent).includes(query);
      const visible = catOk && textOk;
      card.style.display = visible ? '' : 'none';
      if (visible) shown++;
      grid.appendChild(card); // re-append in sorted order
    });

    if (empty) empty.style.display = shown ? 'none' : 'block';
  }

  chips.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === activeCat);
    btn.addEventListener('click', () => {
      activeCat = btn.dataset.cat;
      chips.forEach(b => b.classList.toggle('active', b === btn));
      apply();
    });
  });

  toolbar.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSort = btn.dataset.sort;
      toolbar.querySelectorAll('.sort-btn').forEach(b => b.classList.toggle('active', b === btn));
      apply();
    });
  });

  if (search) {
    search.addEventListener('input', () => {
      query = normalize(search.value.trim());
      apply();
    });
  }

  apply();
}

function initFilterGrids() {
  document.querySelectorAll('[data-filter-toolbar]').forEach(toolbar => {
    initFilterGrid(toolbar, document.querySelector(toolbar.dataset.filterToolbar));
  });
}

// ============ VIDEO CARDS (lite YouTube embed) ============
// <article class="video-card" data-yt="VIDEO_ID"> … <div class="video-thumb"></div>
// Nothing loads from YouTube until the visitor clicks play (youtube-nocookie).
// Cards without data-yt show a "video coming soon" placeholder.
function initVideos() {
  document.querySelectorAll('.video-card').forEach(card => {
    const thumb = card.querySelector('.video-thumb');
    if (!thumb || thumb.dataset.ready) return;
    thumb.dataset.ready = '1';
    const id = (card.dataset.yt || '').trim();

    if (!id) {
      thumb.insertAdjacentHTML('beforeend',
        '<div class="video-soon"><svg class="icon" aria-hidden="true"><use href="' + iconHref('play') + '"/></svg>' +
        '<span data-key="video_soon">Видеото идва скоро</span></div>');
      return;
    }

    thumb.style.backgroundImage = `url("https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg")`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-key-aria', 'video_play');
    btn.setAttribute('aria-label', 'Пусни видеото');
    btn.innerHTML = '<span class="video-play"><svg class="icon" aria-hidden="true"><use href="' + iconHref('play') + '"/></svg></span>';
    btn.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
      iframe.title = card.querySelector('.video-title')?.textContent.trim() || 'YouTube';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      thumb.innerHTML = '';
      thumb.appendChild(iframe);
    });
    thumb.appendChild(btn);
  });
}

// Path to the icon sprite relative to the current page (same as the stylesheet)
function iconHref(name) {
  const css = document.querySelector('link[href$="css/style.css"]');
  const root = css ? css.getAttribute('href').replace(/css\/style\.css$/, '') : '';
  return `${root}images/icons.svg#${name}`;
}

// ============ BLOG POST EXTRAS (blog/*.html) ============
// Reading progress bar, table of contents for long posts, consultation box
// and related posts (read from blog.html, so no per-post markup is needed).
function initPostExtras() {
  const content = document.querySelector('.post-content');
  if (!content || !document.querySelector('.post-header')) return;

  // Reading progress
  const bar = document.createElement('div');
  bar.className = 'read-progress';
  document.body.appendChild(bar);
  const onScroll = () => {
    const rect = content.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.6;
    const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
    bar.style.transform = `scaleX(${progress})`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Table of contents — one per language block, only when there are 4+ sections
  content.querySelectorAll('.lang-content').forEach(block => {
    const heads = Array.from(block.querySelectorAll(':scope > h2'));
    if (heads.length < 4) return;
    const lang = block.dataset.lang === 'en' ? 'en' : 'bg';
    const items = heads.map((h, i) => {
      if (!h.id) h.id = `${lang}-${i + 1}`;
      return `<li><a href="#${h.id}">${h.textContent.trim()}</a></li>`;
    }).join('');
    const toc = document.createElement('nav');
    toc.className = 'post-toc';
    toc.setAttribute('aria-label', translations[lang].toc_title);
    toc.innerHTML = `<p class="post-toc-title">${translations[lang].toc_title}</p><ol>${items}</ol>`;
    heads[0].before(toc);
  });

  // Consultation call-to-action before the share block
  const share = content.querySelector('.post-share');
  if (share && !content.querySelector('.post-consult')) {
    const box = document.createElement('div');
    box.className = 'post-consult';
    box.innerHTML =
      '<div><p data-key="post_consult_title">Имате конкретен казус?</p>' +
      '<p data-key="post_consult_sub">Всяка ситуация е различна. Запазете онлайн консултация и ще я разгледаме заедно.</p></div>' +
      '<a href="../booking/" class="btn"><span data-key="post_consult_btn">Запази час</span>' +
      '<svg class="icon" aria-hidden="true"><use href="../images/icons.svg#arrow-right"/></svg></a>';
    const anchor = share.previousElementSibling?.tagName === 'HR' ? share.previousElementSibling : share;
    anchor.before(box);
    applyTranslations(box, currentLang);
  }

  initRelatedPosts();
}

function initRelatedPosts() {
  const body = document.querySelector('.post-body .container');
  if (!body || !window.fetch || !window.DOMParser) return;
  const self = window.location.pathname.split('/').pop();

  fetch('../blog.html')
    .then(r => (r.ok ? r.text() : Promise.reject()))
    .then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const cards = Array.from(doc.querySelectorAll('.blog-list-grid .blog-card[data-cats]'));
      const own = cards.find(c => c.getAttribute('href').endsWith('/' + self));
      if (!own) return;
      const ownCats = own.dataset.cats.split(/\s+/);
      const picks = cards
        .filter(c => c !== own)
        .map(c => ({ c, score: c.dataset.cats.split(/\s+/).filter(x => ownCats.includes(x)).length }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score || (b.c.dataset.date || '').localeCompare(a.c.dataset.date || ''))
        .slice(0, 3);
      if (!picks.length) return;

      const section = document.createElement('section');
      section.className = 'related-posts';
      section.innerHTML = '<h2 class="section-title" data-key="related_title">Още по темата</h2><div class="blog-grid"></div>';
      const grid = section.querySelector('.blog-grid');
      picks.forEach(({ c }) => {
        const card = document.importNode(c, true);
        card.setAttribute('href', c.getAttribute('href').replace(/^blog\//, ''));
        grid.appendChild(card);
      });
      body.appendChild(section);
      applyTranslations(section, currentLang);
    })
    .catch(() => { /* offline or opened from disk — no related posts */ });
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  // Content that injects translatable markup runs before the language pass
  initVideos();
  initPostExtras();

  // Language
  applyLanguage(currentLang);

  document.getElementById('langToggle')?.addEventListener('click', () => {
    applyLanguage(currentLang === 'bg' ? 'en' : 'bg');
  });

  // UI
  initThemeToggle();
  initNavbar();
  initMobileMenu();
  initShare();
  initFilterGrids();
  initReveal();
});
