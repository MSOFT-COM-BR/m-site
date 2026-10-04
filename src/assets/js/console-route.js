(async function () {
  const host = document.querySelector('#root .console-route');
  if (!host) return;
  try {
    const response = await fetch(`/src/pages/admin.html?v=${window.config.app.version}`);
    if (!response.ok) throw new Error(`Console: ${response.status}`);
    const html = await response.text();
    if (!host.isConnected) return;
    const template = document.createElement('template');
    template.innerHTML = html;
    const style = template.content.querySelector('style');
    const shell = template.content.querySelector('section.cms-container');
    if (!style || !shell) throw new Error('Estrutura do Console indisponível');
    host.replaceWith(style, shell);
    const script = document.createElement('script');
    script.src = `/src/assets/js/console.js?v=${window.config.app.version}`;
    document.head.appendChild(script);
  } catch (error) {
    if (host.isConnected) host.textContent = 'Não foi possível abrir o Console. Atualize a página e tente novamente.';
    console.error('[Console]', error);
  }
})();
