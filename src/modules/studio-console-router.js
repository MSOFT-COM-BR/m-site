(() => {
  const STUDIO_PAGES = Object.freeze({
    'revendas/catalogo': 'revendas/catalogo.html',
    'crm/radar': 'crm/radar.html',
    'equipe/consultoras': 'equipe/consultoras.html',
    'fabrica/produtos': 'erp/produtos.html',
    'fabrica/insumos': 'erp/insumos.html',
    'fabrica/kardex': 'erp/kardex.html',
    'fabrica/categorias': 'erp/categorias.html',
    'fabrica/maquinas': 'erp/maquinas.html',
    'revendas/pedidos': 'revendas/pedidos.html',
  });
  const VIEW_BASE = '/src/pages/app/studio-bva/views/';
  const APP_KEY = 'bva';

  let activeRoot = null;
  let activeRoute = null;
  let radarLeads = [];
  let crudRecords = {};
  let crudTemplates = null;
  let pageClickHandler = null;
  let refreshInterval = null;

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const money = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const officialResellerLink = (user = {}) => {
    const resellerId = user.uuid || user.id;
    const resellerName = user.nome || user.name;
    const link = new URL('https://studiobva.com.br/');
    if (resellerId) link.searchParams.set('consultora', resellerId);
    else if (resellerName) link.searchParams.set('revendedora', resellerName);
    return link.toString();
  };
  const mediaUrl = (value) => {
    const url = String(value || '').trim();
    if (!url || /^https?:\/\//i.test(url)) return url;
    if (!url.startsWith('/uploads/')) return url;
    const apiBase = String(window.config?.api?.baseUrl || 'https://gateway.mirandasoft.com.br/api').replace(/\/api\/?$/, '');
    return `${apiBase}${url}`;
  };
  const setText = (id, value) => { const el = activeRoot?.querySelector(`#${id}`); if (el) el.textContent = value; };
  const setHtml = (id, value) => { const el = activeRoot?.querySelector(`#${id}`); if (el) el.innerHTML = value; };
  function crudIconAction(action, entity, id) {
    const actions = {
      edit: { attribute: 'data-crud-edit', icon: 'bi-pencil', label: 'Editar' },
      delete: { attribute: 'data-crud-delete', icon: 'bi-trash3', label: 'Excluir' },
      archive: { attribute: 'data-crud-delete', icon: 'bi-archive', label: 'Arquivar' },
    };
    const definition = actions[action];
    const label = `${definition.label} ${CRUD[entity]?.[0] || entity}`;
    return `<button type="button" class="crud-action crud-icon-action" ${definition.attribute}="${escapeHtml(entity)}" data-crud-id="${escapeHtml(id)}" aria-label="${label}" title="${label}"><i class="bi ${definition.icon}" aria-hidden="true"></i></button>`;
  }

  function routeKey() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const key = parts[0] === 'app' && parts[1] === 'studio' ? `${parts[2] || ''}/${parts[3] || ''}` : '';
    return STUDIO_PAGES[key] ? key : 'revendas/catalogo';
  }

  function sessionRequired(root) {
    root.innerHTML = `<section id="login-screen" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1E1B4B 0%, #311042 50%, #4C0519 100%); padding: 2rem 1rem;">
        <div class="login-card" style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px); border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); width: 100%; max-width: 480px; padding: 2.5rem; text-align: center;">
            <div class="mb-4">
                <img src="/src/assets/img/studio-bva-paper-logo.png" alt="Studio BVA" style="width: 80px; height: 80px; border-radius: 20px; object-fit: cover; box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3); border: 3px solid #fff; margin-bottom: 1rem;">
                <h3 class="fw-bold mb-1 text-dark" style="font-family: 'Plus Jakarta Sans', sans-serif;">Portal da Área Logada</h3>
                <p class="text-muted small m-0">Acesso exclusivo para Revendedoras VIP e Gestão B2B Studio BVA.</p>
            </div>
            <a href="/login" class="btn w-100 mb-3 py-2" style="background: linear-gradient(135deg, #EC4899, #8B5CF6); color: white; font-weight: 700; border-radius: 14px; box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);">
                Entrar com MSoft
            </a>
            <div class="mt-4 pt-3 border-top text-muted small">
                O Studio BVA agora utiliza o acesso unificado MSoft.
            </div>
        </div>
    </section>`;
  }

  async function fetchFragment(name) {
    const response = await fetch(`${VIEW_BASE}${name}?v=${window.config?.app?.version || '0'}`);
    if (!response.ok) throw new Error(`Não foi possível carregar ${name}.`);
    return response.text();
  }

  async function api(path, method = 'GET', body = null) {
    if (!window.core?.fetchAPI) throw new Error('A integração MSoft não está disponível.');
    const response = await window.core.fetchAPI(path, method, body || {}, { silent: true });
    if (response?.error || response?.success === false) throw new Error(typeof response.error === 'string' ? response.error : 'A operação não foi concluída.');
    return response || {};
  }

  function errorState(message) {
    return `<p class="studio-load-error" role="alert">Não foi possível carregar estes dados: ${escapeHtml(message)}</p>`;
  }

  function formatDate(value) {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.valueOf()) ? date.toLocaleString('pt-BR') : '—';
  }

  async function loadRevendas() {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const [accessResult, ordersResult, prospectsResult] = await Promise.allSettled([
      api(`/bva/catalog-access/stats?appKey=${APP_KEY}`),
      api(`/bva/orders?appKey=${APP_KEY}&since=${encodeURIComponent(monthStart)}&limit=200`),
      api(`/bva/prospects?appKey=${APP_KEY}&limit=50`),
    ]);
    if (!activeRoute.startsWith('revendas/')) return;
    const access = accessResult.status === 'fulfilled' ? accessResult.value.data || {} : {};
    const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : {};
    const prospects = prospectsResult.status === 'fulfilled' ? prospectsResult.value.data || [] : [];

    setText('reseller-stat-acessos', Number(access.total || 0).toLocaleString('pt-BR'));
    setText('reseller-stat-acessos-badge', access.variacaoHoje === undefined ? '—' : `${Number(access.variacaoHoje) >= 0 ? '+' : ''}${access.variacaoHoje}% hoje`);
    setText('reseller-stat-pedidos', String(orders.total ?? orders.data?.length ?? 0));
    setText('reseller-stat-comissao', access.comissaoTotal === undefined ? 'A consultar' : money(access.comissaoTotal));
    setText('reseller-stat-comissao-hint', access.comissaoTotal === undefined ? 'Comissão calculada conforme a regra comercial.' : '');

    const user = window.authService?.getUser?.() || {};
    const resellerLink = officialResellerLink(user);
    const resellerLinkElement = activeRoot?.querySelector('#my-reseller-link');
    if (resellerLinkElement) {
      resellerLinkElement.href = resellerLink;
      resellerLinkElement.textContent = resellerLink;
    }

    const orderRows = (orders.data || orders.orders || []).map((order) => `<tr><td>${escapeHtml(order.customer?.name || order.reseller?.name || 'Cliente')}</td><td>${formatDate(order.createdAt)}</td><td>${escapeHtml((order.items || []).map((item) => item.name || item.sku).filter(Boolean).join(', ') || '—')}</td><td>${money(order.total)}</td><td>${escapeHtml(order.status || 'Novo pedido')}</td></tr>`);

    if (activeRoute === 'revendas/catalogo') {
      const prospectRows = (prospects.data || []).slice(0, 3).map((lead) => `<tr><td>${escapeHtml(lead.name || lead.empresa)}</td><td>${formatDate(lead.createdAt || lead.data)}</td><td>${escapeHtml(lead.category || lead.segmento || '—')}</td><td>—</td><td>${escapeHtml(lead.status)}</td></tr>`);
      const mixed = [...orderRows.slice(0, 5), ...prospectRows].sort(() => Math.random() - 0.5); // Mock shuffle para dashboard
      setHtml('crm-orders-prospects-tbody', mixed.join('') || '<tr><td colspan="5">Nenhuma atividade recente.</td></tr>');
    } else if (activeRoute === 'revendas/pedidos') {
      setHtml('revendas-pedidos-tbody', orderRows.join('') || '<tr><td colspan="5">Nenhum pedido de revenda.</td></tr>');
    }
  }

  function leadMatches(lead, filters) {
    const category = String(lead.category || '').toLowerCase();
    if (filters.category === 'clinic' && !category.includes('clín') && !category.includes('clin')) return false;
    if (filters.category === 'school' && !category.includes('escol') && !category.includes('colég') && !category.includes('coleg')) return false;
    if (filters.category === 'store' && !category.includes('loja') && !category.includes('buffet')) return false;
    if (filters.status !== 'all' && lead.status !== filters.status) return false;
    const text = [lead.name, lead.category, lead.address, lead.whatsapp, lead.phone, lead.instagram, lead.notes].join(' ').toLowerCase();
    return !filters.query || text.includes(filters.query);
  }

  function renderRadar() {
    if (activeRoute !== 'crm/radar') return;
    const filters = {
      query: activeRoot?.querySelector('#radar-filter-search')?.value.trim().toLowerCase() || '',
      category: activeRoot?.querySelector('#radar-filter-category')?.value || 'all',
      status: activeRoot?.querySelector('#radar-filter-status')?.value || 'all',
    };
    const count = (needle) => radarLeads.filter((lead) => String(lead.category || '').toLowerCase().includes(needle)).length;
    setText('radar-total-leads', radarLeads.length);
    setText('radar-clinicas-leads', count('clin'));
    setText('radar-escolas-leads', count('escol') + count('coleg'));
    setText('radar-lojas-leads', radarLeads.filter((lead) => /loja|buffet/.test(String(lead.category || '').toLowerCase())).length);
    const visible = radarLeads.filter((lead) => leadMatches(lead, filters));
    crudRecords.lead = Object.fromEntries(radarLeads.map((lead) => [lead.uuid || lead.id, lead]));
    setHtml('radar-leads-list', visible.map((lead) => `<article class="studio-list-item"><div><strong>${escapeHtml(lead.name)}</strong><span>${escapeHtml(lead.category || 'Lead')} · ${escapeHtml(lead.status || 'Novo Lead')}</span><small>${escapeHtml(lead.address || 'Endereço não informado')} · ${escapeHtml(lead.whatsapp || lead.phone || 'Sem contato')}</small></div><div class="studio-crud-actions">${crudIconAction('edit', 'lead', lead.uuid || lead.id)}${crudIconAction('delete', 'lead', lead.uuid || lead.id)}</div></article>`).join('') || '<p>Nenhum lead encontrado.</p>');
  }

  async function loadRadar() {
    const result = await api(`/bva/prospects?appKey=${APP_KEY}&limit=200`);
    if (activeRoute !== 'crm/radar') return;
    radarLeads = result.data || [];
    renderRadar();
  }

  async function loadEquipe() {
    const result = await api(`/bva/consultoras?appKey=${APP_KEY}`);
    const list = result.data || []; crudRecords.consultora = Object.fromEntries(list.map((item) => [item.uuid || item.id, item]));
    const rows = list.map((item) => `<tr><td><strong>${escapeHtml(item.nome || item.name || '')}</strong><br><small>${escapeHtml(item.email || '')}</small></td><td>${escapeHtml(item.cidade || '—')}</td><td>${escapeHtml(item.whatsapp || '—')}</td><td>${escapeHtml(item.instagram || '—')}</td><td>${escapeHtml(item.nivel || '—')}</td><td>${escapeHtml(item.status === 'active' || !item.status ? 'Ativa' : 'Bloqueada')}</td><td><div class="studio-crud-actions">${crudIconAction('edit', 'consultora', item.uuid || item.id)}${crudIconAction('archive', 'consultora', item.uuid || item.id)}</div></td></tr>`);
    setHtml('team-tbody', rows.join('') || '<tr><td colspan="7">Nenhuma consultora cadastrada.</td></tr>');
  }

  async function loadAllKardex(query) {
    const firstPage = await api(`/erp/kardex${query}&limit=200&page=1`);
    const pages = Number(firstPage.pagination?.pages || 1);
    if (pages <= 1) return firstPage;
    const remainingPages = await Promise.all(
      Array.from({ length: pages - 1 }, (_, index) => api(`/erp/kardex${query}&limit=200&page=${index + 2}`)),
    );
    return {
      ...firstPage,
      count: Number(firstPage.pagination?.total || firstPage.count || 0),
      data: [
        ...(firstPage.data || []),
        ...remainingPages.flatMap((result) => result.data || []),
      ],
    };
  }

  async function loadErp() {
    const query = `?appKey=${APP_KEY}`;
    const results = await Promise.allSettled([
      api(`/erp/insumos${query}`), api(`/erp/produtos${query}`), loadAllKardex(query),
      api(`/erp/kardex/resumo${query}`), api(`/bva/categorias${query}`), api(`/erp/config${query}`), api(`/erp/maquinas${query}`),
    ]);
    if (activeRoute !== 'fabrica/produtos' && activeRoute !== 'fabrica/insumos' && activeRoute !== 'fabrica/kardex' && activeRoute !== 'fabrica/categorias' && activeRoute !== 'fabrica/maquinas') return;
    const [insumos, produtos, kardex, resumo, categorias, config, maquinas] = results.map((result) => result.status === 'fulfilled' ? result.value : {});

    const productList = produtos.data || [];
    crudRecords.produto = Object.fromEntries(productList.map((item) => [item.uuid || item.id, item]));
    const supplyList = insumos.data || [];
    crudRecords.insumo = Object.fromEntries(supplyList.map((item) => [item.uuid || item.id, item]));
    const categoryList = categorias.data || [];
    crudRecords.categoria = Object.fromEntries(categoryList.map((item) => [item.uuid || item.id, item]));
    const machineList = maquinas.data || [];
    crudRecords.maquina = Object.fromEntries(machineList.map((item) => [item.uuid || item.id, item]));

    setText('erp-metric-produtos', productList.length.toString());
    setText('erp-metric-insumos', supplyList.length.toString());
    setText('erp-metric-valor', money(productList.reduce((sum, item) => sum + (item.estoqueAcabado || item.estoque || 0) * (item.precoVarejo || item.preco_varejo || 0), 0)));
    setText('erp-metric-custo', money(supplyList.reduce((sum, item) => sum + (item.qtyEstoque || item.estoque || 0) * (item.custoPorUnidade || item.custo_unitario || 0), 0)));
    const resumoData = resumo.resumo || resumo.data || {};
    const vendas = (kardex.data || []).filter((item) => ['VENDA VAREJO', 'VENDA ATACADO'].includes(item.subtipo));
    setText('erp-total-vendas', money(resumoData.receitaVendas || 0));
    setText('erp-qtd-vendas', `${vendas.length} venda${vendas.length === 1 ? '' : 's'} registrada${vendas.length === 1 ? '' : 's'}`);
    setText('kardex-total-entradas', money(resumoData.entradas));
    setText('kardex-total-saidas', money(resumoData.saidas));
    setText('kardex-total-saldo', money(resumoData.saldo));
    setText('kardex-total-vendas', money(resumoData.receitaVendas));
    setText('kardex-total-lancamentos', String(resumoData.totalMovimentacoes ?? kardex.count ?? kardex.data?.length ?? 0));

    setHtml('erp-produtos-tbody', productList.map((item) => `<tr><td>${escapeHtml(item.nome || item.name)}</td><td>${escapeHtml(item.pesoGramas || item.consumo || '—')}g</td><td>${money(item.custoTotal || item.custoFabricacao || item.ctf)}</td><td>${money(item.precoAtacado || item.preco_atacado)}</td><td>${money(item.precoVarejo || item.preco_varejo)}</td><td>${escapeHtml(item.estoqueAcabado ?? item.estoque ?? '—')}</td><td><div class="studio-crud-actions"><button type="button" class="crud-action crud-icon-action" data-crud-manufacture="${escapeHtml(item.uuid || item.id)}" aria-label="Fabricar ${escapeHtml(item.nome || item.name)}" title="Registrar fabricação"><i class="bi bi-plus-circle" aria-hidden="true"></i></button>${crudIconAction('edit', 'produto', item.uuid || item.id)}${crudIconAction('delete', 'produto', item.uuid || item.id)}</div></td></tr>`).join('') || '<tr><td colspan="7">Nenhum produto cadastrado.</td></tr>');
    setHtml('erp-insumos-tbody', supplyList.map((item) => `<tr><td>${escapeHtml(item.nome || item.name)}</td><td>${escapeHtml(item.categoria || '—')}</td><td>${escapeHtml(item.qtyEstoque ?? item.estoque ?? item.quantidade ?? '—')} ${escapeHtml(item.unidade || '')}</td><td>${money(item.custoPorUnidade || item.custoUnitario || item.custo_unitario)}</td><td><div class="studio-crud-actions">${crudIconAction('edit', 'insumo', item.uuid || item.id)}${crudIconAction('delete', 'insumo', item.uuid || item.id)}</div></td></tr>`).join('') || '<tr><td colspan="5">Nenhum insumo cadastrado.</td></tr>');
    setHtml('erp-kardex-list', (kardex.data || []).map((item) => {
      const tipo = item.tipo || item.type || 'Movimentação';
      const isEntry = tipo === 'ENTRADA';
      const quantidade = item.quantidade == null ? '' : ` · ${escapeHtml(item.quantidade)} un.`;
      return `<li class="studio-kardex-entry"><div><strong>${escapeHtml(tipo)}${item.subtipo ? ` · ${escapeHtml(item.subtipo)}` : ''}</strong><span>${escapeHtml(item.descricao || item.description || '')}</span><small>${formatDate(item.createdAt || item.data)}${quantidade}</small></div><strong class="studio-kardex-value ${isEntry ? 'is-entry' : 'is-exit'}">${isEntry ? '+' : '−'} ${money(item.valor)}</strong></li>`;
    }).join('') || '<li>Nenhuma movimentação registrada.</li>');
    setHtml('erp-categorias-list', categoryList.map((item) => `<li><strong>${escapeHtml(item.rotulo || item.nome || item.name)}</strong><span>${escapeHtml(item.status || 'Ativa')}</span><span class="studio-crud-actions">${crudIconAction('edit', 'categoria', item.uuid || item.id)}</span></li>`).join('') || '<li>Nenhuma categoria cadastrada.</li>');

    setHtml('erp-maquinas-tbody', machineList.map((machine) => `<tr><td>${escapeHtml(machine.nome || machine.name || '—')}</td><td>${escapeHtml(machine.potenciaWatts ?? '—')}</td><td>${money(machine.custoDepreciacaoHora)}</td><td>${money(machine.custoMaquinaHora)}</td><td>${escapeHtml(machine.observacoes || '—')}</td><td><div class="studio-crud-actions">${crudIconAction('edit', 'maquina', machine.uuid || machine.id)}${crudIconAction('delete', 'maquina', machine.uuid || machine.id)}</div></td></tr>`).join('') || '<tr><td colspan="6">Nenhuma máquina cadastrada.</td></tr>');
    const configData = config.data || config || {};
    setHtml('erp-config-list', [...Object.entries(configData), ...((maquinas.data || []).map((machine, index) => [`Máquina ${index + 1}`, machine.nome || machine.name || '—']))].slice(0, 12).map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(typeof value === 'object' ? JSON.stringify(value) : value)}</dd></div>`).join('') || '<div><dt>Parâmetros</dt><dd>Não configurados</dd></div>');
  }

  async function loadCurrentRoute() {
    const loaders = { 'revendas/catalogo': loadRevendas, 'revendas/pedidos': loadRevendas, 'crm/radar': loadRadar, 'equipe/consultoras': loadEquipe, 'fabrica/produtos': loadErp, 'fabrica/insumos': loadErp, 'fabrica/categorias': loadErp, 'fabrica/maquinas': loadErp, 'fabrica/kardex': loadErp };
    try { await loaders[activeRoute]?.(); } catch (error) {
      const destination = activeRoot?.querySelector('#studio-console-page');
      if (destination) destination.insertAdjacentHTML('afterbegin', errorState(error.message));
    }
  }

  const CRUD = {
    lead: ['Lead B2B', '/bva/prospects', [['name', 'Empresa', 'text', true], ['category', 'Segmento', 'text', true], ['address', 'Endereço'], ['whatsapp', 'WhatsApp'], ['status', 'Status'], ['notes', 'Observações', 'textarea']]],
    consultora: ['Consultora', '/bva/consultoras', [['nome', 'Nome completo', 'text', true], ['email', 'E-mail', 'email', true], ['password', 'Senha inicial', 'password'], ['whatsapp', 'WhatsApp'], ['instagram', 'Instagram'], ['cidade', 'Cidade / Estado'], ['nivel', 'Nível'], ['role', 'Permissão'], ['status', 'Status']]],
    produto: ['Produto 3D', '/erp/produtos', [['nome', 'Nome', 'text', true], ['categoria', 'Categoria', 'text', true], ['pesoGramas', 'Peso (g)', 'number'], ['tempoHoras', 'Tempo de impressão (h)', 'number'], ['estoqueAcabado', 'Estoque', 'number'], ['margemAtacado', 'Margem atacado (%)', 'number'], ['margemVarejo', 'Margem varejo (%)', 'number']]],
    insumo: ['Insumo', '/erp/insumos', [['nome', 'Nome', 'text', true], ['categoria', 'Categoria', 'text', true], ['unidade', 'Unidade', 'text', true], ['qtyEstoque', 'Estoque inicial', 'number'], ['custoPorUnidade', 'Custo por unidade', 'number'], ['estoqueMinimo', 'Estoque mínimo', 'number'], ['fornecedor', 'Fornecedor']]],
    categoria: ['Categoria', '/bva/categorias', [['nome', 'Código', 'text', true], ['label', 'Rótulo de vitrine', 'text', true], ['ordem', 'Ordem', 'number'], ['observacoes', 'Observações', 'textarea']]],
    maquina: ['Máquina', '/erp/maquinas', [['nome', 'Nome', 'text', true], ['potenciaWatts', 'Potência (W)', 'number'], ['custoDepreciacaoHora', 'Depreciação/hora', 'number'], ['custoMaquinaHora', 'Custo/hora', 'number'], ['observacoes', 'Observações', 'textarea']]],
  };
  function confirmMutation(message) { return window.confirm(message); }
  function erpInsumosParaFilamento() {
    return Object.values(crudRecords.insumo || {}).filter((item) => (item.categoria || 'filamento') === 'filamento');
  }
  function updateProductWeight(form) {
    const total = [...form.querySelectorAll('[data-filamento-gramas]')]
      .reduce((sum, input) => sum + (Number(input.value) || 0), 0);
    const field = form.elements.pesoGramas;
    if (field) field.value = total || '';
    updateProductPricing(form);
  }
  function updateProductPricing(form) {
    const supplyById = crudRecords.insumo || {};
    const materialCost = [...form.querySelectorAll('.studio-filamento-row')].reduce((total, row) => {
      const supply = supplyById[row.querySelector('[data-filamento-insumo]')?.value];
      return total + (Number(row.querySelector('[data-filamento-gramas]')?.value) || 0) * Number(supply?.custoPorUnidade || 0);
    }, 0);
    const packaging = supplyById[form.elements.embalagemId?.value];
    const packagingCost = Number(packaging?.custoPorUnidade || 0);
    const machine = crudRecords.maquina?.[form.elements.maquinaId?.value];
    const machineCost = (Number(form.elements.tempoHoras?.value) || 0) * Number(machine?.custoMaquinaHora || 0);
    const total = materialCost + packagingCost + machineCost;
    const atacadoMargin = Number(form.elements.margemAtacado?.value || 120);
    const varejoMargin = Number(form.elements.margemVarejo?.value || 250);
    const atacado = total * (1 + atacadoMargin / 100);
    const varejo = total * (1 + varejoMargin / 100);
    if (form.elements.precoAtacado) form.elements.precoAtacado.value = atacado.toFixed(2);
    if (form.elements.precoVarejo) form.elements.precoVarejo.value = varejo.toFixed(2);
    const preview = form.querySelector('.studio-cost-preview');
    if (preview) {
      preview.textContent = `Custo: ${money(total)} (materiais ${money(materialCost + packagingCost)} + máquina ${money(machineCost)}) · Atacado: ${money(atacado)} · Varejo: ${money(varejo)}`;
    }
  }
  function addFilamentoRow(form, value = {}) {
    const rows = form.querySelector('[data-filamento-rows]');
    if (!rows) return;
    const options = erpInsumosParaFilamento().map((item) => {
      const id = item.uuid || item.id;
      return `<option value="${escapeHtml(id)}"${id === value.insumoId ? ' selected' : ''}>${escapeHtml(item.nome || item.name)}</option>`;
    }).join('');
    const row = document.createElement('div');
    row.className = 'studio-filamento-row';
    row.innerHTML = `<label>Material<select data-filamento-insumo required><option value="">Selecione…</option>${options}</select></label><label>Consumo (g)<input data-filamento-gramas type="number" min="0.01" step="any" required value="${escapeHtml(value.gramas || '')}"></label><button type="button" class="crud-action crud-icon-action" data-remove-filamento aria-label="Remover filamento" title="Remover filamento"><i class="bi bi-trash3" aria-hidden="true"></i></button>`;
    row.querySelector('[data-filamento-gramas]').addEventListener('input', () => updateProductWeight(form));
    row.querySelector('[data-filamento-insumo]').addEventListener('change', () => updateProductPricing(form));
    row.querySelector('[data-remove-filamento]').addEventListener('click', () => { row.remove(); updateProductWeight(form); });
    rows.append(row);
  }
  function hydrateProductForm(form, item) {
    const list = Array.isArray(item.filamentos) && item.filamentos.length
      ? item.filamentos
      : item.insumoId ? [{ insumoId: item.insumoId, gramas: item.pesoGramas }] : [];
    list.forEach((filamento) => addFilamentoRow(form, filamento));
    if (!list.length) addFilamentoRow(form);
    form.querySelector('[data-add-filamento]')?.addEventListener('click', () => addFilamentoRow(form));
    if (!form.elements.tempoHoras.value) form.elements.tempoHoras.value = '1';
    if (!form.elements.margemAtacado.value) form.elements.margemAtacado.value = '120';
    if (!form.elements.margemVarejo.value) form.elements.margemVarejo.value = '250';
    form.elements.pesoGramas?.addEventListener('input', () => {
      const rows = [...form.querySelectorAll('.studio-filamento-row')];
      if (rows.length === 1) {
        rows[0].querySelector('[data-filamento-gramas]').value = form.elements.pesoGramas.value;
        updateProductPricing(form);
      }
    });
    ['tempoHoras', 'margemAtacado', 'margemVarejo'].forEach((name) => form.elements[name]?.addEventListener('input', () => updateProductPricing(form)));
    ['embalagemId', 'maquinaId'].forEach((name) => form.elements[name]?.addEventListener('change', () => updateProductPricing(form)));
    updateProductWeight(form);
  }
  function openCrudDialog(entity, item = {}) {
    const [label,, fields] = CRUD[entity] || []; if (!label) return;
    if (!window.MSoftComponents) throw new Error('Componente de dialog indisponível.');
    const content = document.createElement('div');
    const template = crudTemplates?.querySelector(`#studio-form-${entity}`);
    if (template) content.append(template.content.cloneNode(true));
    else content.append(window.MSoftComponents.createCrudForm({ entity, title: label, fields, item, classNames: { form: 'studio-form crud-form', header: 'studio-dialog-header', grid: 'studio-form-grid two', footer: 'studio-dialog-footer', submit: 'studio-refresh' } }));

    const form = content.querySelector('form');

    const categorySelect = form.querySelector('[data-studio-categorias]');
    if (categorySelect) {
      const categories = Object.values(crudRecords.categoria || {});
      const categoryValue = item.categoria || '';
      const hasCurrentCategory = categories.some((category) => (category.label || category.rotulo || category.nome || category.name) === categoryValue);
      categorySelect.innerHTML = '<option value="">Selecione uma categoria…</option>' +
        (!hasCurrentCategory && categoryValue ? `<option value="${escapeHtml(categoryValue)}">${escapeHtml(categoryValue)} (categoria atual)</option>` : '') +
        categories.map((category) => {
          const value = category.label || category.rotulo || category.nome || category.name;
          return `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`;
        }).join('');
    }
    const maquinaSelect = form.querySelector('[data-studio-maquinas]');
    if (maquinaSelect) {
      maquinaSelect.innerHTML = '<option value="">Padrão / Nenhuma</option>' +
        Object.values(crudRecords.maquina || {}).map(m => `<option value="${escapeHtml(m.uuid || m.id)}">${escapeHtml(m.nome || m.name)}</option>`).join('');
    }
    const embSelect = form.querySelector('[data-studio-embalagens]');
    if (embSelect) {
      embSelect.innerHTML = '<option value="">Nenhuma embalagem</option>' +
        Object.values(crudRecords.insumo || {}).filter(i => i.categoria === 'embalagem' || i.categoria === 'acessorio' || i.categoria === 'outro').map(i => `<option value="${escapeHtml(i.uuid || i.id)}">${escapeHtml(i.nome)}</option>`).join('');
    }

    const modal = window.MSoftComponents.createDialog({ content, className: 'studio-crud-dialog', initialFocus: form?.querySelector('[name]'), onClose: () => undefined });
    content.querySelectorAll('[name]').forEach((field) => {
      if (field.type === 'file') {
        const value = item[field.name];
        if (value && Array.isArray(value) && value.length > 0) {
          const preview = document.createElement('div');
          preview.className = 'studio-file-preview';
          preview.style.display = 'flex';
          preview.style.gap = '10px';
          preview.style.marginTop = '10px';
          preview.style.flexWrap = 'wrap';

          if (field.name === 'images') {
            preview.innerHTML = value.map(img => { const url = escapeHtml(mediaUrl(img.url)); return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="display:block; border-radius:8px; overflow:hidden; border:2px solid ${img.isPrimary ? 'var(--studio-primary)' : '#ddd'}"><img src="${url}" alt="Imagem do produto" style="width:70px;height:70px;object-fit:cover;display:block"></a>`; }).join('');
          } else if (field.name === 'attachments') {
            preview.innerHTML = value.map(file => `<a href="${escapeHtml(mediaUrl(file.url))}" target="_blank" rel="noopener noreferrer" style="padding:8px 12px;background:var(--studio-surface);border-radius:6px;font-size:12px;border:1px solid var(--studio-border);text-decoration:none;color:var(--studio-text);display:flex;align-items:center;gap:6px"><i class="bi bi-file-earmark-text"></i> ${escapeHtml(file.originalName || file.filename || 'Arquivo')}</a>`).join('');
          }
          field.parentElement.appendChild(preview);
        }
        return;
      }
      if (field.type === 'checkbox') field.checked = Boolean(item[field.name] ?? field.checked);
      else if (field.name === 'videos' && Array.isArray(item.videos)) field.value = item.videos.map((video) => typeof video === 'string' ? video : video.url).filter(Boolean).join('\n');
      else if (item[field.name] !== undefined) field.value = item[field.name];
    });
    if (entity === 'produto') hydrateProductForm(form, item);
    form.onsubmit = (event) => submitCrud(event, entity, item.uuid || item.id);
    modal.open();
  }

  async function uploadMultipart(path, formData) {
    const baseUrl = String(window.config?.api?.baseUrl || '').replace(/\/+$/, '');
    if (!baseUrl) throw new Error('A API de upload não está configurada.');
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('msoft_auth_token') || ''}` },
      credentials: 'include',
      body: formData
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'Erro no upload');
    return json;
  }

  async function submitCrud(event, entity, id) {
    event.preventDefault();
    const [, route] = CRUD[entity];
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body = Object.fromEntries([...formData].filter(([, value]) => !(value instanceof File)));
    let videoUrls = [];

    // Checkboxes un-checked não aparecem no FormData. Precisamos injetar explicitamente como false.
    form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      body[cb.name] = cb.checked;
    });

    body.appKey = APP_KEY;
    if (entity === 'produto') {
      const filamentos = [...form.querySelectorAll('.studio-filamento-row')].map((row) => ({
        insumoId: row.querySelector('[data-filamento-insumo]')?.value || '',
        gramas: Number(row.querySelector('[data-filamento-gramas]')?.value || 0),
      })).filter((item) => item.insumoId && item.gramas > 0);
      if (!filamentos.length) {
        alert('Informe ao menos um filamento e seu consumo em gramas.');
        return;
      }
      body.filamentos = filamentos;
      videoUrls = String(body.videos || '').split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
      delete body.videos;
      delete body.pesoGramas;
      delete body.images;
      delete body.attachments;
      delete body.precoAtacado;
      delete body.precoVarejo;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Salvando...';
    submitBtn.disabled = true;

    try {
      const res = await api(id ? `${route}/${encodeURIComponent(id)}` : route, id ? 'PUT' : 'POST', body);
      const savedId = id || res.data?.uuid || res.data?.id;

      // Upload files if present and endpoint is produto
      if (savedId && route === '/erp/produtos') {
        const imagesInput = form.querySelector('input[type="file"][name="images"]');
        if (imagesInput?.files?.length > 0) {
          submitBtn.textContent = 'Enviando fotos...';
          const imgData = new FormData();
          for (const file of imagesInput.files) imgData.append('images', file);
          await uploadMultipart(`${route}/${encodeURIComponent(savedId)}/image?appKey=${APP_KEY}`, imgData);
        }
        const attachInput = form.querySelector('input[type="file"][name="attachments"]');
        if (attachInput?.files?.length > 0) {
          submitBtn.textContent = 'Enviando anexos...';
          const attData = new FormData();
          for (const file of attachInput.files) attData.append('files', file);
          await uploadMultipart(`${route}/${encodeURIComponent(savedId)}/attachments?appKey=${APP_KEY}`, attData);
        }
        for (const url of videoUrls) {
          submitBtn.textContent = 'Salvando vídeos...';
          await api(`${route}/${encodeURIComponent(savedId)}/videos?appKey=${APP_KEY}`, 'POST', { url });
        }
      }

      form.closest('dialog').close();
      await loadCurrentRoute();
    } catch (err) {
      alert(err.message);
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  async function deleteCrud(entity, id) {
    const [, route] = CRUD[entity] || [];
    if (route && confirmMutation('Confirma o arquivamento?')) {
      try {
        await api(`${route}/${encodeURIComponent(id)}?appKey=${APP_KEY}`, 'DELETE');
        await loadCurrentRoute();
      } catch (err) {
        alert(err.message);
      }
    }
  }
  function openManufactureDialog(id) {
    const product = crudRecords.produto?.[id];
    if (!product || !window.MSoftComponents) return;
    const content = document.createElement('div');
    content.innerHTML = `<form class="studio-form crud-form"><header class="studio-dialog-header"><div><span class="studio-console-kicker">Fábrica 3D · Produção</span><h2>Registrar fabricação</h2><p>${escapeHtml(product.nome || product.name)}</p></div><button type="button" data-close aria-label="Fechar formulário">×</button></header><fieldset><label>Quantidade produzida<input name="quantidade" type="number" min="1" step="1" required autofocus></label><p class="studio-field-hint">O sistema dará baixa nos filamentos e lançará a movimentação no Kardex.</p></fieldset><footer class="studio-dialog-footer"><button type="button" data-close>Cancelar</button><button class="studio-refresh" type="submit">Registrar produção</button></footer></form>`;
    const form = content.querySelector('form');
    const modal = window.MSoftComponents.createDialog({ content, className: 'studio-crud-dialog', initialFocus: form.elements.quantidade });
    form.onsubmit = async (event) => {
      event.preventDefault();
      const quantidade = Number(form.elements.quantidade.value);
      if (!Number.isInteger(quantidade) || quantidade < 1) return;
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      try {
        await api(`/erp/produtos/${encodeURIComponent(id)}/fabricar?appKey=${APP_KEY}`, 'PATCH', { quantidade, appKey: APP_KEY });
        modal.close();
        await loadCurrentRoute();
      } catch (error) {
        alert(error.message);
      } finally {
        submit.disabled = false;
      }
    };
    modal.open();
  }
  function renderCrudActions() { const entities = activeRoute === 'crm/radar' ? ['lead'] : activeRoute === 'equipe/consultoras' ? ['consultora'] : activeRoute === 'fabrica/produtos' ? ['produto'] : activeRoute === 'fabrica/insumos' ? ['insumo'] : activeRoute === 'fabrica/categorias' ? ['categoria'] : activeRoute === 'fabrica/maquinas' ? ['maquina'] : []; const target = activeRoot?.querySelector('.studio-module-heading'); if (target && entities.length) target.insertAdjacentHTML('beforeend', `<div class="studio-crud-actions">${entities.map((entity) => `<button type="button" class="studio-refresh crud-action" data-crud-create="${entity}">Cadastrar ${CRUD[entity][0]}</button>`).join('')}</div>`); }

  function bindPageEvents() {
    renderCrudActions();
    activeRoot?.querySelectorAll('[data-crud-create]').forEach((button) => button.addEventListener('click', () => openCrudDialog(button.dataset.crudCreate)));

    pageClickHandler = (event) => {
      const edit = event.target.closest('[data-crud-edit]');
      if (edit) {
        console.log('Edit clicked:', edit.dataset.crudEdit, edit.dataset.crudId);
        const record = crudRecords[edit.dataset.crudEdit]?.[edit.dataset.crudId];
        if (!record) {
          alert('Erro interno: Registro não encontrado na memória (' + edit.dataset.crudId + '). Recarregue a página.');
          return;
        }
        try {
          return openCrudDialog(edit.dataset.crudEdit, record);
        } catch (e) {
          alert('Erro ao abrir formulário: ' + e.message);
        }
      }
      const manufacture = event.target.closest('[data-crud-manufacture]');
      if (manufacture) return openManufactureDialog(manufacture.dataset.crudManufacture);
      const remove = event.target.closest('[data-crud-delete]');
      if (remove) return deleteCrud(remove.dataset.crudDelete, remove.dataset.crudId);
    };
    window.addEventListener('click', pageClickHandler);

    activeRoot?.querySelector('[data-copy-reseller-link]')?.addEventListener('click', async (event) => {
      const url = activeRoot?.querySelector('#my-reseller-link')?.href;
      if (!url) return;
      try {
        await navigator.clipboard.writeText(url);
        event.currentTarget.textContent = 'Link copiado';
      } catch {
        window.prompt('Copie o link abaixo:', url);
      }
    });
    ['#radar-filter-search', '#radar-filter-category', '#radar-filter-status'].forEach((selector) => activeRoot?.querySelector(selector)?.addEventListener('input', renderRadar));
    activeRoot?.querySelector('#radar-filter-category')?.addEventListener('change', renderRadar);
    activeRoot?.querySelector('#radar-filter-status')?.addEventListener('change', renderRadar);
    if (refreshInterval) window.clearInterval(refreshInterval);
    refreshInterval = window.setInterval(() => {
      if (!document.hidden && !document.querySelector('.studio-crud-dialog[open]')) loadCurrentRoute();
    }, 25_000);
  }

  async function mount(root) {
    if (!root) return;
    activeRoot = root;
    const authService = window.authService;
    if (!authService?.isAuthenticated()) { sessionRequired(root); return; }
    activeRoute = routeKey();
    try {
      const [shell, page, forms] = await Promise.all([fetchFragment('console.html'), fetchFragment(STUDIO_PAGES[activeRoute]), fetchFragment('shared/crud-forms.html')]);
      if (root !== activeRoot) return;
      root.innerHTML = shell;
      root.querySelector('#studio-console-page').innerHTML = page;
      crudTemplates = document.createElement('div'); crudTemplates.hidden = true; crudTemplates.innerHTML = forms; root.append(crudTemplates);

      const user = authService.getUser?.();
      setText('studio-console-user', user?.name ? `Sessão MSoft: ${user.name}` : 'Sessão MSoft ativa');

      root.querySelectorAll(`[data-studio-route="${activeRoute}"]`).forEach((link) => link.setAttribute('aria-current', 'page'));
      bindPageEvents();
      await loadCurrentRoute();
    } catch (error) {
      if (root !== activeRoot) return;
      root.innerHTML = `<section class="studio-console"><div class="studio-module-card" role="alert"><h2>Console indisponível</h2><p>Não foi possível carregar este módulo agora.</p></div></section>`;
    }
  }

  function unmount() { if (pageClickHandler) window.removeEventListener('click', pageClickHandler); pageClickHandler = null; if (refreshInterval) window.clearInterval(refreshInterval); refreshInterval = null; if (activeRoot) activeRoot.innerHTML = ''; activeRoot = null; activeRoute = null; radarLeads = []; }
  window.addEventListener('msoft:route-unmount', unmount);
  window.StudioConsoleRouter = { mount, unmount, STUDIO_PAGES };
})();
