(() => {
  "use strict";
  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  const WDS_META = "https://www150.statcan.gc.ca/t1/wds/rest/getCubeMetadata";
  const WDS_GUIDE = "https://www.statcan.gc.ca/en/developers/wds/user-guide";
  const STORE = "stcSandbox.";
  const tableUrl = (pid) => `https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=${pid}`;
  const $ = (id) => document.getElementById(id);
  const clear = (n) => { if (n) while (n.firstChild) n.removeChild(n.firstChild); };
  const el = (tag, opt = {}) => {
    const n = document.createElement(tag);
    if (opt.c) n.className = opt.c;
    if (opt.t !== undefined) n.textContent = opt.t;
    if (opt.a) Object.entries(opt.a).forEach(([k, v]) => n.setAttribute(k, String(v)));
    return n;
  };

  const i18n = {
    en: {
      title: "STC Analytical Sandbox", skipMain: "Skip to main content", skipStart: "Skip to start form", skipQuiz: "Skip to quiz",
      prototypeLabel: "Prototype:", prototypeText: "Demonstration only — not an official Government of Canada service. No personal information is required.",
      brandSub: "Statistics Canada data literacy sandbox", brandAria: "STC Analytical Sandbox home", searchLabel: "Search Canada.ca", searchButton: "Search", searchPlaceholder: "Search Canada.ca",
      menu: "Menu", navStart: "Start", navQuiz: "Quiz", navTools: "Sandbox tools", navProgress: "Progress", breadcrumbCurrent: "STC Analytical Sandbox",
      h1: "STC Analytical Sandbox", lead: "Practise statistical thinking with selected Statistics Canada datasets, source checks, accessible charts, quiz feedback and geographic context.",
      meta: "Public metadata check · dataset-specific demonstration values · no server storage", beforeHeading: "Before you start",
      beforeText: "Choose a learning goal and a Statistics Canada subject matter area. Start quiz selects a relevant dataset, checks public metadata when possible, and provides a 10-question quiz with explanations.",
      onThisPage: "On this page", otpStart: "Start a learning scenario", otpQuiz: "Complete the dataset quiz", otpTools: "Use the sandbox tools", otpProgress: "Review progress",
      startHeading: "Start a learning scenario", startText: "Select a learning goal and subject matter area. The Start quiz button selects the dataset and refreshes public source status automatically.",
      errorHeading: "There is a problem", goalLabel: "Learning goal (required)", goalHint: "Choose the main skill to practise.", subjectLabel: "Subject matter area (required)", subjectHint: "Choose a Statistics Canada subject area.",
      provinceLabel: "Province or territory fallback", provinceHint: "Used when postal code is blank or cannot be inferred.", postalLabel: "Postal code seed (optional)", postalHint: "Example: K1A 0A6. First-character inference is approximate and is not a census-boundary match.",
      startQuiz: "Start quiz", reset: "Reset", print: "Print or save as PDF", export: "Download scenario JSON",
      quizHeading: "Dataset quiz", quizIntro: "Start a scenario to load a 10-question quiz for the selected dataset.", submitQuiz: "Submit quiz", showAnswers: "Show answers and explanations", retryQuiz: "Retry quiz",
      toolsHeading: "Sandbox tools", toolsText: "Each tab is driven by the selected dataset and shows whether public metadata was checked or fallback information is being used.",
      tabAssistant: "Assistant", tabDictionary: "Dictionary", tabMatrix: "Matrix", tabVisualizer: "Visualizer", tabMap: "Community Geography", tabLeaderboard: "Progress",
      assistantHeading: "Source-aware statistical assistant", assistantText: "Ask about the selected dataset, metadata, chart choice, geography, quality, quiz answers, or source status.", chatLabel: "Question", send: "Send",
      dictionaryHeading: "Dictionary", termLabel: "Concept", matrixHeading: "Matrix explorer", focusLabel: "Focus", visualizerHeading: "Accessible data visualizer", metricLabel: "Chart view",
      mapHeading: "Community Geography", mapText: "The map uses province/territory geography as the safe default. Postal-code context is approximate and does not replace an official PCCF or census-boundary lookup.",
      leaderboardHeading: "Progress and scores", leaderboardText: "Scores are stored locally in this browser only.", clearProgress: "Clear progress",
      footerHeading: "Government of Canada prototype links", privacy: "Privacy", top: "Top of page", footerNote: "Aliases and scores stay in this browser. No personal information is required.", edition: "Public Service Data Prototype Edition", dateModifiedLabel: "Date modified:",
      primaryNavAria: "Primary navigation", breadcrumbAria: "Breadcrumb", tabsAria: "Sandbox modules", footerAria: "Footer navigation",
      bannerDemo: "Data status: demonstration fallback. Start quiz will retry the public metadata check automatically.", bannerLoading: "Data status: checking Statistics Canada public metadata. Displayed values remain a demonstration subset.", bannerMetadata: "Data status: public metadata loaded. Displayed values are still an embedded demonstration subset, not live WDS values.",
      goalErr: "Select a learning goal.", subjectErr: "Select a subject matter area.", postalErr: "Use a Canadian postal code format such as A1A 1A1.", chatErr: "Enter a question before sending.", quizErr: "Answer all quiz questions before submitting.",
      metadata: "Public metadata loaded; values are demonstration", demo: "Demonstration fallback", loading: "Checking public metadata", selectedDataset: "Selected dataset", table: "Table", source: "Source", frequency: "Frequency", geography: "Geography", unit: "Unit", release: "Release / currency", checked: "Checked", fallbackReason: "Fallback reason", wdsGuide: "WDS user guide", selectedArea: "Selected area", dataMode: "Data mode", datasetSource: "Dataset source",
      score: "Score", answers: "Answers and explanations", correctAnswer: "Correct answer", yourAnswer: "Your answer", notAnswered: "Not answered", correct: "Correct", review: "Needs review", practice: "Practice", practiceText: "Review the source table, unit, geography, comparison basis and limitation before writing a public briefing.",
      allRows: "All rows", selectedRows: "Selected area", largestChange: "Largest change", qualityCautions: "Quality cautions", chartRecommended: "Recommended chart", chartBar: "Bar chart", chartLine: "Line chart", qualityTable: "Quality table", latest: "Latest", previous: "Previous", change: "Change", reference: "Reference period", quality: "Quality", status: "Source status", value: "Value", noScores: "No quiz scores have been saved yet.", progressCaption: "Saved quiz scores in this browser",
      sourceBlock: "Source name, table ID and URL are provided for traceability.", matrixNote: "Do not make individual-level conclusions from aggregate tables.", mapLimit: "Postal-code-to-census-geography matching is not implemented in this static prototype.", noLower: "Lower geography is used only when supported by the selected table.", hello: "Ask about the selected dataset or choose an example."
    },
    fr: {
      title: "Bac à sable analytique de StatCan", skipMain: "Passer au contenu principal", skipStart: "Passer au formulaire de départ", skipQuiz: "Passer au quiz",
      prototypeLabel: "Prototype :", prototypeText: "Démonstration seulement — il ne s’agit pas d’un service officiel du gouvernement du Canada. Aucun renseignement personnel n’est requis.",
      brandSub: "Bac à sable de littératie des données de Statistique Canada", brandAria: "Accueil du bac à sable analytique de StatCan", searchLabel: "Rechercher dans Canada.ca", searchButton: "Rechercher", searchPlaceholder: "Rechercher dans Canada.ca",
      menu: "Menu", navStart: "Commencer", navQuiz: "Quiz", navTools: "Outils du bac à sable", navProgress: "Progrès", breadcrumbCurrent: "Bac à sable analytique de StatCan",
      h1: "Bac à sable analytique de StatCan", lead: "Pratiquez la pensée statistique avec des jeux de données de Statistique Canada, des vérifications de source, des graphiques accessibles, des rétroactions de quiz et un contexte géographique.",
      meta: "Vérification des métadonnées publiques · valeurs de démonstration propres au jeu de données · aucun stockage serveur", beforeHeading: "Avant de commencer",
      beforeText: "Choisissez un objectif d’apprentissage et un domaine de Statistique Canada. Commencer le quiz sélectionne un jeu de données pertinent, vérifie les métadonnées publiques lorsque possible et fournit un quiz de 10 questions avec explications.",
      onThisPage: "Sur cette page", otpStart: "Commencer un scénario d’apprentissage", otpQuiz: "Faire le quiz sur le jeu de données", otpTools: "Utiliser les outils du bac à sable", otpProgress: "Consulter les progrès",
      startHeading: "Commencer un scénario d’apprentissage", startText: "Sélectionnez un objectif d’apprentissage et un domaine. Le bouton Commencer le quiz sélectionne le jeu de données et actualise automatiquement l’état de la source publique.",
      errorHeading: "Il y a un problème", goalLabel: "Objectif d’apprentissage (obligatoire)", goalHint: "Choisissez la principale compétence à pratiquer.", subjectLabel: "Domaine statistique (obligatoire)", subjectHint: "Choisissez un domaine de Statistique Canada.",
      provinceLabel: "Province ou territoire de repli", provinceHint: "Utilisé lorsque le code postal est vide ou ne peut pas être inféré.", postalLabel: "Code postal de départ (facultatif)", postalHint: "Exemple : K1A 0A6. L’inférence par premier caractère est approximative et ne constitue pas un appariement à une limite de recensement.",
      startQuiz: "Commencer le quiz", reset: "Réinitialiser", print: "Imprimer ou enregistrer en PDF", export: "Télécharger le scénario JSON",
      quizHeading: "Quiz sur le jeu de données", quizIntro: "Commencez un scénario pour charger un quiz de 10 questions sur le jeu de données sélectionné.", submitQuiz: "Soumettre le quiz", showAnswers: "Afficher les réponses et les explications", retryQuiz: "Refaire le quiz",
      toolsHeading: "Outils du bac à sable", toolsText: "Chaque onglet est alimenté par le jeu de données sélectionné et indique si les métadonnées publiques ont été vérifiées ou si des renseignements de repli sont utilisés.",
      tabAssistant: "Assistant", tabDictionary: "Dictionnaire", tabMatrix: "Matrice", tabVisualizer: "Visualiseur", tabMap: "Géographie communautaire", tabLeaderboard: "Progrès",
      assistantHeading: "Assistant statistique axé sur les sources", assistantText: "Posez des questions sur le jeu de données, les métadonnées, le choix de graphique, la géographie, la qualité, les réponses du quiz ou l’état de la source.", chatLabel: "Question", send: "Envoyer",
      dictionaryHeading: "Dictionnaire", termLabel: "Concept", matrixHeading: "Explorateur de matrice", focusLabel: "Point de mire", visualizerHeading: "Visualiseur de données accessible", metricLabel: "Vue graphique",
      mapHeading: "Géographie communautaire", mapText: "La carte utilise la province ou le territoire comme géographie par défaut. Le contexte du code postal est approximatif et ne remplace pas un appariement PCCF ou une limite de recensement officielle.",
      leaderboardHeading: "Progrès et scores", leaderboardText: "Les scores sont stockés localement dans ce navigateur seulement.", clearProgress: "Effacer les progrès",
      footerHeading: "Liens du prototype du gouvernement du Canada", privacy: "Confidentialité", top: "Haut de la page", footerNote: "Les alias et les scores restent dans ce navigateur. Aucun renseignement personnel n’est requis.", edition: "Édition prototype des données du service public", dateModifiedLabel: "Date de modification :",
      primaryNavAria: "Navigation principale", breadcrumbAria: "Fil d’Ariane", tabsAria: "Modules du bac à sable", footerAria: "Navigation du pied de page",
      bannerDemo: "État des données : repli de démonstration. Commencer le quiz relancera automatiquement la vérification des métadonnées publiques.", bannerLoading: "État des données : vérification des métadonnées publiques de Statistique Canada. Les valeurs affichées demeurent un sous-ensemble de démonstration.", bannerMetadata: "État des données : métadonnées publiques chargées. Les valeurs affichées demeurent un sous-ensemble de démonstration intégré, et non des valeurs SDW en direct.",
      goalErr: "Sélectionnez un objectif d’apprentissage.", subjectErr: "Sélectionnez un domaine statistique.", postalErr: "Utilisez le format d’un code postal canadien, par exemple A1A 1A1.", chatErr: "Entrez une question avant l’envoi.", quizErr: "Répondez à toutes les questions du quiz avant de soumettre.",
      metadata: "Métadonnées publiques chargées; valeurs de démonstration", demo: "Repli de démonstration", loading: "Vérification des métadonnées publiques", selectedDataset: "Jeu de données sélectionné", table: "Tableau", source: "Source", frequency: "Fréquence", geography: "Géographie", unit: "Unité", release: "Diffusion / actualité", checked: "Vérifié", fallbackReason: "Raison du repli", wdsGuide: "Guide d’utilisation du SDW", selectedArea: "Région sélectionnée", dataMode: "Mode de données", datasetSource: "Source du jeu de données",
      score: "Score", answers: "Réponses et explications", correctAnswer: "Bonne réponse", yourAnswer: "Votre réponse", notAnswered: "Sans réponse", correct: "Exact", review: "À revoir", practice: "Pratique", practiceText: "Révisez le tableau source, l’unité, la géographie, la base de comparaison et la limite avant de rédiger un breffage public.",
      allRows: "Toutes les lignes", selectedRows: "Région sélectionnée", largestChange: "Variation la plus forte", qualityCautions: "Notes de qualité", chartRecommended: "Graphique recommandé", chartBar: "Graphique à barres", chartLine: "Graphique linéaire", qualityTable: "Tableau de qualité", latest: "Dernière", previous: "Précédente", change: "Variation", reference: "Période de référence", quality: "Qualité", status: "État de la source", value: "Valeur", noScores: "Aucun score de quiz n’a encore été enregistré.", progressCaption: "Scores de quiz sauvegardés dans ce navigateur",
      sourceBlock: "Le nom de la source, l’identifiant du tableau et l’URL sont fournis pour la traçabilité.", matrixNote: "Ne tirez pas de conclusions individuelles à partir de tableaux agrégés.", mapLimit: "L’appariement du code postal à la géographie de recensement n’est pas mis en œuvre dans ce prototype statique.", noLower: "La géographie inférieure est utilisée seulement si la table sélectionnée la prend en charge.", hello: "Posez une question sur le jeu de données sélectionné ou choisissez un exemple."
    }
  };

  const goals = [["","Select an option","Sélectionnez une option"],["quality","Assess data quality","Évaluer la qualité des données"],["chart","Interpret a chart","Interpréter un graphique"],["metadata","Use metadata before comparing data","Utiliser les métadonnées avant de comparer les données"],["geo","Compare geography levels","Comparer les niveaux géographiques"],["source","Check public metadata versus fallback data","Vérifier les métadonnées publiques et les données de repli"],["briefing","Build a short evidence briefing","Préparer un court exposé probant"]];
  const subjects = [["","Select an option","Sélectionnez une option"],["population","Population and demography","Population et démographie"],["labour","Labour and employment","Travail et emploi"],["prices","Prices and inflation","Prix et inflation"],["housing","Housing and construction","Logement et construction"],["income","Income and affordability","Revenu et abordabilité"],["health","Health","Santé"],["education","Education","Éducation"],["environment","Environment","Environnement"],["justice","Justice and public safety","Justice et sécurité publique"],["immigration","Immigration and diversity","Immigration et diversité"]];
  const provinces = [["CA","Canada","Canada",""],["NL","Newfoundland and Labrador","Terre-Neuve-et-Labrador","A"],["PE","Prince Edward Island","Île-du-Prince-Édouard","C"],["NS","Nova Scotia","Nouvelle-Écosse","B"],["NB","New Brunswick","Nouveau-Brunswick","E"],["QC","Quebec","Québec","GHJ"],["ON","Ontario","Ontario","KLMNP"],["MB","Manitoba","Manitoba","R"],["SK","Saskatchewan","Saskatchewan","S"],["AB","Alberta","Alberta","T"],["BC","British Columbia","Colombie-Britannique","V"],["YT","Yukon","Yukon","Y"],["NT","Northwest Territories","Territoires du Nord-Ouest","X"],["NU","Nunavut","Nunavut","X"]];
  const boxes = {YT:[80,120,90,62],NT:[190,110,130,68],NU:[350,95,170,82],BC:[80,310,88,80],AB:[180,305,82,76],SK:[270,300,82,72],MB:[360,295,82,70],ON:[470,310,110,78],QC:[585,250,100,75],NB:[700,320,62,42],NS:[775,335,70,38],PE:[740,300,54,30],NL:[770,160,72,44]};

  function mkRows(base, unitEn, unitFr, refEn, refFr) {
    return [["CA","Canada","Canada",1,.97,"A"],["ON","Ontario","Ontario",1.04,1,"A"],["QC","Quebec","Québec",.96,.95,"A"],["AB","Alberta","Alberta",1.08,1.03,"B"],["BC","British Columbia","Colombie-Britannique",1.02,.99,"B"],["NS","Nova Scotia","Nouvelle-Écosse",.90,.89,"B"]].map(r => ({code:r[0],geoEn:r[1],geoFr:r[2],value:base*r[3],previous:base*r[4],quality:r[5],unitEn,unitFr,refEn,refFr}));
  }
  function ds(id, subject, tableId, pid, en, fr, freqEn, freqFr, geoEn, geoFr, unitEn, unitFr, relEn, relFr, chart, base, refEn, refFr, noteEn, noteFr) {
    return {id,subject,tableId,pid,en,fr,freqEn,freqFr,geoEn,geoFr,unitEn,unitFr,relEn,relFr,chart,url:tableUrl(pid),noteEn,noteFr,rows:mkRows(base,unitEn,unitFr,refEn,refFr)};
  }
  const datasets = [
    ds("pop","population","17-10-0009-01","1710000901","Population estimates, quarterly","Estimations de la population, trimestrielles","Quarterly","Trimestrielle","Canada, province or territory","Canada, province ou territoire","Persons","Personnes","2026 context","Contexte de 2026","line",41600000,"2026 Q2","T2 2026","Quarterly estimates support province-level comparisons, not individual conclusions.","Les estimations trimestrielles appuient les comparaisons provinciales, non les conclusions individuelles."),
    ds("lab","labour","14-10-0287-01","1410028701","Labour force characteristics, monthly, seasonally adjusted and trend-cycle","Caractéristiques de la population active, mensuelles, désaisonnalisées et tendance-cycle","Monthly","Mensuelle","Canada, province or territory","Canada, province ou territoire","Percent","Pourcentage","2026 context","Contexte de 2026","line",6.9,"May 2026","Mai 2026","Seasonal adjustment and trend-cycle status must be stated.","La désaisonnalisation et la tendance-cycle doivent être indiquées."),
    ds("cpi","prices","18-10-0004-01","1810000401","Consumer Price Index, monthly, not seasonally adjusted","Indice des prix à la consommation, mensuel, non désaisonnalisé","Monthly","Mensuelle","Canada, province or territory","Canada, province ou territoire","Index, 2002=100","Indice, 2002=100","2026 context","Contexte de 2026","line",164.2,"May 2026","Mai 2026","CPI index values are not the same as percentage change.","Les valeurs de l’indice IPC ne sont pas des variations en pourcentage."),
    ds("housing","housing","34-10-0135-01","3410013501","CMHC housing starts, under construction and completions, quarterly","SCHL, mises en chantier, logements en construction et achevés, trimestriel","Quarterly","Trimestrielle","Canada, region, province or territory","Canada, région, province ou territoire","Units","Unités","2026 context","Contexte de 2026","bar",240000,"2026 Q1","T1 2026","Starts, under construction and completions are not interchangeable.","Les mises en chantier, les logements en construction et les achèvements ne sont pas interchangeables."),
    ds("income","income","11-10-0239-01","1110023901","Income of individuals by age group, sex and income source","Revenu des particuliers selon le groupe d’âge, le sexe et la source de revenu","Annual","Annuelle","Canada, province or territory","Canada, province ou territoire","Dollars","Dollars","Latest available","Données les plus récentes","bar",52000,"Latest available","Données les plus récentes","Income estimates require year, source and inflation context.","Les estimations de revenu exigent le contexte de l’année, de la source et de l’inflation."),
    ds("health","health","13-10-0096-01","1310009601","Health characteristics, annual estimates","Caractéristiques de la santé, estimations annuelles","Annual","Annuelle","Canada, province or territory","Canada, province ou territoire","Percent","Pourcentage","Latest available","Données les plus récentes","bar",68,"Latest available","Données les plus récentes","Survey estimates require reliability notes.","Les estimations d’enquête exigent des notes de fiabilité."),
    ds("education","education","37-10-0011-01","3710001101","Postsecondary enrolments","Effectifs postsecondaires","Annual","Annuelle","Canada, province or territory","Canada, province ou territoire","Students","Étudiants","Latest available","Données les plus récentes","bar",2200000,"Latest available","Données les plus récentes","Check reference period before calling data current.","Vérifiez la période avant de dire que les données sont actuelles."),
    ds("environment","environment","38-10-0097-01","3810009701","Greenhouse gas emissions","Émissions de gaz à effet de serre","Annual","Annuelle","Canada, province or territory","Canada, province ou territoire","Megatonnes","Mégatonnes","Latest available","Données les plus récentes","bar",680,"Latest available","Données les plus récentes","Emissions levels and intensity are different measures.","Les niveaux d’émissions et l’intensité sont des mesures différentes."),
    ds("justice","justice","35-10-0177-01","3510017701","Incident-based crime statistics by detailed violations","Statistiques des crimes fondées sur l’affaire selon les infractions détaillées","Annual","Annuelle","Canada, province or territory, police service","Canada, province ou territoire, service de police","Rate per 100,000","Taux pour 100 000","Latest available","Données les plus récentes","bar",5100,"Latest available","Données les plus récentes","Police-reported data reflect reporting and classification practices.","Les données déclarées par la police reflètent les pratiques de déclaration et de classification."),
    ds("immigration","immigration","43-10-0008-01","4310000801","Immigrant admissions by admission category","Admissions d’immigrants selon la catégorie d’admission","Annual","Annuelle","Canada, province or territory","Canada, province ou territoire","Persons","Personnes","Latest available","Données les plus récentes","bar",470000,"Latest available","Données les plus récentes","Admissions are flows, not the full immigrant population stock.","Les admissions sont des flux, non le stock complet de population immigrante.")
  ];

  const concepts = {
    quality:[["cv","Coefficient of variation","Coefficient de variation","Relative sampling variability used to judge estimate reliability.","Variabilité relative utilisée pour juger la fiabilité."],["flag","Quality flag","Indicateur de qualité","A warning attached to an estimate or observation.","Avertissement associé à une estimation."]],
    chart:[["trend","Trend","Tendance","A general movement across reference periods.","Mouvement général entre périodes."],["table","Equivalent table","Tableau équivalent","Accessible table containing chart values.","Tableau accessible contenant les valeurs du graphique."]],
    metadata:[["frequency","Frequency","Fréquence","How often data are released or measured.","Fréquence de diffusion ou de mesure."],["unit","Unit of measure","Unité de mesure","The measurement unit used for values.","Unité utilisée pour les valeurs."]],
    geo:[["boundary","Boundary","Limite","The official spatial definition for a value.","Définition spatiale officielle."],["postal","Postal-code inference","Inférence par code postal","First-character approximation only in this prototype.","Approximation par premier caractère seulement."]],
    source:[["wds","Web Data Service","Service de données Web","Statistics Canada public data API.","API publique de données de Statistique Canada."],["fallback","Fallback data","Données de repli","Labelled demonstration values used when metadata cannot be checked.","Valeurs de démonstration indiquées."]],
    briefing:[["claim","Claim","Énoncé","A concise analytical statement.","Énoncé analytique concis."],["limitation","Limitation","Limite","Boundary on valid use of evidence.","Limite de l’utilisation valide de la preuve."]]
  };

  const st = {lang: localStorage.getItem(STORE+"lang") || "en", dataset: null, rows: [], scenario: null, selectedGeo: "ON", mode: "demo", err: "", checked: "", quiz: [], answers: {}, submitted: false, score: null, tab: "assistant"};
  const tr = (k) => (i18n[st.lang] && i18n[st.lang][k]) || i18n.en[k] || k;
  const loc = () => st.lang === "fr" ? "fr-CA" : "en-CA";
  const fmt = (v) => new Intl.NumberFormat(loc(), {maximumFractionDigits:1}).format(Number(v));
  const L = (arr) => st.lang === "fr" ? arr[2] : arr[1];
  const dName = (d=st.dataset) => st.lang==="fr" ? d.fr : d.en;
  const dFreq = () => st.lang==="fr" ? st.dataset.freqFr : st.dataset.freqEn;
  const dGeo = () => st.lang==="fr" ? st.dataset.geoFr : st.dataset.geoEn;
  const dUnit = () => st.lang==="fr" ? st.dataset.unitFr : st.dataset.unitEn;
  const dRel = () => st.lang==="fr" ? st.dataset.relFr : st.dataset.relEn;
  const dNote = () => st.lang==="fr" ? st.dataset.noteFr : st.dataset.noteEn;
  const rGeo = (r) => st.lang==="fr" ? r.geoFr : r.geoEn;
  const rUnit = (r) => st.lang==="fr" ? r.unitFr : r.unitEn;
  const rRef = (r) => st.lang==="fr" ? r.refFr : r.refEn;
  const pName = (code) => { const p = provinces.find(x=>x[0]===code) || provinces[0]; return st.lang==="fr" ? p[2] : p[1]; };
  const statusText = () => st.mode==="metadata" ? tr("metadata") : st.mode==="loading" ? tr("loading") : tr("demo");
  const badgeClass = () => st.mode==="metadata" ? "badge badge-metadata" : st.mode==="loading" ? "badge badge-loading" : "badge badge-demo";
  const bannerText = () => st.mode==="metadata" ? tr("bannerMetadata") : st.mode==="loading" ? tr("bannerLoading") : tr("bannerDemo");

  function setStaticText() {
    document.documentElement.lang = st.lang;
    document.title = tr("title");
    document.querySelectorAll("[data-i18n]").forEach(n => n.textContent = tr(n.dataset.i18n));
    document.querySelectorAll("[data-i18n-aria-label]").forEach(n => n.setAttribute("aria-label", tr(n.dataset.i18nAriaLabel)));
    $("langToggle").textContent = st.lang==="en" ? "Français" : "English";
    $("q").placeholder = tr("searchPlaceholder");
    $("siteSearch").action = st.lang==="fr" ? "https://www.canada.ca/fr/sr/srb.html" : "https://www.canada.ca/en/sr/srb.html";
    $("primaryNav").setAttribute("aria-label", tr("primaryNavAria"));
    $("breadcrumb").setAttribute("aria-label", tr("breadcrumbAria"));
    $("tabs").setAttribute("aria-label", tr("tabsAria"));
    document.querySelector("footer nav")?.setAttribute("aria-label", tr("footerAria"));
    localStorage.setItem(STORE+"lang", st.lang);
  }

  function fill(id, opts, selected) {
    const s = $(id); clear(s);
    opts.forEach(o => s.append(el("option", {t:o.label, a:{value:o.value}})));
    if ([...s.options].some(o => o.value === selected)) s.value = selected;
  }
  function renderSelectors() {
    fill("goal", goals.map(g=>({value:g[0], label:L(g)})), st.scenario?.goal || "chart");
    fill("subject", subjects.map(s=>({value:s[0], label:L(s)})), st.scenario?.subject || "prices");
    fill("province", provinces.map(p=>({value:p[0], label:st.lang==="fr"?p[2]:p[1]})), st.selectedGeo || "ON");
  }
  function normPostal(v){ return String(v||"").trim().toUpperCase().replace(/\s+/g,""); }
  function validPostal(v){ const n=normPostal(v); return !n || /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(n); }
  function postalProvince(v){ const c=normPostal(v).charAt(0); const p=provinces.find(x=>x[3] && x[3].includes(c)); return p ? p[0] : null; }
  function selectedDataset(goal, subject){ return datasets.find(d=>d.subject===subject) || datasets[2]; }
  function getScenario(){ return {goal:$("goal").value, subject:$("subject").value, postal:normPostal($("postal").value), province:postalProvince($("postal").value) || $("province").value || "ON", at:new Date().toISOString()}; }

  function clearErrors() {
    ["goalError","subjectError","postalError"].forEach(id=>{ $(id).hidden=true; $(id).textContent=""; });
    ["goalGroup","subjectGroup","postalGroup"].forEach(id=>$(id).classList.remove("has-error"));
    ["goal","subject","postal"].forEach(id=>$(id).removeAttribute("aria-invalid"));
    clear($("errorList")); $("errorSummary").hidden = true;
  }
  function addError(field, group, msgNode, msg) {
    const li = el("li"), a = el("a",{t:msg,a:{href:"#"+field}});
    li.append(a); $("errorList").append(li);
    $(msgNode).textContent = msg; $(msgNode).hidden = false; $(group).classList.add("has-error"); $(field).setAttribute("aria-invalid","true");
  }

  function startScenario(e) {
    if (e) e.preventDefault();
    clearErrors();
    const s = getScenario();
    if (!s.goal) addError("goal","goalGroup","goalError",tr("goalErr"));
    if (!s.subject) addError("subject","subjectGroup","subjectError",tr("subjectErr"));
    if (!validPostal($("postal").value)) addError("postal","postalGroup","postalError",tr("postalErr"));
    if ($("errorList").children.length) { $("errorSummary").hidden=false; $("errorSummary").focus(); return; }
    st.scenario = s; st.selectedGeo = s.province; st.dataset = selectedDataset(s.goal, s.subject); st.rows = st.dataset.rows.map(r=>({...r,sourceStatus:"fallback"})); st.mode="demo"; st.err=""; st.checked=""; st.quiz = makeQuiz(); st.answers={}; st.submitted=false; st.score=null;
    renderAll(); checkMetadata(); $("quiz").scrollIntoView({behavior:"smooth", block:"start"});
  }

  async function checkMetadata() {
    st.mode = "loading"; st.checked = new Date().toLocaleString(loc(), {dateStyle:"medium", timeStyle:"short"}); renderAll();
    try {
      const res = await fetch(WDS_META, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify([{productId:st.dataset.pid}])});
      if (!res.ok) throw new Error("HTTP " + res.status);
      const j = await res.json();
      if (!Array.isArray(j) || !j.some(x=>x.status==="SUCCESS" || x.object)) throw new Error("No usable metadata returned");
      st.mode = "metadata"; st.err = "";
    } catch (err) {
      st.mode = "demo"; st.err = err && err.message ? err.message : "Metadata request failed";
    }
    st.checked = new Date().toLocaleString(loc(), {dateStyle:"medium", timeStyle:"short"});
    renderAll();
  }

  function makeQuiz() {
    const d = st.dataset, chartEn = d.chart==="line" ? "line chart" : "bar chart", chartFr = d.chart==="line" ? "graphique linéaire" : "graphique à barres";
    const q = (id,en,fr,oe,of,exE,exF) => ({id,en,fr,oe,of,correct:0,exE,exF});
    return [
      q("source",`Which source should be named in a briefing about ${d.en}?`,`Quelle source faut-il nommer dans un breffage sur ${d.fr}?`,[`Statistics Canada table ${d.tableId}`,"A social media post","Only the chart title"],[`Tableau ${d.tableId} de Statistique Canada`,"Une publication sur les médias sociaux","Seulement le titre du graphique"],`Cite Statistics Canada table ${d.tableId} and include the URL.`,`Citez le tableau ${d.tableId} de Statistique Canada et incluez l’URL.`),
      q("frequency",`What is the frequency of ${d.en}?`,`Quelle est la fréquence de ${d.fr}?`,[d.freqEn,"Daily","Once only"],[d.freqFr,"Quotidienne","Une seule fois"],`The metadata lists the frequency as ${d.freqEn}.`,`Les métadonnées indiquent une fréquence ${d.freqFr.toLowerCase()}.`),
      q("geo","Which geography statement is safest for this prototype?","Quel énoncé géographique est le plus sûr pour ce prototype?",[d.geoEn,"Exact street address boundary","Individual-level location"],[d.geoFr,"Limite exacte de l’adresse","Emplacement individuel"],"Use the geography stated in the metadata. Postal-code inference is approximate only.","Utilisez la géographie indiquée dans les métadonnées. L’inférence par code postal est approximative."),
      q("unit",`What unit should be stated when using ${d.en}?`,`Quelle unité faut-il indiquer lorsqu’on utilise ${d.fr}?`,[d.unitEn,"Website visits","No unit is needed"],[d.unitFr,"Visites du site Web","Aucune unité n’est nécessaire"],`The unit is ${d.unitEn}.`,`L’unité est ${d.unitFr}.`),
      q("status","If the app says public metadata loaded, what does that mean?","Si l’application indique que les métadonnées publiques sont chargées, qu’est-ce que cela signifie?",["Metadata was checked; displayed values are a demonstration subset.","All displayed values are certified live values.","The app is the source of record."],["Les métadonnées ont été vérifiées; les valeurs affichées sont un sous-ensemble de démonstration.","Toutes les valeurs affichées sont des valeurs en direct certifiées.","L’application est la source officielle."],"This release checks metadata only; it does not claim displayed values are live WDS values.","Cette version vérifie seulement les métadonnées; elle n’affirme pas que les valeurs affichées sont des valeurs SDW en direct."),
      q("compare","What should be checked before comparing two rows?","Que faut-il vérifier avant de comparer deux lignes?",["Reference period, geography, unit and definition are comparable.","The larger number is always more important.","The first row always explains the cause."],["La période de référence, la géographie, l’unité et la définition sont comparables.","Le nombre le plus élevé est toujours le plus important.","La première ligne explique toujours la cause."],"Valid comparisons require comparable metadata and definitions.","Les comparaisons valides exigent des métadonnées et des définitions comparables."),
      q("cause","Can one table value prove the cause of a trend?","Une seule valeur de tableau peut-elle prouver la cause d’une tendance?",["No. Causal claims need additional evidence.","Yes. One value is enough.","Yes, if it appears in a chart."],["Non. Les énoncés causaux exigent d’autres preuves.","Oui. Une seule valeur suffit.","Oui, si elle apparaît dans un graphique."],"A table value can support an observation, not prove causality by itself.","Une valeur de tableau peut appuyer une observation, mais ne prouve pas la causalité à elle seule."),
      q("chart","Which chart type is recommended by the prototype for this dataset?","Quel type de graphique le prototype recommande-t-il pour ce jeu de données?",[chartEn,"Pie chart for every dataset","A chart with no equivalent table"],[chartFr,"Diagramme circulaire pour tous les jeux de données","Un graphique sans tableau équivalent"],`The prototype recommends a ${chartEn} and provides an equivalent table.`,`Le prototype recommande un ${chartFr} et fournit un tableau équivalent.`),
      q("limit","Which limitation should be included?","Quelle limite devrait être incluse?",[d.noteEn,"There are no limitations.","Use the data to profile individuals."],[d.noteFr,"Il n’y a aucune limite.","Utiliser les données pour profiler des personnes."],d.noteEn,d.noteFr),
      q("brief","What makes a stronger public briefing?","Qu’est-ce qui rend un breffage public plus solide?",["Separate data, interpretation, limitation and next step.","Hide the source if the chart is clear.","Use the most dramatic claim first."],["Séparer les données, l’interprétation, la limite et la prochaine étape.","Cacher la source si le graphique est clair.","Utiliser l’énoncé le plus spectaculaire d’abord."],"A strong briefing separates evidence from interpretation and includes limitations.","Un breffage solide sépare la preuve de l’interprétation et inclut les limites.")
    ];
  }

  function renderQuiz() {
    clear($("quizMeta")); clear($("quizQuestions")); clear($("scorePanel"));
    if (!st.dataset) return;
    const dl = defList([[tr("selectedDataset"),dName()],[tr("table"),st.dataset.tableId],[tr("frequency"),dFreq()],[tr("geography"),dGeo()],[tr("unit"),dUnit()],[tr("dataMode"),statusText()]]);
    $("quizMeta").append(el("h3",{t:tr("selectedDataset")}), dl);
    st.quiz.forEach((q,i)=>{
      const fs=el("fieldset",{c:"quiz-card",a:{id:"q-"+q.id}}), legend=el("legend",{t:`${i+1}. ${st.lang==="fr"?q.fr:q.en}`}), ul=el("ul",{c:"choice-list"}), opts=st.lang==="fr"?q.of:q.oe;
      fs.append(legend);
      opts.forEach((o,j)=>{ const id=`${q.id}-${j}`, li=el("li"), lab=el("label"), input=el("input",{a:{type:"radio",name:q.id,id,value:String(j)}}); if(st.answers[q.id]===j) input.checked=true; input.onchange=()=>{st.answers[q.id]=j;}; lab.append(input,el("span",{t:o})); li.append(lab); ul.append(li); });
      fs.append(ul);
      if(st.submitted){ const picked=st.answers[q.id], exp=el("div",{c:"explanation"}); fs.classList.add(picked===q.correct?"correct":"incorrect"); exp.append(el("p",{t:`${tr("yourAnswer")}: ${picked>=0?opts[picked]:tr("notAnswered")}`}),el("p",{t:`${tr("correctAnswer")}: ${opts[q.correct]}`}),el("p",{t:st.lang==="fr"?q.exF:q.exE})); fs.append(exp); }
      $("quizQuestions").append(fs);
    });
    if (st.score) renderScore();
    else $("scorePanel").hidden = true;
  }

  function submitQuiz(e) {
    e.preventDefault();
    const missing = st.quiz.find(q => !Number.isInteger(st.answers[q.id]));
    if (missing) { const box=$("q-"+missing.id); box.querySelector("input").focus(); box.scrollIntoView({behavior:"smooth",block:"center"}); return; }
    const good = st.quiz.filter(q => st.answers[q.id]===q.correct).length;
    st.score = {good,total:st.quiz.length,pct:Math.round(good/st.quiz.length*100)};
    st.submitted = true; saveScore(); renderAll(); $("scorePanel").focus();
  }
  function renderScore() {
    const p=$("scorePanel"); p.hidden=false; clear(p);
    p.append(el("h3",{t:tr("score")}), el("p",{t:`${st.score.good}/${st.score.total} — ${st.score.pct}%`}), el("h4",{t:tr("practice")}), el("p",{t:tr("practiceText")}), el("h4",{t:tr("answers")}));
    const ol=el("ol"); st.quiz.forEach(q=>{ const opts=st.lang==="fr"?q.of:q.oe, li=el("li"); li.append(el("strong",{t:st.lang==="fr"?q.fr:q.en}),el("p",{t:`${tr("correctAnswer")}: ${opts[q.correct]}`}),el("p",{t:st.lang==="fr"?q.exF:q.exE})); ol.append(li); }); p.append(ol);
  }
  function showAnswers(){ st.quiz.forEach(q=>{ if(!Number.isInteger(st.answers[q.id])) st.answers[q.id]=-1; }); st.submitted=true; st.score={good:st.quiz.filter(q=>st.answers[q.id]===0).length,total:st.quiz.length,pct:Math.round(st.quiz.filter(q=>st.answers[q.id]===0).length/st.quiz.length*100)}; renderAll(); $("scorePanel").focus(); }
  function retryQuiz(){ st.answers={}; st.submitted=false; st.score=null; renderAll(); }

  function defList(items){ const dl=el("dl",{c:"status-grid"}); items.forEach(([k,v])=>dl.append(el("dt",{t:k}),el("dd",{t:v||"—"}))); return dl; }
  function sourceNote(parent){ const sec=el("section",{c:"source-note"}); sec.append(el("h4",{t:tr("datasetSource")}),el("p",{t:tr("sourceBlock")}),defList([[tr("source"),dName()],[tr("table"),st.dataset.tableId],[tr("frequency"),dFreq()],[tr("geography"),dGeo()],[tr("unit"),dUnit()],[tr("release"),dRel()],[tr("dataMode"),statusText()]])); const p=el("p",{c:"source-links"}); p.append(el("a",{t:st.dataset.url,a:{href:st.dataset.url,target:"_blank",rel:"noopener noreferrer"}}),document.createTextNode(" · "),el("a",{t:tr("wdsGuide"),a:{href:WDS_GUIDE,target:"_blank",rel:"noopener noreferrer"}})); sec.append(p); parent.append(sec); }
  function renderStatus(){ const o=$("dataStatus"); clear(o); o.append(el("h3",{t:tr("sourceStatus")}),el("span",{c:badgeClass(),t:statusText()}),defList([[tr("selectedDataset"),dName()],[tr("table"),st.dataset.tableId],[tr("checked"),st.checked || "—"],[tr("selectedArea"),pName(st.selectedGeo)]])); if(st.mode==="demo" && st.err) o.append(el("p",{t:`${tr("fallbackReason")}: ${st.err}`})); sourceNote(o); }
  function renderScenario(){ const o=$("scenarioOutput"); clear(o); o.append(el("h3",{t:st.lang==="fr"?"Quiz prêt":"Quiz ready"}),defList([[tr("selectedDataset"),dName()],[tr("table"),st.dataset.tableId],[tr("selectedArea"),pName(st.selectedGeo)],[tr("dataMode"),statusText()]])); }

  function setTab(id){ st.tab=id; document.querySelectorAll('[role="tab"]').forEach(t=>{const on=t.dataset.tab===id; t.setAttribute("aria-selected",String(on)); t.tabIndex=on?0:-1;}); document.querySelectorAll('[role="tabpanel"]').forEach(p=>p.hidden=p.id!=="panel-"+id); $("tab-"+id).focus(); }
  function initTabs(){ document.querySelectorAll('[role="tab"]').forEach(t=>{t.onclick=()=>setTab(t.dataset.tab); t.onkeydown=e=>{const tabs=[...document.querySelectorAll('[role="tab"]')]; let i=tabs.indexOf(e.currentTarget), n=i; if(e.key==="ArrowRight") n=(i+1)%tabs.length; if(e.key==="ArrowLeft") n=(i-1+tabs.length)%tabs.length; if(e.key==="Home") n=0; if(e.key==="End") n=tabs.length-1; if(n!==i){e.preventDefault(); setTab(tabs[n].dataset.tab);}};}); }

  function addMsg(w,m){ const d=el("div",{c:"msg "+(w==="user"?"user":"")}); d.append(el("strong",{t:w==="user"?(st.lang==="fr"?"Vous : ":"You: "):(st.lang==="fr"?"Assistant : ":"Assistant: ")}),document.createTextNode(m)); $("chat").append(d); }
  function answer(q){ q=q.toLowerCase(); if(q.includes("chart")||q.includes("graph")) return `${tr("chartRecommended")}: ${st.dataset.chart==="line"?tr("chartLine"):tr("chartBar")}.`; if(q.includes("geo")||q.includes("postal")||q.includes("carte")) return `${tr("mapLimit")} ${tr("noLower")}`; if(q.includes("source")||q.includes("api")||q.includes("live")||q.includes("direct")||q.includes("repli")) return `${statusText()}. ${dName()} (${st.dataset.tableId}). ${dNote()}`; return `${dName()}. ${dNote()} ${tr("matrixNote")}`; }
  function renderChat(){ clear($("chat")); clear($("chips")); addMsg("bot",tr("hello")); (st.lang==="fr"?["Ces données sont-elles en direct?","Quel graphique convient?","Quelle est la limite géographique?"]:["Are these data live?","Which chart fits?","What is the geography limitation?"]).forEach(q=>{const b=el("button",{c:"chip",t:q,a:{type:"button"}}); b.onclick=()=>{$("chatInput").value=q;$("chatForm").dispatchEvent(new Event("submit",{cancelable:true}));}; $("chips").append(b);}); }
  function renderDict(){ const bank=concepts[st.scenario?.goal]||concepts.chart; fill("term",bank.map(c=>({value:c[0],label:st.lang==="fr"?c[2]:c[1]})),$("term").value); const c=bank.find(x=>x[0]===$("term").value)||bank[0], o=$("dictionaryOutput"); clear(o); o.append(el("span",{c:badgeClass(),t:statusText()}),el("h4",{t:st.lang==="fr"?c[2]:c[1]}),el("p",{t:st.lang==="fr"?c[4]:c[3]})); sourceNote(o); $("term").onchange=renderDict; }

  function focusOpts(){return[{value:"all",label:tr("allRows")},{value:"selected",label:tr("selectedRows")},{value:"change",label:tr("largestChange")},{value:"quality",label:tr("qualityCautions")}];}
  function rowsFiltered(){ let r=[...st.rows], f=$("focus").value; if(f==="selected") r=r.filter(x=>x.code===st.selectedGeo||x.code==="CA"); if(f==="change") r=r.sort((a,b)=>Math.abs(b.value-b.previous)-Math.abs(a.value-a.previous)).slice(0,3); if(f==="quality") r=r.filter(x=>x.quality!=="A"); return r; }
  function renderTable(table, rows, caption){ clear(table); table.append(el("caption",{t:caption})); const head=el("thead"), hr=el("tr"); [tr("geography"),tr("latest"),tr("previous"),tr("change"),tr("reference"),tr("unit"),tr("status"),tr("quality")].forEach(h=>hr.append(el("th",{t:h,a:{scope:"col"}}))); head.append(hr); table.append(head); const body=el("tbody"); rows.forEach(r=>{const row=el("tr"); row.append(el("th",{t:rGeo(r),a:{scope:"row"}}),el("td",{t:fmt(r.value)}),el("td",{t:fmt(r.previous)}),el("td",{t:fmt(r.value-r.previous)}),el("td",{t:st.lang==="fr"?r.refFr:r.refEn}),el("td",{t:rUnit(r)}),el("td",{t:statusText()}),el("td",{t:r.quality==="A"?"A":"B"})); body.append(row);}); table.append(body); }
  function renderMatrix(){ fill("focus",focusOpts(),$("focus").value||"all"); renderTable($("matrixTable"),rowsFiltered(),dName()+" — "+(st.lang==="fr"?"matrice":"matrix")); const n=$("matrixNote"); clear(n); n.append(el("p",{t:tr("matrixNote")})); sourceNote(n); $("focus").onchange=renderMatrix; }
  function renderViz(){ fill("metric",[{value:"recommended",label:tr("chartRecommended")},{value:"bar",label:tr("chartBar")},{value:"line",label:tr("chartLine")},{value:"quality",label:tr("qualityTable")}],$("metric").value||"recommended"); drawViz(); $("metric").onchange=drawViz; }
  function drawViz(){ const o=$("visualizerOutput"); clear(o); o.append(el("span",{c:badgeClass(),t:statusText()})); const view=$("metric").value==="recommended"?st.dataset.chart:$("metric").value; if(view==="line"){const c=el("div",{c:"line-chart",a:{role:"img","aria-label":tr("chartLine")}}); st.rows.slice(0,5).forEach((r,i)=>c.append(el("span",{c:"point",t:"●",a:{style:`left:${10+i*20}%;top:${30+i*18}px`,"aria-hidden":"true"}}))); o.append(c);} else if(view==="bar"){const c=el("div",{c:"bar-chart",a:{"aria-hidden":"true"}}), max=Math.max(...st.rows.map(r=>r.value)); st.rows.forEach(r=>{const row=el("div",{c:"bar-row"}), track=el("div",{c:"bar-track"}), fill=el("div",{c:"bar-fill"}); fill.style.width=Math.max(2,r.value/max*100)+"%"; track.append(fill); row.append(el("span",{t:rGeo(r)}),track,el("strong",{t:fmt(r.value)})); c.append(row);}); o.append(c);} const wrap=el("div",{c:"table-wrap"}), t=el("table"); renderTable(t,st.rows,dName()+" — "+(st.lang==="fr"?"tableau équivalent":"equivalent table")); wrap.append(t); o.append(wrap); sourceNote(o); }
  function renderMap(){ clear($("geoButtons")); clear($("mapFrame")); clear($("mapOutput")); provinces.filter(p=>p[0]!=="CA").forEach(p=>{const b=el("button",{c:"chip",t:st.lang==="fr"?p[2]:p[1],a:{type:"button","aria-pressed":String(p[0]===st.selectedGeo)}}); b.onclick=()=>{st.selectedGeo=p[0]; renderMap(); renderMatrix(); renderViz(); renderStatus();}; $("geoButtons").append(b);}); const svg=el("svg",{a:{viewBox:"0 0 900 520",role:"img","aria-label":tr("mapHeading")}}); svg.append(el("rect",{a:{width:900,height:520,fill:"#e8f0f8"}})); Object.entries(boxes).forEach(([code,b])=>{svg.append(el("rect",{c:"geo-shape"+(code===st.selectedGeo?" selected":""),a:{x:b[0],y:b[1],width:b[2],height:b[3],rx:8}})); svg.append(el("text",{t:code,a:{x:b[0]+8,y:b[1]+24,"font-size":16,"font-weight":700}}));}); $("mapFrame").append(svg); const r=st.rows.find(x=>x.code===st.selectedGeo)||st.rows[0]; $("mapOutput").append(el("h4",{t:pName(st.selectedGeo)}),defList([[tr("selectedDataset"),dName()],[tr("table"),st.dataset.tableId],[tr("value"),fmt(r.value)],[tr("unit"),rUnit(r)],[tr("reference"),rRef(r)]]),el("p",{t:tr("mapLimit")}),el("p",{t:tr("noLower")})); sourceNote($("mapOutput")); }

  function saveScore(){ const scores=JSON.parse(localStorage.getItem(STORE+"scores")||"[]"); scores.unshift({at:new Date().toISOString(),score:st.score,dataset:{en:st.dataset.en,fr:st.dataset.fr,tableId:st.dataset.tableId},subject:st.scenario.subject,goal:st.scenario.goal,geo:st.selectedGeo,mode:st.mode}); localStorage.setItem(STORE+"scores",JSON.stringify(scores.slice(0,25))); }
  function renderScores(){ const out=$("leaderboardOutput"); clear(out); const scores=JSON.parse(localStorage.getItem(STORE+"scores")||"[]"); if(!scores.length){out.append(el("p",{t:tr("noScores")})); return;} const t=el("table"); t.append(el("caption",{t:tr("progressCaption")})); const head=el("thead"), hr=el("tr"); [tr("checked"),tr("score"),tr("selectedDataset"),tr("table"),tr("selectedArea"),tr("dataMode")].forEach(h=>hr.append(el("th",{t:h,a:{scope:"col"}}))); head.append(hr); t.append(head); const body=el("tbody"); scores.forEach(s=>{const r=el("tr"); [new Date(s.at).toLocaleString(loc(),{dateStyle:"medium",timeStyle:"short"}),`${s.score.good}/${s.score.total} — ${s.score.pct}%`,st.lang==="fr"?s.dataset.fr:s.dataset.en,s.dataset.tableId,pName(s.geo),s.mode==="metadata"?tr("metadata"):tr("demo")].forEach((v,i)=>r.append(el(i===0?"th":"td",{t:v,a:i===0?{scope:"row"}:{}}))); body.append(r);}); t.append(body); out.append(t); }

  function exportJson(){ const data={scenario:st.scenario,dataset:{name:dName(),tableId:st.dataset.tableId,url:st.dataset.url,frequency:dFreq(),geography:dGeo(),unit:dUnit(),release:dRel(),limitation:dNote()},status:statusText(),score:st.score,rows:st.rows}; const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"})); const a=el("a",{a:{href:url,download:"stc-analytical-sandbox-scenario.json"}}); document.body.append(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

  function renderAll(){ setStaticText(); $("bannerText").textContent=bannerText(); renderSelectors(); renderScenario(); renderStatus(); renderQuiz(); renderChat(); renderDict(); renderMatrix(); renderViz(); renderMap(); renderScores(); }
  function init(){ initTabs(); st.scenario={goal:"chart",subject:"prices",province:"ON"}; st.selectedGeo="ON"; st.dataset=selectedDataset("chart","prices"); st.rows=st.dataset.rows; st.quiz=makeQuiz(); renderAll();
    $("scenarioForm").onsubmit=startScenario; $("resetButton").onclick=()=>{st.scenario={goal:"chart",subject:"prices",province:"ON"}; $("postal").value="K1A 0A6"; startScenario();}; $("printButton").onclick=()=>window.print(); $("exportButton").onclick=exportJson; $("langToggle").onclick=()=>{st.lang=st.lang==="en"?"fr":"en"; renderAll(); $("wb-cont").focus();};
    $("quizForm").onsubmit=submitQuiz; $("showAnswersButton").onclick=showAnswers; $("retryQuizButton").onclick=retryQuiz; $("clearLeaderboardButton").onclick=()=>{localStorage.removeItem(STORE+"scores"); renderScores();};
    $("chatForm").onsubmit=(e)=>{e.preventDefault(); const q=$("chatInput").value.trim(); if(!q){$("chatError").textContent=tr("chatErr"); $("chatError").hidden=false; return;} $("chatError").hidden=true; addMsg("user",q); addMsg("bot",answer(q)); $("chatInput").value="";};
  }
  document.addEventListener("DOMContentLoaded", init);
})();