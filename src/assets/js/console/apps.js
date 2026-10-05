window.consoleViews = window.consoleViews || Object.create(null);
window.consoleViews.apps = async function ({ container, auth }) {
                container.innerHTML = `
                    <div class="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 mb-4">
                        <div>
                            <h4 class="mb-1 text-on-surface fw-bold fs-3">Catálogo de aplicativos</h4>
                            <p class="text-on-surface-variant small mb-0">Apps exibidos no marketplace, com tipo de cobrança e preço.</p>
                        </div>
                        <span class="badge align-self-md-center" style="background: rgba(56, 189, 248, 0.12); color: var(--ms-secondary); border: 1px solid rgba(56, 189, 248, 0.3); padding: 7px 10px;">
                            <i class="bi bi-grid-3x3-gap me-1"></i> Marketplace
                        </span>
                    </div>
                    <div class="alert cms-alert mb-4">
                        <i class="bi bi-info-circle me-2 text-info"></i>
                        Desativar um app apenas o oculta do catálogo público; os acessos já concedidos aos usuários não são alterados.
                    </div>
                    <style>
                        #catalog-app-list .catalog-item-row { display: grid !important; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 1rem; min-width: 0; }
                        #catalog-app-list .catalog-item-info { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
                        #catalog-app-list .catalog-item-actions { display: flex; flex-direction: column; align-items: stretch; gap: .5rem; min-width: 7.5rem; max-width: 100%; }
                        #catalog-app-list .catalog-item-actions .btn { white-space: normal; overflow-wrap: anywhere; }
                        @media (max-width: 575.98px) {
                            #catalog-app-list .catalog-item-row { grid-template-columns: minmax(0, 1fr); }
                            #catalog-app-list .catalog-item-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); min-width: 0; width: 100%; }
                        }
                    </style>
                    <div class="row g-4">
                        <div class="col-lg-5">
                            <section class="border rounded-3 p-3 p-md-4 h-100" style="border-color: var(--ms-outline-variant) !important; background: var(--ms-surface-container-low);">
                                <div class="d-flex align-items-center gap-2 mb-1">
                                    <i class="bi bi-plus-square text-info"></i>
                                    <h5 class="text-on-surface fw-semibold mb-0" id="catalog-form-title">Novo app</h5>
                                </div>
                                <p class="text-on-surface-variant small mb-4" id="catalog-form-subtitle">Cadastre um app para disponibilizá-lo no marketplace.</p>
                                <form id="catalog-app-form" class="row g-3" novalidate>
                                    <div class="col-12">
                                        <label class="form-label text-on-surface mb-2" for="catalog-app-name">Nome</label>
                                        <input id="catalog-app-name" type="text" class="form-control cms-input" maxlength="120" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-on-surface mb-2" for="catalog-app-key">Chave (appKey)</label>
                                        <input id="catalog-app-key" type="text" class="form-control cms-input" autocomplete="off" minlength="2" maxlength="64" pattern="[a-z0-9][a-z0-9-]{0,63}" placeholder="Ex.: bva" aria-describedby="catalog-app-key-help" required>
                                        <div id="catalog-app-key-help" class="form-text text-on-surface-variant">Use de 2 a 64 letras minúsculas, números ou hífens. A chave não muda depois do cadastro.</div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-on-surface mb-2" for="catalog-app-category">Categoria</label>
                                        <input id="catalog-app-category" type="text" class="form-control cms-input" maxlength="60" placeholder="Ex.: Gestão">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label text-on-surface mb-2" for="catalog-app-description">Descrição</label>
                                        <textarea id="catalog-app-description" class="form-control cms-input" rows="3" maxlength="1000" required></textarea>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label text-on-surface mb-2" for="catalog-app-type">Cobrança</label>
                                        <select id="catalog-app-type" class="form-select cms-input" required>
                                            <option value="free">Grátis</option>
                                            <option value="subscription">Assinatura</option>
                                            <option value="one-time">Pagamento único</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label text-on-surface mb-2" for="catalog-app-price">Preço</label>
                                        <input id="catalog-app-price" type="number" class="form-control cms-input" min="0" step="0.01" value="0" required>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label text-on-surface mb-2" for="catalog-app-currency">Moeda</label>
                                        <input id="catalog-app-currency" type="text" class="form-control cms-input" maxlength="3" value="BRL" required>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label text-on-surface mb-2" for="catalog-app-icon">Ícone (Bootstrap Icons)</label>
                                        <input id="catalog-app-icon" type="text" class="form-control cms-input" maxlength="60" placeholder="bi-box">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label text-on-surface mb-2" for="catalog-app-features">Recursos (um por linha)</label>
                                        <textarea id="catalog-app-features" class="form-control cms-input" rows="3" maxlength="1000" aria-describedby="catalog-app-features-help" placeholder="Relatórios em tempo real&#10;Multiusuário"></textarea>
                                        <div id="catalog-app-features-help" class="form-text text-on-surface-variant">Até 120 caracteres por recurso.</div>
                                    </div>
                                    <div class="col-12 d-flex flex-wrap align-items-center gap-3 mt-2">
                                        <button id="catalog-app-submit" type="submit" class="btn cms-btn-primary">
                                            <i class="bi bi-plus-lg me-2"></i>Cadastrar app
                                        </button>
                                        <button id="catalog-app-cancel" type="button" class="btn btn-outline-light" hidden>Cancelar edição</button>
                                        <div id="catalog-app-feedback" class="small" role="status" aria-live="polite" hidden></div>
                                    </div>
                                </form>
                            </section>
                        </div>
                        <div class="col-lg-7">
                            <section class="border rounded-3 p-3 p-md-4 h-100" style="border-color: var(--ms-outline-variant) !important; background: var(--ms-surface-container-low);">
                                <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
                                    <div>
                                        <h5 class="text-on-surface fw-semibold mb-1">Apps cadastrados <span id="catalog-app-count" class="text-on-surface-variant small fw-normal"></span></h5>
                                        <p class="text-on-surface-variant small mb-0">Inclui apps inativos, ocultos do marketplace.</p>
                                    </div>
                                    <button id="catalog-app-refresh" type="button" class="btn btn-sm btn-outline-light">
                                        <i class="bi bi-arrow-clockwise me-1"></i> Atualizar
                                    </button>
                                </div>
                                <div id="catalog-app-list-feedback" class="small mb-3" role="status" aria-live="polite" tabindex="-1" hidden></div>
                                <div id="catalog-app-list" class="d-flex flex-column gap-2" aria-live="polite">
                                    <div class="text-center py-5 text-on-surface-variant"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Carregando apps...</div>
                                </div>
                            </section>
                        </div>
                    </div>
                `;

                const getCatalogElement = (id) => document.getElementById(id);
                const catalogForm = getCatalogElement('catalog-app-form');
                const formTitle = getCatalogElement('catalog-form-title');
                const formSubtitle = getCatalogElement('catalog-form-subtitle');
                const nameInput = getCatalogElement('catalog-app-name');
                const appKeyInput = getCatalogElement('catalog-app-key');
                const categoryInput = getCatalogElement('catalog-app-category');
                const descriptionInput = getCatalogElement('catalog-app-description');
                const typeInput = getCatalogElement('catalog-app-type');
                const priceInput = getCatalogElement('catalog-app-price');
                const currencyInput = getCatalogElement('catalog-app-currency');
                const iconInput = getCatalogElement('catalog-app-icon');
                const featuresInput = getCatalogElement('catalog-app-features');
                const submitButton = getCatalogElement('catalog-app-submit');
                const cancelButton = getCatalogElement('catalog-app-cancel');
                const formFeedback = getCatalogElement('catalog-app-feedback');
                const refreshButton = getCatalogElement('catalog-app-refresh');
                const catalogList = getCatalogElement('catalog-app-list');
                const catalogListFeedback = getCatalogElement('catalog-app-list-feedback');
                const catalogCount = getCatalogElement('catalog-app-count');
                let editingAppKey = null;
                let catalogMutationInProgress = false;
                let catalogRefreshGeneration = 0;

                const escapeHtml = (value) => String(value ?? '')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
                const encodeValue = (value) => encodeURIComponent(String(value ?? ''));
                const decodeValue = (value) => {
                    try { return decodeURIComponent(String(value || '')); } catch (_error) { return ''; }
                };
                const normalizeAppKey = (value) => String(value || '').trim().toLowerCase();
                const getErrorMessage = (error, fallback) => {
                    const message = String(error && error.message ? error.message : '').trim();
                    return message && !message.startsWith('API Error:') ? message : fallback;
                };
                const setFeedback = (element, message, type = 'error') => {
                    if (!element) return;
                    element.hidden = false;
                    element.className = type === 'success' ? 'small text-success' : type === 'info' ? 'small text-info' : 'small text-danger';
                    element.textContent = message;
                };
                const callCatalogApi = async (url, method = 'GET', payload = {}) => {
                    if (!window.core || typeof window.core.fetchAPI !== 'function') {
                        throw new Error('A comunicação com o servidor não está disponível.');
                    }
                    const response = await window.core.fetchAPI(url, method, payload, { silent: true });
                    if (!response || !response.success) {
                        const message = typeof (response && response.error) === 'string' ? response.error : 'A operação não foi concluída.';
                        throw new Error(message);
                    }
                    return response;
                };
                const setButtonBusy = (button, label) => {
                    if (!button) return () => {};
                    const originalContent = button.innerHTML;
                    button.disabled = true;
                    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${label}`;
                    return () => {
                        button.disabled = false;
                        button.innerHTML = originalContent;
                    };
                };
                const setCatalogMutationState = (active) => {
                    catalogMutationInProgress = active;
                    if (active) catalogRefreshGeneration++;
                    catalogForm?.querySelectorAll('input, textarea, select, button').forEach((control) => {
                        control.disabled = active || (control === appKeyInput && Boolean(editingAppKey));
                    });
                    catalogList?.querySelectorAll('button').forEach((button) => { button.disabled = active; });
                    if (refreshButton) refreshButton.disabled = active;
                };
                const CATALOG_TYPE_LABELS = { free: 'Grátis', subscription: 'Assinatura', 'one-time': 'Pagamento único' };
                const formatPrice = (item) => {
                    const price = Number(item && item.price);
                    if (!Number.isFinite(price) || price <= 0) return 'Grátis';
                    try {
                        return price.toLocaleString('pt-BR', { style: 'currency', currency: String(item.currency || 'BRL') });
                    } catch (_error) {
                        return `R$ ${price.toFixed(2)}`;
                    }
                };
                const parseFeatures = (value) => String(value || '')
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean);

                const resetCatalogForm = () => {
                    editingAppKey = null;
                    if (catalogForm) catalogForm.reset();
                    if (appKeyInput) appKeyInput.disabled = false;
                    if (priceInput) priceInput.value = '0';
                    if (currencyInput) currencyInput.value = 'BRL';
                    if (formTitle) formTitle.textContent = 'Novo app';
                    if (formSubtitle) formSubtitle.textContent = 'Cadastre um app para disponibilizá-lo no marketplace.';
                    if (submitButton) submitButton.innerHTML = '<i class="bi bi-plus-lg me-2"></i>Cadastrar app';
                    if (cancelButton) cancelButton.hidden = true;
                };

                const startEditing = (item) => {
                    if (!item) return;
                    editingAppKey = normalizeAppKey(item.appKey);
                    if (nameInput) nameInput.value = item.name || '';
                    if (appKeyInput) {
                        appKeyInput.value = editingAppKey;
                        appKeyInput.disabled = true;
                    }
                    if (categoryInput) categoryInput.value = item.category || '';
                    if (descriptionInput) descriptionInput.value = item.description || '';
                    if (typeInput) typeInput.value = item.type || 'free';
                    if (priceInput) priceInput.value = String(Number(item.price) || 0);
                    if (currencyInput) currencyInput.value = item.currency || 'BRL';
                    if (iconInput) iconInput.value = item.icon || '';
                    if (featuresInput) featuresInput.value = (Array.isArray(item.features) ? item.features : []).join('\n');
                    if (formTitle) formTitle.textContent = `Editando: ${item.name || editingAppKey}`;
                    if (formSubtitle) formSubtitle.textContent = 'A chave (appKey) não pode ser alterada após o cadastro.';
                    if (submitButton) submitButton.innerHTML = '<i class="bi bi-check-lg me-2"></i>Salvar alterações';
                    if (cancelButton) cancelButton.hidden = false;
                    if (formFeedback) formFeedback.hidden = true;
                    if (nameInput) nameInput.focus();
                };

                let catalogItemsCache = [];

                const renderCatalogList = (items) => {
                    if (!catalogList) return;
                    if (catalogCount) catalogCount.textContent = `(${items.length})`;
                    if (!items.length) {
                        catalogList.innerHTML = '<div class="text-center text-on-surface-variant border rounded-3 py-4 px-3" style="border-color: var(--ms-outline-variant) !important;">Nenhum app cadastrado no catálogo.</div>';
                        return;
                    }
                    catalogList.innerHTML = items.map((item) => {
                        const active = item.active !== false;
                        const status = active
                            ? '<span class="badge text-bg-success-subtle text-success-emphasis">Ativo</span>'
                            : '<span class="badge text-bg-secondary">Inativo</span>';
                        const typeLabel = CATALOG_TYPE_LABELS[item.type] || item.type || 'Grátis';
                        const toggleButton = active
                            ? `<button type="button" class="btn btn-sm btn-outline-danger" data-catalog-action="deactivate" data-app-key="${encodeValue(item.appKey)}"><i class="bi bi-eye-slash me-1"></i> Desativar</button>`
                            : `<button type="button" class="btn btn-sm btn-outline-success" data-catalog-action="reactivate" data-app-key="${encodeValue(item.appKey)}"><i class="bi bi-eye me-1"></i> Reativar</button>`;
                        return `
                            <article class="border rounded-3 p-3 overflow-hidden" style="border-color: var(--ms-outline) !important; background: var(--ms-surface-container-low);">
                                <div class="catalog-item-row">
                                    <div class="catalog-item-info">
                                        <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                                            <i class="bi ${escapeHtml(item.icon || 'bi-box')} text-info"></i>
                                            <h6 class="text-on-surface mb-0 text-truncate">${escapeHtml(item.name || 'Sem nome')}</h6>
                                            ${status}
                                            <span class="badge text-bg-info-subtle text-info-emphasis">${escapeHtml(typeLabel)}</span>
                                        </div>
                                        <div class="small text-on-surface-variant text-truncate">${escapeHtml(item.description || '')}</div>
                                        <div class="small text-on-surface-variant mt-2">
                                            <i class="bi bi-key me-1"></i>${escapeHtml(item.appKey || '')}
                                            <span class="opacity-50 mx-1">|</span> ${escapeHtml(formatPrice(item))}
                                            ${item.category ? `<span class="opacity-50 mx-1">|</span> <i class="bi bi-tag me-1"></i>${escapeHtml(item.category)}` : ''}
                                        </div>
                                    </div>
                                    <div class="catalog-item-actions">
                                        <button type="button" class="btn btn-sm btn-outline-light" data-catalog-action="edit" data-app-key="${encodeValue(item.appKey)}">
                                            <i class="bi bi-pencil me-1"></i> Editar
                                        </button>
                                        ${toggleButton}
                                    </div>
                                </div>
                            </article>
                        `;
                    }).join('');
                };

                const refreshCatalog = async () => {
                    if (!catalogList) return;
                    const requestId = ++catalogRefreshGeneration;
                    catalogList.innerHTML = '<div class="text-center py-4 text-on-surface-variant"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Atualizando apps...</div>';
                    try {
                        const response = await callCatalogApi('/catalog/admin');
                        if (!container.contains(catalogList) || requestId !== catalogRefreshGeneration) return;
                        catalogItemsCache = Array.isArray(response.data) ? response.data : [];
                        renderCatalogList(catalogItemsCache);
                        if (catalogListFeedback) catalogListFeedback.hidden = true;
                    } catch (error) {
                        if (requestId !== catalogRefreshGeneration) return;
                        if (catalogCount) catalogCount.textContent = '';
                        if (container.contains(catalogList)) {
                            catalogList.innerHTML = `<div class="text-danger border rounded-3 py-4 px-3" style="border-color: rgba(239, 68, 68, 0.35) !important;">${escapeHtml(getErrorMessage(error, 'Não foi possível carregar o catálogo.'))}</div>`;
                        }
                    }
                };

                if (appKeyInput) {
                    appKeyInput.addEventListener('change', () => {
                        appKeyInput.value = normalizeAppKey(appKeyInput.value);
                    });
                }

                if (catalogForm && submitButton) {
                    catalogForm.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        if (catalogMutationInProgress) return;
                        appKeyInput.value = normalizeAppKey(appKeyInput.value);
                        if (!catalogForm.checkValidity()) {
                            catalogForm.reportValidity();
                            return;
                        }
                        const editing = Boolean(editingAppKey);
                        setCatalogMutationState(true);
                        const restoreButton = setButtonBusy(submitButton, editing ? 'Salvando...' : 'Cadastrando...');
                        let saved = false;
                        if (formFeedback) formFeedback.hidden = true;
                        const payload = {
                            name: nameInput.value.trim(),
                            description: descriptionInput.value.trim(),
                            price: Number(priceInput.value) || 0,
                            currency: String(currencyInput.value || 'BRL').trim().toUpperCase(),
                            type: typeInput.value,
                            icon: iconInput.value.trim() || 'bi-box',
                            category: categoryInput.value.trim(),
                            features: parseFeatures(featuresInput.value),
                        };
                        if (payload.features.some((feature) => feature.length > 120)) {
                            restoreButton();
                            setCatalogMutationState(false);
                            setFeedback(formFeedback, 'Cada recurso pode conter até 120 caracteres.', 'error');
                            featuresInput.focus();
                            return;
                        }
                        if (payload.type === 'free' && payload.price > 0) {
                            restoreButton();
                            setCatalogMutationState(false);
                            setFeedback(formFeedback, 'Apps gratuitos devem ter preço igual a zero.', 'error');
                            priceInput.focus();
                            return;
                        }
                        if (!/^[A-Z]{3}$/.test(payload.currency)) {
                            restoreButton();
                            setCatalogMutationState(false);
                            setFeedback(formFeedback, 'Informe a sigla de moeda com três letras, como BRL.', 'error');
                            currencyInput.focus();
                            return;
                        }
                        try {
                            if (editing) {
                                await callCatalogApi(`/catalog/admin/${encodeURIComponent(editingAppKey)}`, 'PUT', payload);
                                setFeedback(formFeedback, 'App atualizado com sucesso.', 'success');
                            } else {
                                await callCatalogApi('/catalog/admin', 'POST', { ...payload, appKey: appKeyInput.value });
                                setFeedback(formFeedback, 'App cadastrado e disponível no marketplace.', 'success');
                            }
                            saved = true;
                            await refreshCatalog();
                        } catch (error) {
                            setFeedback(formFeedback, getErrorMessage(error, editing ? 'Não foi possível atualizar o app.' : 'Não foi possível cadastrar o app.'), 'error');
                        } finally {
                            restoreButton();
                            if (saved) resetCatalogForm();
                            setCatalogMutationState(false);
                        }
                    });
                }

                if (cancelButton) {
                    cancelButton.addEventListener('click', () => {
                        resetCatalogForm();
                        if (formFeedback) formFeedback.hidden = true;
                    });
                }
                if (refreshButton) refreshButton.addEventListener('click', refreshCatalog);
                if (catalogList) {
                    catalogList.addEventListener('click', async (event) => {
                        if (catalogMutationInProgress) return;
                        const button = event.target.closest('button[data-catalog-action]');
                        if (!button) return;
                        const action = button.dataset.catalogAction;
                        const appKey = decodeValue(button.dataset.appKey);
                        const item = catalogItemsCache.find((entry) => normalizeAppKey(entry.appKey) === appKey);
                        if (action === 'edit') {
                            if (!item) {
                                setFeedback(formFeedback, 'Este app não está mais disponível. Atualize a lista e tente novamente.', 'error');
                                await refreshCatalog();
                                return;
                            }
                            startEditing(item);
                            return;
                        }
                        if (action === 'deactivate') {
                            if (!window.confirm(`Desativar o app "${item && item.name ? item.name : appKey}"? Ele some do marketplace, mas os acessos já concedidos continuam.`)) return;
                            if (!item) {
                                setFeedback(catalogListFeedback, 'Este app não está mais disponível. Atualize a lista e tente novamente.', 'error');
                                return;
                            }
                            setCatalogMutationState(true);
                            if (catalogListFeedback) catalogListFeedback.hidden = true;
                            const restoreButton = setButtonBusy(button, 'Desativando...');
                            try {
                                await callCatalogApi(`/catalog/admin/${encodeURIComponent(appKey)}`, 'DELETE');
                                setFeedback(catalogListFeedback, 'App desativado; os acessos existentes foram preservados.', 'success');
                                await refreshCatalog();
                            } catch (error) {
                                setFeedback(catalogListFeedback, getErrorMessage(error, 'Não foi possível desativar o app.'), 'error');
                                catalogListFeedback?.focus({ preventScroll: true });
                                catalogListFeedback?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                catalogListFeedback?.setAttribute('aria-atomic', 'true');
                            } finally {
                                restoreButton();
                                setCatalogMutationState(false);
                            }
                            return;
                        }
                        if (action === 'reactivate') {
                            setCatalogMutationState(true);
                            if (catalogListFeedback) catalogListFeedback.hidden = true;
                            const restoreButton = setButtonBusy(button, 'Reativando...');
                            try {
                                await callCatalogApi(`/catalog/admin/${encodeURIComponent(appKey)}`, 'PUT', { active: true });
                                setFeedback(catalogListFeedback, 'App reativado e disponível no marketplace.', 'success');
                                await refreshCatalog();
                            } catch (error) {
                                setFeedback(catalogListFeedback, getErrorMessage(error, 'Não foi possível reativar o app.'), 'error');
                                catalogListFeedback?.focus({ preventScroll: true });
                                catalogListFeedback?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                catalogListFeedback?.setAttribute('aria-atomic', 'true');
                            } finally {
                                restoreButton();
                                setCatalogMutationState(false);
                            }
                        }
                    });
                }

                refreshCatalog();
};
