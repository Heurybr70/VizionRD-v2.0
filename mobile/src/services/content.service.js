import { formatPrice } from '@shared/utils/formatters';

const readContent = (doc) => doc?.content || doc || {};

export const DEFAULT_HERO_CONTENT = {
  title: 'PasiÃ³n por la PerfecciÃ³n',
  subtitle: 'Elevamos el estÃ¡ndar del cuidado automotriz con tecnologÃ­a de vanguardia.',
  ctaText: 'Ver Productos',
};

export const DEFAULT_ABOUT_CONTENT = {
  title: 'Excelencia en Cada Detalle',
  description:
    'Vizion RD nace de la pasiÃ³n genuina por el automovilismo y el cuidado estÃ©tico profesional.',
  mission:
    'Transformar la experiencia del cuidado vehicular a travÃ©s de productos y servicios de grado profesional.',
  vision:
    'Ser el referente #1 en detailing en la regiÃ³n, impulsando la innovaciÃ³n y la protecciÃ³n duradera.',
  history:
    'Tratamos cada automÃ³vil con el mÃ¡ximo respeto y dedicaciÃ³n artesanal.',
};

export const DEFAULT_CONTACT_INFO = {
  address: 'Santo Domingo, RepÃºblica Dominicana',
  phone: '+1 (849) 352-5315',
  whatsapp: '+18493525315',
  email: 'info@vizionrd.com',
  hours: 'Lunes - Viernes: 9:00 AM - 6:00 PM',
};

export const DEFAULT_SOCIAL_LINKS = {
  instagram: 'https://instagram.com/vizionrd',
  facebook: 'https://facebook.com/vizionrd',
  whatsapp: 'https://wa.me/18493525315',
};

export const DEFAULT_SERVICE_ITEMS = [
  {
    id: 'service-1',
    title: 'Lavado Premium',
    price: 'RD$ 1,500+',
    description:
      'Limpieza profunda artesanal con pH neutro, descontaminado bÃ¡sico y sellado cerÃ¡mico rÃ¡pido.',
    category: 'exterior',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDs5BywT6R47Slq5wLDpC2HxQWI-KBckAKqujCWJrJs61u8DiWy_GMTXHu5dp5OnzIaCYm5H9thAdb-Cp4IpgGbrhUPyR7Cp4ubRyZD2FQEotJnV1K96uTYgvX9K58WrW_dMlihDDOqKHO8pvaQc5G5sY6Kg2s4J3hYG7a4P6T-WzMaIA4cN-X5ygjxlg6ls1QUtUGlgk_Ggx-FqOCAgDl6vtycg_cJpCE8tNaJVlsr4OW7aFd-KKdQkE18TZ3eJjTu09ZXP3W2cx4_',
  },
  {
    id: 'service-2',
    title: 'Pulido de Pintura',
    price: 'RD$ 5,500+',
    description:
      'CorrecciÃ³n de micro-rayas y recuperaciÃ³n de la profundidad del color con pulido multi-etapa.',
    category: 'exterior',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDqEF6V5jWaX_kBR2klvJ8U7XE3gzEYj8mKg7SVhOaTglXOlhab7k_6At84Kc2u2TvjPTxMNL3gkFRhdsjfH4cMXcJ0msbYEJnWbt9uj9X8Jw1HEji8rTPHbXJdG2uau9Tj81puxBfz_TbCcQcjqjLba7qxnxGGqPoHTM_4Tdxtm-XQO4medOJuJhA_3CJFJ8BE7SXXWhqlBU-HzHfLuavUTujcjAGc_D8gNSoWysVi8waf_RARurj8m24B2RvbYGbVR9-4ryDZlKCv',
  },
  {
    id: 'service-3',
    title: 'Ceramic Coating 9H',
    price: 'RD$ 12,000+',
    description:
      'ProtecciÃ³n nano-tecnolÃ³gica de larga duraciÃ³n con efecto hidrofÃ³bico y protecciÃ³n UV.',
    category: 'protection',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB30gYz97fzz32Xwv9p_YnBn9HHBgo_hzBo8uezaheQIZBjzlZBz28Yka7PeQ-ZWwHLInegI0I82jWZxfNlbXuqjHPc6C9JoBfAaYEymTi7Z1FhbZ-X0lG0BNqfXFvfKpGWvI17OAMmXWfKqOhHJdKuMK9cMFMNwFIfWmBkZ7kqfYT5rVmQFWvZpzSg3m3Vy3aS5lqfJeSTDovdVKXpCo5eoB9ixoE_Yzf3ZkAbWLHuv0r6hjRK0zqJh_FUfIYVVPSlbPirEQ3u6B',
  },
  {
    id: 'service-4',
    title: 'Detallado Interior',
    price: 'RD$ 3,500+',
    description:
      'Limpieza profunda de tapicerÃ­a, plÃ¡sticos, cuero y cristales interiores con eliminaciÃ³n de olores.',
    category: 'interior',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAqQRw4XUUMhemag93ZJYR9FTYQ3bzKKeP8ctwf3FSeBSiGBSmGst9T4K7qNgRrPwbLTCeIzcg6VaW7wFtUHYrSha0mhbvTnQvyfhAxrlwJdnIjZO7zd1PPjVSvO68GTyx1lfykMy-pP-CMWN2475Ck0vfgSdhmhfN_nF9iZ2s2L7h2v3t3GYjqMzOodwBsCLccR1UCDlabrwfDG2sEjY7AdZWBia-rQAKaHaDO-RkJ58y4f3hhJynIHl3WYSDQwA4PL4OQuQui8YZQ',
  },
];

export const normalizeHeroContent = (doc) => {
  const content = readContent(doc);
  return {
    title: content.title || DEFAULT_HERO_CONTENT.title,
    subtitle: content.subtitle || DEFAULT_HERO_CONTENT.subtitle,
    ctaText: content.ctaPrimary || content.ctaText || DEFAULT_HERO_CONTENT.ctaText,
    secondaryCtaText: content.ctaSecondary || 'Nuestra Historia',
  };
};

export const normalizeAboutContent = (doc) => {
  const content = readContent(doc);
  return {
    title: content.title || DEFAULT_ABOUT_CONTENT.title,
    description: content.description || DEFAULT_ABOUT_CONTENT.description,
    mission: content.mission?.text || content.mission || DEFAULT_ABOUT_CONTENT.mission,
    vision: content.vision?.text || content.vision || DEFAULT_ABOUT_CONTENT.vision,
    history: content.history || DEFAULT_ABOUT_CONTENT.history,
  };
};

export const normalizeContactInfo = (doc) => {
  const content = readContent(doc);
  return {
    address: content.address || DEFAULT_CONTACT_INFO.address,
    phone: content.phone || DEFAULT_CONTACT_INFO.phone,
    whatsapp: content.whatsapp || content.phone || DEFAULT_CONTACT_INFO.whatsapp,
    email: content.email || DEFAULT_CONTACT_INFO.email,
    hours: content.hours || DEFAULT_CONTACT_INFO.hours,
  };
};

export const normalizeSocialLinks = (doc) => {
  const content = readContent(doc);
  return {
    instagram: content.instagram || DEFAULT_SOCIAL_LINKS.instagram,
    facebook: content.facebook || DEFAULT_SOCIAL_LINKS.facebook,
    whatsapp: content.whatsapp || DEFAULT_SOCIAL_LINKS.whatsapp,
  };
};

export const normalizeSiteSettings = (doc) => {
  const content = readContent(doc);
  return {
    businessName: content.businessName || 'VizionRD',
    currency: content.currency || 'DOP',
    whatsappEnabled: content.whatsappEnabled ?? true,
    whatsappNumber: content.whatsappNumber || DEFAULT_CONTACT_INFO.whatsapp,
    contactFormEnabled: content.contactFormEnabled ?? true,
    catalogEnabled: content.catalogEnabled ?? true,
  };
};

export const normalizeCarouselSlides = (slides = []) =>
  slides
    .filter((slide) => (slide.active ?? slide.isActive ?? true) === true)
    .map((slide) => ({
      id: slide.id,
      title: slide.title || DEFAULT_HERO_CONTENT.title,
      subtitle: slide.subtitle || DEFAULT_HERO_CONTENT.subtitle,
      description: slide.description || '',
      image: slide.image || slide.imageUrl,
      buttonText: slide.buttonText || DEFAULT_HERO_CONTENT.ctaText,
      buttonLink: slide.buttonLink || '/productos',
    }));

export const normalizeServices = (doc) => {
  const content = readContent(doc);
  if (Array.isArray(content.services) && content.services.length > 0) {
    return content.services;
  }
  return DEFAULT_SERVICE_ITEMS;
};

export const buildProductWhatsAppMessage = (product) =>
  `Hola VizionRD, me interesa el producto ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''}${product.price ? ` por ${formatPrice(product.price)}` : ''}. ¿Tienen disponibilidad?`;
