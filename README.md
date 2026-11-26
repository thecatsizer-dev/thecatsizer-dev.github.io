# TheCatsizerLab — portfolio mirror

Live: https://thecatsizer-dev.github.io/

This repository mirrors the portfolio from https://thecatsizerlab.github.io/
(source commit ec173a4). The main content, project media, five languages and local
demos are synchronized, including the editorial studio redesign. The original publisher/contact information is
retained below the portfolio footer on all 55 portfolio pages. The owner updated
the address to Quartier i Costi, 20190 Zigliara on 26 November 2026.

The original app-ads.txt, Android association, ShareSpend invitation routes,
server.js and root package.json remain byte-for-byte unchanged. Do not replace
the root package with the portfolio package: the existing server is CommonJS.
The portfolio's source package is retained in tools/mirror/source-package.json.

GitHub Pages: main branch, root folder. The canonical and hreflang metadata keep
the primary portfolio as the preferred indexed URL; local navigation and local
demos work on this mirror. Casa Suprana stays on its existing independent URL.
The same consent-gated GA4 property can measure both portfolio hosts; advertising
features remain disabled. No cross-domain identity linking is added.

Use python tools/i18n/build.py --portfolio-only for portfolio-only updates.
After a full rebuild with python tools/i18n/build.py, run
python tools/mirror/legal-footer.py to restore the retained legal footer.
The six original paragraphs are stored in tools/mirror/legal.json. They are
retained as supplied, with the owner’s address correction and without independent
legal validation.

## Original repository purpose

AdMob app-ads.txt file for ShareSpend app. Existing application routes remain.
