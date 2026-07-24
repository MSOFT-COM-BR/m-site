/**
 * SEO Configuration
 * Títulos e descrições por página para o m-site.
 * Chaves correspondem aos slugs em config.routes.validPages.
 */
const SEO_CONFIG = {
  'home': {
    title: 'MSoft | Soluções Digitais que Transformam Negócios',
    description: 'Líderes em desenvolvimento de software e soluções tecnológicas de alta performance para impulsionar sua empresa.',
    noindex: false
  },
  'about': {
    title: 'Sobre a MSoft | Fábrica de Software e Inovação',
    description: 'Conheça a Miranda Soft: mais de uma década transformando negócios com software sob medida, apps mobile e consultoria tech.',
    noindex: false
  },
  'expertise': {
    title: 'Expertise MSoft | Desenvolvimento Web, Apps e Consultoria TI',
    description: 'Descubra como a MSoft acelera produto, escala e resultado com desenvolvimento web, apps mobile, cloud e consultoria estratégica.',
    noindex: false
  },
  'ecossistema': {
    title: 'Ecossistema MSoft | Serviços, Produtos e Conteúdo',
    description: 'Explore o ecossistema Miranda Soft: soluções digitais, produtos, conteúdo e suporte em uma única porta de entrada.',
    noindex: false
  },
  'apps': {
    title: 'Apps MSoft | Utilitários e Ferramentas Digitais',
    description: 'Acesse utilitários, apps e ferramentas digitais desenvolvidos pela MSoft para resolver desafios do dia a dia.',
    noindex: false
  },
  'marketplace': {
    title: 'Marketplace MSoft | Soluções Prontas para seu Negócio',
    description: 'Encontre produtos e recursos no marketplace da MSoft para ampliar sua operação e produtividade.',
    noindex: false
  },
  'mcredential': {
    title: 'MCredential | Gerenciador de Senhas MSoft',
    description: 'Protetor de senhas corporativo com criptografia de ponta a ponta. Segurança para credenciais da sua empresa.',
    noindex: false
  },
  'games': {
    title: 'Games MSoft | Jogos e Experiências Interativas',
    description: 'Explore jogos e experiências interativas desenvolvidos pela MSoft.',
    noindex: false
  },
  'blog': {
    title: 'Blog & Insights | Miranda Soft',
    description: 'Fique por dentro das últimas novidades sobre tecnologia, produtividade e inovação no blog da MSoft.',
    noindex: false
  },
  'blogs': {
    title: 'Blog MSoft | Todos os Artigos',
    description: 'Lista completa de artigos sobre tecnologia, inovação e transformação digital da MSoft.',
    noindex: false
  },
  'blog-ads': {
    title: 'Blog MSoft | Reviews com Publicidade',
    description: 'Reviews e análises de produtos e serviços com transparência publicitária.',
    noindex: false
  },
  'blog-review': {
    title: 'Blog MSoft | Reviews e Análises',
    description: 'Reviews honestos e análises detalhadas de ferramentas, serviços e produtos digitais.',
    noindex: false
  },
  'blog-custom': {
    title: 'Blog MSoft | Conteúdo Personalizado',
    description: 'Conteúdo customizado sobre tecnologia, produtos e inovação da MSoft.',
    noindex: false
  },
  'materials': {
    title: 'Materiais MSoft | E-books, Guias e Conteúdo',
    description: 'Baixe e-books, guias e materiais educativos sobre tecnologia e transformação digital.',
    noindex: false
  },
  'support': {
    title: 'Suporte MSoft | Atendimento e Ajuda',
    description: 'Encontre suporte, tire dúvidas e fale com nosso time de especialistas.',
    noindex: false
  },
  'contact': {
    title: 'Contato MSoft | Fale com um Especialista',
    description: 'Entre em contato com a MSoft. Fale conosco por WhatsApp ou e-mail e transforme seu negócio com tecnologia.',
    noindex: false
  },
  'privacy': {
    title: 'Política de Privacidade | MSoft',
    description: 'Leia nossa Política de Privacidade e entenda como a MSoft protege seus dados.',
    noindex: false
  },
  'terms': {
    title: 'Termos de Uso | MSoft',
    description: 'Termos de uso dos serviços e produtos digitais da MSoft.',
    noindex: false
  },
  'lgpd': {
    title: 'LGPD | MSoft',
    description: 'Informações sobre a Lei Geral de Proteção de Dados e seus direitos na MSoft.',
    noindex: false
  },
  'cookies': {
    title: 'Política de Cookies | MSoft',
    description: 'Entenda como a MSoft utiliza cookies e tecnologias semelhantes.',
    noindex: false
  },
  '404': {
    title: 'Página Não Encontrada | MSoft',
    description: 'A página solicitada não foi encontrada. Explore nosso ecossistema de soluções digitais.',
    noindex: true
  },
  // Áreas logadas/restritas — não devem ser indexadas
  'login': {
    title: 'Login | MSoft',
    description: 'Acesse sua conta MSoft.',
    noindex: true
  },
  'admin': {
    title: 'Painel Admin | MSoft',
    description: 'Painel administrativo da MSoft.',
    noindex: true
  },
  'profile': {
    title: 'Meu Perfil | MSoft',
    description: 'Gerencie seus dados e preferências de conta MSoft.',
    noindex: true
  },
  'premium': {
    title: 'Dashboard Premium | MSoft',
    description: 'Acesse seus aplicativos e recursos premium da MSoft.',
    noindex: true
  }
};

if (typeof window !== 'undefined') {
  window.SEO_CONFIG = SEO_CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SEO_CONFIG };
}
