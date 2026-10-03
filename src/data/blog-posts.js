const blogPosts = [
  {
    id: 1,
    title: "Dentro do router: como o SPA funciona sem build",
    excerpt:
      "Uma imersão no roteador nativo do Framework Frontend e em como ele mantém o estado entre páginas.",
    content: `
      <p>O roteador do Framework Frontend foi pensado para quem quer construir SPAs com HTML puro e precisa apenas do essencial.</p>

      <h2>Detectando a rota</h2>
      <p>Assim que o usuário navega, o Core observa <code>window.location.pathname</code>, extrai o segmento principal e busca o HTML correspondente em <code>/src/pages</code>.</p>

      <pre><code>const segments = window.location.pathname.split('/');
const pageName = segments[1] || 'home';</code></pre>

      <h2>Reutilizando componentes</h2>
      <p>Depois que o HTML é carregado, o Core reaplica os componentes declarados com <code>data-component</code>, garantindo cabeçalho, rodapé e skeletons sempre sincronizados.</p>

      <h2>Estado & eventos</h2>
      <p>Os parâmetros adicionais são guardados em <code>core.state.params</code> e disparados via <code>CustomEvent</code>, permitindo que widgets específicos reajam sem recarregar tudo.</p>
    `,
    image: "/src/assets/images/blog/router.jpg",
    date: "2024-06-18",
    author: "Equipe Framework",
    category: "Arquitetura",
    tags: ["router", "spa", "arquitetura"],
    featured: true,
  },
  {
    id: 2,
    title: "CMS embutido: usando localStorage para editar o site",
    excerpt:
      "Veja como o painel em /console salva conteúdo, notifica componentes e exporta JSON sem backend.",
    content: `
      <p>O CMS integrado resolve o dilema de editar textos em um projeto estático. Ele usa <code>localStorage</code> como camada de persistência e publica eventos para toda a aplicação.</p>

      <h2>ContentService</h2>
      <p>O serviço central expõe <code>getAll</code>, <code>updateSection</code>, <code>reset</code> e <code>subscribe</code>. Cada atualização dispara <code>notify</code>, que por sua vez mantém a home, o banner e qualquer outro componente sincronizados.</p>

      <h2>Exportar / importar</h2>
      <p>Com um clique você gera um JSON contendo todas as seções. Esse arquivo pode ser versionado ou reaplicado em outro navegador.</p>

      <h2>Casos de uso</h2>
      <ul>
        <li>Time de marketing ajustando textos em produção sem dependência do dev.</li>
        <li>Demos offline em que o conteúdo precisa ser carregado direto do notebook.</li>
        <li>MVPs que exigem variações rápidas de copy.</li>
      </ul>
    `,
    image: "/src/assets/images/blog/cms.jpg",
    date: "2024-06-10",
    author: "Equipe Framework",
    category: "Produtividade",
    tags: ["cms", "conteúdo", "localStorage"],
    featured: true,
  },
  {
    id: 3,
    title: "Checklist de performance para projetos vanilla",
    excerpt:
      "Truques usados pelo Framework Frontend para continuar rápido mesmo sem bundler.",
    content: `
      <p>Performance não depende de uma pipeline complexa. Aqui estão os princípios aplicados no framework para manter o carregamento instantâneo.</p>

      <h2>1. Componentes preguiçosos</h2>
      <p>Carregue HTML de componentes apenas quando eles existem no DOM e reutilize o markup via cache.</p>

      <h2>2. Vendors locais</h2>
      <p>Bootstrap, Swiper, Icons e demais bibliotecas vivem em <code>src/assets/vendor</code>, garantindo previsibilidade mesmo offline.</p>

      <h2>3. API helper</h2>
      <p>O <code>fetchAPI</code> concentra headers, proxy e tratamento de erro em um ponto só, reduzindo código duplicado e melhorando logs.</p>

      <h2>4. CMS primeiro</h2>
      <p>Separar conteúdo em uma camada (ContentService + CMS) evita re-renderizações completas ao alterar textos.</p>

      <p>No repositório você encontra um checklist completo para revisar antes de publicar.</p>
    `,
    image: "/src/assets/images/blog/performance.jpg",
    date: "2024-06-01",
    author: "Equipe Framework",
    category: "Performance",
    tags: ["performance", "otimização", "assets"],
    featured: false,
  },
];

export default blogPosts;
