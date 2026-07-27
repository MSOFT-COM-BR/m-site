(function () {
  const loading = new Map();

  function loadAsset(type, url) {
    const key = `${type}:${url}`;
    if (loading.has(key)) return loading.get(key);

    const existing = document.querySelector(`${type === 'style' ? 'link' : 'script'}[data-vendor-url="${url}"]`);
    if (existing) {
      const ready = Promise.resolve(existing);
      loading.set(key, ready);
      return ready;
    }

    const promise = new Promise((resolve, reject) => {
      const element = document.createElement(type === 'style' ? 'link' : 'script');
      element.dataset.vendorUrl = url;
      if (type === 'style') {
        element.rel = 'stylesheet';
        element.href = url;
      } else {
        element.src = url;
      }
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error(`Não foi possível carregar ${url}`));
      document.head.appendChild(element);
    });

    loading.set(key, promise);
    return promise;
  }

  function loadScript(url) {
    return loadAsset('script', url);
  }

  function loadStyle(url) {
    return loadAsset('style', url);
  }

  async function loadAdminEditorVendors() {
    await loadScript('/src/assets/vendor/jquery/jquery-3.7.1.min.js');
    await loadStyle('/src/assets/vendor/summernote/summernote-lite.min.css');
    await loadScript('/src/assets/vendor/summernote/summernote-lite.min.js');

    if (!window.jQuery || !window.jQuery.fn || typeof window.jQuery.fn.summernote !== 'function') {
      throw new Error('As dependências do editor administrativo não foram inicializadas.');
    }
  }

  window.vendorLoader = Object.freeze({
    loadAdminEditorVendors
  });
})();
