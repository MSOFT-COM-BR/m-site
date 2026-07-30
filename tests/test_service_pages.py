"""Static contract tests for the approved commercial service pages."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = {
    "criacao-de-sites": "Criação de Sites",
    "desenvolvimento-de-sistemas": "Desenvolvimento de Sistemas",
}


class ServicePagesContractTests(unittest.TestCase):
    def test_service_pages_are_routable_and_indexable(self) -> None:
        config = (ROOT / "src/config/config.js").read_text(encoding="utf-8")
        seo = (ROOT / "src/config/seo.js").read_text(encoding="utf-8")
        sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")

        for slug in PAGES:
            with self.subTest(slug=slug):
                self.assertIn(f"'{slug}'", config)
                self.assertRegex(seo, rf"'{re.escape(slug)}':\s*\{{")
                self.assertIn(f"https://mirandasoft.com.br/{slug}", sitemap)

    def test_service_route_release_invalidates_cached_router_configuration(self) -> None:
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        config = (ROOT / "src/config/config.js").read_text(encoding="utf-8")

        self.assertIn('<!-- Version: V0.11.79 -->', index)
        self.assertIn('version: "0.11.79"', config)
        for asset in (
            'config/config.js',
            'config/seo.js',
            'core/consent.js',
            'core/component.js',
            'core/i18n.js',
            'core/helpers.js',
            'core/skeleton.js',
            'core/core.js',
        ):
            self.assertIn(f'/src/{asset}?v=0.11.79', index)

        for stylesheet in ('design-system.css', 'style.css', 'developer.css'):
            self.assertIn(f'/src/assets/css/{stylesheet}?v=0.11.79', index)

    def test_quote_route_is_indexable_and_has_spa_fallback(self) -> None:
        config = (ROOT / "src/config/config.js").read_text(encoding="utf-8")
        seo = (ROOT / "src/config/seo.js").read_text(encoding="utf-8")
        sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
        dockerfile = (ROOT / "Dockerfile").read_text(encoding="utf-8")

        self.assertIn("'cotacoes'", config)
        self.assertRegex(seo, r"'cotacoes':\s*\{")
        self.assertIn("https://mirandasoft.com.br/cotacoes", sitemap)
        self.assertIn('CMD ["serve", "-s", ".", "-p", "8080"]', dockerfile)

    def test_standard_budget_approval_route_opens_a_simplified_whatsapp_report(self) -> None:
        config = (ROOT / "src/config/config.js").read_text(encoding="utf-8")
        seo = (ROOT / "src/config/seo.js").read_text(encoding="utf-8")
        sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
        page = (ROOT / "src/pages/padrao.html").read_text(encoding="utf-8")

        self.assertIn("'padrao'", config)
        self.assertRegex(seo, re.compile(r"'padrao':\s*\{.*?noindex:\s*true", re.DOTALL))
        self.assertNotIn("https://mirandasoft.com.br/padrao", sitemap)
        self.assertNotIn('standardBudgetWebhookUrl', config)
        self.assertEqual(page.count('data-template-select='), 5)
        self.assertIn('id="standard-preview-dialog"', page)
        self.assertIn('id="standard-preview-frame"', page)
        self.assertIn('sandbox', page)
        self.assertNotIn('allow-same-origin', page)
        self.assertNotIn('<button>VER CONCEITO</button>', page)
        self.assertIn('Padrão Engenharia', page)
        self.assertIn('Aprovar no WhatsApp', page)
        self.assertNotIn('<html', page)
        for reference in ('axis.png', 'civic.png', 'atelier.png', 'aureo.png', 'forge.png'):
            self.assertIn(f'/src/assets/images/padrao-referencias/{reference}', page)
            self.assertTrue((ROOT / 'src/assets/images/padrao-referencias' / reference).is_file())
        for color in ('#1E2124', '#A60B0B', '#FFFFFF', '#3A3F45', '#70767D', '#D9D9D9', '#F7F7F7'):
            self.assertIn(color, page)
        for field in ('buildWhatsAppReport', 'Layout escolhido:', 'Direção:', 'Tipografia:', 'Tom:', 'Paleta:', 'Página de aprovação:', 'encodeURIComponent'):
            self.assertIn(field, page)
        self.assertIn('https://wa.me/5584988330532', page)
        self.assertIn("window.open(whatsappUrl, '_blank', 'noopener,noreferrer')", page)
        self.assertIn('a conversa com o relatório será aberta no WhatsApp', page)
        self.assertNotIn('envia o relatório', page.lower())
        self.assertNotIn('fetch(', page)
        self.assertNotIn('n8n', page.lower())
        self.assertNotIn("innerHTML", page)

    def test_shared_layout_guards_against_mobile_horizontal_overflow(self) -> None:
        style = (ROOT / "src/assets/css/style.css").read_text(encoding="utf-8")
        footer = (ROOT / "src/components/footer.html").read_text(encoding="utf-8")

        self.assertIn('html, body {', style)
        self.assertIn('overflow-x: clip;', style)
        self.assertIn('img, svg, video, canvas, iframe {', style)
        self.assertIn('max-width: 100%;', style)
        self.assertIn('@media (max-width: 991.98px)', footer)
        self.assertIn('white-space: normal;', footer)
        self.assertIn('`/src/components/${name}.html?v=${componentVersion}`', (ROOT / 'src/core/core.js').read_text(encoding="utf-8"))

    def test_market_route_has_a_distinct_public_data_contract(self) -> None:
        config = (ROOT / "src/config/config.js").read_text(encoding="utf-8")
        seo = (ROOT / "src/config/seo.js").read_text(encoding="utf-8")
        sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
        header = (ROOT / "src/components/header.html").read_text(encoding="utf-8")
        page = (ROOT / "src/pages/mercado.html").read_text(encoding="utf-8")

        self.assertIn("'mercado'", config)
        self.assertRegex(seo, r"'mercado':\s*\{")
        self.assertIn("https://mirandasoft.com.br/mercado", sitemap)
        self.assertIn('href="/mercado"', header)
        self.assertIn('href="/cotacoes"', header)
        self.assertIn("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL", page)
        self.assertNotIn("innerHTML", page)
        self.assertIn("timestamp > 0", page)
        self.assertIn("time.dateTime = sourceTime.datetime", page)
        for quote_code in ("USDBRL", "EURBRL", "BTCBRL"):
            self.assertIn(quote_code, page)

    def test_public_shell_defers_admin_only_vendor_stack(self) -> None:
        index = (ROOT / "index.html").read_text(encoding="utf-8")
        loader = (ROOT / "src/core/vendor-loader.js").read_text(encoding="utf-8")
        admin = (ROOT / "src/pages/admin.html").read_text(encoding="utf-8")
        core = (ROOT / "src/core/core.js").read_text(encoding="utf-8")

        for asset in (
            "jquery.min.js",
            "summernote-lite.min.js",
            "summernote-lite.min.css",
            "swiper-bundle.min.js",
            "papaparse.min.js",
            "marked.min.js",
        ):
            self.assertNotIn(asset, index)
        self.assertIn('/src/core/vendor-loader.js?v=0.11.79', index)
        self.assertIn('loadAdminEditorVendors', loader)
        self.assertIn('window.jQuery', loader)
        self.assertIn('summernote-lite.min.js', loader)
        self.assertIn('await window.vendorLoader.loadAdminEditorVendors()', admin)
        self.assertIn('const filePath = `/src/pages/${pageName}.html?v=${config.app.version}`;', core)

    def test_products_route_is_removed_in_favor_of_marketplace(self) -> None:
        config = (ROOT / "src/config/config.js").read_text(encoding="utf-8")
        seo = (ROOT / "src/config/seo.js").read_text(encoding="utf-8")
        sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
        header = (ROOT / "src/components/header.html").read_text(encoding="utf-8")

        self.assertNotIn("'produtos'", config)
        self.assertNotIn("'produtos':", seo)
        self.assertNotIn("https://mirandasoft.com.br/produtos", sitemap)
        self.assertNotIn('href="/produtos"', header)
        self.assertIn('href="/marketplace"', header)

    def test_admin_apps_tab_drives_the_catalog_crud(self) -> None:
        admin = (ROOT / "src/pages/admin.html").read_text(encoding="utf-8")

        self.assertIn('data-tab="apps"', admin)
        self.assertIn("tab === 'apps'", admin)
        self.assertIn("'/catalog/admin'", admin)
        self.assertIn("`/catalog/admin/${encodeURIComponent(editingAppKey)}`", admin)
        self.assertIn("`/catalog/admin/${encodeURIComponent(appKey)}`", admin)
        self.assertIn("'catalog-app-form'", admin)
        self.assertIn("'catalog-app-list'", admin)

    def test_admin_blog_categories_use_the_api_crud(self) -> None:
        admin = (ROOT / "src/pages/admin.html").read_text(encoding="utf-8")

        self.assertIn("'/blogs/categories'", admin)
        self.assertIn("`/blogs/categories/${encodeURIComponent(id)}`", admin)
        self.assertIn("window.renameBlogCategory", admin)
        self.assertIn("window.deleteBlogCategory", admin)
        self.assertNotIn("defaultCats", admin)
        self.assertNotIn("/mjson/blog-categories", admin)

    def test_marketplace_tool_handoff_preserves_the_query_string(self) -> None:
        core = (ROOT / "src/core/core.js").read_text(encoding="utf-8")
        marketplace = (ROOT / "src/pages/marketplace.html").read_text(encoding="utf-8")

        self.assertIn('href="/apps?tool=${encodeURIComponent(item.appKey)}"', marketplace)
        self.assertIn('this.navigate(`${link.pathname}${link.search}${link.hash}`);', core)
        self.assertIn('const routeSearch = window.location.search;', core)
        self.assertIn("const canonicalPath = pageName === 'home' ? '/' : `/${pageName}${paramsString}`;", core)
        self.assertIn('const newPath = `${canonicalPath}${routeSearch}${routeHash}`;', core)
        self.assertIn("if (pageName === 'apps' && tool && typeof window.openTool === 'function')", core)
        self.assertIn('this.updatePageSEO(pageName, canonicalPath);', core)
        self.assertNotIn('this.updatePageSEO(pageName, newPath);', core)

    def test_marketplace_public_view_hides_catalog_prices(self) -> None:
        marketplace = (ROOT / "src/pages/marketplace.html").read_text(encoding="utf-8")

        self.assertIn('id="modal-price">A consultar</span>', marketplace)
        self.assertIn('<span class="text-white fs-4 fw-bold">A consultar</span>', marketplace)
        self.assertIn("onclick=\"openPurchaseModal('${escapeHtml(item.name).replace(/'/g, \"\\\\'\")}', '${item.type}')\"", marketplace)
        self.assertIn("currentPurchase = { name, type };", marketplace)
        self.assertIn("Gostaria de receber informações sobre o produto", marketplace)
        self.assertNotIn("toLocaleString('pt-BR', { style: 'currency'", marketplace)
        self.assertNotIn('R$ 0,00', marketplace)

    def test_each_service_page_has_safe_conversion_and_schema_contract(self) -> None:
        for slug, service_name in PAGES.items():
            with self.subTest(slug=slug):
                page = (ROOT / "src/pages" / f"{slug}.html").read_text(encoding="utf-8")

                self.assertIn("https://wa.me/5584988330532", page)
                self.assertIn('href="/contact"', page)
                self.assertIn('href="/blog"', page)
                schema_match = re.search(
                    r'<script type="application/ld\+json">\s*(.*?)\s*</script>',
                    page,
                    flags=re.DOTALL,
                )
                if schema_match is None:
                    self.fail("A página deve expor schema JSON-LD")
                schema = json.loads(schema_match.group(1))
                self.assertEqual(schema["@type"], "Service")
                self.assertEqual(schema["name"], service_name)
                self.assertNotIn("offers", schema)
                self.assertNotIn("aggregateRating", schema)
                self.assertNotIn("review", schema)
                self.assertNotIn("case de sucesso", page.lower())
                self.assertNotIn("clientes atendidos", page.lower())

    def test_homepage_fallback_prioritizes_approved_services(self) -> None:
        home = (ROOT / "src/pages/home.html").read_text(encoding="utf-8")

        for slug, service_name in PAGES.items():
            with self.subTest(slug=slug):
                self.assertIn(service_name, home)
                self.assertIn(f'href="/{slug}"', home)

        self.assertNotIn("Fábrica de Software", home)
        self.assertNotIn("Aplicativos Mobile", home)
        self.assertNotIn("Consultoria Tech", home)

    def test_login_page_has_accessible_credential_controls(self) -> None:
        login = (ROOT / "src/pages/login.html").read_text(encoding="utf-8")

        self.assertIn('autocomplete="username"', login)
        self.assertIn('autocomplete="current-password"', login)
        self.assertIn('aria-controls="password"', login)
        self.assertIn('id="login-form-feedback"', login)
        self.assertIn('role="status"', login)
        self.assertIn("passwordToggle?.addEventListener('click'", login)


if __name__ == "__main__":
    unittest.main()
