window.consoleViews = window.consoleViews || Object.create(null);
window.consoleViews.logs = async function ({ container, auth }) {
                container.innerHTML = '<div class="text-center py-5"><div class="spinner-grow text-info" role="status"></div><p class="text-on-surface-variant mt-3"></p></div>';
                try {
                    const res = await window.core.fetchAPI('/logs');
                    let logsHtml = '';
                    if (res && res.success && res.data && res.data.length > 0) {
                        res.data.forEach(log => {
                            let color = 'text-success';
                            if (log.level === 'warning') color = 'text-warning';
                            if (log.level === 'error') color = 'text-danger';
                            const date = new Date(log.createdAt).toLocaleString('pt-BR');
                            const userTag = log.user ? '<span class="text-on-surface-variant ms-2">(ID: ' + log.user + ')</span>' : '';
                            logsHtml += `<div class="mb-1 pb-1 border-bottom border-secondary border-opacity-25 ${color}"><span class="text-on-surface-variant me-2">[${date}]</span> <span class="badge bg-secondary bg-opacity-25 me-2">${log.action}</span> ${log.details} ${userTag}</div>`;
                        });
                    } else {
                        logsHtml = '<div class="text-on-surface-variant text-center pt-4"><i class="bi bi-wind fs-2 d-block mb-2"></i>Nenhum rastro detectado.</div>';
                    }
                    if (!container.isConnected) return;
                    container.innerHTML = `
                        <h4 class="mb-4 text-on-surface fw-bold fs-3">Monitoramento</h4>
                        <div class="alert cms-alert mb-4"><i class="bi bi-radar text-info me-2"></i>Auditoria Live-Action do seu ambiente em Produção.</div>
                        <div class="p-4 rounded font-monospace small" style="background: var(--ms-surface-container-lowest); border: 1px solid rgba(255,255,255,0.05); height: 450px; overflow-y: auto;">
                            ${logsHtml}
                        </div>
                        <div class="text-end mt-4">
                            <button class="btn btn-outline-info" style="border-radius: 8px;" onclick="loadTab('logs')"><i class="bi bi-arrow-repeat me-2"></i> Atualizar Radar</button>
                        </div>
                    `;
                } catch (e) {
                    if (!container.isConnected) return;
                    container.innerHTML = '<div class="alert alert-danger" style="background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2);"><i class="bi bi-x-circle me-2"></i> Falha Crítica ao contatar a API (M-Manage).</div>';
                }
};
