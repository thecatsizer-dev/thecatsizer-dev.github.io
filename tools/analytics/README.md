# Portfolio analytics

Property: TheCatsizerLab — Portfolio (565893548), account 417508359.
Stream: Portfolio TheCatsizerLab (16417137199), measurement ID G-JH81V3X1HP.
https://analytics.google.com/analytics/web/#/a417508359p565893548/reports/intelligenthome

GA4 is loaded only after opt-in (Google's basic consent mode). No Google request
is made for a missing, rejected or expired choice. Advertising storage, ad-user
data, personalisation and Google Signals are disabled. Preference text is shared
in `assets/analytics/messages.js` for FR/EN/IT/ES/DE. The footer reopens the choices.

The public measurement ID belongs in `assets/analytics/config.js`. An empty ID
disables the module entirely. No API secret belongs in this repository.

The shared portfolio entry module imports this implementation. Hotel/municipal
demos do not inherit the portfolio's tracking or consent UI.

Page and referrer query strings/fragments are excluded from the initial config.
Use page-view-only collection: disable enhanced measurement (forms, search,
outbound clicks, history and video) in the GA4 stream. Keep Google Signals and
advertising associations off. Never put personal data in page paths or titles.
Cookies are host-only, have a maximum configured lifetime of 180 days and do not
extend on page views. Preferences expire after 180 days. Rejection deletes the
accessible Analytics cookies; withdrawal then reloads to unload the Google code.
Previously collected data is not deleted from Google's servers by that action.

Run: `node --test tools/analytics/consent.test.mjs`.
The tests execute the actual module in an isolated DOM harness and never send
events to Google. Verify the deployed UI and receiving stream separately.

Sources:
- https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic
- https://developers.google.com/analytics/devguides/collection/ga4/reference/config

Historical visits cannot be reconstructed by installing a new Analytics tag.
Self-tests and owner visits are not evidence of outside visitors.
