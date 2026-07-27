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

        self.assertIn('<!-- Version: V0.11.66 -->', index)
        self.assertIn('version: "0.11.66"', config)
        self.assertIn('/src/config/config.js?v=0.11.66', index)
        self.assertIn('/src/config/seo.js?v=0.11.66', index)
        self.assertIn('/src/core/core.js?v=0.11.66', index)

    def test_quote_route_is_indexable_and_has_spa_fallback(self) -> None:
        config = (ROOT / "src/config/config.js").read_text(encoding="utf-8")
        seo = (ROOT / "src/config/seo.js").read_text(encoding="utf-8")
        sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
        dockerfile = (ROOT / "Dockerfile").read_text(encoding="utf-8")

        self.assertIn("'cotacoes'", config)
        self.assertRegex(seo, r"'cotacoes':\s*\{")
        self.assertIn("https://mirandasoft.com.br/cotacoes", sitemap)
        self.assertIn('CMD ["serve", "-s", ".", "-p", "8080"]', dockerfile)

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
