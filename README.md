# TheCatsizerLab — portfolio mirror

Live: https://thecatsizer-dev.github.io/

This repository mirrors the portfolio from https://thecatsizerlab.github.io/
(source commit 71831dd). The main content, project media, five languages and local
demos are copied without redesign. The original publisher/contact information is
retained verbatim below the portfolio footer on all 55 portfolio pages.

The original app-ads.txt, Android association, ShareSpend invitation routes,
server.js and root package.json remain byte-for-byte unchanged. Do not replace
the root package with the portfolio package: the existing server is CommonJS.
The portfolio's source package is retained in tools/mirror/source-package.json.

GitHub Pages: main branch, root folder. The canonical and hreflang metadata keep
the primary portfolio as the preferred indexed URL; local navigation and local
demos work on this mirror. Casa Suprana stays on its existing independent URL.
The same consent-gated GA4 property can measure both portfolio hosts; advertising
features remain disabled. No cross-domain identity linking is added.

After rebuilding with python tools/i18n/build.py, run
python tools/mirror/legal-footer.py to restore the retained legal footer.
The six original paragraphs are stored in tools/mirror/legal.json. They are
retained as supplied, without independent legal validation or changes.

## Original repository purpose

AdMob app-ads.txt file for ShareSpend app. Existing application routes remain.
