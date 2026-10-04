window.consoleViews = window.consoleViews || Object.create(null);
window.consoleViews.blog = async function ({ container, auth }) {
                const route = window.location.pathname.replace(/\/$/, '');
                const editorRoute = route === '/console/conteudo/blog/novo' || /\/console\/conteudo\/blog\/[a-zA-Z0-9-]{1,64}\/editar$/.test(route);
                const editingId = route.match(/^\/console\/conteudo\/blog\/([a-zA-Z0-9-]{1,64})\/editar$/)?.[1] || '';
                let isDirty = false;
                function escapeHtmlAttr(s) {
                    return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
                }
                const blogUser = window.authService && window.authService.getUser();
                const blogLoggedAuthor = (blogUser && String(blogUser.name || blogUser.email || '').trim()) || '';

                container.innerHTML = `
                    <div id="blog-list-screen" ${editorRoute ? 'hidden style="display:none"' : ''}>
                    <div class="cms-section-header">
                        <div><h2 class="cms-title">Artigos</h2><p>Organize suas publicações e acompanhe o alcance do blog.</p></div>
                        <div class="cms-actions">
                            <a href="/blog" target="_blank" rel="noopener" class="btn btn-outline-light">Ver blog <i class="bi bi-box-arrow-up-right ms-1" aria-hidden="true"></i></a>
                            <a href="/console/conteudo/blog/novo" class="btn cms-btn-primary"><i class="bi bi-plus-lg me-2" aria-hidden="true"></i>Escrever artigo</a>
                        </div>
                    </div>
                    <dl class="cms-stats" aria-label="Resumo dos artigos">
                        ${[['total', 'journal-text', 'Total de artigos'], ['published', 'check2-circle', 'Publicados'], ['drafts', 'file-earmark', 'Rascunhos'], ['views', 'eye', 'Visualizações']].map(([id, icon, label]) => `<div class="cms-stat"><dt><i class="bi bi-${icon}" aria-hidden="true"></i>${label}</dt><dd id="blog-stat-${id}">—</dd></div>`).join('')}
                    </dl>
                    <div class="cms-filter-panel">
                        <div class="cms-filters">
                            <div><label for="blog-search">Buscar artigos</label><input type="search" id="blog-search" class="form-control cms-input" placeholder="Título, autor ou endereço do artigo"></div>
                            <div><label for="blog-status-filter">Status</label><select id="blog-status-filter" class="form-select cms-input"><option value="all">Todos os status</option><option value="published">Publicados</option><option value="draft">Rascunhos</option></select></div>
                            <div><label for="blog-category-filter">Categoria</label><select id="blog-category-filter" class="form-select cms-input"><option value="">Todas as categorias</option></select></div>
                            <div><label for="blog-sort">Ordenar por</label><select id="blog-sort" class="form-select cms-input"><option value="recent">Mais recentes</option><option value="oldest">Mais antigos</option><option value="views">Mais visualizados</option><option value="title">Título (A–Z)</option></select></div>
                        </div>
                        <div class="cms-results-bar"><span id="blog-result-count" role="status" aria-live="polite">Carregando artigos…</span><div class="cms-actions"><button type="button" id="blog-clear-filters" class="btn btn-outline-light btn-sm">Limpar filtros</button><button type="button" id="blog-refresh" class="btn btn-outline-light btn-sm"><i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>Atualizar</button></div></div>
                    </div>
                    <div id="blog-list-container" class="mt-3" aria-busy="true"></div>
                    <nav id="blog-pagination" class="cms-pagination" aria-label="Paginação de artigos" hidden></nav>

                    </div>
                    <div id="blog-form-container" style="display: ${editorRoute ? 'block' : 'none'};" class="cms-article-editor pt-3">
                        <div class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
                            <div><a href="/console/conteudo/blog" class="text-decoration-none text-on-surface-variant small"><i class="bi bi-arrow-left me-1"></i> Voltar aos artigos</a><h2 class="cms-title mt-2 mb-1" id="blog-editor-heading">${editingId ? 'Editar artigo' : 'Escrever artigo'}</h2><p class="text-on-surface-variant mb-0">Prepare o conteúdo, escolha a publicação e posicione anúncios entre os blocos.</p></div>
                            <span class="cms-status" id="blog-editor-status">Rascunho</span>
                        </div>
                        <h5 class="text-on-surface mb-4 fw-bold fs-4"><i class="bi bi-journal-plus text-info me-2"></i> Estúdio do Artigo</h5>
                        <div id="blog-editor-load-error" class="alert cms-alert" role="alert" hidden></div>
                        <form id="new-blog-form" class="row g-4">
                            <input type="hidden" id="blog-id" name="id">
                            <div class="col-md-6">
                                <label class="form-label text-on-surface mb-2">Título do Artigo</label>
                                <input type="text" class="form-control cms-input" id="blog-title" placeholder="Digite uma chamada impactante..." oninput="window.generateSlug(this.value)" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label text-on-surface mb-2">Slug (URL SEO-friendly)</label>
                                <input type="text" class="form-control cms-input" id="blog-slug" placeholder="ex: dicas-de-tecnologia-2026" required aria-describedby="blog-slug-hint">
                                <div id="blog-slug-hint" class="form-text text-on-surface-variant small mt-1 d-none" data-slug-hint>Novo artigo: preenchido automaticamente pelo título.</div>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label text-on-surface mb-2" for="blog-author-select">Nome do Autor</label>
                                <select class="form-select cms-input" id="blog-author-select" required>
                                    <option value="Anônimo">Anônimo</option>
                                    ${blogLoggedAuthor
                                        ? `<option value="${escapeHtmlAttr(blogLoggedAuthor)}" selected>${escapeHtmlAttr(blogLoggedAuthor)} — conta logada</option>`
                                        : ''}
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label text-on-surface mb-2" for="blog-category">Área / Categoria</label>
                                <div class="d-flex gap-2">
                                    <select class="form-select cms-input" id="blog-category" name="categories" multiple size="5" aria-describedby="blog-category-hint" style="flex: 1;">
                                    </select>
                                    <div class="d-flex flex-column gap-2">
                                        <button type="button" class="btn btn-outline-info" onclick="window.addDynamicBlogCategory()" title="Adicionar Nova Categoria"><i class="bi bi-plus-lg"></i></button>
                                        <button type="button" class="btn btn-outline-light" onclick="window.toggleBlogCategoryManager()" title="Gerenciar Categorias"><i class="bi bi-gear"></i></button>
                                    </div>
                                </div>
                                <div id="blog-category-manager" class="border rounded-3 p-2 mt-2" style="border-color: var(--ms-outline-variant) !important; background: var(--ms-surface-container);" hidden>
                                    <div id="blog-category-manager-list" class="d-flex flex-column gap-1"></div>
                                </div>
                                <div id="blog-category-hint" class="form-text text-on-surface-variant small mt-1">Segure Ctrl (Windows) ou Cmd (Mac) para selecionar várias.</div>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label text-on-surface mb-2">Visibilidade</label>
                                <div class="form-control cms-input d-flex align-items-center" style="background: var(--ms-surface-container-low) !important;">
                                     <div class="form-check form-switch m-0 pt-0 pb-0">
                                        <input class="form-check-input" type="checkbox" id="blog-published">
                                        <label class="form-check-label text-on-surface ms-1 mb-0" for="blog-published">Ativo ao Público</label>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <label class="form-label text-on-surface mb-2">Tags Livres (Opcional, separadas por vírgula)</label>
                                <input type="text" class="form-control cms-input" id="blog-tags" placeholder="Ex: seo, frontend, inovação">
                            </div>
                            <div class="col-md-12">
                                <label class="form-label text-on-surface mb-2">Capa do Artigo (Link de Imagem) - Opcional</label>
                                <input type="text" class="form-control cms-input" id="blog-imageUrl" placeholder="https:// ... imagem.jpg">
                            </div>
                            <div class="col-md-12 mt-4">
                                <label class="form-label text-on-surface mb-2"><i class="bi bi-body-text me-2"></i> Corpo do Artigo</label>
                                <div class="btn-group mb-3" role="group" aria-label="Modo do editor">
                                    <input type="radio" class="btn-check" name="blog-editor-mode" id="blog-mode-visual" autocomplete="off" checked>
                                    <label class="btn btn-outline-light btn-sm" for="blog-mode-visual">Editor visual</label>
                                    <input type="radio" class="btn-check" name="blog-editor-mode" id="blog-mode-html" autocomplete="off">
                                    <label class="btn btn-outline-light btn-sm" for="blog-mode-html">HTML (anúncios / scripts)</label>
                                </div>
                                <div class="cms-ad-controls mb-3 p-3 rounded-3">
                                    <label for="blog-ad-mode" class="form-label text-on-surface fw-semibold">Anúncios entre os blocos</label>
                                    <div class="d-flex flex-wrap gap-2 align-items-center">
                                        <select id="blog-ad-mode" class="form-select cms-input" style="max-width: 250px"><option value="auto">Automáticos</option><option value="manual">Posições manuais</option><option value="none">Sem anúncios no texto</option></select>
                                        <button type="button" class="btn btn-outline-light" id="blog-insert-ad"><i class="bi bi-plus-circle me-1"></i> Inserir anúncio no cursor</button>
                                        <button type="button" class="btn btn-outline-light" id="blog-remove-ad"><i class="bi bi-dash-circle me-1"></i> Remover último anúncio</button>
                                    </div>
                                    <p class="text-on-surface-variant small mb-0 mt-2" id="blog-ad-help">No modo manual, posicione o cursor entre os parágrafos e insira os espaços desejados. O blog adiciona o anúncio na publicação.</p>
                                </div>
                                <p class="text-on-surface-variant small mb-2 d-none" id="blog-html-mode-hint">Use este modo para colar blocos Google AdSense no meio do texto. Os scripts são executados na página pública do blog.</p>
                                <div id="blog-editor-visual-wrap">
                                    <p id="blog-editor-vendor-feedback" class="alert alert-warning d-none" role="alert"></p>
                                    <div style="box-shadow: 0 5px 15px rgba(0,0,0,0.2); border-radius: 10px;">
                                        <textarea id="blog-editor-container"></textarea>
                                    </div>
                                </div>
                                <div id="blog-editor-html-wrap" class="d-none">
                                    <textarea id="blog-content-html" class="form-control cms-input font-monospace" rows="18" spellcheck="false" placeholder="&lt;p&gt;Parágrafos...&lt;/p&gt;&#10;&lt;script async src=&quot;...googlesyndication...&quot;&gt;&lt;/script&gt;&#10;&lt;ins class=&quot;adsbygoogle&quot;&gt;...&lt;/ins&gt;"></textarea>
                                </div>
                                <input type="hidden" id="blog-content">
                            </div>
                            <div class="col-12 mt-4 text-end">
                                <hr class="border-secondary opacity-25 mb-4">
                                <button type="button" class="btn btn-link text-on-surface-variant text-decoration-none me-3" onclick="hideBlogForm()">Cancelar edição</button>
                                <button type="button" class="btn btn-outline-light" id="blog-save-draft" onclick="saveBlogForm(event, false)"><i class="bi bi-file-earmark me-1"></i> Salvar rascunho</button>
                                <button type="button" class="btn cms-btn-primary" id="blog-save-published" onclick="saveBlogForm(event, true)"><i class="bi bi-check2-circle me-1"></i> Publicar artigo</button>
                            </div>
                        </form>
                    </div>
                `;

                // Funções auxiliares pro Blog — categorias vivem no CRUD /blogs/categories da API
                let blogCategoriesCache = [];

                const fetchBlogCategories = async () => {
                    if (!window.core || typeof window.core.fetchAPI !== 'function') return [];
                    const res = await window.core.fetchAPI('/blogs/categories');
                    if (res && res.success && Array.isArray(res.data)) return res.data;
                    throw new Error((res && res.error) || 'Falha ao buscar categorias.');
                };

                window.loadBlogCategories = async function() {
                    const sel = document.getElementById('blog-category');
                    if (!sel) return;
                    try {
                        blogCategoriesCache = await fetchBlogCategories();
                    } catch(e) {
                        if (!container.isConnected || !container.contains(sel)) return;
                        console.warn('Falha ao buscar categorias do servidor:', e);
                        if (window.core && window.core.toast) window.core.toast('Não foi possível carregar as categorias.', 'error');
                        return;
                    }
                    if (!container.isConnected || !container.contains(sel)) return;

                    // Preserva seleções atuais ao reconstruir as opções
                    const currentSelections = Array.from(sel.selectedOptions).map((o) => o.value).filter(Boolean);

                    sel.innerHTML = '';
                    blogCategoriesCache.forEach(cat => {
                        const opt = document.createElement('option');
                        opt.value = cat.name;
                        opt.textContent = cat.name;
                        if (currentSelections.includes(cat.name)) opt.selected = true;
                        sel.appendChild(opt);
                    });
                };

                window.addDynamicBlogCategory = async function() {
                    const cat = prompt('Digite o nome da nova categoria:');
                    if (!cat || !cat.trim()) return;
                    const newCat = cat.trim();

                    try {
                        const saveRes = await window.core.fetchAPI('/blogs/categories', 'POST', { name: newCat });
                        if (!saveRes || !saveRes.success) {
                            const message = (saveRes && saveRes.error) || 'Erro ao salvar no servidor.';
                            if (window.core && window.core.toast) window.core.toast(message, 'error');
                            return;
                        }
                        if (window.core && window.core.toast) window.core.toast('Categoria salva no servidor.', 'success');
                    } catch(e) {
                        if (window.core && window.core.toast) window.core.toast('Falha de rede ao salvar.', 'error');
                        return;
                    }

                    await window.loadBlogCategories();
                    renderBlogCategoryManager();

                    const sel = document.getElementById('blog-category');
                    if (sel) {
                        Array.from(sel.options).forEach(opt => {
                            if (opt.value === newCat) opt.selected = true;
                        });
                    }
                };

                const renderBlogCategoryManager = () => {
                    if (!container.isConnected) return;
                    const list = document.getElementById('blog-category-manager-list');
                    if (!list) return;
                    if (!blogCategoriesCache.length) {
                        list.innerHTML = '<div class="text-on-surface-variant small text-center py-2">Nenhuma categoria cadastrada.</div>';
                        return;
                    }
                    const escapeCat = (value) => String(value ?? '')
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                    list.innerHTML = blogCategoriesCache.map((cat) => `
                        <div class="d-flex align-items-center justify-content-between gap-2 py-1 px-2 rounded-2" style="background: var(--ms-surface-container);">
                            <span class="small text-on-surface text-truncate">${escapeCat(cat.name)}</span>
                            <span class="d-flex gap-1">
                                <button type="button" class="btn btn-sm btn-outline-light py-0 px-1" title="Renomear" onclick="window.renameBlogCategory('${escapeCat(cat._id || cat.id)}')"><i class="bi bi-pencil"></i></button>
                                <button type="button" class="btn btn-sm btn-outline-danger py-0 px-1" title="Excluir" onclick="window.deleteBlogCategory('${escapeCat(cat._id || cat.id)}')"><i class="bi bi-trash"></i></button>
                            </span>
                        </div>
                    `).join('');
                };

                window.toggleBlogCategoryManager = async function() {
                    const panel = document.getElementById('blog-category-manager');
                    if (!panel) return;
                    panel.hidden = !panel.hidden;
                    if (!panel.hidden) {
                        await window.loadBlogCategories();
                        renderBlogCategoryManager();
                    }
                };

                window.renameBlogCategory = async function(id) {
                    const current = blogCategoriesCache.find((cat) => String(cat._id || cat.id) === String(id));
                    if (!current) return;
                    const renamed = prompt('Novo nome da categoria:', current.name);
                    if (!renamed || !renamed.trim() || renamed.trim() === current.name) return;
                    try {
                        const res = await window.core.fetchAPI(`/blogs/categories/${encodeURIComponent(id)}`, 'PUT', { name: renamed.trim() });
                        if (!res || !res.success) {
                            if (window.core && window.core.toast) window.core.toast((res && res.error) || 'Erro ao renomear.', 'error');
                            return;
                        }
                        if (window.core && window.core.toast) window.core.toast('Categoria renomeada.', 'success');
                    } catch(e) {
                        if (window.core && window.core.toast) window.core.toast('Falha de rede ao renomear.', 'error');
                        return;
                    }
                    await window.loadBlogCategories();
                    renderBlogCategoryManager();
                };

                window.deleteBlogCategory = async function(id) {
                    const current = blogCategoriesCache.find((cat) => String(cat._id || cat.id) === String(id));
                    if (!current) return;
                    if (!window.confirm(`Excluir a categoria "${current.name}"? Posts que já a utilizam manterão o texto salvo.`)) return;
                    try {
                        const res = await window.core.fetchAPI(`/blogs/categories/${encodeURIComponent(id)}`, 'DELETE');
                        if (!res || !res.success) {
                            if (window.core && window.core.toast) window.core.toast((res && res.error) || 'Erro ao excluir.', 'error');
                            return;
                        }
                        if (window.core && window.core.toast) window.core.toast('Categoria excluída.', 'success');
                    } catch(e) {
                        if (window.core && window.core.toast) window.core.toast('Falha de rede ao excluir.', 'error');
                        return;
                    }
                    await window.loadBlogCategories();
                    renderBlogCategoryManager();
                };

                // Inicializar categorias dinâmicas agora
                setTimeout(window.loadBlogCategories, 50);

                function getBlogCategorySelections() {
                    const sel = document.getElementById('blog-category');
                    if (!sel) return [];
                    return Array.from(sel.selectedOptions).map((o) => o.value).filter(Boolean);
                }
                function setBlogCategorySelections(values) {
                    const sel = document.getElementById('blog-category');
                    if (!sel) return;
                    let arr = [];
                    if (Array.isArray(values)) arr = values.filter(Boolean);
                    else if (values && typeof values === 'string') arr = values.split(',').map((s) => s.trim()).filter(Boolean);
                    Array.from(sel.options).forEach((opt) => {
                        opt.selected = arr.includes(opt.value);
                    });
                }

                function getLoggedAuthorDisplayName() {
                    const u = window.authService && window.authService.getUser();
                    if (!u) return '';
                    return String(u.name || u.email || '').trim();
                }

                function clearEphemeralAuthorOptions() {
                    const sel = document.getElementById('blog-author-select');
                    if (!sel) return;
                    sel.querySelectorAll('option[data-ephemeral="1"]').forEach((o) => o.remove());
                }

                function applyDefaultBlogAuthor() {
                    const sel = document.getElementById('blog-author-select');
                    if (!sel) return;
                    const name = getLoggedAuthorDisplayName();
                    if (name && Array.from(sel.options).some((o) => o.value === name)) {
                        sel.value = name;
                    } else {
                        sel.value = 'Anônimo';
                    }
                }

                function setBlogAuthorValue(authorStr) {
                    const sel = document.getElementById('blog-author-select');
                    if (!sel) return;
                    const a = (authorStr || '').trim();
                    if (!a) {
                        applyDefaultBlogAuthor();
                        return;
                    }
                    if (!Array.from(sel.options).some((o) => o.value === a)) {
                        const o = document.createElement('option');
                        o.value = a;
                        o.textContent = a + ' (no artigo)';
                        o.setAttribute('data-ephemeral', '1');
                        sel.appendChild(o);
                    }
                    sel.value = a;
                }

                window.slugifyTitle = function (text) {
                    return String(text || '')
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');
                };

                function setBlogSlugMode(isCreate) {
                    const slugEl = document.getElementById('blog-slug');
                    const hint = document.querySelector('[data-slug-hint]');
                    if (!slugEl) return;
                    slugEl.readOnly = !!isCreate;
                    if (hint) hint.classList.toggle('d-none', !isCreate);
                }

                window.generateSlug = function (text) {
                    if (document.getElementById('blog-id').value) return;
                    document.getElementById('blog-slug').value = window.slugifyTitle(text);
                };

                function blogContentNeedsRawHtml(html) {
                    if (!html || typeof html !== 'string') return false;
                    const h = html.toLowerCase();
                    return (
                        h.includes('<script') ||
                        h.includes('adsbygoogle') ||
                        h.includes('googlesyndication') ||
                        h.includes('doubleclick') ||
                        h.includes('pagead2') ||
                        (h.includes('<iframe') && (h.includes('goog') || h.includes('doubleclick')))
                    );
                }

                function isBlogBodyEmpty(raw) {
                    if (!raw || !String(raw).trim()) return true;
                    const t = String(raw).trim();
                    if (t === '<p><br></p>' || t === '<p></p>' || t === '<br>') return true;
                    if (/<(script|iframe|img|video|ins|audio)[\s>/]/i.test(t)) return false;
                    const d = document.createElement('div');
                    d.innerHTML = raw;
                    d.querySelectorAll('[data-ms-ad-marker]').forEach(marker => marker.remove());
                    const text = (d.textContent || '').replace(/\s/g, '');
                    return text === '';
                }

                function getBlogBodyContent() {
                    const htmlRadio = document.getElementById('blog-mode-html');
                    if (htmlRadio && htmlRadio.checked) {
                        const ta = document.getElementById('blog-content-html');
                        return ta ? String(ta.value).trim() : '';
                    }
                    if (window.summernoteEditor) {
                        document.getElementById('blog-content').value = window.summernoteEditor.root.innerHTML;
                    }
                    return String(document.getElementById('blog-content').value || '').trim();
                }

                const adModePattern = /<!--\s*msoft:inline-ads:(manual|none)\s*-->/i;
                function readAdMode(raw) {
                    const match = String(raw || '').match(adModePattern);
                    return match ? match[1].toLowerCase() : /data-ms-ad-marker/i.test(String(raw || '')) ? 'manual' : 'auto';
                }
                function removeAdMode(raw) {
                    return String(raw || '').replace(adModePattern, '').trim();
                }
                function contentWithAdMode(raw) {
                    const body = removeAdMode(raw);
                    const mode = document.getElementById('blog-ad-mode').value;
                    return mode === 'auto' ? body : `<!-- msoft:inline-ads:${mode} -->\n${body}`;
                }
                function insertAdMarker() {
                    const mode = document.getElementById('blog-ad-mode');
                    mode.value = 'manual';
                    const marker = '<p class="ms-inline-ad-marker" data-ms-ad-marker="inline" contenteditable="false">Publicidade · anúncio nesta posição</p>';
                    const htmlMode = document.getElementById('blog-mode-html').checked;
                    if (!htmlMode && window.summernoteEditor?._editor) {
                        window.summernoteEditor._editor.summernote('pasteHTML', marker);
                    } else {
                        if (!htmlMode) setBlogEditorMode('html');
                        const field = document.getElementById('blog-content-html');
                        const from = field.selectionStart;
                        const to = field.selectionEnd;
                        field.setRangeText(`\n${marker}\n`, from, to, 'end');
                        field.focus();
                    }
                    isDirty = true;
                }
                document.getElementById('blog-insert-ad').addEventListener('click', insertAdMarker);
                document.getElementById('blog-remove-ad').addEventListener('click', () => {
                    if (document.getElementById('blog-mode-html').checked) {
                        const field = document.getElementById('blog-content-html');
                        const matches = [...field.value.matchAll(/<p\b[^>]*data-ms-ad-marker="inline"[^>]*>[\s\S]*?<\/p>/gi)];
                        const last = matches.at(-1);
                        if (last) field.value = field.value.slice(0, last.index) + field.value.slice(last.index + last[0].length);
                    } else {
                        const editable = document.querySelector('#blog-editor-container + .note-editor .note-editable, .note-editor .note-editable');
                        [...(editable?.querySelectorAll('[data-ms-ad-marker="inline"]') || [])].at(-1)?.remove();
                        if (window.summernoteEditor) document.getElementById('blog-content').value = window.summernoteEditor.root.innerHTML;
                    }
                    isDirty = true;
                });

                function setBlogEditorMode(mode) {
                    const visualWrap = document.getElementById('blog-editor-visual-wrap');
                    const htmlWrap = document.getElementById('blog-editor-html-wrap');
                    const hint = document.getElementById('blog-html-mode-hint');
                    const ta = document.getElementById('blog-content-html');
                    if (!visualWrap || !htmlWrap) return;
                    if (mode === 'html') {
                        if (window.summernoteEditor && ta) {
                            ta.value = window.summernoteEditor.root.innerHTML;
                        }
                        visualWrap.classList.add('d-none');
                        htmlWrap.classList.remove('d-none');
                        if (hint) hint.classList.remove('d-none');
                        const vR = document.getElementById('blog-mode-visual');
                        const hR = document.getElementById('blog-mode-html');
                        if (hR) hR.checked = true;
                        if (vR) vR.checked = false;
                    } else {
                        if (ta && ta.value && blogContentNeedsRawHtml(ta.value)) {
                            if (window.core && window.core.toast) {
                                window.core.toast('Conteúdo com anúncios/scripts: permaneça no modo HTML.', 'warning');
                            }
                            const hRadio = document.getElementById('blog-mode-html');
                            if (hRadio) hRadio.checked = true;
                            return;
                        }
                        if (window.summernoteEditor && ta) {
                            window.summernoteEditor.root.innerHTML = ta.value || '<p><br></p>';
                        }
                        const hidden = document.getElementById('blog-content');
                        if (hidden && window.summernoteEditor) {
                            hidden.value = window.summernoteEditor.root.innerHTML;
                        }
                        visualWrap.classList.remove('d-none');
                        htmlWrap.classList.add('d-none');
                        if (hint) hint.classList.add('d-none');
                        const vR2 = document.getElementById('blog-mode-visual');
                        const hR2 = document.getElementById('blog-mode-html');
                        if (vR2) vR2.checked = true;
                        if (hR2) hR2.checked = false;
                    }
                }

                function resetBlogEditorChrome() {
                    const visualRadio = document.getElementById('blog-mode-visual');
                    const htmlRadio = document.getElementById('blog-mode-html');
                    const visualWrap = document.getElementById('blog-editor-visual-wrap');
                    const htmlWrap = document.getElementById('blog-editor-html-wrap');
                    const hint = document.getElementById('blog-html-mode-hint');
                    const ta = document.getElementById('blog-content-html');
                    if (visualRadio) visualRadio.checked = true;
                    if (htmlRadio) htmlRadio.checked = false;
                    if (visualWrap) visualWrap.classList.remove('d-none');
                    if (htmlWrap) htmlWrap.classList.add('d-none');
                    if (hint) hint.classList.add('d-none');
                    if (ta) ta.value = '';
                }

                (function wireBlogEditorModeRadios() {
                    const rv = document.getElementById('blog-mode-visual');
                    const rh = document.getElementById('blog-mode-html');
                    if (rv) {
                        rv.addEventListener('change', () => {
                            if (rv.checked) setBlogEditorMode('visual');
                        });
                    }
                    if (rh) {
                        rh.addEventListener('change', () => {
                            if (rh.checked) setBlogEditorMode('html');
                        });
                    }
                })();

                const listEl = document.getElementById('blog-list-container');
                const countEl = document.getElementById('blog-result-count');
                const paginationEl = document.getElementById('blog-pagination');
                const refreshButton = document.getElementById('blog-refresh');
                const filters = {
                    search: document.getElementById('blog-search'),
                    status: document.getElementById('blog-status-filter'),
                    category: document.getElementById('blog-category-filter'),
                    sort: document.getElementById('blog-sort')
                };
                const pageSize = 10;
                let blogs = [];
                let currentPage = 1;
                let listReady = false;
                let requestId = 0;
                const number = new Intl.NumberFormat('pt-BR');
                const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
                const categoriesOf = blog => Array.isArray(blog.categories) && blog.categories.length ? blog.categories : [blog.category || 'Geral'];
                const viewsOf = blog => Math.max(0, Number(blog.views) || 0);
                const dateOf = blog => Date.parse(blog.createdAt) || 0;
                const escape = escapeHtmlAttr;

                function renderBlogList() {
                    if (!listEl.isConnected || !listReady) return;
                    const query = normalize(filters.search.value.trim());
                    const filtered = blogs.filter(blog => {
                        const matchesSearch = normalize([blog.title, blog.author, blog.slug, ...categoriesOf(blog)].join(' ')).includes(query);
                        const matchesStatus = filters.status.value === 'all' || (filters.status.value === 'published' ? blog.published : !blog.published);
                        return matchesSearch && matchesStatus && (!filters.category.value || categoriesOf(blog).includes(filters.category.value));
                    }).sort((a, b) => {
                        if (filters.sort.value === 'title') return String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR');
                        if (filters.sort.value === 'views') return viewsOf(b) - viewsOf(a);
                        return filters.sort.value === 'oldest' ? dateOf(a) - dateOf(b) : dateOf(b) - dateOf(a);
                    });
                    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
                    currentPage = Math.min(currentPage, pages);
                    const start = (currentPage - 1) * pageSize;
                    countEl.textContent = `${number.format(filtered.length)} de ${number.format(blogs.length)} artigos`;
                    paginationEl.hidden = filtered.length <= pageSize;
                    paginationEl.innerHTML = `<span class="small text-on-surface-variant">Página ${currentPage} de ${pages}</span><div class="cms-actions"><button type="button" class="btn btn-outline-light btn-sm" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>Anterior</button><button type="button" class="btn btn-outline-light btn-sm" data-page="${currentPage + 1}" ${currentPage === pages ? 'disabled' : ''}>Próxima</button></div>`;
                    if (!filtered.length) {
                        listEl.innerHTML = `<div class="cms-empty"><i class="bi bi-${blogs.length ? 'search' : 'journal-plus'}" aria-hidden="true"></i><h3>${blogs.length ? 'Nenhum artigo encontrado' : 'Seu primeiro artigo começa aqui'}</h3><p>${blogs.length ? 'Experimente outro termo ou limpe os filtros.' : 'Crie uma publicação ou salve um rascunho para continuar depois.'}</p><button type="button" class="btn btn-outline-light" data-list-action="${blogs.length ? 'clear' : 'create'}">${blogs.length ? 'Limpar filtros' : 'Escrever artigo'}</button></div>`;
                        return;
                    }
                    listEl.innerHTML = '<div class="d-flex flex-column gap-3">' + filtered.slice(start, start + pageSize).map(blog => {
                        const title = escape(blog.title || 'Sem título');
                        const url = `/blog/${encodeURIComponent(blog.slug || '')}`;
                        const date = dateOf(blog) ? new Date(blog.createdAt).toLocaleDateString('pt-BR') : 'Data não informada';
                        return `<article class="ms-card cms-article p-3 p-md-4">
                            <div class="cms-article-main">
                                <h3 class="fw-semibold">${blog.published && blog.slug ? `<a href="${escape(url)}" target="_blank" rel="noopener" class="text-decoration-none text-on-surface hover-primary">${title}</a>` : title}</h3>
                                <div class="cms-article-meta"><span><i class="bi bi-folder me-1" aria-hidden="true"></i>${escape(categoriesOf(blog).join(', '))}</span><span><i class="bi bi-eye me-1" aria-hidden="true"></i>${number.format(viewsOf(blog))} visualizações</span><span><i class="bi bi-calendar3 me-1" aria-hidden="true"></i>${date}</span>${blog.author ? `<span>${escape(blog.author)}</span>` : ''}</div>
                                <div class="cms-article-slug">/blog/${escape(blog.slug || '')}</div>
                            </div>
                            <div class="cms-article-actions">
                                <span class="cms-status ${blog.published ? 'cms-status-published' : ''}"><i class="bi bi-${blog.published ? 'check2-circle' : 'file-earmark'}" aria-hidden="true"></i>${blog.published ? 'Publicado' : 'Rascunho'}</span>
                                <button type="button" class="btn-action-tech edit" data-list-action="edit" data-blog-id="${escape(blog._id)}" aria-label="Editar ${title}" title="Editar artigo"><i class="bi bi-pencil-square" aria-hidden="true"></i></button>
                                <button type="button" class="btn-action-tech delete" data-list-action="delete" data-blog-id="${escape(blog._id)}" aria-label="Excluir ${title}" title="Excluir artigo"><i class="bi bi-trash3" aria-hidden="true"></i></button>
                            </div>
                        </article>`;
                    }).join('') + '</div>';
                }

                function clearBlogFilters() {
                    filters.search.value = '';
                    filters.status.value = 'all';
                    filters.category.value = '';
                    filters.sort.value = 'recent';
                    currentPage = 1;
                    renderBlogList();
                }
                Object.entries(filters).forEach(([key, input]) => input.addEventListener(key === 'search' ? 'input' : 'change', () => {
                    currentPage = 1;
                    renderBlogList();
                }));
                document.getElementById('blog-clear-filters').addEventListener('click', clearBlogFilters);
                refreshButton.addEventListener('click', () => window.refreshBlogList());
                paginationEl.addEventListener('click', event => {
                    const button = event.target.closest('[data-page]');
                    if (!button || button.disabled) return;
                    currentPage = Number(button.dataset.page);
                    renderBlogList();
                    listEl.scrollIntoView({ block: 'start', behavior: 'auto' });
                });
                listEl.addEventListener('click', event => {
                    const button = event.target.closest('[data-list-action]');
                    if (!button) return;
                    const action = button.dataset.listAction;
                    if (action === 'clear') clearBlogFilters();
                    if (action === 'create') window.core.navigate('/console/conteudo/blog/novo');
                    if (action === 'retry') window.refreshBlogList();
                    if (action === 'edit') window.core.navigate(`/console/conteudo/blog/${encodeURIComponent(button.dataset.blogId)}/editar`);
                    if (action === 'delete') window.deleteBlog(button.dataset.blogId);
                });

                window.refreshBlogList = async function() {
                    const currentRequest = ++requestId;
                    listReady = false;
                    window.blogCache = Object.create(null);
                    listEl.setAttribute('aria-busy', 'true');
                    refreshButton.disabled = true;
                    paginationEl.hidden = true;
                    countEl.textContent = 'Carregando artigos…';
                    listEl.innerHTML = '<div class="cms-empty" role="status"><div class="spinner-border text-info mb-3" aria-hidden="true"></div><p class="mb-0">Carregando artigos…</p></div>';
                    ['total', 'published', 'drafts', 'views'].forEach(id => document.getElementById(`blog-stat-${id}`).textContent = '—');
                    try {
                        const res = await window.core.fetchAPI('/blogs/all');
                        if (!listEl.isConnected || currentRequest !== requestId) return;
                        if (!res?.success || !Array.isArray(res.data)) throw new Error('Resposta inválida ao carregar artigos');
                        blogs = res.data;
                        blogs.forEach(blog => window.blogCache[blog._id] = blog);
                        const published = blogs.filter(blog => blog.published).length;
                        Object.entries({ total: blogs.length, published, drafts: blogs.length - published, views: blogs.reduce((sum, blog) => sum + viewsOf(blog), 0) }).forEach(([id, value]) => document.getElementById(`blog-stat-${id}`).textContent = number.format(value));
                        const selectedCategory = filters.category.value;
                        const categories = [...new Set(blogs.flatMap(categoriesOf))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
                        filters.category.innerHTML = '<option value="">Todas as categorias</option>' + categories.map(category => `<option value="${escape(category)}">${escape(category)}</option>`).join('');
                        filters.category.value = categories.includes(selectedCategory) ? selectedCategory : '';
                        listReady = true;
                        renderBlogList();
                        return blogs;
                    } catch (error) {
                        if (!listEl.isConnected || currentRequest !== requestId) return;
                        countEl.textContent = 'Artigos indisponíveis';
                        listEl.innerHTML = '<div class="cms-empty" role="alert"><i class="bi bi-cloud-slash" aria-hidden="true"></i><h3>Não foi possível carregar os artigos</h3><p>Verifique sua conexão e tente novamente.</p><button type="button" class="btn btn-outline-light" data-list-action="retry">Tentar novamente</button></div>';
                    } finally {
                        if (listEl.isConnected && currentRequest === requestId) {
                            listEl.setAttribute('aria-busy', 'false');
                            refreshButton.disabled = false;
                        }
                    }
                };

                // Destroi o Summernote antes de reinicializar (Story 8.2)
                function destroyBlogEditor() {
                    try {
                        if (window.summernoteEditor && window.summernoteEditor._editor) {
                            window.summernoteEditor._editor.summernote('destroy');
                        }
                    } catch(e) { /* ignore */ }
                    window.summernoteEditor = null;
                }

                function updateEditorStatus(published) {
                    const checkbox = document.getElementById('blog-published');
                    const status = document.getElementById('blog-editor-status');
                    const draftButton = document.getElementById('blog-save-draft');
                    const publishButton = document.getElementById('blog-save-published');
                    checkbox.checked = Boolean(published);
                    status.textContent = published ? 'Publicado' : 'Rascunho';
                    status.classList.toggle('cms-status-published', Boolean(published));
                    draftButton.innerHTML = `<i class="bi bi-file-earmark me-1"></i> ${published ? 'Retirar da publicação' : 'Salvar rascunho'}`;
                    publishButton.innerHTML = `<i class="bi bi-check2-circle me-1"></i> ${published ? 'Salvar alterações' : 'Publicar artigo'}`;
                }

                if (editorRoute) {
                    const form = document.getElementById('new-blog-form');
                    form.addEventListener('input', () => { isDirty = true; });
                    form.addEventListener('change', () => { isDirty = true; });
                    const beforeRoute = event => {
                        if (isDirty && event.detail?.to !== window.location.pathname && !window.confirm('Há alterações não salvas. Deseja sair do editor?')) event.preventDefault();
                    };
                    const beforeUnload = event => {
                        if (!isDirty || !container.isConnected) return;
                        event.preventDefault();
                        event.returnValue = '';
                    };
                    window.addEventListener('msoft:before-route', beforeRoute);
                    window.addEventListener('beforeunload', beforeUnload);
                    window.addEventListener('msoft:route-unmount', () => {
                        window.removeEventListener('msoft:before-route', beforeRoute);
                        window.removeEventListener('beforeunload', beforeUnload);
                    }, { once: true });
                }

                window.showBlogForm = async function() {
                    if (!editorRoute) {
                        window.core.navigate('/console/conteudo/blog/novo');
                        return false;
                    }
                    const formStr = document.getElementById('new-blog-form');
                    if (!container.isConnected || !formStr || !container.contains(formStr)) return false;
                    if (formStr) formStr.reset();
                    clearEphemeralAuthorOptions();
                    resetBlogEditorChrome();
                    document.getElementById('blog-id').value = '';
                    applyDefaultBlogAuthor();
                    setBlogCategorySelections(['Tecnologia']);
                    document.getElementById('blog-tags').value = '';
                    updateEditorStatus(false);
                    document.getElementById('blog-form-container').style.display = 'block';
                    setBlogSlugMode(true);
                    window.generateSlug(document.getElementById('blog-title').value);

                    try {
                        await window.vendorLoader.loadAdminEditorVendors();
                    } catch (error) {
                        if (!container.isConnected || !container.contains(formStr)) return false;
                        console.error('Dependências do editor indisponíveis:', error);
                        const feedback = document.getElementById('blog-editor-vendor-feedback');
                        if (feedback) {
                            feedback.textContent = 'O editor não está disponível agora. Atualize a página e tente novamente.';
                            feedback.classList.remove('d-none');
                        }
                        return false;
                    }
                    if (!container.isConnected || !container.contains(formStr)) return false;

                    // Destroi editor anterior antes de reinicializar (Story 8.2)
                    destroyBlogEditor();

                    try {
                        const $editor = window.jQuery('#blog-editor-container');
                        $editor.summernote({
                            height: 500,
                            placeholder: 'A mágica começa agora. Escreva seu artigo...',
                            dialogsInBody: true,
                            tabsize: 2,
                            toolbar: [
                                ['style', ['style']],
                                ['heading', ['h1', 'h2', 'h3']],
                                ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
                                ['fontname', ['fontname']],
                                ['color', ['color']],
                                ['para', ['ul', 'ol', 'paragraph']],
                                ['alignment', ['left', 'center', 'right', 'justify']],
                                ['table', ['table']],
                                ['insert', ['link', 'picture', 'video', 'hr']],
                                ['view', ['fullscreen', 'codeview', 'help']],
                                ['misc', ['undo', 'redo']]
                            ]
                        });
                        const editor = $editor;
                        window.summernoteEditor = {
                            _editor: editor,
                            root: {
                                get innerHTML() {
                                    return editor.summernote('code') || '<p><br></p>';
                                },
                                set innerHTML(value) {
                                    editor.summernote('code', value || '<p><br></p>');
                                }
                            }
                        };
                        // Sincroniza o hidden input com o editor em cada mudanca
                        editor.on('summernote.change', function() {
                            var ed = window.summernoteEditor;
                            if (ed && ed.root && container.isConnected && container.contains(formStr)) {
                                document.getElementById('blog-content').value = ed.root.innerHTML;
                                isDirty = true;
                            }
                        });
                    } catch(e) { console.error('Summernote não iniciou: ', e); }

                    document.getElementById('blog-content').value = '';
                    window.scrollTo({ top: document.getElementById('blog-form-container').offsetTop - 100, behavior: 'smooth' });
                    isDirty = false;
                    return true;
                };

                window.hideBlogForm = function() {
                    if (editorRoute) {
                        window.core.navigate('/console/conteudo/blog');
                        return;
                    }
                    if (!container.isConnected || !container.querySelector('#blog-form-container')) return;
                    document.getElementById('blog-form-container').style.display = 'none';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                };

                window.editBlog = async function(id) {
                    if (!editorRoute) {
                        window.core.navigate(`/console/conteudo/blog/${encodeURIComponent(id)}/editar`);
                        return;
                    }
                    const blog = window.blogCache[id];
                    if(!blog) return;
                    if (!await showBlogForm()) return;
                    document.getElementById('blog-id').value = blog._id;
                    document.getElementById('blog-title').value = blog.title || '';
                    document.getElementById('blog-slug').value = blog.slug || '';
                    setBlogSlugMode(false);
                    setBlogAuthorValue(blog.author || '');
                    if (blog.categories && blog.categories.length) {
                        setBlogCategorySelections(blog.categories);
                    } else {
                        setBlogCategorySelections(blog.category || '');
                    }
                    document.getElementById('blog-tags').value = (blog.tags || []).join(', ');
                    document.getElementById('blog-imageUrl').value = blog.imageUrl || '';
                    updateEditorStatus(blog.published);

                    const raw = removeAdMode(blog.content || '');
                    document.getElementById('blog-ad-mode').value = readAdMode(blog.content || '');
                    if (blogContentNeedsRawHtml(raw)) {
                        const vRadio = document.getElementById('blog-mode-visual');
                        const hRadio = document.getElementById('blog-mode-html');
                        const visualWrap = document.getElementById('blog-editor-visual-wrap');
                        const htmlWrap = document.getElementById('blog-editor-html-wrap');
                        const hint = document.getElementById('blog-html-mode-hint');
                        const ta = document.getElementById('blog-content-html');
                        if (hRadio) hRadio.checked = true;
                        if (vRadio) vRadio.checked = false;
                        if (ta) ta.value = raw;
                        if (visualWrap) visualWrap.classList.add('d-none');
                        if (htmlWrap) htmlWrap.classList.remove('d-none');
                        if (hint) hint.classList.remove('d-none');
                        if (window.summernoteEditor) {
                            window.summernoteEditor.root.innerHTML = '';
                        }
                    } else {
                        resetBlogEditorChrome();
                        if (window.summernoteEditor) {
                            window.summernoteEditor.root.innerHTML = raw;
                        }
                    }
                    document.getElementById('blog-content').value = raw;
                    isDirty = false;
                };

                window.saveBlogForm = async function(event, desiredPublished) {
                    const btnSave = event.target.closest('button');
                    const form = document.getElementById('new-blog-form');
                    if (!form || !container.contains(form) || form.getAttribute('aria-busy') === 'true') return;
                    const routeAtSubmit = window.location.pathname;
                    const orgText = btnSave.innerHTML;
                    const actionButtons = [document.getElementById('blog-save-draft'), document.getElementById('blog-save-published')];
                    btnSave.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>Salvando...';

                    const id = document.getElementById('blog-id').value;
                    const tagsStr = document.getElementById('blog-tags').value;
                    const categories = getBlogCategorySelections();
                    const titleVal = document.getElementById('blog-title').value.trim();
                    let slugVal = document.getElementById('blog-slug').value.trim();
                    if (!id && titleVal && !slugVal) {
                        slugVal = window.slugifyTitle(titleVal);
                        document.getElementById('blog-slug').value = slugVal;
                    }
                    const bodyContent = getBlogBodyContent();
                    const payload = {
                        title: document.getElementById('blog-title').value,
                        slug: slugVal,
                        author: document.getElementById('blog-author-select').value,
                        categories,
                        category: categories[0] || 'Geral',
                        tags: tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [],
                        imageUrl: document.getElementById('blog-imageUrl').value,
                        content: contentWithAdMode(bodyContent),
                        published: Boolean(desiredPublished)
                    };

                    if (!payload.title || !payload.slug || isBlogBodyEmpty(bodyContent)) {
                        window.core.toast('O Título, o Slug e o Conteúdo são cruciais e obrigatórios.', 'warning');
                        btnSave.innerHTML = orgText;
                        actionButtons.forEach(button => { button.disabled = false; });
                        return;
                    }

                    const controls = [...form.querySelectorAll('input, select, textarea, button')];
                    const disabledBefore = controls.map(control => control.disabled);
                    controls.forEach(control => { control.disabled = true; });
                    const editable = form.querySelector('.note-editable');
                    const contentEditableBefore = editable?.getAttribute('contenteditable');
                    editable?.setAttribute('contenteditable', 'false');
                    form.setAttribute('aria-busy', 'true');

                    try {
                        const endpoint = id ? '/blogs/' + id : '/blogs';
                        const method = id ? 'PUT' : 'POST';
                        const res = await window.core.fetchAPI(endpoint, method, payload);
                        if (!container.isConnected || !container.contains(form) || window.location.pathname !== routeAtSubmit) return;
                        if (res && res.success) {
                            window.core.toast('Artigo salvo com sucesso.', 'success');
                            isDirty = false;
                            updateEditorStatus(payload.published);
                            const savedId = String(res.data?._id || res.data?.id || id || '');
                            if (!id && savedId) window.core.navigate(`/console/conteudo/blog/${encodeURIComponent(savedId)}/editar`);
                            else if (!id) window.core.navigate('/console/conteudo/blog');
                        } else {
                            window.core.toast('Erro ao processar: ' + (res?.error || 'Código Desconhecido'), 'error');
                        }
                    } catch(e) {
                        if (container.isConnected && container.contains(form)) window.core.toast('Não foi possível salvar. Verifique sua conexão e tente novamente.', 'error');
                    } finally {
                        if (container.isConnected && container.contains(form)) {
                            btnSave.innerHTML = orgText;
                            controls.forEach((control, index) => { control.disabled = disabledBefore[index]; });
                            if (editable) {
                                if (contentEditableBefore === null) editable.removeAttribute('contenteditable');
                                else editable.setAttribute('contenteditable', contentEditableBefore);
                            }
                            form.removeAttribute('aria-busy');
                        }
                    }
                };

                window.deleteBlog = async function(id) {
                    if (!confirm('Excluir este artigo permanentemente? Esta ação não pode ser desfeita.')) return;
                    try {
                        const res = await window.core.fetchAPI('/blogs/' + id, 'DELETE');
                        if (res && res.success) {
                            window.core.toast('Artigo excluído com sucesso.', 'success');
                            refreshBlogList();
                        } else {
                            window.core.toast('Não foi possível excluir o artigo.', 'error');
                        }
                    } catch(e) {
                        window.core.toast('Problema conectando-se à base de dados.', 'error');
                    }
                };

                // A lista e o estúdio compartilham a lógica de edição, mas cada rota mostra apenas sua tela.
                if (editorRoute) {
                    if (editingId) {
                        const articles = await window.refreshBlogList();
                        if (!container.isConnected) return;
                        const article = Array.isArray(articles) && articles.find(item => String(item._id) === editingId);
                        if (article) await window.editBlog(editingId);
                        else {
                            document.getElementById('new-blog-form').hidden = true;
                            const error = document.getElementById('blog-editor-load-error');
                            error.hidden = false;
                            error.textContent = Array.isArray(articles) ? 'Artigo não encontrado. Volte à lista e escolha outro artigo.' : 'Não foi possível carregar o artigo. Atualize a página para tentar novamente.';
                        }
                    } else await window.showBlogForm();
                } else refreshBlogList();
};
