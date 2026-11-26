import { content, categoryNames, disclaimer } from "./content.js";
import { exampleResource } from "./example-resource.js";

const $ = (s, root = document) => root.querySelector(s);
const esc = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const storageKey = "learning-studio-concept-v1";
let saved = {},
  storageOK = true;
try {
  saved = JSON.parse(localStorage.getItem(storageKey) || "{}") || {};
} catch {
  storageOK = false;
}
let lang = Object.hasOwn(content, saved.lang) ? saved.lang : "fr";
let progress = {
  step:
    Number.isInteger(saved.step) && saved.step >= 0 && saved.step <= 5
      ? saved.step
      : 0,
  max:
    Number.isInteger(saved.max) && saved.max >= 0 && saved.max <= 5
      ? saved.max
      : 0,
  answers: [3, 4].map((_, i) =>
    Number.isInteger(saved.answers?.[i]) &&
    saved.answers[i] >= 0 &&
    saved.answers[i] <= 2
      ? saved.answers[i]
      : null,
  ),
};
// A persisted summary is valid only if both activities were answered.
if (progress.answers.some((a) => a === null) && progress.max === 5)
  progress.max = 3;
progress.step = Math.min(progress.step, progress.max);
let category = 0,
  query = "",
  route = "",
  menuOpen = false,
  modalReturn = null;
const t = () => content[lang];
const tools = () => categoryNames[lang];
function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ lang, ...progress }));
  } catch {
    storageOK = false;
  }
}
const icon = (name, cls = "") => {
  const paths = {
    leaf: '<path d="M20 4C9 2 3 8 5 15s12 6 15-11Z"/><path d="m5 21 9-11"/>',
    book: '<path d="M12 5c-3-2-7-2-10 0v15c3-2 7-2 10 0 3-2 7-2 10 0V5c-3-2-7-2-10 0Zm0 0v15"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
    globe:
      '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    chat: '<path d="M20 16V4H4v12h4v5l6-5Z"/><path d="M8 8h8M8 12h5"/>',
    file: '<path d="M5 2h9l5 5v15H5Zm9 0v6h5M9 12h6m-6 4h6"/>',
    download: '<path d="M4 16v5h16v-5M12 3v12m-4-4 4 4 4-4"/>',
  };
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;
};
const logo = () =>
  `<a class="brand" href="#home" aria-label="Learning Studio · ${t().home}"><span>Learning Studio</span><small lang="en">Independent concept demo</small></a>`;
const label = (text) => `<p class="eyebrow">${text}</p>`;
const lessonCTA = () =>
  progress.max === 5
    ? t().lessonAgain
    : progress.max > 0
      ? t().lessonResume
      : t().lessonStart;

function art(i) {
  const drawings = [
    '<path d="M18 117c27-11 35-63 66-54s7 64 44 57 35-40 66-40" stroke-dasharray="4 7"/><g transform="translate(63 17) rotate(25)"><ellipse cx="0" cy="19" rx="11" ry="20" fill="currentColor" stroke="none"/><circle cy="48" r="9" fill="currentColor" stroke="none"/></g><g transform="translate(136 53) rotate(-18)"><ellipse cx="0" cy="19" rx="11" ry="20" fill="currentColor" stroke="none"/><circle cy="48" r="9" fill="currentColor" stroke="none"/></g>',
    '<path d="M28 27h103v62H77l-25 22V89H28Z" fill="#faf5e8"/><path d="M104 65h81v53h-18v17l-24-17h-39Z" fill="currentColor"/><path d="M49 50c10 14 20 14 30 0m13 0c10 14 20 14 30 0"/><path d="M124 86h40m-40 13h25" stroke="#faf5e8"/>',
    '<path d="M26 31h157M26 132h157" opacity=".35"/><text x="34" y="108" fill="currentColor" stroke="none" font-family="Georgia,serif" font-size="88">Aa</text><path d="M156 40v35m-11-22h22"/><circle cx="183" cy="95" r="8"/>',
    '<rect x="39" y="37" width="87" height="104" rx="6" transform="rotate(-15 39 37)" fill="#f9f4e7"/><rect x="89" y="21" width="87" height="104" rx="6" transform="rotate(10 89 21)" fill="#d8dcbf"/><path d="M100 76s17-24 37-19 29 28 29 28-21 17-39 12-27-21-27-21Z"/><circle cx="134" cy="77" r="9"/>',
    '<ellipse cx="108" cy="83" rx="80" ry="43" transform="rotate(-28 108 83)"/><path d="M88 27h42m-42 111h42m-36-109c0 31 6 40 16 53-10 13-16 23-16 54m31-107c0 31-6 40-15 53 9 13 15 23 15 54"/><path d="m96 123 14-20 13 20Z" fill="currentColor"/><circle cx="174" cy="48" r="9" fill="#f9f4e7"/>',
  ];
  return `<svg class="tool-art" viewBox="0 0 216 166" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawings[i]}</svg>`;
}

function header() {
  const c = t();
  $("#header").innerHTML =
    `<div class="header-inner wrap">${logo()}<nav id="navigation" class="${menuOpen ? "is-open" : ""}" aria-label="${c.menu}">${["project", "library", "course"].map((r, i) => `<a href="#${r}" ${route === r || (r === "course" && route === "lesson") ? 'aria-current="page"' : ""}>${c.nav[i]}</a>`).join("")}</nav><div class="header-actions"><label class="lang-control">${icon("globe")}<span class="sr-only">${c.language}</span><select id="language" aria-label="${c.language}">${[
      ["fr", "FR", "Français"],
      ["en", "EN", "English"],
      ["es", "ES", "Español"],
      ["it", "IT", "Italiano"],
    ]
      .map(
        ([v, s, n]) =>
          `<option value="${v}" lang="${v}" aria-label="${n}" ${lang === v ? "selected" : ""}>${s}</option>`,
      )
      .join(
        "",
      )}</select></label><button class="mobile-menu icon-button" data-action="menu" aria-controls="navigation" aria-expanded="${menuOpen}" aria-label="${c.menu}">${icon(menuOpen ? "close" : "menu")}</button></div></div>`;
  document.documentElement.lang = lang;
  document.title = c.title;
  $(".skip-link").textContent = c.skip;
}
function footer() {
  const c = t();
  $("#footer").innerHTML =
    `<div class="wrap"><div class="footer-top"><div>${logo()}<p class="footer-tag">${c.footerTag}</p></div><div class="footer-links"><a href="#project">${c.nav[0]}</a><a href="#library">${c.nav[1]}</a><a href="#course">${c.nav[2]}</a><button class="text-button" data-action="credits">${c.credits}</button><button class="text-button" data-action="privacy">${c.privacy}</button></div></div><div class="footer-bottom"><p lang="en">${disclaimer}</p><div><span>${c.footerNote}</span><span class="developer-credit" lang="en">Concept and development: Giovinazzo José.</span></div></div></div>`;
}
function toolCard(i) {
  const c = t();
  return `<article class="tool-card tone-${i}"><button class="tool-card-button" data-tool="${i}" aria-label="${tools()[i]} · ${c.toolAction}"><div class="tool-visual">${art(i)}<span class="card-plus">${icon("plus")}</span></div><div class="tool-copy"><span class="micro">${c.toolLabel}</span><h3>${tools()[i]}</h3><p>${c.toolSub[i]}</p></div></button></article>`;
}
function home() {
  const c = t();
  return `<section class="hero wrap"><div class="hero-copy"><p class="concept-notice" lang="en">Independent client concept · Fictional learning experience</p>${label(c.eyebrow)}<h1>${c.hero[0]}<br>${c.hero[1]}<br><em>${c.hero[2]}</em></h1><p class="hero-intro">${c.intro}</p><div class="button-row"><a class="button primary" href="#course">${icon("book")}${c.start}</a><a class="quiet-link" href="#tools">${c.explore}</a></div><ul class="promises">${c.promise.map((p) => `<li>${icon("check")}${p}</li>`).join("")}</ul></div><div class="hero-visual"><img class="hero-image" src="./assets/atelier.jpg" width="1500" height="1000" alt="${c.photo}" fetchpriority="high"><div class="photo-caption">${label(c.photoLabel)}<p>${c.photoNote}</p></div><div class="hero-stamp" aria-hidden="true">${icon("chat")}<span>FR · EN<br>ES · IT</span></div><svg class="hero-thread" viewBox="0 0 200 180" fill="none" aria-hidden="true"><path d="M12 159c13-111 129 7 146-67S83 8 82 55s118 93 106-32" stroke="currentColor" stroke-width="2"/></svg></div></section>
 <section class="ribbon"><div class="wrap ribbon-inner">${icon("leaf")}<p>${c.ribbon}</p><span>${c.ribbonNote}</span></div></section>
 <section class="section wrap" id="tools"><div class="section-head"><div>${label(c.toolkitLabel)}<h2>${c.toolkitTitle}</h2><p class="section-intro">${c.toolkitIntro}</p></div><a class="quiet-link underlined" href="#library">${c.allResources}</a></div><div class="tool-grid">${tools().map((_, i) => toolCard(i)).join("")}</div><p class="section-footnote">${c.illustrationNote}</p></section>
 <section class="learning-feature wrap"><div class="learning-photo"><img src="./assets/collectif.jpg" width="1000" height="667" loading="lazy" alt="${c.photo}"><div class="photo-tag">${icon("eye")}<span>${c.journey[3]}</span></div></div><div class="learning-copy">${label(c.learningLabel)}<h2>${c.learningTitle}</h2><p>${c.learningIntro}</p><span class="lesson-meta">${icon("clock")}${c.learningMeta}</span><a class="button light" href="#lesson">${lessonCTA()}</a><small>${c.learningNote}</small></div></section>
 <section class="section wrap approach">${label(c.approachLabel)}<h2>${c.approachTitle}</h2><div class="approach-grid">${c.approachItems.map(([h, p], i) => `<article><div class="approach-icon">${icon(["book", "chat", "leaf"][i])}</div><h3>${h}</h3><p>${p}</p></article>`).join("")}</div></section>`;
}
function pageIntro(k) {
  const c = t();
  return `<div class="page-intro">${label(c[k + "Label"])}<h1>${c[k + "Title"]}</h1><p>${c[k + "Intro"]}</p></div>`;
}
function library() {
  const c = t();
  return `<section class="wrap page-section">${pageIntro("library")}<div class="library-toolbar"><label class="search-control">${icon("search")}<span class="sr-only">${c.search}</span><input id="search" type="search" placeholder="${c.searchPlaceholder}" value="${esc(query)}" autocomplete="off"></label><div class="filter-group" role="group" aria-label="${c.libraryLabel}">${c.categories.map((v, i) => `<button data-category="${i}" class="filter ${category === i ? "active" : ""}" aria-pressed="${category === i}">${v}</button>`).join("")}</div></div><div id="resource-results"></div><aside class="library-note">${icon("book")}<div><h2>${c.pendingTitle}</h2><p>${c.libraryIntro}</p><a class="quiet-link underlined" href="#lesson">${c.lessonStart}</a></div></aside></section>`;
}
function resources() {
  const c = t();
  const entries = [
    {
      id: 10,
      name: exampleResource[lang].title,
      sub: exampleResource[lang].subtitle,
      cat: 2,
    },
    ...tools().map((name, i) => ({ id: i, name, sub: c.guide, cat: 1 })),
    ...c.resourceNames.map((name, i) => ({
      id: i + 5,
      name,
      sub: c.resourceDescriptions[i],
      cat: i === 0 ? 1 : i < 3 ? 2 : 3,
    })),
  ];
  const normalize = (v) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase(lang);
  const filtered = entries.filter(
    (r) =>
      (category === 0 || r.cat === category) &&
      normalize(r.name + " " + r.sub).includes(normalize(query)),
  );
  $("#resource-results").innerHTML =
    `<p class="result-count" role="status">${filtered.length} ${c.results}</p><div class="resource-grid">${filtered.length ? filtered.map((r) => `<article class="resource-card"><div class="resource-icon tone-${r.id % 5}">${r.id < 5 ? art(r.id) : icon("file")}</div><div class="resource-copy"><span class="micro">${c.categories[r.cat]}</span><h2>${r.name}</h2><p>${r.sub}</p><span class="resource-status">${r.id === 10 ? exampleResource[lang].badge : c.pending}</span><button class="quiet-link underlined" data-resource="${r.id}">${c.detail}</button></div></article>`).join("") : `<div class="empty-state"><h2>${c.empty}</h2><button class="button secondary" data-action="clear">${c.clear}</button></div>`}</div>`;
}
function project() {
  const c = t();
  return `<section class="wrap page-section">${pageIntro("project")}<div class="project-banner"><img src="./assets/atelier.jpg" width="1500" height="1000" alt="${c.photo}"><div>${icon("leaf")}<h2>${c.projectMotto.join("<br>")}</h2><p>${c.projectBody}</p></div></div><div class="project-grid">${c.projectCards.map(([h, p]) => `<article><h2>${h}</h2><p>${p}</p></article>`).join("")}</div><aside class="partner-note"><h2>${c.partnerTitle}</h2><p>${c.partnerBody}</p></aside></section>`;
}
function course() {
  const c = t();
  return `<section class="wrap page-section">${pageIntro("course")}<p class="demo-note">${icon("eye")}${c.learningNote}</p><div class="module-list">${c.modules.map((name, i) => `<article class="module-card ${i === 1 ? "available" : ""}"><span class="module-letter" aria-hidden="true">${["A", "B", "C"][i]}</span><div><span class="micro">${i === 1 ? c.available : c.planned}</span><h2>${name}</h2><p>${c.moduleDescriptions[i]}</p>${i === 1 ? `<span class="lesson-meta">${icon("clock")}${c.learningMeta}</span>` : ""}</div>${i === 1 ? `<a class="button primary" href="#lesson">${lessonCTA()}</a>` : `<button class="button secondary" data-module="${i}">${c.planned}</button>`}</article>`).join("")}</div><div class="journey-strip">${c.journey.map((s) => `<span>${s}</span>`).join('<span class="journey-line" aria-hidden="true"></span>')}</div></section>`;
}
function lesson() {
  const c = t(),
    n = progress.step,
    step = c.steps[n];
  return `<section class="wrap lesson-section"><div class="lesson-top"><a class="quiet-link underlined" href="#course">${c.exit}</a><span class="storage-note">${icon("check")}${storageOK ? c.saved : c.storageOff}</span></div><div class="lesson-layout"><aside class="lesson-sidebar">${label(c.lessonLabel)}<h2>${c.modules[1]}</h2><div class="progress-label"><span>${c.step} ${n + 1} ${c.of} 6</span><span>${Math.round((n / 5) * 100)} %</span></div><progress max="5" value="${n}" aria-label="${c.courseNav}"></progress><nav class="step-list" aria-label="${c.courseNav}">${[...c.steps.map((s) => s.label), c.completeLabel].map((s, i) => `<button data-step="${i}" ${i > progress.max ? "disabled" : ""} ${i === n ? 'aria-current="step"' : ""}><span class="step-marker">${i < n ? icon("check") : i + 1}</span><span>${s}</span></button>`).join("")}</nav><button class="text-button reset-button" data-action="reset">${c.reset}</button></aside><div class="lesson-paper"><div class="lesson-kicker">${label(n === 5 ? c.completeLabel : step.label)}<span>${String(n + 1).padStart(2, "0")} / 06</span></div>${n === 5 ? summary() : `<h1>${step.title}</h1><p class="lesson-intro">${step.intro}</p>${lessonBody(n, step)}<div class="lesson-bottom">${n > 0 ? `<button class="button secondary" data-action="previous">${c.back}</button>` : "<span></span>"}<div>${n >= 3 && progress.answers[n - 3] === null ? `<p class="select-hint">${c.selectHint}</p>` : ""}<button class="button primary" data-action="next" ${n >= 3 && progress.answers[n - 3] === null ? "disabled" : ""}>${n === 4 ? c.finish : c.next}</button></div></div>`}</div></div></section>`;
}
function lessonBody(n, s) {
  const c = t();
  if (n === 0)
    return `<img class="workshop-illustration" src="./assets/workshop.svg" width="900" height="460" alt="${s.alt}"><p class="lesson-text">${s.text}</p><aside class="callout">${icon("eye")}<p>${s.callout}</p></aside>`;
  if (n === 1)
    return `<div class="comparison">${s.compare.map(([h, p, q], i) => `<div>${icon(i ? "eye" : "chat")}${label(h)}<h2>${p}</h2><span>${q}</span></div>`).join("")}</div><p class="lesson-text">${s.text}</p><aside class="callout">${icon("book")}<p>${s.callout}</p></aside>`;
  if (n === 2)
    return `<figure class="scenario"><span class="quote-mark" aria-hidden="true">“</span><blockquote>${s.quote}</blockquote><figcaption>${s.quoteLabel}</figcaption></figure><p class="lesson-text">${s.text}</p><aside class="callout">${icon("eye")}<p>${s.callout}</p></aside>`;
  const selected = progress.answers[n - 3];
  return `<fieldset class="answer-group"><legend class="sr-only">${s.title}</legend>${s.options.map((option, i) => `<label class="answer ${selected === i ? "selected" : ""}"><input type="radio" name="answer" value="${i}" ${selected === i ? "checked" : ""} aria-describedby="feedback"><span class="radio-mark" aria-hidden="true"></span><span>${option}</span></label>`).join("")}</fieldset><div id="feedback" class="feedback ${selected === null ? "feedback-empty" : ""}" role="status" aria-live="polite" aria-atomic="true">${selected === null ? "" : feedback(s, selected)}</div>`;
}
function feedback(s, i) {
  return `${icon("chat")}<div><h2>${t().feedbackLabel}</h2><p>${s.feedback[i]}</p><small>${t().tryOther}</small></div>`;
}
function summary() {
  const c = t();
  return `<div class="summary"><div class="summary-symbol">${icon("leaf")}</div><h1>${c.completeTitle}</h1><p class="lesson-intro">${c.completeIntro}</p><ul class="takeaways">${c.takeaways.map((p) => `<li>${icon("check")}<span>${p}</span></li>`).join("")}</ul><p class="summary-note">${c.summaryNote}</p><div class="button-row"><a class="button primary" href="#library">${c.returnLibrary}</a><a class="button secondary" href="./assets/learning-studio-memo-${lang}.txt" download="learning-studio-memo-demo-${lang}.txt">${icon("download")}${c.download}</a></div><p id="download-status" role="status"></p><button class="text-button" data-action="previous">${c.back}</button></div>`;
}
function render(focus = false) {
  header();
  footer();
  $("#main").innerHTML = (
    { home, library, course, lesson, project }[route] || home
  )();
  if (route === "library") resources();
  if (focus) {
    $("#main h1")?.setAttribute("tabindex", "-1");
    $("#main h1")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}
function navigate() {
  const hash = location.hash.slice(1) || "home";
  if (hash === "tools") {
    if (route !== "home") {
      route = "home";
      render();
    }
    menuOpen = false;
    header();
    requestAnimationFrame(() =>
      $("#tools").scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      }),
    );
    return;
  }
  route = ["home", "library", "course", "project", "lesson"].includes(hash)
    ? hash
    : "home";
  menuOpen = false;
  render(true);
}
function modal(title, body, actions = "") {
  modalReturn = document.activeElement;
  $("#dialog").innerHTML =
    `<button class="dialog-close icon-button" data-action="close" aria-label="${t().close}">${icon("close")}</button><div class="dialog-content"><h2 id="dialog-title">${title}</h2>${body}<div class="button-row">${actions || `<button class="button primary" data-action="close">${t().close}</button>`}</div></div>`;
  $("#dialog").showModal();
}
function closeModal() {
  $("#dialog").close();
  modalReturn?.focus();
}
function resourceModal(id) {
  if (id === 10) {
    const r = exampleResource[lang];
    return modal(
      r.title,
      `<span class="resource-status example-status">${r.badge}</span><p>${r.intro}</p><h3>${r.objectiveLabel}</h3><p>${r.objective}</p><h3>${r.scenarioLabel}</h3><p>${r.scenario}</p><h3>${r.tableLabel}</h3><div class="example-table"><table><thead><tr>${r.headers.map((x) => `<th scope="col">${x}</th>`).join("")}</tr></thead><tbody>${r.rows.map((row) => `<tr>${row.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div><h3>${r.summaryLabel}</h3><p>${r.summary}</p><small>${r.privacy}</small><p class="example-format">${r.format}</p>`,
      `<a class="button primary" href="./assets/example-observation-${lang}.pdf" download>${icon("download")}${r.download}</a><button class="button secondary" data-action="close">${t().close}</button>`,
    );
  }

  const c = t(),
    isTool = id < 5;
  modal(
    isTool ? tools()[id] : c.resourceNames[id - 5],
    `${isTool ? `<div class="dialog-art tone-${id}">${art(id)}</div>` : ""}<span class="resource-status">${c.pending}</span><p>${isTool ? c.pendingBody : c.pendingOther}</p>${isTool ? `<small>${c.illustrationNote}</small>` : ""}`,
  );
}
function changeStep(n) {
  progress.step = n;
  progress.max = Math.max(n, progress.max);
  persist();
  render();
  $(".lesson-paper h1").setAttribute("tabindex", "-1");
  $(".lesson-paper h1").focus({ preventScroll: true });
  $(".lesson-paper").scrollIntoView({ block: "start", behavior: "instant" });
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".skip-link")) {
    e.preventDefault();
    $("#main").focus();
    return;
  }
  const downloadLink = e.target.closest("a[download]");
  if (downloadLink) {
    const status = document.querySelector("#download-status");
    if (status) status.textContent = t().downloadDone;
    return;
  }
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.tool !== undefined) return resourceModal(+b.dataset.tool);
  if (b.dataset.resource !== undefined)
    return resourceModal(+b.dataset.resource);
  if (b.dataset.module !== undefined)
    return modal(t().modules[+b.dataset.module], `<p>${t().moduleModal}</p>`);
  if (b.dataset.category !== undefined) {
    category = +b.dataset.category;
    $$Filters();
    resources();
    return;
  }
  if (b.dataset.step !== undefined)
    return changeStep(Math.min(+b.dataset.step, progress.max));
  const action = b.dataset.action;
  if (action === "menu") {
    menuOpen = !menuOpen;
    header();
    $(".mobile-menu").focus();
  }
  if (action === "close") closeModal();
  if (action === "credits")
    modal(
      t().credits,
      `<p>${t().creditsBody}</p><p><a class="underlined" href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer">Unsplash License</a> · <a class="underlined" href="https://openfontlicense.org/" target="_blank" rel="noopener noreferrer">SIL Open Font License</a></p>`,
    );
  if (action === "privacy")
    modal(t().privacyTitle, `<p>${t().privacyBody}</p>`);
  if (action === "clear") {
    query = "";
    category = 0;
    $("#search").value = "";
    $$Filters();
    resources();
    $("#search").focus();
  }
  if (action === "previous") changeStep(Math.max(0, progress.step - 1));
  if (
    action === "next" &&
    progress.step < 5 &&
    (progress.step < 3 || progress.answers[progress.step - 3] !== null)
  )
    changeStep(progress.step + 1);
  if (action === "reset")
    modal(
      t().resetTitle,
      `<p>${t().resetBody}</p>`,
      `<button class="button secondary" data-action="close">${t().cancel}</button><button class="button primary" data-action="confirm-reset">${t().reset}</button>`,
    );
  if (action === "confirm-reset") {
    closeModal();
    progress = { step: 0, max: 0, answers: [null, null] };
    persist();
    render(true);
  }
});
function $$Filters() {
  document.querySelectorAll("[data-category]").forEach((b) => {
    b.classList.toggle("active", +b.dataset.category === category);
    b.setAttribute("aria-pressed", String(+b.dataset.category === category));
  });
}
document.addEventListener("change", (e) => {
  if (e.target.id === "language") {
    lang = e.target.value;
    persist();
    render();
    $("#language").focus();
  }
  if (e.target.name === "answer") {
    const i = +e.target.value;
    progress.answers[progress.step - 3] = i;
    persist();
    document
      .querySelectorAll(".answer")
      .forEach((l) =>
        l.classList.toggle("selected", +l.querySelector("input").value === i),
      );
    $("#feedback").classList.remove("feedback-empty");
    $("#feedback").innerHTML = feedback(t().steps[progress.step], i);
    $('[data-action="next"]').disabled = false;
    $(".select-hint")?.remove();
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "search") {
    query = e.target.value;
    resources();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) {
    menuOpen = false;
    header();
    $(".mobile-menu").focus();
  }
});
$("#dialog").addEventListener("click", (e) => {
  if (e.target === $("#dialog")) {
    const r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      closeModal();
  }
});
window.addEventListener("hashchange", navigate);
persist();
navigate();
