window.consoleViews = window.consoleViews || Object.create(null);
window.consoleViews.images = async function ({ container, auth }) {
                container.innerHTML = `
                    <h4 class="mb-4 text-on-surface fw-bold fs-3">Galeria e Assets do Domínio</h4>
                    <p class="text-on-surface-variant mb-5">Manutenção dos pilares de identidade imagética do ecossistema.</p>

                    <div class="row g-4">
                        <div class="col-md-6">
                            <div class="card bg-transparent border-0 h-100 rounded-4" style="background: var(--ms-surface-container-low) !important; border: 1px dashed rgba(255,255,255,0.1) !important;">
                                <div class="card-body text-center p-5">
                                    <h6 class="text-on-surface mb-4">Logotipo Mestre</h6>
                                    <div class="p-3 mb-4 d-flex align-items-center justify-content-center mx-auto rounded-circle" style="width: 120px; height: 120px; background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.2);">
                                        <i class="bi bi-image text-info" style="font-size: 3rem;"></i>
                                    </div>
                                    <button class="btn btn-outline-info rounded-pill px-4"><i class="bi bi-upload me-2"></i> Substituir Logotipo</button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card bg-transparent border-0 h-100 rounded-4" style="background: var(--ms-surface-container-low) !important; border: 1px dashed rgba(255,255,255,0.1) !important;">
                                <div class="card-body text-center p-5">
                                    <h6 class="text-on-surface mb-4">Favicon (Ícone de Aba)</h6>
                                    <div class="p-3 mb-4 d-flex align-items-center justify-content-center mx-auto rounded-circle" style="width: 120px; height: 120px; background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.2);">
                                        <i class="bi bi-bezier2 text-info" style="font-size: 3rem;"></i>
                                    </div>
                                    <button class="btn btn-outline-info rounded-pill px-4"><i class="bi bi-upload me-2"></i> Substituir Ícone</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
};
