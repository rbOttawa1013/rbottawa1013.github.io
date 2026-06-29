'use strict';

const st = {
  lang: 'en',
  tract: 'a',
  scenario: null,
  dataMode: 'loading',
  dataError: '',
  checkedAt: '',
  series: [],
  rows: []
};

const WDS_ENDPOINT = 'https://www150.statcan.gc.ca/t1/wds/rest/getDataFromVectorsAndLatestNPeriods';
const WDS_INFO_ENDPOINT = 'https://www150.statcan.gc.ca/t1/wds/rest/getSeriesInfoFromVector';
const STATCAN_WDS_GUIDE = 'https://www.statcan.gc.ca/en/developers/wds/user-guide';
const STATCAN_SEARCH = 'https://www150.statcan.gc.ca/n1/en/type/data?text=';

const LIVE_SERIES = [
  { vectorId: 1, latestN: 6, fallbackTitleEn: 'Population estimate, Canada', fallbackTitleFr: 'Estimation de la population, Canada', theme: 'Population' },
  { vectorId: 42076, latestN: 6, fallbackTitleEn: 'Public StatCan vector example', fallbackTitleFr: 'Exemple de vecteur public de StatCan', theme: 'Economic or social series' },
  { vectorId: 32164132, latestN: 6, fallbackTitleEn: 'Youth justice public vector example', fallbackTitleFr: 'Exemple de vecteur public sur la justice des jeunes', theme: 'Justice / quality notes' }
];

const demoRows = [
  { geo: 'Metro demo', employment: 78, income: 74, access: 86, confidence: 92, quality: 'A', refPer: 'Demo period', source: 'Demo training values', value: 78, previous: 72, change: 6, titleEn: 'Employment index', titleFr: 'Indice d’emploi' },
  { geo: 'Rural demo', employment: 64, income: 61, access: 63, confidence: 78, quality: 'B', refPer: 'Demo period', source: 'Demo training values', value: 64, previous: 68, change: -4, titleEn: 'Income index', titleFr: 'Indice de revenu' },
  { geo: 'North demo', employment: 58, income: 67, access: 52, confidence: 62, quality: 'C', refPer: 'Demo period', source: 'Demo training values', value: 58, previous: 60, change: -2, titleEn: 'Digital access index', titleFr: 'Indice d’accès numérique' },
  { geo: 'Coastal demo', employment: 71, income: 69, access: 72, confidence: 84, quality: 'B', refPer: 'Demo period', source: 'Demo training values', value: 71, previous: 69, change: 2, titleEn: 'Quality confidence', titleFr: 'Confiance de qualité' }
];

const tracts = {
  a: ['Metro demo', 24500, 76000, 91, 'A', 'Training proxy for a dense urban area.'],
  b: ['Suburban demo', 18200, 82000, 86, 'B', 'Training proxy for a commuter suburb.'],
  c: ['Rural demo', 9600, 61000, 78, 'B', 'Training proxy for a rural service area.'],
  d: ['Coastal demo', 12100, 69000, 74, 'B', 'Training proxy for a coastal or resource community.'],
  e: ['North demo', 4300, 67000, 59, 'C', 'Training proxy for a northern or remote community.']
};

const tx = {
  en: {
    skip: 'Skip to main content',
    brand: 'Statistics Canada data literacy prototype',
    searchLabel: 'Search Canada.ca',
    search: 'Search',
    menu: 'Menu',
    navStart: 'Start',
    navTools: 'Sandbox tools',
    crumb: 'National Data Literacy Sandbox Suite',
    h1: 'National Data Literacy Sandbox Suite',
    lead: 'Practise statistical thinking, source evaluation, accessible visualization and geographic interpretation in one bilingual prototype.',
    meta: 'Live public-data attempt · automatic demonstration fallback · no server storage',
    beforeH: 'Before you start',
    beforeP: 'The sandbox first tries to load public Statistics Canada Web Data Service data in your browser. If the public API, network, or browser policy blocks the request, the page falls back to clearly labelled demonstration data.',
    onPage: 'On this page',
    otp1: 'Start a learning scenario',
    otp2: 'Use the sandbox tools',
    startH: 'Start a learning scenario',
    startP: 'Choose a learning goal and community type. The page creates a printable learning path and updates the tools below.',
    errH: 'There is a problem',
    goalLabel: 'Learning goal (required)',
    goalHint: 'Choose the main skill to practise.',
    postalLabel: 'Postal code seed (optional)',
    postalHint: 'Use a format such as K1A 0A6. This stays in your browser and is used only to tailor the training scenario.',
    communityLegend: 'Community type (required)',
    modulesLegend: 'Optional modules',
    generate: 'Generate learning path',
    reset: 'Reset',
    reloadData: 'Reload public data',
    print: 'Print or save as PDF',
    export: 'Download scenario JSON',
    toolsH: 'Sandbox tools',
    toolsP: 'Each module shows its data status. Live public data is used when available; otherwise the module uses labelled demonstration data.',
    tabAssistant: 'Assistant',
    tabDictionary: 'Dictionary',
    tabMatrix: 'Matrix',
    tabVisualizer: 'Visualizer',
    tabMap: 'Community profile',
    assistantH: 'Source-aware statistical assistant',
    assistantP: 'Ask about rounding, coefficients of variation, suppression, metadata, chart interpretation, or whether the current values are live or demonstration data.',
    chatLabel: 'Question',
    send: 'Send',
    dictH: 'Bilingual statistical dictionary',
    termLabel: 'Concept',
    matrixH: 'Evidence matrix explorer',
    focusLabel: 'Focus',
    vizH: 'Accessible data visualizer',
    metricLabel: 'Metric',
    mapH: 'Community profile training view',
    mapP: 'The postal-code seed does not create an official StatCan boundary. This tab shows a keyboard-operable training profile and, when available, a live national public-data reference for comparison.',
    footerH: 'Government of Canada prototype links',
    privacy: 'Privacy',
    top: 'Top of page',
    edition: 'Public Service Data Prototype Edition',
    bannerLive: 'Data status: live Statistics Canada public API data loaded. Verify metadata before reuse.',
    bannerDemo: 'Data status: demonstration fallback. Public API data was not loaded; values are for training only.',
    bannerLoading: 'Data status: checking Statistics Canada public API. Demonstration fallback is available.',
    goalErr: 'Select a learning goal.',
    commErr: 'Select a community type.',
    postalErr: 'Use a Canadian postal code format such as A1A 1A1.',
    chatErr: 'Enter a question before sending.',
    ready: 'Learning path generated.',
    hello: 'Ask a statistical-method question or choose an example.',
    liveBadge: 'Live public API',
    demoBadge: 'Demonstration fallback',
    loadingBadge: 'Checking public API',
    dataStatusH: 'Data source status',
    apiSource: 'Source: Statistics Canada Web Data Service (WDS).',
    fallbackReason: 'Fallback reason',
    checked: 'Checked',
    learnMore: 'WDS user guide',
    sourceLink: 'Source link',
    sourceSearch: 'Search source table',
    limitations: 'Limitations',
    limitationsText: 'Postal code to census geography is not resolved in this static page. Do not use the training map for individual-level or address-level conclusions.',
    matrixNote: 'Review source, period, geography, unit and quality before comparing rows.',
    noLiveLocal: 'No official local geography has been resolved from the postal code. Local values below are demonstration values.',
    liveReference: 'Live public-data reference',
    demoReference: 'Demonstration training reference'
  },
  fr: {
    skip: 'Passer au contenu principal',
    brand: 'Prototype de littératie des données de Statistique Canada',
    searchLabel: 'Rechercher dans Canada.ca',
    search: 'Rechercher',
    menu: 'Menu',
    navStart: 'Commencer',
    navTools: 'Outils du bac à sable',
    crumb: 'Suite nationale de bac à sable sur la littératie des données',
    h1: 'Suite nationale de bac à sable sur la littératie des données',
    lead: 'Pratiquez la pensée statistique, l’évaluation des sources, la visualisation accessible et l’interprétation géographique dans un prototype bilingue.',
    meta: 'Tentative de données publiques en direct · repli automatique vers des données de démonstration · aucun stockage serveur',
    beforeH: 'Avant de commencer',
    beforeP: 'Le bac à sable tente d’abord de charger des données publiques du Service de données Web de Statistique Canada dans votre navigateur. Si l’API publique, le réseau ou la politique du navigateur bloque la demande, la page utilise des données de démonstration clairement indiquées.',
    onPage: 'Sur cette page',
    otp1: 'Commencer un scénario d’apprentissage',
    otp2: 'Utiliser les outils du bac à sable',
    startH: 'Commencer un scénario d’apprentissage',
    startP: 'Choisissez un objectif d’apprentissage et un type de communauté. La page crée un parcours imprimable et met à jour les outils ci-dessous.',
    errH: 'Il y a un problème',
    goalLabel: 'Objectif d’apprentissage (obligatoire)',
    goalHint: 'Choisissez la principale compétence à pratiquer.',
    postalLabel: 'Code postal de départ (facultatif)',
    postalHint: 'Utilisez un format comme K1A 0A6. Cette valeur demeure dans votre navigateur et sert seulement à adapter le scénario de formation.',
    communityLegend: 'Type de communauté (obligatoire)',
    modulesLegend: 'Modules facultatifs',
    generate: 'Générer le parcours',
    reset: 'Réinitialiser',
    reloadData: 'Recharger les données publiques',
    print: 'Imprimer ou enregistrer en PDF',
    export: 'Télécharger le scénario JSON',
    toolsH: 'Outils du bac à sable',
    toolsP: 'Chaque module affiche l’état de ses données. Les données publiques en direct sont utilisées lorsqu’elles sont disponibles; sinon, le module utilise des données de démonstration indiquées.',
    tabAssistant: 'Assistant',
    tabDictionary: 'Dictionnaire',
    tabMatrix: 'Matrice',
    tabVisualizer: 'Visualiseur',
    tabMap: 'Profil communautaire',
    assistantH: 'Assistant statistique axé sur les sources',
    assistantP: 'Posez des questions sur l’arrondissement, les coefficients de variation, la suppression, les métadonnées, l’interprétation des graphiques ou l’état direct/de démonstration des valeurs.',
    chatLabel: 'Question',
    send: 'Envoyer',
    dictH: 'Dictionnaire statistique bilingue',
    termLabel: 'Concept',
    matrixH: 'Explorateur de matrice des preuves',
    focusLabel: 'Point de mire',
    vizH: 'Visualiseur de données accessible',
    metricLabel: 'Mesure',
    mapH: 'Vue de formation du profil communautaire',
    mapP: 'Le code postal de départ ne crée pas une limite officielle de Statistique Canada. Cet onglet montre un profil de formation utilisable au clavier et, lorsqu’elle est disponible, une référence nationale de données publiques en direct.',
    footerH: 'Liens du prototype du gouvernement du Canada',
    privacy: 'Confidentialité',
    top: 'Haut de la page',
    edition: 'Édition prototype des données du service public',
    bannerLive: 'État des données : données de l’API publique de Statistique Canada chargées. Vérifiez les métadonnées avant toute réutilisation.',
    bannerDemo: 'État des données : repli vers des données de démonstration. Les données de l’API publique n’ont pas été chargées; les valeurs servent seulement à la formation.',
    bannerLoading: 'État des données : vérification de l’API publique de Statistique Canada. Le repli vers la démonstration est disponible.',
    goalErr: 'Sélectionnez un objectif d’apprentissage.',
    commErr: 'Sélectionnez un type de communauté.',
    postalErr: 'Utilisez le format d’un code postal canadien, par exemple A1A 1A1.',
    chatErr: 'Entrez une question avant l’envoi.',
    ready: 'Parcours d’apprentissage généré.',
    hello: 'Posez une question sur une méthode statistique ou choisissez un exemple.',
    liveBadge: 'API publique en direct',
    demoBadge: 'Repli de démonstration',
    loadingBadge: 'Vérification de l’API publique',
    dataStatusH: 'État de la source de données',
    apiSource: 'Source : Service de données Web (SDW) de Statistique Canada.',
    fallbackReason: 'Raison du repli',
    checked: 'Vérifié',
    learnMore: 'Guide d’utilisation du SDW',
    sourceLink: 'Lien de source',
    sourceSearch: 'Rechercher la table source',
    limitations: 'Limites',
    limitationsText: 'Le passage du code postal à la géographie du recensement n’est pas résolu dans cette page statique. N’utilisez pas la carte de formation pour tirer des conclusions au niveau individuel ou de l’adresse.',
    matrixNote: 'Vérifiez la source, la période, la géographie, l’unité et la qualité avant de comparer les lignes.',
    noLiveLocal: 'Aucune géographie locale officielle n’a été résolue à partir du code postal. Les valeurs locales ci-dessous sont des valeurs de démonstration.',
    liveReference: 'Référence de données publiques en direct',
    demoReference: 'Référence de formation de démonstration'
  }
};

const opts = {
  goals: {
    en: [['', 'Select an option'], ['quality', 'Assess data quality'], ['chart', 'Interpret a chart'], ['metadata', 'Use metadata before comparing data'], ['geo', 'Compare geography levels'], ['source', 'Check live API versus fallback data']],
    fr: [['', 'Sélectionnez une option'], ['quality', 'Évaluer la qualité des données'], ['chart', 'Interpréter un graphique'], ['metadata', 'Utiliser les métadonnées avant de comparer les données'], ['geo', 'Comparer les niveaux géographiques'], ['source', 'Vérifier l’API en direct et les données de repli']]
  },
  communities: {
    en: [['metro', 'Metro training community'], ['rural', 'Rural training community'], ['north', 'Northern training community']],
    fr: [['metro', 'Communauté métropolitaine de formation'], ['rural', 'Communauté rurale de formation'], ['north', 'Communauté nordique de formation']]
  },
  modules: {
    en: [['assistant', 'Source-aware assistant prompts'], ['chart', 'Accessible chart and equivalent table'], ['map', 'Community profile training view'], ['methods', 'Method and limitation notes'], ['api', 'Public API status review']],
    fr: [['assistant', 'Questions de l’assistant axées sur les sources'], ['chart', 'Graphique accessible et tableau équivalent'], ['map', 'Vue de formation du profil communautaire'], ['methods', 'Notes de méthode et limites'], ['api', 'Examen de l’état de l’API publique']]
  },
  focus: {
    en: [['all', 'All rows'], ['live', 'Live API rows only'], ['demo', 'Demonstration fallback rows'], ['reliability', 'Reliability cautions'], ['changed', 'Largest recent change']],
    fr: [['all', 'Toutes les lignes'], ['live', 'Lignes de l’API en direct seulement'], ['demo', 'Lignes de repli de démonstration'], ['reliability', 'Mises en garde sur la fiabilité'], ['changed', 'Plus grande variation récente']]
  },
  metrics: {
    en: [['value', 'Latest value'], ['change', 'Recent change'], ['confidence', 'Quality confidence']],
    fr: [['value', 'Valeur la plus récente'], ['change', 'Variation récente'], ['confidence', 'Confiance de qualité']]
  }
};

const terms = [
  ['api', 'Public API', 'API publique', 'A documented web service that lets the page request public data directly from the source system.', 'Service Web documenté qui permet à la page de demander des données publiques directement au système source.'],
  ['fallback', 'Demonstration fallback', 'Repli de démonstration', 'Labelled synthetic or training data used only when live public data cannot be loaded.', 'Données synthétiques ou de formation indiquées, utilisées seulement lorsque les données publiques en direct ne peuvent pas être chargées.'],
  ['vector', 'Vector', 'Vecteur', 'A short Statistics Canada identifier for a time series of data points.', 'Court identifiant de Statistique Canada pour une série chronologique de points de données.'],
  ['pid', 'Product identification number', 'Numéro d’identification du produit', 'An identifier for a Statistics Canada table or cube. It supports source traceability.', 'Identifiant d’une table ou d’un cube de Statistique Canada. Il appuie la traçabilité de la source.'],
  ['metadata', 'Metadata', 'Métadonnées', 'Information that explains concept, geography, reference period, units, source status and limitations.', 'Information qui explique le concept, la géographie, la période de référence, les unités, l’état de la source et les limites.'],
  ['rounding', 'Random rounding', 'Arrondissement aléatoire', 'Rounds values to reduce disclosure risk in small cells. Rounded cells may not add exactly to totals.', 'Arrondit les valeurs afin de réduire le risque de divulgation dans les petites cellules. Les cellules arrondies peuvent ne pas correspondre exactement aux totaux.'],
  ['cv', 'Coefficient of variation', 'Coefficient de variation', 'Relative measure of sampling variability used to judge estimate reliability.', 'Mesure relative de la variabilité d’échantillonnage utilisée pour juger la fiabilité d’une estimation.'],
  ['suppression', 'Suppression', 'Suppression', 'Withholding a value when quality or confidentiality rules mean it should not be released or reused as a precise statistic.', 'Non-diffusion d’une valeur lorsque les règles de qualité ou de confidentialité signifient qu’elle ne devrait pas être publiée ou réutilisée comme statistique précise.'],
  ['accessible-chart', 'Accessible chart', 'Graphique accessible', 'A chart with clear labels, sufficient contrast, no colour-only meaning and an equivalent table.', 'Graphique comprenant des étiquettes claires, un contraste suffisant, une signification qui ne dépend pas seulement de la couleur et un tableau équivalent.']
];

function T(k) { return tx[st.lang][k] || tx.en[k] || k; }
function $(id) { return document.getElementById(id); }
function E(tag, o = {}) {
  const n = document.createElement(tag);
  if (o.c) n.className = o.c;
  if (o.t !== undefined) n.textContent = o.t;
  if (o.a) Object.entries(o.a).forEach(([k, v]) => n.setAttribute(k, String(v)));
  return n;
}
function clear(n) { if (n) { while (n.firstChild) n.removeChild(n.firstChild); } }
function loc() { return st.lang === 'fr' ? 'fr-CA' : 'en-CA'; }
function money(v) { return new Intl.NumberFormat(loc(), { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v); }
function num(v, max = 0) { return new Intl.NumberFormat(loc(), { maximumFractionDigits: max }).format(v); }
function label(list, v) { const m = list[st.lang].find(x => x[0] === v); return m ? m[1] : v; }
function titleOf(row) { return st.lang === 'fr' ? (row.titleFr || row.titleEn || row.geo) : (row.titleEn || row.titleFr || row.geo); }
function modeBadge() { return st.dataMode === 'live' ? T('liveBadge') : st.dataMode === 'loading' ? T('loadingBadge') : T('demoBadge'); }
function statusClass() { return st.dataMode === 'live' ? 'badge badge-live' : st.dataMode === 'loading' ? 'badge badge-loading' : 'badge badge-demo'; }
function sourceMode(row) { return row.live ? T('liveBadge') : T('demoBadge'); }
function todayStamp() { return new Date().toLocaleString(loc(), { dateStyle: 'medium', timeStyle: 'short' }); }

function applyLang() {
  document.documentElement.lang = st.lang;
  document.querySelectorAll('[data-k]').forEach(n => { n.textContent = T(n.dataset.k); });
  const bannerKey = st.dataMode === 'live' ? 'bannerLive' : st.dataMode === 'loading' ? 'bannerLoading' : 'bannerDemo';
  $('banner').textContent = T(bannerKey);
  $('lang').textContent = st.lang === 'en' ? 'Français' : 'English';
  $('q').placeholder = st.lang === 'en' ? 'Search Canada.ca' : 'Rechercher dans Canada.ca';
  renderAll();
}

function fillSelect(id, list) {
  const s = $(id);
  const cur = s.value;
  clear(s);
  list[st.lang].forEach(([v, l]) => s.append(E('option', { t: l, a: { value: v } })));
  if ([...s.options].some(o => o.value === cur)) s.value = cur;
}

function renderForm() {
  fillSelect('goal', opts.goals);
  const c = $('communities');
  clear(c);
  opts.communities[st.lang].forEach(([v, l]) => {
    const li = E('li');
    const lab = E('label');
    const inp = E('input', { a: { type: 'radio', name: 'community', value: v } });
    if ((st.scenario && st.scenario.community === v) || (!st.scenario && v === 'metro')) inp.checked = true;
    lab.append(inp, E('span', { t: l }));
    li.append(lab);
    c.append(li);
  });
  const m = $('modules');
  clear(m);
  opts.modules[st.lang].forEach(([v, l]) => {
    const li = E('li');
    const lab = E('label');
    const inp = E('input', { a: { type: 'checkbox', name: 'modules', value: v } });
    inp.checked = !st.scenario || (st.scenario.modules || []).includes(v);
    lab.append(inp, E('span', { t: l }));
    li.append(lab);
    m.append(li);
  });
}

function norm(v) { return v.trim().toUpperCase().replace(/\s+/g, ''); }
function displayPostal(v) { const n = norm(v); return n.length === 6 ? n.slice(0, 3) + ' ' + n.slice(3) : n; }
function validPostal(v) { return v === '' || /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(norm(v)); }
function clearErr() {
  $('errsum').hidden = true;
  clear($('errlist'));
  ['goalerr', 'postalerr', 'commerr'].forEach(id => { $(id).hidden = true; $(id).textContent = ''; });
  ['goalgrp', 'postalgrp', 'commgrp'].forEach(id => $(id).classList.remove('has-error'));
  ['goal', 'postal'].forEach(id => $(id).removeAttribute('aria-invalid'));
}
function addErr(field, group, msgEl, msg) {
  const li = E('li');
  const a = E('a', { t: msg, a: { href: '#' + field } });
  li.append(a);
  $('errlist').append(li);
  $(msgEl).textContent = msg;
  $(msgEl).hidden = false;
  $(group).classList.add('has-error');
  if ($(field)) $(field).setAttribute('aria-invalid', 'true');
}

function getScenario() {
  const com = document.querySelector('input[name="community"]:checked');
  return {
    goal: $('goal').value,
    postal: norm($('postal').value) || 'K1A0A6',
    community: com ? com.value : '',
    modules: [...document.querySelectorAll('input[name="modules"]:checked')].map(x => x.value),
    dataMode: st.dataMode,
    generated: new Date().toISOString()
  };
}

function submitScenario(e) {
  if (e) e.preventDefault();
  clearErr();
  const s = getScenario();
  if (!s.goal) addErr('goal', 'goalgrp', 'goalerr', T('goalErr'));
  if (!s.community) addErr('communities', 'commgrp', 'commerr', T('commErr'));
  if (!validPostal($('postal').value)) addErr('postal', 'postalgrp', 'postalerr', T('postalErr'));
  if ($('errlist').children.length) {
    $('errsum').hidden = false;
    $('errsum').focus();
    return;
  }
  st.scenario = s;
  renderOutput();
  renderMap();
  $('output').focus();
}

function renderOutput() {
  const out = $('output');
  clear(out);
  const s = st.scenario || getScenario();
  out.append(E('h3', { t: st.lang === 'fr' ? 'Parcours généré' : 'Generated learning path' }));
  const ul = E('ul');
  ul.append(
    E('li', { t: (st.lang === 'fr' ? 'Objectif : ' : 'Goal: ') + label(opts.goals, s.goal) }),
    E('li', { t: (st.lang === 'fr' ? 'Communauté : ' : 'Community: ') + label(opts.communities, s.community || 'metro') }),
    E('li', { t: (st.lang === 'fr' ? 'Code postal : ' : 'Postal seed: ') + displayPostal(s.postal) }),
    E('li', { t: (st.lang === 'fr' ? 'Modules : ' : 'Modules: ') + (s.modules || []).map(v => label(opts.modules, v)).join(', ') }),
    E('li', { t: (st.lang === 'fr' ? 'État des données : ' : 'Data status: ') + modeBadge() })
  );
  out.append(ul, E('p', { t: T('ready') }));
}

function initTabs() {
  document.querySelectorAll('[role=tab]').forEach(t => {
    t.addEventListener('click', () => setTab(t.dataset.tab));
    t.addEventListener('keydown', e => {
      const a = [...document.querySelectorAll('[role=tab]')];
      const i = a.indexOf(e.currentTarget);
      let n = i;
      if (e.key === 'ArrowRight') n = (i + 1) % a.length;
      if (e.key === 'ArrowLeft') n = (i - 1 + a.length) % a.length;
      if (e.key === 'Home') n = 0;
      if (e.key === 'End') n = a.length - 1;
      if (n !== i) { e.preventDefault(); setTab(a[n].dataset.tab); }
    });
  });
}
function setTab(id) {
  document.querySelectorAll('[role=tab]').forEach(t => {
    const on = t.dataset.tab === id;
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
  });
  document.querySelectorAll('[role=tabpanel]').forEach(p => { p.hidden = p.id !== 'panel-' + id; });
  $('tab-' + id).focus();
}

async function fetchPublicData() {
  st.dataMode = 'loading';
  st.checkedAt = todayStamp();
  st.dataError = '';
  renderSourceStatus();
  try {
    const requests = LIVE_SERIES.map(s => ({ vectorId: s.vectorId, latestN: s.latestN }));
    const infoReq = LIVE_SERIES.map(s => ({ vectorId: s.vectorId }));
    const [seriesRes, infoRes] = await Promise.all([
      fetch(WDS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requests) }),
      fetch(WDS_INFO_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(infoReq) })
    ]);
    if (!seriesRes.ok) throw new Error('WDS data request returned HTTP ' + seriesRes.status);
    const seriesJson = await seriesRes.json();
    const infoJson = infoRes.ok ? await infoRes.json() : [];
    const infoByVector = new Map((Array.isArray(infoJson) ? infoJson : []).map(x => [Number(x.object && x.object.vectorId), x.object || {}]));
    const parsed = parseWds(seriesJson, infoByVector);
    if (!parsed.rows.length) throw new Error('WDS returned no usable data points.');
    st.series = parsed.series;
    st.rows = parsed.rows;
    st.dataMode = 'live';
  } catch (err) {
    st.dataMode = 'demo';
    st.dataError = err && err.message ? err.message : 'Public API request failed.';
    st.series = [];
    st.rows = demoRows.map(r => ({ ...r, live: false, source: 'Demonstration fallback' }));
  }
  st.checkedAt = todayStamp();
  renderAll();
}

function parseWds(payload, infoByVector) {
  const items = Array.isArray(payload) ? payload : [payload];
  const series = [];
  const rows = [];
  items.forEach((entry, i) => {
    if (!entry || entry.status !== 'SUCCESS' || !entry.object) return;
    const obj = entry.object;
    const vectorId = Number(obj.vectorId || LIVE_SERIES[i]?.vectorId);
    const info = infoByVector.get(vectorId) || {};
    const fallback = LIVE_SERIES.find(x => Number(x.vectorId) === vectorId) || LIVE_SERIES[i] || {};
    const points = (obj.vectorDataPoint || [])
      .map(p => ({
        refPer: p.refPer || p.refPerRaw || '',
        value: Number(p.value),
        decimals: Number(p.decimals || 0),
        statusCode: p.statusCode,
        releaseTime: p.releaseTime || '',
        frequencyCode: p.frequencyCode || obj.frequencyCode || info.frequencyCode || ''
      }))
      .filter(p => Number.isFinite(p.value));
    if (!points.length) return;
    const latest = points[points.length - 1];
    const previous = points.length > 1 ? points[points.length - 2] : null;
    const change = previous ? latest.value - previous.value : 0;
    const productId = obj.productId || info.productId || '';
    const titleEn = info.SeriesTitleEn || fallback.fallbackTitleEn || ('Vector ' + vectorId);
    const titleFr = info.SeriesTitleFr || fallback.fallbackTitleFr || titleEn;
    const quality = latest.statusCode && latest.statusCode !== 0 ? 'B' : 'A';
    const row = {
      geo: 'V' + vectorId,
      vectorId,
      productId,
      coordinate: obj.coordinate || info.coordinate || '',
      titleEn,
      titleFr,
      refPer: latest.refPer,
      releaseTime: latest.releaseTime,
      value: latest.value,
      previous: previous ? previous.value : null,
      change,
      confidence: quality === 'A' ? 90 : 72,
      quality,
      source: 'Statistics Canada WDS',
      live: true,
      points
    };
    rows.push(row);
    series.push(row);
  });
  return { series, rows };
}

function renderSourceStatus() {
  const o = $('data-status');
  if (!o) return;
  clear(o);
  o.append(E('h3', { t: T('dataStatusH') }), E('span', { c: statusClass(), t: modeBadge() }));
  const p = E('p', { t: T('apiSource') + ' ' + (st.dataMode === 'live' ? T('liveReference') : st.dataMode === 'loading' ? T('loadingBadge') : T('demoReference')) + '.' });
  o.append(p);
  const dl = E('dl', { c: 'status-grid' });
  dl.append(E('dt', { t: T('checked') }), E('dd', { t: st.checkedAt || todayStamp() }));
  if (st.dataMode === 'demo' && st.dataError) dl.append(E('dt', { t: T('fallbackReason') }), E('dd', { t: st.dataError }));
  o.append(dl);
  const links = E('p', { c: 'source-links' });
  const guide = E('a', { t: T('learnMore'), a: { href: STATCAN_WDS_GUIDE, target: '_blank', rel: 'noopener noreferrer' } });
  links.append(guide);
  if (st.rows.find(r => r.productId)) {
    const row = st.rows.find(r => r.productId);
    links.append(document.createTextNode(' · '), E('a', { t: T('sourceSearch'), a: { href: STATCAN_SEARCH + encodeURIComponent(row.productId), target: '_blank', rel: 'noopener noreferrer' } }));
  }
  o.append(links);
}

function addMsg(w, m) {
  const d = E('div', { c: 'msg ' + (w === 'user' ? 'user' : '') });
  d.append(E('strong', { t: w === 'user' ? (st.lang === 'fr' ? 'Vous : ' : 'You: ') : (st.lang === 'fr' ? 'Assistant : ' : 'Assistant: ') }), document.createTextNode(m));
  $('chat').append(d);
}
function answer(q) {
  q = q.toLowerCase();
  const liveText = st.dataMode === 'live'
    ? (st.lang === 'fr' ? 'Les valeurs actuelles ont été chargées à partir de l’API publique de Statistique Canada. Vérifiez toutefois les métadonnées, l’unité, la période et les notes de qualité avant de les réutiliser.' : 'The current values were loaded from the Statistics Canada public API. Still verify metadata, unit, period and quality notes before reuse.')
    : (st.lang === 'fr' ? 'Les valeurs actuelles sont des données de démonstration, parce que l’API publique n’a pas été chargée dans ce navigateur.' : 'The current values are demonstration data because the public API was not loaded in this browser.');
  if (q.includes('source') || q.includes('api') || q.includes('live') || q.includes('fallback') || q.includes('demo') || q.includes('démon')) return liveText;
  if (q.includes('round') || q.includes('arrond')) return st.lang === 'fr' ? 'L’arrondissement protège la confidentialité, mais les cellules peuvent ne pas correspondre exactement aux totaux. Signalez cette limite dans toute note d’analyse.' : 'Rounding protects confidentiality, but cells may not add exactly to totals. State this limitation in any analytical note.';
  if (q.includes('variation') || q.includes('cv')) return st.lang === 'fr' ? 'Le coefficient de variation aide à juger la fiabilité relative. Une valeur avec faible fiabilité ne devrait pas soutenir une conclusion forte.' : 'The coefficient of variation helps judge relative reliability. A low-reliability value should not support a strong conclusion.';
  if (q.includes('metadata') || q.includes('métad')) return st.lang === 'fr' ? 'Les métadonnées expliquent le concept, la géographie, la période de référence, l’unité, les limites et l’état de la source.' : 'Metadata explains the concept, geography, reference period, unit, limitations and source status.';
  if (q.includes('postal') || q.includes('map') || q.includes('carte') || q.includes('community')) return T('limitationsText');
  return st.lang === 'fr' ? 'Vérifiez la source, la géographie, la période de référence, l’unité, les notes de qualité et l’état direct/de démonstration avant de comparer.' : 'Check the source, geography, reference period, unit, quality notes and live/demo status before comparing.';
}
function renderChat() {
  clear($('chat'));
  addMsg('bot', T('hello'));
  clear($('chips'));
  (st.lang === 'fr'
    ? ['Ces données sont-elles en direct?', 'Pourquoi lire les métadonnées?', 'Quelle est la limite du code postal?', 'Pourquoi l’arrondissement est-il important?']
    : ['Are these data live?', 'Why read metadata first?', 'What is the postal-code limitation?', 'Why does rounding matter?']
  ).forEach(q => {
    const b = E('button', { c: 'chip', t: q, a: { type: 'button' } });
    b.onclick = () => { $('chatin').value = q; $('chatform').dispatchEvent(new Event('submit', { cancelable: true })); };
    $('chips').append(b);
  });
}

function renderDict() {
  clear($('term'));
  terms.forEach(x => $('term').append(E('option', { t: st.lang === 'fr' ? x[2] : x[1], a: { value: x[0] } })));
  drawDict();
  $('term').onchange = drawDict;
}
function drawDict() {
  const x = terms.find(v => v[0] === $('term').value) || terms[0];
  const o = $('dictout');
  clear(o);
  o.append(E('span', { c: statusClass(), t: modeBadge() }), E('h4', { t: st.lang === 'fr' ? x[2] : x[1] }), E('p', { t: st.lang === 'fr' ? x[4] : x[3] }));
  if (x[0] === 'api' || x[0] === 'vector' || x[0] === 'pid') {
    o.append(E('p', { t: st.lang === 'fr' ? 'Consultez le guide du SDW pour les méthodes, les vecteurs, les identifiants de produit et les formats de réponse.' : 'Use the WDS guide for methods, vectors, product identifiers and response formats.' }), E('p', { c: 'source-links' }));
    o.querySelector('.source-links').append(E('a', { t: T('learnMore'), a: { href: STATCAN_WDS_GUIDE, target: '_blank', rel: 'noopener noreferrer' } }));
  }
}

function qText(q) {
  return q === 'A' ? (st.lang === 'fr' ? 'A — confiance élevée' : 'A — high confidence') : q === 'B' ? (st.lang === 'fr' ? 'B — confiance moyenne' : 'B — medium confidence') : (st.lang === 'fr' ? 'C — utiliser avec prudence' : 'C — use with caution');
}
function activeRows() { return st.rows && st.rows.length ? st.rows : demoRows.map(r => ({ ...r, live: false })); }
function rowsFiltered() {
  const f = $('focus').value;
  let rows = [...activeRows()];
  if (f === 'live') return rows.filter(r => r.live);
  if (f === 'demo') return rows.filter(r => !r.live);
  if (f === 'reliability') return rows.filter(r => r.quality === 'C' || r.quality === 'B');
  if (f === 'changed') return rows.sort((a, b) => Math.abs(b.change || 0) - Math.abs(a.change || 0)).slice(0, 3);
  return rows;
}
function table(tableEl, rows, cap, metric) {
  clear(tableEl);
  tableEl.append(E('caption', { t: cap }));
  const head = E('tr');
  const headers = metric
    ? ['Indicator / Indicateur', metric, 'Reference period / Période', 'Source status / État de la source', 'Quality / Qualité']
    : ['Indicator / Indicateur', 'Latest value / Dernière valeur', 'Previous / Précédente', 'Change / Variation', 'Reference period / Période', 'Source status / État de la source', 'Quality / Qualité'];
  headers.forEach(h => head.append(E('th', { t: h, a: { scope: 'col' } })));
  const thead = E('thead');
  thead.append(head);
  tableEl.append(thead);
  const body = E('tbody');
  rows.forEach(r => {
    const tr = E('tr');
    tr.append(E('th', { t: titleOf(r), a: { scope: 'row' } }));
    if (metric) {
      const key = $('metric').value || 'value';
      const val = key === 'confidence' ? (r.confidence + ' / 100') : num(r[key] || 0, 2);
      tr.append(E('td', { t: val }), E('td', { t: r.refPer || '—' }), E('td', { t: sourceMode(r) }), E('td', { t: qText(r.quality) }));
    } else {
      tr.append(E('td', { t: num(r.value || r.employment || 0, 2) }), E('td', { t: r.previous === null || r.previous === undefined ? '—' : num(r.previous, 2) }), E('td', { t: num(r.change || 0, 2) }), E('td', { t: r.refPer || '—' }), E('td', { t: sourceMode(r) }), E('td', { t: qText(r.quality) }));
    }
    body.append(tr);
  });
  tableEl.append(body);
}
function renderMatrix() {
  fillSelect('focus', opts.focus);
  drawMatrix();
  $('focus').onchange = drawMatrix;
}
function drawMatrix() {
  table($('matrixtable'), rowsFiltered(), st.lang === 'fr' ? 'Matrice des preuves' : 'Evidence matrix');
  clear($('matrixnote'));
  $('matrixnote').append(E('p', { t: T('matrixNote') }));
}

function renderViz() {
  fillSelect('metric', opts.metrics);
  drawViz();
  $('metric').onchange = drawViz;
}
function drawViz() {
  const key = $('metric').value || 'value';
  const lbl = label(opts.metrics, key);
  const rows = activeRows();
  const o = $('vizout');
  clear(o);
  o.append(E('span', { c: statusClass(), t: modeBadge() }));
  const c = E('div', { c: 'bar-chart', a: { 'aria-hidden': 'true' } });
  const vals = rows.map(r => key === 'confidence' ? r.confidence : Math.abs(Number(r[key] || 0)));
  const max = Math.max(...vals, 1);
  rows.forEach(r => {
    const raw = key === 'confidence' ? r.confidence : Number(r[key] || 0);
    const val = Math.abs(raw);
    const row = E('div', { c: 'bar-row' });
    const track = E('div', { c: 'bar-track' });
    const fill = E('div', { c: 'bar-fill ' + (raw < 0 ? 'negative' : '') });
    fill.style.width = Math.max(2, (val / max) * 100) + '%';
    track.append(fill);
    row.append(E('span', { t: titleOf(r) }), track, E('strong', { t: key === 'confidence' ? raw + '/100' : num(raw, 2) }));
    c.append(row);
  });
  o.append(c);
  const wrap = E('div', { c: 'table-wrap' });
  const t = E('table');
  table(t, rows, lbl + ' — ' + (st.lang === 'fr' ? 'tableau équivalent' : 'equivalent table'), lbl);
  wrap.append(t);
  o.append(wrap, E('p', { t: st.lang === 'fr' ? 'Le tableau donne accès aux mêmes valeurs que le graphique et indique l’état de la source.' : 'The table provides the same values as the chart and states the source status.' }));
}

function renderMap() {
  clear($('mapchips'));
  [['a', 'Metro demo'], ['c', 'Rural demo'], ['e', 'North demo']].forEach(([id, l]) => {
    const b = E('button', { c: 'chip', t: l, a: { type: 'button' } });
    b.onclick = () => selectTract(id);
    $('mapchips').append(b);
  });
  document.querySelectorAll('.tract').forEach(x => {
    x.onclick = () => selectTract(x.dataset.tract);
    x.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectTract(x.dataset.tract); } };
  });
  selectTract(st.tract);
}
function selectTract(id) {
  st.tract = id;
  document.querySelectorAll('.tract').forEach(x => {
    const on = x.dataset.tract === id;
    x.setAttribute('aria-pressed', on);
    x.setAttribute('aria-label', (on ? (st.lang === 'fr' ? 'Sélectionné : ' : 'Selected: ') : '') + (st.lang === 'fr' ? 'secteur ' : 'tract ') + x.dataset.tract.toUpperCase());
  });
  const r = tracts[id];
  const o = $('mapout');
  clear(o);
  o.append(E('h4', { t: (st.lang === 'fr' ? 'Secteur ' : 'Tract ') + id.toUpperCase() }), E('span', { c: 'badge badge-demo', t: T('demoBadge') }));
  o.append(E('p', { t: T('noLiveLocal') }));
  const dl = E('dl');
  [[st.lang === 'fr' ? 'Région' : 'Region', r[0]], [st.lang === 'fr' ? 'Population' : 'Population', num(r[1])], [st.lang === 'fr' ? 'Revenu médian' : 'Median income', money(r[2])], [st.lang === 'fr' ? 'Confiance' : 'Confidence', r[3] + ' / 100'], ['Quality / qualité', qText(r[4])], [st.lang === 'fr' ? 'Note' : 'Note', r[5]]].forEach(([k, v]) => dl.append(E('dt', { t: k }), E('dd', { t: v })));
  o.append(dl);
  const ref = activeRows().find(x => x.live) || activeRows()[0];
  if (ref) {
    o.append(E('h5', { t: st.dataMode === 'live' ? T('liveReference') : T('demoReference') }));
    o.append(E('p', { t: titleOf(ref) + ': ' + num(ref.value || ref.employment || 0, 2) + (ref.refPer ? ' (' + ref.refPer + ')' : '') }));
  }
  o.append(E('details'));
  const det = o.querySelector('details');
  det.append(E('summary', { t: T('limitations') }), E('p', { t: T('limitationsText') }));
}

function renderAll() {
  renderForm();
  renderOutput();
  renderSourceStatus();
  renderChat();
  renderDict();
  renderMatrix();
  renderViz();
  renderMap();
}

function downloadScenario() {
  if (!st.scenario) submitScenario();
  const dataObj = { ...(st.scenario || getScenario()), checkedAt: st.checkedAt, rows: activeRows().map(r => ({ title: titleOf(r), refPer: r.refPer, value: r.value, sourceStatus: sourceMode(r), vectorId: r.vectorId || null, productId: r.productId || null })) };
  const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = E('a', { a: { href: url, download: 'sandbox-scenario.json' } });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function init() {
  initTabs();
  $('scenario').onsubmit = submitScenario;
  $('reset').onclick = () => { st.scenario = null; $('goal').value = ''; $('postal').value = 'K1A 0A6'; renderAll(); };
  $('reload-data').onclick = fetchPublicData;
  $('print').onclick = () => window.print();
  $('export').onclick = downloadScenario;
  $('chatform').onsubmit = e => {
    e.preventDefault();
    const q = $('chatin').value.trim();
    if (!q) { $('chaterr').textContent = T('chatErr'); $('chaterr').hidden = false; $('chatin').focus(); return; }
    $('chaterr').hidden = true;
    addMsg('user', q);
    addMsg('bot', answer(q));
    $('chatin').value = '';
  };
  $('lang').onclick = () => { st.lang = st.lang === 'en' ? 'fr' : 'en'; applyLang(); $('wb-cont').focus(); };
  st.rows = demoRows.map(r => ({ ...r, live: false }));
  applyLang();
  $('goal').value = 'source';
  st.scenario = getScenario();
  renderOutput();
  fetchPublicData();
}

document.addEventListener('DOMContentLoaded', init);
