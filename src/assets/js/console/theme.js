window.consoleViews = window.consoleViews || Object.create(null);
window.consoleViews.theme = async function ({ container, auth }) {
                container.innerHTML = `
                    <h4 class="mb-4 text-on-surface fw-bold fs-3">Personalização Visual</h4>
                    <div class="alert cms-alert mb-5"><i class="bi bi-stars me-2 text-info"></i> Ajuste as cores vitais da sua identidade visual refletida no site inteiro.</div>

                    <form id="theme-form" class="row g-4">
                        <div class="col-md-6">
                            <label class="form-label text-on-surface mb-2">Cor Primária (Theme)</label>
                            <input type="color" class="form-control form-control-color cms-input cms-input-color w-100" value="#000000">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-on-surface mb-2">Cor Secundária (Acentos)</label>
                            <input type="color" class="form-control form-control-color cms-input cms-input-color w-100" value="#28a745">
                        </div>
                        <div class="col-md-12">
                            <label class="form-label text-on-surface mb-2">Tipografia Principal (Google Fonts)</label>
                            <select class="form-select cms-input w-100">
                                <option value="Inter">Inter (Elegante & Limpa)</option>
                                <option value="Roboto">Roboto (Clássica do Google)</option>
                                <option value="Poppins">Poppins (Redonda & Moderna)</option>
                                <option value="Outfit">Outfit (Tecnológica & Sharp)</option>
                            </select>
                        </div>
                        <div class="col-12 mt-5">
                            <hr class="border-secondary opacity-25 mb-4">
                            <div class="d-flex justify-content-end">
                                <button type="button" class="btn cms-btn-primary" onclick="window.core.toast('O design foi publicado e está ao vivo!', 'success')">
                                    <i class="bi bi-cloud-check me-2"></i> Publicar Alterações
                                </button>
                            </div>
                        </div>
                    </form>
                `;
};
