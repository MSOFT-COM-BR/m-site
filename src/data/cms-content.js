/**
 * Default content used by the CMS and public pages.
 * Acts as a seed for localStorage so the site keeps working offline.
 */
(function (window) {
  const defaultCMSContent = {
    hero: {
      eyebrow: "Tecnologia & Inovação",
      title: "Soluções digitais que transformam o seu negócio",
      subtitle: "MSoft Digital",
      description:
        "Somos líderes em desenvolvimento de software e soluções tecnológicas inovadoras. Transformamos ideias complexas em produtos de alta performance, focados em resultados reais para sua empresa.",
      primaryAction: {
        label: "Conheça Nossas Soluções",
        href: "#solucoes",
        icon: "bi-grid-fill",
      },
      secondaryAction: {
        label: "Fale com um Especialista",
        href: "#contact",
        icon: "bi-chat-text-fill",
      },
      badgeIcon: "bi-rocket-takeoff-fill",
    },
    features: [
      {
        title: "Criação de Sites",
        description: "Sites institucionais e páginas de campanha para comunicar sua oferta com clareza.",
        href: "/criacao-de-sites",
        icon: "bi-window-stack",
        theme: "primary",
        ctaLabel: "Saber mais",
        bullets: ["Site institucional", "Página de serviço", "Página de campanha", "Conteúdo organizado"]
      },
      {
        title: "Desenvolvimento de Sistemas",
        description: "Sistemas sob medida para apoiar processos e necessidades específicas da operação.",
        href: "/desenvolvimento-de-sistemas",
        icon: "bi-code-square",
        theme: "secondary",
        ctaLabel: "Ver detalhes",
        bullets: ["Sistemas internos", "Portais digitais", "Regras de negócio", "Evolução contínua"]
      },

    ],
    about: {
      title: "Nossa Essência",
      description:
        "Fundada com a missão de democratizar o acesso à tecnologia de alta qualidade, a MSoft se estabeleceu como referência em desenvolvimento de soluções digitais para todo o Brasil.",
      bullets: [
        "10+ Anos de Experiência",
        "100% Foco no Cliente",
        "Equipe Especializada",
        "Projetos de Alta Complexidade",
      ],
      supportTitle: "Por que nos escolher?",
      supportDescription: "Nossa essência é entregar qualidade técnica superior com agilidade e parceria real.",
      supportColumns: [
        ["Qualidade Técnica Superior", "Tecnologias Modernas (React, Node.js)", "Longevidade do Projeto"],
        ["Entregas Ágeis (Scrum)", "Parceria Estratégica", "Feedback Constante"],
      ],
    },
    testimonials: [
      {
        name: "Carlos Eduardo",
        relation: "CEO - TechSolutions RN",
        quote:
          "Essa parceria transformou nossa operação. O sistema desenvolvido automatizou processos que levavam dias em poucos minutos.",
        icon: "bi-person-circle",
        tone: "primary",
      },
      {
        name: "Ana Clara",
        relation: "Diretora de Marketing - Inova",
        quote:
          "Excelente parceiro tecnológico. A equipe é muito atenta aos detalhes e o aplicativo ficou com uma usabilidade incrível.",
        icon: "bi-person-circle",
        tone: "success",
      },
      {
        name: "Roberto Campos",
        relation: "Gerente de Projetos",
        quote:
          "Comprometimento e qualidade técnica. Entregaram o projeto antes do prazo e com qualidade superior ao esperado.",
        icon: "bi-person-circle",
        tone: "info",
      },
    ],
    cta: {
      title: "Conheça o nosso Super App",
      description:
        "Explore nossa suíte de ferramentas e utilitários desenvolvidos para facilitar o dia a dia de desenvolvedores e empresas.",
      action: {
        label: "Acessar Ferramentas",
        href: "/apps",
        icon: "bi-arrow-right",
      },
    },
    seo: {
      updatedAt: new Date().toISOString(),
      author: "MSoft",
    },
  };

  window.defaultCMSContent = Object.freeze(defaultCMSContent);
})(window);
