window.consoleViews = window.consoleViews || Object.create(null);
window.consoleViews.users = async function ({ container, auth }) {
                container.innerHTML = `
                    <div class="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 mb-4">
                        <div>
                            <h4 class="mb-1 text-on-surface fw-bold fs-3">Usuários por aplicação</h4>
                            <p class="text-on-surface-variant small mb-0">Contas comuns, permissões mínimas e sessões revogadas a cada alteração.</p>
                        </div>
                        <span class="badge align-self-md-center" style="background: rgba(56, 189, 248, 0.12); color: var(--ms-secondary); border: 1px solid rgba(56, 189, 248, 0.3); padding: 7px 10px;">
                            <i class="bi bi-shield-lock me-1"></i> Escopo por aplicação
                        </span>
                    </div>
                    <div class="alert cms-alert mb-4">
                        <i class="bi bi-shield-check me-2 text-info"></i>
                        Este painel não exibe nem altera contas <strong>Admin Master</strong>. Desativar uma conta encerra suas sessões e remove todos os acessos; reativar não restaura permissões antigas.
                    </div>
                    <div class="row g-4">
                        <div class="col-lg-5">
                            <section class="border rounded-3 p-3 p-md-4 h-100" style="border-color: var(--ms-outline-variant) !important; background: var(--ms-surface-container-low);">
                                <div class="d-flex align-items-center gap-2 mb-1">
                                    <i class="bi bi-person-plus text-info"></i>
                                    <h5 class="text-on-surface fw-semibold mb-0">Nova conta</h5>
                                </div>
                                <p class="text-on-surface-variant small mb-4">A conta nasce sem privilégios globais e recebe apenas o acesso selecionado.</p>
                                <form id="app-user-form" class="row g-3" novalidate>
                                    <div class="col-12">
                                        <label class="form-label text-on-surface mb-2" for="app-user-name">Nome completo</label>
                                        <input id="app-user-name" type="text" class="form-control cms-input" autocomplete="name" maxlength="120" required>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label text-on-surface mb-2" for="app-user-email">E-mail</label>
                                        <input id="app-user-email" type="email" class="form-control cms-input" autocomplete="email" maxlength="254" required>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label text-on-surface mb-2" for="app-user-password">Senha inicial</label>
                                        <input id="app-user-password" type="password" class="form-control cms-input" autocomplete="new-password" minlength="12" maxlength="128" aria-describedby="app-user-password-help" required>
                                        <div id="app-user-password-help" class="form-text text-on-surface-variant small mt-2">Mínimo de 12 caracteres. A senha não volta a ser exibida pelo painel.</div>
                                    </div>
                                    <div class="col-md-7">
                                        <label class="form-label text-on-surface mb-2" for="app-user-app-key">Aplicação</label>
                                        <input id="app-user-app-key" type="text" class="form-control cms-input" list="app-user-app-options" autocomplete="off" pattern="[a-z0-9][a-z0-9-]{0,63}" placeholder="Ex.: bva" required>
                                        <datalist id="app-user-app-options"></datalist>
                                    </div>
                                    <div class="col-md-5">
                                        <label class="form-label text-on-surface mb-2" for="app-user-role">Permissão</label>
                                        <select id="app-user-role" class="form-select cms-input" required>
                                            <option value="viewer">Visualizador</option>
                                            <option value="editor">Editor</option>
                                            <option value="owner">Proprietário</option>
                                        </select>
                                    </div>
                                    <div class="col-12 d-flex flex-wrap align-items-center gap-3 mt-2">
                                        <button id="app-user-submit" type="submit" class="btn cms-btn-primary">
                                            <i class="bi bi-person-plus me-2"></i>Criar e conceder acesso
                                        </button>
                                        <div id="app-user-feedback" class="small" role="status" aria-live="polite" hidden></div>
                                    </div>
                                </form>
                            </section>
                        </div>
                        <div class="col-lg-7">
                            <section class="border rounded-3 p-3 p-md-4 h-100" style="border-color: var(--ms-outline-variant) !important; background: var(--ms-surface-container-low);">
                                <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
                                    <div>
                                        <h5 class="text-on-surface fw-semibold mb-1">Contas gerenciáveis <span id="app-user-count" class="text-on-surface-variant small fw-normal"></span></h5>
                                        <p class="text-on-surface-variant small mb-0">Admin Masters não aparecem nesta lista.</p>
                                    </div>
                                    <button id="app-user-refresh" type="button" class="btn btn-sm btn-outline-light">
                                        <i class="bi bi-arrow-clockwise me-1"></i> Atualizar
                                    </button>
                                </div>
                                <form id="app-user-search-form" class="input-group mb-3" role="search">
                                    <label class="visually-hidden" for="app-user-search">Buscar usuário</label>
                                    <input id="app-user-search" type="search" class="form-control cms-input" maxlength="80" autocomplete="off" placeholder="Buscar por nome ou e-mail">
                                    <button type="submit" class="btn btn-outline-info">Buscar</button>
                                </form>
                                <div id="app-user-list" class="d-flex flex-column gap-2" aria-live="polite">
                                    <div class="text-center py-5 text-on-surface-variant"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Carregando usuários...</div>
                                </div>
                            </section>
                        </div>
                    </div>
                    <section id="app-user-editor-section" class="border rounded-3 p-3 p-md-4 mt-4" style="border-color: var(--ms-outline-variant) !important; background: var(--ms-surface-container-low);" hidden></section>
                `;

                const getUserElement = (id) => document.getElementById(id);
                const createForm = getUserElement('app-user-form');
                const nameInput = getUserElement('app-user-name');
                const emailInput = getUserElement('app-user-email');
                const passwordInput = getUserElement('app-user-password');
                const appKeyInput = getUserElement('app-user-app-key');
                const appRoleInput = getUserElement('app-user-role');
                const appOptions = getUserElement('app-user-app-options');
                const createButton = getUserElement('app-user-submit');
                const createFeedback = getUserElement('app-user-feedback');
                const searchForm = getUserElement('app-user-search-form');
                const searchInput = getUserElement('app-user-search');
                const refreshButton = getUserElement('app-user-refresh');
                const userList = getUserElement('app-user-list');
                const userCount = getUserElement('app-user-count');
                const editorSection = getUserElement('app-user-editor-section');
                let selectedUser = null;

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
                const formatDate = (value, fallback = 'Nunca') => {
                    if (!value) return fallback;
                    const date = new Date(value);
                    return Number.isNaN(date.getTime()) ? fallback : date.toLocaleString('pt-BR');
                };
                const setFeedback = (element, message, type = 'error') => {
                    if (!element) return;
                    element.hidden = false;
                    element.className = type === 'success' ? 'small text-success' : type === 'info' ? 'small text-info' : 'small text-danger';
                    element.textContent = message;
                };
                const callUserApi = async (url, method = 'GET', payload = {}) => {
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

                const loadApplicationSuggestions = async () => {
                    if (!appOptions) return;
                    try {
                        const response = await callUserApi('/auth/admin/applications');
                        const fragment = document.createDocumentFragment();
                        const seen = new Set();
                        appOptions.replaceChildren();
                        (Array.isArray(response.data) ? response.data : []).forEach((item) => {
                            const appKey = normalizeAppKey(item && item.appKey);
                            if (!appKey || seen.has(appKey)) return;
                            seen.add(appKey);
                            const option = document.createElement('option');
                            option.value = appKey;
                            fragment.appendChild(option);
                        });
                        appOptions.appendChild(fragment);
                    } catch (_error) {
                        // Uma chave de aplicacao nova continua podendo ser informada manualmente.
                    }
                };

                // Catalogo real (GET /catalog, publico) usado para o select de "instalar app" —
                // diferente da lista de sugestoes de mAppAccess acima, aqui so entram appKeys
                // que realmente existem no catalogo, porque instalar exige o app cadastrado.
                let catalogAppsCache = [];

                const loadCatalogApps = async () => {
                    try {
                        const response = await window.core.fetchAPI('/catalog', 'GET');
                        catalogAppsCache = (response && response.success && Array.isArray(response.data)) ? response.data : [];
                    } catch (_error) {
                        catalogAppsCache = [];
                    }
                };

                const catalogAppOptions = (installedKeys) => {
                    const installed = new Set(installedKeys);
                    const available = catalogAppsCache.filter((item) => !installed.has(normalizeAppKey(item.appKey)));
                    if (!available.length) {
                        return '<option value="">Nenhum app disponível no catálogo</option>';
                    }
                    return '<option value="">Selecione um app...</option>' + available
                        .map((item) => `<option value="${encodeValue(normalizeAppKey(item.appKey))}">${escapeHtml(item.name)} (${escapeHtml(item.appKey)})</option>`)
                        .join('');
                };

                const renderUserList = (users) => {
                    if (!userList) return;
                    if (userCount) userCount.textContent = `(${users.length})`;
                    if (!users.length) {
                        userList.innerHTML = '<div class="text-center text-on-surface-variant border rounded-3 py-4 px-3" style="border-color: var(--ms-outline-variant) !important;">Nenhuma conta encontrada.</div>';
                        return;
                    }

                    userList.innerHTML = users.map((user) => {
                        const active = user.status === 'active';
                        const accesses = Array.isArray(user.appAccesses) ? user.appAccesses : [];
                        const status = active
                            ? '<span class="badge text-bg-success-subtle text-success-emphasis">Ativo</span>'
                            : '<span class="badge text-bg-secondary">Inativo</span>';
                        const accessLabel = accesses.length === 1 ? '1 aplicação' : `${accesses.length} aplicações`;
                        return `
                            <article class="border rounded-3 p-3" style="border-color: var(--ms-outline) !important; background: var(--ms-surface-container-low);">
                                <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                                    <div class="min-w-0">
                                        <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                                            <h6 class="text-on-surface mb-0 text-truncate">${escapeHtml(user.name || 'Sem nome')}</h6>
                                            ${status}
                                        </div>
                                        <div class="small text-on-surface-variant text-truncate">${escapeHtml(user.email || '')}</div>
                                        <div class="small text-on-surface-variant mt-2"><i class="bi bi-grid me-1"></i>${accessLabel} <span class="opacity-50 mx-1">|</span> criado em ${escapeHtml(formatDate(user.createdAt, 'data indisponível'))}</div>
                                    </div>
                                    <button type="button" class="btn btn-sm btn-outline-light align-self-sm-center" data-user-action="edit" data-user-id="${encodeValue(user.id)}">
                                        <i class="bi bi-sliders me-1"></i> Gerenciar
                                    </button>
                                </div>
                            </article>
                        `;
                    }).join('');
                };

                const refreshUsers = async () => {
                    if (!userList) return;
                    userList.innerHTML = '<div class="text-center py-4 text-on-surface-variant"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Atualizando usuários...</div>';
                    const query = String(searchInput && searchInput.value ? searchInput.value : '').trim();
                    const url = `/auth/admin/users?limit=50${query ? `&q=${encodeURIComponent(query)}` : ''}`;
                    try {
                        const response = await callUserApi(url);
                        if (!container.contains(userList)) return;
                        renderUserList(Array.isArray(response.data) ? response.data : []);
                    } catch (error) {
                        if (userCount) userCount.textContent = '';
                        if (container.contains(userList)) {
                            userList.innerHTML = `<div class="text-danger border rounded-3 py-4 px-3" style="border-color: rgba(239, 68, 68, 0.35) !important;">${escapeHtml(getErrorMessage(error, 'Não foi possível carregar os usuários.'))}</div>`;
                        }
                    }
                };

                const roleOptions = (selectedRole) => ['viewer', 'editor', 'owner'].map((role) => {
                    const labels = { viewer: 'Visualizador', editor: 'Editor', owner: 'Proprietário' };
                    return `<option value="${role}"${role === selectedRole ? ' selected' : ''}>${labels[role]}</option>`;
                }).join('');

                const renderEditor = (user, feedbackMessage = '', feedbackType = 'success') => {
                    if (!editorSection) return;
                    selectedUser = user;
                    const active = user.status === 'active';
                    const accesses = Array.isArray(user.appAccesses) ? user.appAccesses : [];
                    const accessesHtml = accesses.length
                        ? accesses.map((access) => `
                            <div class="border rounded-3 p-3" data-app-access data-app-key="${encodeValue(access.appKey)}" style="border-color: var(--ms-outline) !important; background: var(--ms-surface-container-low);">
                                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                                    <div>
                                        <div class="text-on-surface fw-semibold">${escapeHtml(access.appKey)}</div>
                                        <div class="small text-on-surface-variant">Concedido em ${escapeHtml(formatDate(access.createdAt, 'data indisponível'))}</div>
                                    </div>
                                    <div class="d-flex flex-wrap align-items-center gap-2">
                                        <select class="form-select form-select-sm cms-input" aria-label="Permissão para ${escapeHtml(access.appKey)}" style="min-width: 150px;">${roleOptions(access.role)}</select>
                                        <button type="button" class="btn btn-sm btn-outline-info" data-access-action="save"><i class="bi bi-check2 me-1"></i>Salvar</button>
                                        <button type="button" class="btn btn-sm btn-outline-danger" data-access-action="revoke"><i class="bi bi-x-lg me-1"></i>Revogar</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')
                        : '<div class="text-on-surface-variant small border rounded-3 p-3" style="border-color: var(--ms-outline) !important;">Nenhuma permissão de aplicação foi concedida.</div>';
                    const statusBadge = active
                        ? '<span class="badge text-bg-success-subtle text-success-emphasis">Ativo</span>'
                        : '<span class="badge text-bg-secondary">Inativo</span>';

                    const installedApps = Array.isArray(user.installedApps) ? user.installedApps : [];
                    const installedKeys = installedApps.map((app) => normalizeAppKey(app.appKey));
                    const installedAppsHtml = installedApps.length
                        ? installedApps.map((app) => `
                            <div class="border rounded-3 p-3" data-installed-app data-app-key="${encodeValue(app.appKey)}" style="border-color: var(--ms-outline) !important; background: var(--ms-surface-container-low);">
                                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                                    <div>
                                        <div class="text-on-surface fw-semibold">${escapeHtml(app.name || app.appKey)}</div>
                                        <div class="small text-on-surface-variant">${escapeHtml(app.appKey)} <span class="opacity-50 mx-1">|</span> instalado em ${escapeHtml(formatDate(app.createdAt, 'data indisponível'))}</div>
                                    </div>
                                    <button type="button" class="btn btn-sm btn-outline-danger" data-installed-app-action="remove"><i class="bi bi-trash me-1"></i>Remover</button>
                                </div>
                            </div>
                        `).join('')
                        : '<div class="text-on-surface-variant small border rounded-3 p-3" style="border-color: var(--ms-outline) !important;">Nenhum app instalado nesta conta.</div>';

                    editorSection.hidden = false;
                    editorSection.innerHTML = `
                        <div class="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 mb-4">
                            <div>
                                <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                                    <h5 class="text-on-surface fw-semibold mb-0">Gerenciar ${escapeHtml(user.name || 'usuário')}</h5>
                                    ${statusBadge}
                                </div>
                                <p class="text-on-surface-variant small mb-0">${escapeHtml(user.email || '')} <span class="opacity-50 mx-1">|</span> último acesso: ${escapeHtml(formatDate(user.lastLogin))}</p>
                            </div>
                            <button id="app-user-editor-close" type="button" class="btn btn-sm btn-outline-light"><i class="bi bi-x-lg me-1"></i>Fechar</button>
                        </div>
                        <div id="app-user-editor-feedback" class="small mb-3" role="status" aria-live="polite" hidden></div>
                        <form id="app-user-editor-form" class="row g-3" novalidate>
                            <div class="col-md-6">
                                <label class="form-label text-on-surface mb-2" for="app-user-edit-name">Nome completo</label>
                                <input id="app-user-edit-name" type="text" class="form-control cms-input" maxlength="120" autocomplete="name" value="${escapeHtml(user.name || '')}" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-on-surface mb-2" for="app-user-edit-email">E-mail</label>
                                <input id="app-user-edit-email" type="email" class="form-control cms-input" maxlength="254" autocomplete="email" value="${escapeHtml(user.email || '')}" required>
                            </div>
                            <div class="col-md-8">
                                <label class="form-label text-on-surface mb-2" for="app-user-edit-password">Nova senha <span class="text-on-surface-variant fw-normal">(opcional)</span></label>
                                <input id="app-user-edit-password" type="password" class="form-control cms-input" minlength="12" maxlength="128" autocomplete="new-password" aria-describedby="app-user-edit-password-help">
                                <div id="app-user-edit-password-help" class="form-text text-on-surface-variant small mt-2">Preencha somente para trocar a senha. Qualquer atualização encerra as sessões existentes.</div>
                            </div>
                            <div class="col-md-4 d-flex align-items-end">
                                <button id="app-user-edit-submit" type="submit" class="btn cms-btn-primary w-100"><i class="bi bi-save me-2"></i>Salvar perfil</button>
                            </div>
                        </form>
                        <hr class="border-secondary opacity-25 my-4">
                        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
                            <div>
                                <h6 class="text-on-surface fw-semibold mb-1">Apps instalados</h6>
                                <p class="text-on-surface-variant small mb-0">Controla o que aparece em "Meus Aplicativos" no painel do usuário. Independente das permissões abaixo.</p>
                            </div>
                        </div>
                        ${active ? `
                            <form id="app-user-install-form" class="row g-3 mb-3" novalidate>
                                <div class="col-md-8">
                                    <label class="form-label text-on-surface mb-2" for="app-user-install-key">App do catálogo</label>
                                    <select id="app-user-install-key" class="form-select cms-input" required>${catalogAppOptions(installedKeys)}</select>
                                </div>
                                <div class="col-md-4 d-flex align-items-end">
                                    <button id="app-user-install-submit" type="submit" class="btn btn-outline-info w-100"><i class="bi bi-plus-lg me-1"></i>Instalar</button>
                                </div>
                            </form>
                        ` : `
                            <div class="alert cms-alert small mb-3"><i class="bi bi-lock me-2 text-warning"></i>Reative a conta antes de instalar novos apps.</div>
                        `}
                        <div id="app-user-installed-list" class="d-flex flex-column gap-2">${installedAppsHtml}</div>
                        <hr class="border-secondary opacity-25 my-4">
                        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
                            <div>
                                <h6 class="text-on-surface fw-semibold mb-1">Permissões por aplicação</h6>
                                <p class="text-on-surface-variant small mb-0">Apenas estas permissões determinam o acesso aos produtos.</p>
                            </div>
                        </div>
                        ${active ? `
                            <form id="app-user-access-form" class="row g-3 mb-3" novalidate>
                                <div class="col-md-6">
                                    <label class="form-label text-on-surface mb-2" for="app-user-access-key">Aplicação</label>
                                    <input id="app-user-access-key" type="text" class="form-control cms-input" list="app-user-app-options" autocomplete="off" pattern="[a-z0-9][a-z0-9-]{0,63}" placeholder="Ex.: bva" required>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label text-on-surface mb-2" for="app-user-access-role">Permissão</label>
                                    <select id="app-user-access-role" class="form-select cms-input">${roleOptions('viewer')}</select>
                                </div>
                                <div class="col-md-3 d-flex align-items-end">
                                    <button id="app-user-access-submit" type="submit" class="btn btn-outline-info w-100"><i class="bi bi-plus-lg me-1"></i>Conceder</button>
                                </div>
                            </form>
                        ` : `
                            <div class="alert cms-alert small mb-3"><i class="bi bi-lock me-2 text-warning"></i>Reative a conta antes de conceder permissões. Nenhum acesso anterior será restaurado.</div>
                        `}
                        <div id="app-user-access-list" class="d-flex flex-column gap-2">${accessesHtml}</div>
                        <hr class="border-secondary opacity-25 my-4">
                        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                            <p class="text-on-surface-variant small mb-0">A exclusão é lógica para preservar auditoria e impedir reutilização indevida da conta.</p>
                            ${active
                                ? '<button id="app-user-deactivate" type="button" class="btn btn-outline-danger"><i class="bi bi-person-x me-2"></i>Desativar e revogar acessos</button>'
                                : '<button id="app-user-reactivate" type="button" class="btn btn-outline-info"><i class="bi bi-person-check me-2"></i>Reativar sem acessos</button>'}
                        </div>
                    `;

                    const editorFeedback = getUserElement('app-user-editor-feedback');
                    if (feedbackMessage) setFeedback(editorFeedback, feedbackMessage, feedbackType);
                    bindEditorEvents();
                };

                const loadManagedUser = async (userId, feedbackMessage = '', feedbackType = 'success') => {
                    if (!editorSection || !userId) return;
                    editorSection.hidden = false;
                    editorSection.innerHTML = '<div class="text-center py-4 text-on-surface-variant"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Carregando dados do usuário...</div>';
                    try {
                        const [userResponse, appsResponse] = await Promise.all([
                            callUserApi(`/auth/admin/users/${encodeURIComponent(userId)}`),
                            callUserApi(`/auth/admin/users/${encodeURIComponent(userId)}/apps`).catch(() => ({ data: [] })),
                            catalogAppsCache.length ? Promise.resolve() : loadCatalogApps(),
                        ]);
                        if (!container.contains(editorSection)) return;
                        const user = { ...userResponse.user, installedApps: Array.isArray(appsResponse.data) ? appsResponse.data : [] };
                        renderEditor(user, feedbackMessage, feedbackType);
                    } catch (error) {
                        if (container.contains(editorSection)) {
                            editorSection.innerHTML = `<div class="text-danger">${escapeHtml(getErrorMessage(error, 'Não foi possível carregar este usuário.'))}</div>`;
                        }
                    }
                };

                const bindEditorEvents = () => {
                    const closeButton = getUserElement('app-user-editor-close');
                    const profileForm = getUserElement('app-user-editor-form');
                    const profileName = getUserElement('app-user-edit-name');
                    const profileEmail = getUserElement('app-user-edit-email');
                    const profilePassword = getUserElement('app-user-edit-password');
                    const profileButton = getUserElement('app-user-edit-submit');
                    const editorFeedback = getUserElement('app-user-editor-feedback');
                    const accessForm = getUserElement('app-user-access-form');
                    const accessKey = getUserElement('app-user-access-key');
                    const accessRole = getUserElement('app-user-access-role');
                    const accessButton = getUserElement('app-user-access-submit');
                    const accessList = getUserElement('app-user-access-list');
                    const installForm = getUserElement('app-user-install-form');
                    const installKey = getUserElement('app-user-install-key');
                    const installButton = getUserElement('app-user-install-submit');
                    const installedList = getUserElement('app-user-installed-list');
                    const deactivateButton = getUserElement('app-user-deactivate');
                    const reactivateButton = getUserElement('app-user-reactivate');

                    if (closeButton) {
                        closeButton.addEventListener('click', () => {
                            selectedUser = null;
                            editorSection.hidden = true;
                            editorSection.replaceChildren();
                        });
                    }

                    if (profileForm && profileName && profileEmail && profilePassword && profileButton) {
                        profileForm.addEventListener('submit', async (event) => {
                            event.preventDefault();
                            if (!selectedUser) return;
                            if (!profileForm.checkValidity()) {
                                profileForm.reportValidity();
                                return;
                            }
                            const name = profileName.value.trim();
                            const email = profileEmail.value.trim();
                            const password = profilePassword.value;
                            if (name === selectedUser.name && email.toLowerCase() === String(selectedUser.email || '').toLowerCase() && !password) {
                                setFeedback(editorFeedback, 'Nenhuma alteração de perfil foi informada.', 'info');
                                return;
                            }
                            const restoreButton = setButtonBusy(profileButton, 'Salvando...');
                            try {
                                const payload = { name, email };
                                if (password) payload.password = password;
                                const response = await callUserApi(`/auth/admin/users/${encodeURIComponent(selectedUser.id)}`, 'PUT', payload);
                                await refreshUsers();
                                renderEditor(response.user, 'Perfil atualizado e sessões anteriores invalidadas.', 'success');
                            } catch (error) {
                                setFeedback(editorFeedback, getErrorMessage(error, 'Não foi possível atualizar o usuário.'), 'error');
                            } finally {
                                restoreButton();
                            }
                        });
                    }

                    if (accessKey) {
                        accessKey.addEventListener('change', () => {
                            accessKey.value = normalizeAppKey(accessKey.value);
                        });
                    }

                    if (accessForm && accessKey && accessRole && accessButton) {
                        accessForm.addEventListener('submit', async (event) => {
                            event.preventDefault();
                            if (!selectedUser) return;
                            accessKey.value = normalizeAppKey(accessKey.value);
                            if (!accessForm.checkValidity()) {
                                accessForm.reportValidity();
                                return;
                            }
                            const restoreButton = setButtonBusy(accessButton, 'Concedendo...');
                            try {
                                await callUserApi(`/auth/admin/users/${encodeURIComponent(selectedUser.id)}/access/${encodeURIComponent(accessKey.value)}`, 'PUT', { role: accessRole.value });
                                await loadManagedUser(selectedUser.id, 'Permissão atualizada.', 'success');
                                await loadApplicationSuggestions();
                                await refreshUsers();
                            } catch (error) {
                                setFeedback(editorFeedback, getErrorMessage(error, 'Não foi possível conceder o acesso.'), 'error');
                            } finally {
                                restoreButton();
                            }
                        });
                    }

                    if (accessList) {
                        accessList.addEventListener('click', async (event) => {
                            const button = event.target.closest('button[data-access-action]');
                            const accessRow = button && button.closest('[data-app-access]');
                            if (!button || !accessRow || !selectedUser) return;
                            const appKey = decodeValue(accessRow.dataset.appKey);
                            if (!appKey) return;
                            const action = button.dataset.accessAction;
                            const select = accessRow.querySelector('select');
                            if (action === 'revoke' && !window.confirm(`Revogar o acesso de ${selectedUser.email} à aplicação ${appKey}?`)) return;
                            const restoreButton = setButtonBusy(button, action === 'revoke' ? 'Revogando...' : 'Salvando...');
                            try {
                                if (action === 'revoke') {
                                    await callUserApi(`/auth/admin/users/${encodeURIComponent(selectedUser.id)}/access/${encodeURIComponent(appKey)}`, 'DELETE');
                                } else {
                                    await callUserApi(`/auth/admin/users/${encodeURIComponent(selectedUser.id)}/access/${encodeURIComponent(appKey)}`, 'PUT', { role: select ? select.value : 'viewer' });
                                }
                                await loadManagedUser(selectedUser.id, action === 'revoke' ? 'Acesso revogado.' : 'Permissão atualizada.', 'success');
                                await loadApplicationSuggestions();
                                await refreshUsers();
                            } catch (error) {
                                setFeedback(editorFeedback, getErrorMessage(error, 'Não foi possível atualizar o acesso.'), 'error');
                            } finally {
                                restoreButton();
                            }
                        });
                    }

                    if (installForm && installKey && installButton) {
                        installForm.addEventListener('submit', async (event) => {
                            event.preventDefault();
                            if (!selectedUser) return;
                            if (!installKey.value) {
                                setFeedback(editorFeedback, 'Selecione um app do catálogo para instalar.', 'error');
                                return;
                            }
                            const restoreButton = setButtonBusy(installButton, 'Instalando...');
                            try {
                                await callUserApi(`/auth/admin/users/${encodeURIComponent(selectedUser.id)}/apps/${encodeURIComponent(installKey.value)}`, 'PUT');
                                await loadManagedUser(selectedUser.id, 'App instalado.', 'success');
                                await refreshUsers();
                            } catch (error) {
                                setFeedback(editorFeedback, getErrorMessage(error, 'Não foi possível instalar o app.'), 'error');
                            } finally {
                                restoreButton();
                            }
                        });
                    }

                    if (installedList) {
                        installedList.addEventListener('click', async (event) => {
                            const button = event.target.closest('button[data-installed-app-action="remove"]');
                            const appRow = button && button.closest('[data-installed-app]');
                            if (!button || !appRow || !selectedUser) return;
                            const appKey = decodeValue(appRow.dataset.appKey);
                            if (!appKey) return;
                            if (!window.confirm(`Remover o app ${appKey} da conta de ${selectedUser.email}?`)) return;
                            const restoreButton = setButtonBusy(button, 'Removendo...');
                            try {
                                await callUserApi(`/auth/admin/users/${encodeURIComponent(selectedUser.id)}/apps/${encodeURIComponent(appKey)}`, 'DELETE');
                                await loadManagedUser(selectedUser.id, 'App removido.', 'success');
                                await refreshUsers();
                            } catch (error) {
                                setFeedback(editorFeedback, getErrorMessage(error, 'Não foi possível remover o app.'), 'error');
                            } finally {
                                restoreButton();
                            }
                        });
                    }

                    if (deactivateButton) {
                        deactivateButton.addEventListener('click', async () => {
                            if (!selectedUser || !window.confirm(`Desativar ${selectedUser.email} e revogar todos os acessos às aplicações?`)) return;
                            const restoreButton = setButtonBusy(deactivateButton, 'Desativando...');
                            try {
                                await callUserApi(`/auth/admin/users/${encodeURIComponent(selectedUser.id)}`, 'DELETE');
                                selectedUser = null;
                                editorSection.hidden = true;
                                editorSection.replaceChildren();
                                await refreshUsers();
                                await loadApplicationSuggestions();
                            } catch (error) {
                                setFeedback(editorFeedback, getErrorMessage(error, 'Não foi possível desativar o usuário.'), 'error');
                            } finally {
                                restoreButton();
                            }
                        });
                    }

                    if (reactivateButton) {
                        reactivateButton.addEventListener('click', async () => {
                            if (!selectedUser || !window.confirm(`Reativar ${selectedUser.email} sem restaurar nenhuma permissão anterior?`)) return;
                            const restoreButton = setButtonBusy(reactivateButton, 'Reativando...');
                            try {
                                await callUserApi(`/auth/admin/users/${encodeURIComponent(selectedUser.id)}/reactivate`, 'POST');
                                await loadManagedUser(selectedUser.id, 'Usuário reativado sem acessos. Conceda somente as permissões necessárias.', 'success');
                                await refreshUsers();
                                await loadApplicationSuggestions();
                            } catch (error) {
                                setFeedback(editorFeedback, getErrorMessage(error, 'Não foi possível reativar o usuário.'), 'error');
                            } finally {
                                restoreButton();
                            }
                        });
                    }
                };

                if (appKeyInput) {
                    appKeyInput.addEventListener('change', () => {
                        appKeyInput.value = normalizeAppKey(appKeyInput.value);
                    });
                }

                if (createForm && nameInput && emailInput && passwordInput && appKeyInput && appRoleInput && createButton) {
                    createForm.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        appKeyInput.value = normalizeAppKey(appKeyInput.value);
                        if (!createForm.checkValidity()) {
                            createForm.reportValidity();
                            return;
                        }
                        const restoreButton = setButtonBusy(createButton, 'Criando...');
                        if (createFeedback) createFeedback.hidden = true;
                        try {
                            await callUserApi('/auth/admin/users', 'POST', {
                                name: nameInput.value.trim(),
                                email: emailInput.value.trim(),
                                password: passwordInput.value,
                                appKey: appKeyInput.value,
                                appRole: appRoleInput.value,
                            });
                            createForm.reset();
                            setFeedback(createFeedback, 'Usuário criado e acesso concedido com sucesso.', 'success');
                            nameInput.focus();
                            await loadApplicationSuggestions();
                            await refreshUsers();
                        } catch (error) {
                            setFeedback(createFeedback, getErrorMessage(error, 'Não foi possível criar o usuário.'), 'error');
                        } finally {
                            restoreButton();
                        }
                    });
                }

                if (searchForm) {
                    searchForm.addEventListener('submit', async (event) => {
                        event.preventDefault();
                        await refreshUsers();
                    });
                }
                if (refreshButton) refreshButton.addEventListener('click', refreshUsers);
                if (userList) {
                    userList.addEventListener('click', async (event) => {
                        const button = event.target.closest('button[data-user-action="edit"]');
                        if (!button) return;
                        await loadManagedUser(decodeValue(button.dataset.userId));
                    });
                }

                loadApplicationSuggestions();
                loadCatalogApps();
                refreshUsers();
};
