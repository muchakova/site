/* =============================================
   Marina Muchakova — main.js
   Handles: language toggle, navbar, mobile menu, share
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
    projects_subtitle: 'Избрани проекти и работа',
    proj_cat_1:        'Корпоративен сайт',
    proj_cat_2:        'Образователна платформа',
    proj_cat_3:        'Асоциация',
    proj_title_1:      'Веста Консулт',
    proj_title_2:      'Крипто Академията',
    proj_title_3:      'НАБИ - Национална Асоциация по Блокчейн и Иновации',
    proj_desc_1:       'Онлайн присъствие на Веста Консулт с ясно представяне на услуги, бизнес профил и контактна информация.',
    proj_desc_2:       'Образователен проект за крипто и блокчейн с фокус върху достъпно съдържание и практическо обучение.',
    proj_desc_3:       'Официалният сайт е в процес на разработка (under construction). Скоро ще бъде публикуван.',
    proj_link:         'Виж повече →',

    // Blog
    blog_title:      'Блог',
    blog_see_all:    'Всички статии →',
    blog_post_1_tag:     'Данъци',
    blog_post_1_title:   'ДЦК и как не се облагат с данъци',
    blog_post_1_excerpt: 'Купони, отстъпки и капиталови печалби — пълното данъчно ръководство за физически лица, инвестиращи в ДЦК и облигации.',
    blog_post_2_tag:     'Бизнес',
    blog_post_2_title:   'Размерът има значение!',
    blog_post_2_excerpt: 'Истината, която финансистите няма да ти разкрият безвъзмездно — размерът на стартовия капитал понякога е границата между фалита и успеха.',
    read_more:       'Прочети →',

    // Contact
    contact_title:          'Контакти',
    contact_subtitle:       'Свържете се с мен',
    contact_text:           'Имате въпроси или искате да се свържете? Изпратете ми имейл или ме намерете в социалните мрежи.',
    contact_group_direct:   'Директен контакт',
    contact_group_messaging:'Съобщения',
    contact_group_social:   'Социални мрежи',

    // Footer
    footer_text: '© 2026 Марина Мучакова. Всички права запазени.',

    // Blog page
    blog_page_title:    'Блог',
    blog_page_subtitle: 'Статии и обновления',

    // Post: DCK
    dck_tag:       'Данъци',
    dck_title:     'ДЦК и как не се облагат с данъци',
    dck_read_time: '8 мин четене',

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
  },

  en: {
    // Name
    full_name:      'Marina Muchakova',

    // Navigation
    nav_about:      'About',
    nav_projects:   'Projects',
    nav_blog:       'Blog',
    nav_contact:    'Contact',
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
    projects_subtitle: 'Selected projects and work',
    proj_cat_1:        'Corporate website',
    proj_cat_2:        'Educational platform',
    proj_cat_3:        'Association',
    proj_title_1:      'Vesta Consult',
    proj_title_2:      'The Crypto Academy',
    proj_title_3:      'NABI - National Association for Blockchain and Innovation',
    proj_desc_1:       'Online presence for Vesta Consult with clear presentation of services, company profile, and contact details.',
    proj_desc_2:       'Educational crypto and blockchain project focused on accessible content and practical learning.',
    proj_desc_3:       'The official website is currently under construction and will be published soon.',
    proj_link:         'View more →',

    // Blog
    blog_title:      'Blog',
    blog_see_all:    'All articles →',
    blog_post_1_tag:     'Taxes',
    blog_post_1_title:   'Government bonds and how they are not taxed',
    blog_post_1_excerpt: 'Coupons, discounts and capital gains — a complete tax guide for individual investors in government bonds and corporate bonds.',
    blog_post_2_tag:     'Business',
    blog_post_2_title:   'Size matters!',
    blog_post_2_excerpt: 'The truth that financial advisors won\'t share for free — the size of your starting capital can be the difference between failure and success.',
    read_more:       'Read more →',

    // Contact
    contact_title:          'Contact',
    contact_subtitle:       'Get in touch',
    contact_text:           'Have questions or want to connect? Send me an email or find me on social media.',
    contact_group_direct:   'Direct contact',
    contact_group_messaging:'Messaging',
    contact_group_social:   'Social media',

    // Footer
    footer_text: '© 2026 Marina Muchakova. All rights reserved.',

    // Blog page
    blog_page_title:    'Blog',
    blog_page_subtitle: 'Articles and updates',

    // Post: DCK
    dck_tag:       'Taxes',
    dck_title:     'Government Bonds and How They Are NOT Taxed',
    dck_read_time: '8 min read',

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
  }
};

// ============ STATE ============
let currentLang = localStorage.getItem('mm-lang') || 'bg';

// ============ APPLY LANGUAGE ============
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('mm-lang', lang);
  document.documentElement.setAttribute('lang', lang);

  const t = translations[lang];
  if (!t) return;

  // Update all elements with data-key
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.getAttribute('data-key');
    if (t[key] !== undefined) {
      el.textContent = t[key];
    }
  });

  // Show/hide bilingual content blocks in blog posts
  document.querySelectorAll('.lang-content').forEach(el => {
    el.style.display = el.getAttribute('data-lang') === lang ? '' : 'none';
  });

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

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  // Language
  applyLanguage(currentLang);

  document.getElementById('langToggle')?.addEventListener('click', () => {
    applyLanguage(currentLang === 'bg' ? 'en' : 'bg');
  });

  // UI
  initNavbar();
  initMobileMenu();
  initShare();
});
