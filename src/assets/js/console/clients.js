window.consoleViews = window.consoleViews || Object.create(null);
window.consoleViews.clients = async function ({ container }) {
  container.innerHTML = `
    <section aria-labelledby="client-title">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
        <div><span class="console-kicker">MirandaSoft · Sistema</span><h2 id="client-title" class="text-on-surface fw-bold fs-3 mb-1">Clientes MSoft</h2><p class="text-on-surface-variant mb-0">Cadastros de pessoas físicas e jurídicas atendidas pela MirandaSoft.</p></div>
        <button class="btn cms-btn-primary" id="client-new"><i class="bi bi-person-plus me-2" aria-hidden="true"></i>Novo cliente</button>
      </div>
      <div class="alert cms-alert mb-4"><i class="bi bi-shield-lock me-2" aria-hidden="true"></i>CPF/CNPJ aparece mascarado na lista e completo somente no formulário individual. Este cadastro não cria contas de acesso nem organizações de aplicativos.</div>
      <section class="border rounded-3 p-3 p-md-4 mb-4" style="border-color:var(--ms-outline-variant)!important;background:var(--ms-surface-container-low)" aria-label="Filtros de clientes">
        <form id="client-search" class="row g-3 align-items-end">
          <div class="col-12 col-lg-6"><label for="client-query" class="form-label text-on-surface">Buscar por nome, e-mail ou documento</label><input id="client-query" class="form-control cms-input" type="search" maxlength="100" autocomplete="off" placeholder="Nome, e-mail, CPF ou CNPJ"></div>
          <div class="col-6 col-lg-2"><label for="client-filter-type" class="form-label text-on-surface">Tipo</label><select id="client-filter-type" class="form-select cms-input"><option value="">Todos</option><option value="PF">Pessoa física</option><option value="PJ">Pessoa jurídica</option></select></div>
          <div class="col-6 col-lg-2"><label for="client-filter-status" class="form-label text-on-surface">Status</label><select id="client-filter-status" class="form-select cms-input"><option value="active">Ativos</option><option value="inactive">Inativos</option><option value="">Todos</option></select></div>
          <div class="col-12 col-lg-2 d-grid"><button type="submit" class="btn btn-outline-info"><i class="bi bi-search me-2" aria-hidden="true"></i>Buscar</button></div>
        </form>
      </section>
      <section class="border rounded-3 p-3 p-md-4" style="border-color:var(--ms-outline-variant)!important;background:var(--ms-surface-container-low)" aria-label="Lista de clientes">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3"><h3 class="text-on-surface fw-semibold fs-5 mb-0">Cadastro de clientes</h3><span id="client-count" class="small text-on-surface-variant" aria-live="polite"></span></div>
        <div id="client-list" aria-live="polite"><div class="text-center py-5 text-on-surface-variant"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Carregando clientes...</div></div>
        <nav class="d-flex align-items-center justify-content-between gap-3 mt-3" aria-label="Paginação dos clientes"><button id="client-prev" type="button" class="btn btn-sm btn-outline-light">Anterior</button><span id="client-page" class="small text-on-surface-variant" aria-live="polite"></span><button id="client-next" type="button" class="btn btn-sm btn-outline-light">Próxima</button></nav>
      </section>
      <section id="client-editor" class="border rounded-3 p-3 p-md-4 mt-4" style="border-color:var(--ms-outline-variant)!important;background:var(--ms-surface-container-low)" aria-label="Formulário de cliente" hidden></section>
    </section>`;

  const byId = (id) => container.querySelector(`#${id}`);
  const list = byId('client-list');
  const editor = byId('client-editor');
  const searchInput = byId('client-query');
  const typeFilter = byId('client-filter-type');
  const statusFilter = byId('client-filter-status');
  let refreshGeneration = 0;
  let editorGeneration = 0;
  let clientMutationInProgress = false;
  const setMutationState = (active) => {
    clientMutationInProgress = active;
    byId('client-new').disabled = active;
    list.querySelectorAll('[data-client-edit], [data-client-status]').forEach((button) => { button.disabled = active; });
    editor.querySelectorAll('input, select, textarea, button').forEach((control) => { control.disabled = active; });
  };
  let page = 1;
  let pages = 0;
  let searchTerm = '';
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const safeMessage = (error, fallback) => error?.message && !error.message.startsWith('API Error:') ? error.message : fallback;
  const api = async (url, method = 'GET', payload = {}) => {
    const result = await window.core.fetchAPI(url, method, payload, { silent: true, sensitive: true });
    if (!result?.success) throw new Error(typeof result?.error === 'string' ? result.error : 'A operação não foi concluída.');
    return result.data;
  };
  const filters = () => {
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (typeFilter.value) params.set('personType', typeFilter.value);
    if (statusFilter.value) params.set('status', statusFilter.value);
    return params.toString();
  };
  const renderRows = (items) => {
    if (!items.length) {
      list.innerHTML = '<div class="text-center text-on-surface-variant border rounded-3 py-5 px-3" style="border-color:var(--ms-outline-variant)!important">Nenhum cliente encontrado. Ajuste a busca ou cadastre um novo cliente.</div>';
      return;
    }
    list.innerHTML = `<div class="d-flex flex-column gap-2">${items.map((client) => {
      const active = client.status === 'active';
      const person = client.personType === 'PJ' ? 'Pessoa jurídica' : 'Pessoa física';
      return `<article class="border rounded-3 p-3" style="border-color:var(--ms-outline)!important;background:var(--ms-surface-container-low)">
        <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div class="min-w-0"><div class="d-flex flex-wrap align-items-center gap-2 mb-1"><h4 class="text-on-surface fs-6 fw-semibold mb-0">${escapeHtml(client.name)}</h4><span class="badge ${active ? 'text-bg-success-subtle text-success-emphasis' : 'text-bg-secondary'}">${active ? 'Ativo' : 'Inativo'}</span><span class="badge text-bg-light">${person}</span></div>
            ${client.tradeName ? `<div class="small text-on-surface-variant">${escapeHtml(client.tradeName)}</div>` : ''}
            <div class="small text-on-surface-variant">${escapeHtml(client.email || 'Sem e-mail')} <span class="mx-1 opacity-50">·</span> ${escapeHtml(client.phone || 'Sem telefone')}</div>
            <div class="small text-on-surface-variant mt-1">Documento: ${escapeHtml(client.document || 'Não informado')}</div></div>
          <div class="d-flex flex-wrap align-items-center gap-2 flex-shrink-0"><button type="button" class="btn btn-sm btn-outline-light" data-client-edit="${escapeHtml(client.id)}"><i class="bi bi-pencil me-1" aria-hidden="true"></i>Editar</button><button type="button" class="btn btn-sm ${active ? 'btn-outline-danger' : 'btn-outline-success'}" data-client-status="${escapeHtml(client.id)}" data-next-status="${active ? 'inactive' : 'active'}">${active ? 'Inativar' : 'Ativar'}</button></div>
        </div></article>`;
    }).join('')}</div>`;
  };
  const refresh = async () => {
    const requestId = ++refreshGeneration;
    list.setAttribute('aria-busy', 'true');
    list.innerHTML = '<div class="text-center py-5 text-on-surface-variant"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Carregando clientes...</div>';
    try {
      const query = filters();
      const result = searchTerm
        ? await api(`/admin/clients/search?${query}`, 'POST', { q: searchTerm })
        : await api(`/admin/clients?${query}`);
      if (!container.isConnected || requestId !== refreshGeneration) return;
      const items = Array.isArray(result.items) ? result.items : [];
      pages = Number(result.pages || 0);
      renderRows(items);
      byId('client-count').textContent = `${Number(result.total || 0)} cliente${Number(result.total || 0) === 1 ? '' : 's'}`;
      byId('client-page').textContent = pages ? `Página ${result.page} de ${pages}` : 'Sem páginas';
      byId('client-prev').disabled = Number(result.page || page) <= 1;
      byId('client-next').disabled = Number(result.page || page) >= pages;
    } catch (error) {
      if (requestId !== refreshGeneration) return;
      list.innerHTML = `<div class="alert alert-danger mb-0" role="alert">${escapeHtml(safeMessage(error, 'Não foi possível carregar os clientes.'))}<button type="button" class="btn btn-sm btn-outline-danger ms-2" id="client-retry">Tentar novamente</button></div>`;
    } finally {
      if (requestId === refreshGeneration) list.removeAttribute('aria-busy');
    }
  };
  const showEditor = async (id = '') => {
    if (clientMutationInProgress) return;
    const requestId = ++editorGeneration;
    editor.hidden = false;
    editor.innerHTML = '<div class="text-center py-4 text-on-surface-variant"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Carregando cadastro...</div>';
    try {
      const client = id ? await api(`/admin/clients/${encodeURIComponent(id)}`) : { personType: 'PF', name: '', document: '', tradeName: '', email: '', phone: '', status: 'active' };
      if (!container.isConnected || requestId !== editorGeneration) return;
      const isCompany = client.personType === 'PJ';
      editor.innerHTML = `<div class="d-flex align-items-start justify-content-between gap-3 mb-3"><div><h3 class="text-on-surface fs-5 fw-semibold mb-1">${id ? 'Editar cliente' : 'Novo cliente'}</h3><p class="small text-on-surface-variant mb-0">Preencha somente os dados necessários; CPF/CNPJ é opcional.</p></div><button type="button" id="client-editor-close" class="btn btn-sm btn-outline-light" aria-label="Fechar cadastro"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>
        <form id="client-form" class="row g-3" novalidate>
          <div class="col-12 col-md-4"><label class="form-label text-on-surface" for="client-person-type">Tipo de pessoa</label><select id="client-person-type" name="personType" class="form-select cms-input" required><option value="PF" ${!isCompany ? 'selected' : ''}>Pessoa física</option><option value="PJ" ${isCompany ? 'selected' : ''}>Pessoa jurídica</option></select></div>
          <div class="col-12 col-md-8"><label class="form-label text-on-surface" id="client-name-label" for="client-name">${isCompany ? 'Razão social' : 'Nome completo'}</label><input id="client-name" name="name" class="form-control cms-input" value="${escapeHtml(client.name)}" minlength="2" maxlength="160" autocomplete="${isCompany ? 'organization' : 'name'}" required></div>
          <div class="col-12 col-md-6" id="client-trade-wrap" ${isCompany ? '' : 'hidden'}><label class="form-label text-on-surface" for="client-trade-name">Nome fantasia <span class="text-on-surface-variant">(opcional)</span></label><input id="client-trade-name" name="tradeName" class="form-control cms-input" value="${escapeHtml(client.tradeName)}" maxlength="160"></div>
          <div class="col-12 col-md-6"><label class="form-label text-on-surface" id="client-document-label" for="client-document">${isCompany ? 'CNPJ' : 'CPF'} <span class="text-on-surface-variant">(opcional)</span></label><input id="client-document" name="document" class="form-control cms-input" value="${escapeHtml(isCompany ? formatCnpj(client.document) : formatCpf(client.document))}" maxlength="18" inputmode="text" autocapitalize="characters" autocomplete="off" aria-describedby="client-document-help"><div id="client-document-help" class="form-text text-on-surface-variant">O documento fica completo somente na consulta individual autorizada.</div></div>
          <div class="col-12 col-md-6"><label class="form-label text-on-surface" for="client-email">E-mail <span class="text-on-surface-variant">(opcional)</span></label><input id="client-email" name="email" type="email" class="form-control cms-input" value="${escapeHtml(client.email)}" maxlength="254" autocomplete="email"></div>
          <div class="col-12 col-md-6"><label class="form-label text-on-surface" for="client-phone">Telefone <span class="text-on-surface-variant">(opcional)</span></label><input id="client-phone" name="phone" type="tel" class="form-control cms-input" value="${escapeHtml(client.phone)}" maxlength="20" autocomplete="tel"></div>
          <div class="col-12 d-flex flex-wrap align-items-center gap-3 mt-3"><button type="submit" id="client-save" class="btn cms-btn-primary"><i class="bi bi-check-lg me-2" aria-hidden="true"></i>Salvar cliente</button><span id="client-feedback" class="small" role="status" aria-live="polite"></span></div>
        </form>`;
      const form = byId('client-form');
      const personType = byId('client-person-type');
      const updateType = () => {
        const company = personType.value === 'PJ';
        byId('client-name-label').textContent = company ? 'Razão social' : 'Nome completo';
        byId('client-trade-wrap').hidden = !company;
        byId('client-document-label').firstChild.textContent = company ? 'CNPJ ' : 'CPF ';
      };
      personType.addEventListener('change', () => {
        byId('client-document').value = '';
        updateType();
      });
      byId('client-document').addEventListener('input', (event) => {
        if (personType.value === 'PJ') {
          const start = event.target.selectionStart;
          event.target.value = event.target.value.toUpperCase();
          event.target.setSelectionRange(start, start);
        }
      });
      byId('client-editor-close').addEventListener('click', () => { editorGeneration++; editor.hidden = true; editor.replaceChildren(); });
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (clientMutationInProgress || requestId !== editorGeneration) return;
        if (!form.reportValidity()) return;
        const feedback = byId('client-feedback');
        const payload = Object.fromEntries(new FormData(form).entries());
        if (payload.personType !== 'PJ') delete payload.tradeName;
        setMutationState(true);
        feedback.textContent = 'Salvando…';
        try {
          await api(id ? `/admin/clients/${encodeURIComponent(id)}` : '/admin/clients', id ? 'PUT' : 'POST', payload);
          if (requestId !== editorGeneration) return;
          feedback.className = 'small text-success';
          feedback.textContent = 'Cliente salvo.';
          editor.hidden = true;
          editor.replaceChildren();
          await refresh();
        } catch (error) {
          if (requestId !== editorGeneration) return;
          feedback.className = 'small text-danger';
          feedback.textContent = safeMessage(error, 'Não foi possível salvar o cliente. Confira os dados e tente novamente.');
        } finally {
          setMutationState(false);
        }
      });
    } catch (error) {
      if (requestId !== editorGeneration) return;
      editor.innerHTML = `<div class="alert alert-danger mb-0" role="alert">${escapeHtml(safeMessage(error, 'Não foi possível abrir este cadastro.'))}</div>`;
    }
    if (requestId === editorGeneration && container.isConnected) editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  function formatCpf(value) { const digits = String(value || '').replace(/\D/g, '').slice(0, 11); return digits.length === 11 ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : digits; }
  function formatCnpj(value) { const cnpj = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14); return /^[A-Z0-9]{12}\d{2}$/.test(cnpj) ? cnpj.replace(/(.{2})(.{3})(.{3})(.{4})(\d{2})/, '$1.$2.$3/$4-$5') : cnpj; }

  byId('client-search').addEventListener('submit', (event) => { event.preventDefault(); searchTerm = searchInput.value.trim(); page = 1; refresh(); });
  byId('client-new').addEventListener('click', () => showEditor());
  typeFilter.addEventListener('change', () => { page = 1; refresh(); });
  statusFilter.addEventListener('change', () => { page = 1; refresh(); });
  byId('client-prev').addEventListener('click', () => { if (page > 1) { page--; refresh(); } });
  byId('client-next').addEventListener('click', () => { if (page < pages) { page++; refresh(); } });
  list.addEventListener('click', async (event) => {
    const target = event.target.closest('[data-client-edit], [data-client-status], #client-retry');
    if (!target) return;
    if (target.id === 'client-retry') { refresh(); return; }
    if (clientMutationInProgress) return;
    if (target.hasAttribute('data-client-edit')) { showEditor(target.dataset.clientEdit); return; }
    target.disabled = true;
    setMutationState(true);
    try {
      await api(`/admin/clients/${encodeURIComponent(target.dataset.clientStatus)}/status`, 'PATCH', { status: target.dataset.nextStatus });
      await refresh();
    } catch (error) {
      target.disabled = false;
      const message = document.createElement('div');
      message.className = 'alert alert-danger mt-2 mb-0';
      message.setAttribute('role', 'alert');
      message.textContent = safeMessage(error, 'Não foi possível alterar o status do cliente.');
      target.closest('article')?.appendChild(message);
    } finally {
      setMutationState(false);
    }
  });
  await refresh();
};
