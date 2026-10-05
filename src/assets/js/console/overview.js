window.consoleViews = window.consoleViews || Object.create(null);
window.consoleViews.overview = async function ({ container }) {
  const entries = [...document.querySelectorAll('.admin-nav [data-overview-description]')];
  const cards = entries.map(link => {
    const label = [...link.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())?.textContent.trim()
      || link.textContent.trim();
    const icon = link.querySelector('i')?.className || 'bi bi-arrow-up-right';
    return `<a class="console-overview-card" href="${link.getAttribute('href')}">
      <span class="console-overview-card-icon"><i class="${icon}" aria-hidden="true"></i></span>
      <strong>${label}</strong>
      <span>${link.dataset.overviewDescription}</span>
    </a>`;
  }).join('');

  container.innerHTML = `<section aria-labelledby="console-overview-title">
    <header class="console-overview-header">
      <span class="console-kicker">Espaço de trabalho</span>
      <h2 id="console-overview-title">Visão geral</h2>
      <p>Escolha uma área para continuar. Cada ferramenta abre em sua própria página.</p>
    </header>
    <div class="console-overview-grid">${cards}</div>
  </section>`;
};
