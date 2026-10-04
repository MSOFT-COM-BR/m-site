window.consoleViews = window.consoleViews || Object.create(null);
window.consoleViews.mjson = async function ({ container, auth }) {
                container.innerHTML = `
                    <h4 class="mb-4 text-on-surface fw-bold fs-3">MJSON</h4>
                    <div class="alert cms-alert mb-4">
                        <i class="bi bi-database me-2 text-info"></i> Salve JSONs reutilizáveis para qualquer parte do site.
                    </div>
                    <form id="mjson-form" class="row g-3">
                        <div class="col-md-8">
                            <label class="form-label text-on-surface mb-2">Chave do JSON</label>
                            <input id="mjson-key" type="text" class="form-control cms-input" placeholder="ex: home.hero, pricing.table, faq.global" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-on-surface mb-2">Descrição</label>
                            <input id="mjson-description" type="text" class="form-control cms-input" placeholder="Opcional">
                        </div>
                        <div class="col-12">
                            <label class="form-label text-on-surface mb-2">Conteúdo JSON</label>
                            <textarea id="mjson-data" class="form-control cms-input font-monospace" rows="12" spellcheck="false" placeholder='{"title":"Exemplo","items":[1,2,3]}' required></textarea>
                        </div>
                        <div class="col-12 d-flex flex-wrap gap-2">
                            <button type="button" class="btn cms-btn-primary" onclick="saveMjson()">
                                <i class="bi bi-save me-2"></i>Salvar MJSON
                            </button>
                            <button type="button" class="btn btn-outline-light" onclick="loadMjsonByKey()">
                                <i class="bi bi-search me-2"></i>Carregar por chave
                            </button>
                        </div>
                    </form>
                    <div class="mt-4">
                        <h6 class="text-on-surface mb-3">Chaves recentes</h6>
                        <div id="mjson-list" class="small text-on-surface-variant"></div>
                    </div>
                `;
                window.saveMjson = async function () {
                    const keyEl = document.getElementById('mjson-key');
                    const descriptionEl = document.getElementById('mjson-description');
                    const dataEl = document.getElementById('mjson-data');
                    if (!keyEl || !dataEl) return;

                    const key = String(keyEl.value || '').trim();
                    const description = descriptionEl ? String(descriptionEl.value || '').trim() : '';
                    const raw = String(dataEl.value || '').trim();

                    if (!key || !raw) {
                        window.core.toast('Informe chave e JSON.', 'warning');
                        return;
                    }

                    let parsed;
                    try {
                        parsed = JSON.parse(raw);
                    } catch (_error) {
                        window.core.toast('JSON inválido.', 'error');
                        return;
                    }

                    try {
                        const res = await window.core.fetchAPI('/mjson', 'POST', { key, description, data: parsed });
                        if (res && res.success) {
                            window.core.toast('MJSON salvo com sucesso.', 'success');
                            refreshMjsonList();
                        } else {
                            window.core.toast(res && res.error ? res.error : 'Erro ao salvar MJSON.', 'error');
                        }
                    } catch (_error) {
                        window.core.toast('Falha de conexão ao salvar MJSON.', 'error');
                    }
                };

                window.loadMjsonByKey = async function () {
                    const keyEl = document.getElementById('mjson-key');
                    const dataEl = document.getElementById('mjson-data');
                    const descriptionEl = document.getElementById('mjson-description');
                    if (!keyEl || !dataEl) return;
                    const key = String(keyEl.value || '').trim();
                    if (!key) {
                        window.core.toast('Informe a chave para carregar.', 'warning');
                        return;
                    }
                    try {
                        const res = await window.core.fetchAPI('/mjson/' + encodeURIComponent(key));
                        if (res && res.success && res.data) {
                            dataEl.value = JSON.stringify(res.data.data || {}, null, 2);
                            if (descriptionEl) descriptionEl.value = res.data.description || '';
                            window.core.toast('MJSON carregado.', 'success');
                        } else {
                            window.core.toast('Chave não encontrada.', 'warning');
                        }
                    } catch (_error) {
                        window.core.toast('Falha ao carregar MJSON.', 'error');
                    }
                };

                const refreshMjsonList = async () => {
                    const listEl = document.getElementById('mjson-list');
                    if (!listEl) return;
                    try {
                        const res = await window.core.fetchAPI('/mjson');
                        if (res && res.success && Array.isArray(res.data) && res.data.length) {
                            listEl.innerHTML = res.data.slice(0, 20).map((item) => {
                                const key = String(item.key || '');
                                const updatedAt = item.updatedAt ? new Date(item.updatedAt).toLocaleString('pt-BR') : '-';
                                return `<div class="mb-2"><button class="btn btn-sm btn-outline-light me-2" onclick="document.getElementById('mjson-key').value='${key.replace(/'/g, "\\'")}'; loadMjsonByKey();">${key}</button><span class="text-on-surface-variant">${updatedAt}</span></div>`;
                            }).join('');
                        } else {
                            listEl.innerHTML = '<span class="text-on-surface-variant">Nenhum MJSON salvo.</span>';
                        }
                    } catch (_error) {
                        listEl.innerHTML = '<span class="text-danger">Erro ao carregar lista de MJSON.</span>';
                    }
                };

                refreshMjsonList();
};
