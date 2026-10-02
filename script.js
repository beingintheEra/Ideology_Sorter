let ideologies = {};

async function loadIdeologies() {
  try {
    const res = await fetch("./ideologies.json");
    if (!res.ok) throw new Error(`Unable to load ideologies.json (${res.status})`);
    ideologies = await res.json();
  } catch {
    ideologies = {};
  }
}

const state = {
  history: []
};

const RESULT_FLAG_ALIASES = Object.freeze({
  "National Bolshevism (Limonov)": "Limonovism",
  "National Bolshevism (Karl Otto Paetel)": "National Bolshevism (Paetel)",
  "National Bolshevism (Heinrich Laufenberg)": "National Bolshevism (Laufenberg)",
  "Smiley Fascism": "Smiley Facism",
  "Communization (Troploin)": "Communization (Dauve)",
  "Falangism (Primo De Rivera)": "Falangism"
});

document.addEventListener("DOMContentLoaded", async () => {
  await loadIdeologies();
  renderWelcome();
});

function $(selector) {
  return document.querySelector(selector);
}

function clearApp() {
  const app = $("#app");
  app.innerHTML = "";
  return app;
}

function renderWelcome() {
  state.history = [];
  setView("home");
  const app = clearApp();
  const wrap = document.createElement("div");
  wrap.className = "welcome";

  const heading = document.createElement("h1");
  heading.className = "visually-hidden";
  heading.textContent = "IDEOLOGY SORTER";
  wrap.appendChild(heading);

  const startBtn = makeButton("Start", () => {
    state.history = [];
    q_privateProperty();
  });

  const treeBtn = makeButton("Tree", renderTree);
  const aboutBtn = makeButton("About", renderAbout);
  const createBtn = makeButton("Create", renderCreate);

  for (const button of [startBtn, treeBtn, aboutBtn, createBtn]) {
    button.classList.add("home-button");
    wrap.appendChild(button);
  }

  app.appendChild(wrap);
}

function renderQuiz(questionText, choices, backFn) {
  setView("quiz");

  const app = clearApp();

  const wrap = document.createElement("div");
  wrap.className = "quiz";

  const h1 = document.createElement("h1");
  h1.textContent = questionText;

  const answersWrap = document.createElement("div");
  answersWrap.style.marginTop = "24px";

  for (const choice of choices) {
    answersWrap.appendChild(makeButton(choice.label, choice.onClick));
  }

  wrap.appendChild(h1);
  wrap.appendChild(answersWrap);

  if (backFn) {
    const backBtn = makeButton("Back", backFn);
    backBtn.style.marginTop = "32px";
    wrap.appendChild(backBtn);
  }

  app.appendChild(wrap);
  updateAmbientFromButtons(answersWrap.querySelectorAll("button"));
}

function renderResult(ideologyName) {
  const fromTree = document.body.dataset.view === "tree";
  setView("result");

  const app = clearApp();

  const wrap = document.createElement("div");
  wrap.className = "result";

  const h1 = document.createElement("h1");
  h1.textContent = ideologyName;

  const flagWrap = document.createElement("div");
  flagWrap.className = "flag-wrap";

  const flagImg = document.createElement("img");
  flagImg.className = "result-flag";
  flagImg.alt = `${ideologyName} flag`;
  flagImg.src = getFlagUrl(ideologyName);
  flagImg.onerror = () => {
    flagImg.onerror = null;
    flagImg.src = "./assets/flags/null.svg";
  };
  flagImg.addEventListener("load", () => updateAmbientFromImage(flagImg));

  flagWrap.appendChild(flagImg);
  flagWrap.classList.add("flag-preview-trigger");
  flagWrap.tabIndex = 0;
  flagWrap.setAttribute("role", "button");
  flagWrap.setAttribute("aria-label", `View and copy ${ideologyName} flag as PNG`);
  flagWrap.addEventListener("click", () => showFlagPng(flagImg, ideologyName));
  flagWrap.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      showFlagPng(flagImg, ideologyName);
    }
  });

  const entry = ideologies[ideologyName];
  const quoteStr = entry?.[0]?.trim() || "";
  const authorStr = entry?.[1]?.trim() || "";

  const quoteBox = document.createElement("div");
  quoteBox.className = "quote-box";

  const quoteText = document.createElement("div");
  quoteText.className = "quote-text";
  quoteText.textContent = `“${quoteStr}”`;

  const quoteAuthor = document.createElement("div");
  quoteAuthor.className = "quote-author";
  quoteAuthor.textContent = authorStr ? `— ${authorStr}` : "";

  quoteBox.appendChild(quoteText);
  quoteBox.appendChild(quoteAuthor);

  const restartBtn = makeButton("Restart", renderWelcome);

  let backBtn = null;
  if (state.history.length > 0 && !fromTree) {
    backBtn = makeButton("Back", () => {
      const last = state.history.pop();
      if (last) last();
    });
  }

  wrap.appendChild(h1);
  wrap.appendChild(flagWrap);
  if (quoteStr) wrap.appendChild(quoteBox);

  if (backBtn) wrap.appendChild(backBtn);
  if (fromTree) wrap.appendChild(makeButton("Back to Tree", renderTree));
  wrap.appendChild(restartBtn);

  app.appendChild(wrap);
}

async function showFlagPng(flagImg, ideologyName) {
  if (!flagImg.complete || !flagImg.naturalWidth) return;

  const scale = Math.min(4608 / flagImg.naturalWidth, 3072 / flagImg.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(flagImg.naturalWidth * scale);
  canvas.height = Math.round(flagImg.naturalHeight * scale);
  canvas.getContext("2d").drawImage(flagImg, 0, 0, canvas.width, canvas.height);

  const png = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  if (!png || !flagImg.isConnected) return;
  const url = URL.createObjectURL(png);

  const dialog = document.createElement("dialog");
  dialog.className = "flag-dialog";
  const heading = document.createElement("h2");
  heading.textContent = `${ideologyName} flag · PNG`;
  const image = document.createElement("img");
  image.src = url;
  image.alt = `${ideologyName} flag as PNG`;
  const actions = document.createElement("div");
  actions.className = "flag-dialog-actions";
  const copyButton = makeButton("Copy PNG", async () => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      copyButton.textContent = "Copied PNG";
    } catch {
      copyButton.textContent = "Copy unavailable";
    }
  });
  const download = document.createElement("a");
  download.href = url;
  download.download = `${ideologyName.replace(/[\\/:*?"<>|]/g, "-")}.png`;
  download.textContent = "Download PNG";
  download.className = "flag-download";
  const close = makeButton("Close", () => dialog.close());
  actions.append(copyButton, download, close);
  dialog.append(heading, image, actions);
  dialog.addEventListener("close", () => {
    URL.revokeObjectURL(url);
    dialog.remove();
  }, { once: true });
  document.body.appendChild(dialog);
  dialog.showModal();
}

function q(prev, questionText,
           b1, n1,
           b2, n2,
           b3, n3,
           b4, n4,
           b5, n5) {
  const questionFn = q.caller || null;
  if (window.treeCollector) {
    window.treeCollector.capture(questionFn, questionText, [[b1, n1], [b2, n2], [b3, n3], [b4, n4], [b5, n5]]);
    return;
  }
  const choices = [];

  function addChoice(label, next) {
    if (!label) return;

    choices.push({
      label,
      onClick: () => {
        if (questionFn) state.history.push(questionFn);
        if (typeof next === "function") next();
      }
    });
  }

  addChoice(b1, n1);
  addChoice(b2, n2);
  addChoice(b3, n3);
  addChoice(b4, n4);
  addChoice(b5, n5);

  let backFn = null;

  if (state.history.length > 0) {
    backFn = () => {
      const last = state.history.pop();
      if (last) last();
    };
  } else if (prev === "") {
    backFn = renderWelcome;
  } else if (typeof prev === "function") {
    backFn = prev;
  }

  renderQuiz(questionText, choices, backFn);
}

function r(_fromQuestionFn, ideologyName) {
  if (window.treeCollector) {
    window.treeCollector.target = { type: "result", name: ideologyName };
    return;
  }
  renderResult(ideologyName);
}

/* START OF QUIZ */

function q_privateProperty() {
  q("", "Should private property exist?", "Yes", q_constitution, "No", q_markets);
}

/* ANTI-PRIVATE PROPERTY TREE */

function q_markets() {
  q("", "Should monetary mechanisms be used to distribute goods and services?", "Yes", q_authMarkSoc, "No", q_communism);
}

function q_authMarkSoc() {
  q(q_markets, "Should the state be governed by a single, central party?", "Yes", q_ethnicHierarchy, "No", q_guilds, "The state should not exist", q_participatoryPlanning);
}

function q_ethnicHierarchy() {
  q(q_authMarkSoc, "Should the state uphold an ethnically defined social hierarchy?", "Yes", () => r(q_ethnicHierarchy, "Strasserism"), "No", q_lange);
}

function q_lange() {
  q(q_ethnicHierarchy, "Should central planning guide the direction of the economy?", "Yes", q_privateEnterprise, "No", () => r(q_lange, "Titoism"));
}

function q_privateEnterprise() {
  q(q_lange, "Should individual producers have a place alongside state planning?", "Yes", q_partyMarketSocialism, "No", () => r(q_privateEnterprise, "Langean Socialism"));
}

function q_partyMarketSocialism() {
  q(q_privateEnterprise, "Can a market economy governed by a communist party be called socialist?", "Yes", () => r(q_partyMarketSocialism, "Marxism-Leninism-MZT"), "No", () => r(q_partyMarketSocialism, "Bukharinism"));
}

function q_guilds() {
  q(q_authMarkSoc, "Should public services be competitive?", "Yes", () => r(q_guilds, "Market Socialism"), "No", () => r(q_guilds, "Guild Socialism"));
}

function q_participatoryPlanning() {
  q(q_authMarkSoc, "Should producers and consumers allocate resources through participatory planning?", "Yes", () => r(q_participatoryPlanning, "Participism"), "No", q_mutual);
}

function q_mutual() {
  q(q_participatoryPlanning, "Should the economy be based on mutual credit?", "Yes", () => r(q_mutual, "Tuckerite Mutualism"), "No", () => r(q_mutual, "Market Anarchism"));
}

function q_communism() {
  q(q_markets, "Should we reach a classless, stateless, moneyless society?", "Yes", q_religion, "No", q_weed);
}

function q_religion() {
  q(q_communism, "Is the motive for my politics religious?", "Yes", q_whatreligion, "No", q_dotp);
}

function q_whatreligion() {
  q(q_religion, "What religion drives your ideology?", "Christianity", q_anarchochrist, "Islam", q_anarchoislam, "Judaism", q_anarchojewish, "Confucianism", q_anarchoconfucian);
}

function q_anarchochrist() {
  q(q_whatreligion, "Do you subscribe to the anarchist school of thought?", "Yes", () => r(q_anarchochrist, "Christian Anarchism"), "No", () => r(q_anarchochrist, "Liberation Theology"));
}

function q_anarchoislam() {
  q(q_whatreligion, "Do you subscribe to the anarchist school of thought?", "Yes", () => r(q_anarchoislam, "Islamic Anarcho-Communism"), "No", () => r(q_anarchoislam, "Islamic Socialism"));
}

function q_anarchojewish() {
  q(q_whatreligion, "Do you subscribe to the anarchist school of thought?", "Yes", () => r(q_anarchojewish, "Jewish Anarchism"), "No", () => r(q_anarchojewish, "Jewish Bundism"));
}

function q_anarchoconfucian() {
  q(q_whatreligion, "Do you subscribe to the anarchist school of thought?", "Yes", () => r(q_anarchoconfucian, "Confucian Anarcho-Communism"), "No", () => r(q_anarchoconfucian, "Confucian Socialism"));
}

function q_dotp() {
  q(q_religion, "Is a dictatorship of the proletariat necessary to achieve communism?", "Yes", q_workerscouncils, "No", q_communization);
}

function q_workerscouncils() {
  q(q_dotp, "Should political and economic power remain under the direct control of workers' councils, independent of a separate state administration?", "Yes", q_massparty, "No", q_demCent);
}

function q_socialistNationalism() {
  q(q_electoralism, "Should the socialist movement embrace nationalist ideas?", "Yes", q_nationalStruggle, "No", q_partyElites);
}

function q_nationalStruggle() {
  q(q_socialistNationalism, "Should the national struggle be paramount to class struggle?", "Yes", () => r(q_nationalStruggle, "National Bolshevism (Karl Otto Paetel)"), "No", () => r(q_nationalStruggle, "National Bolshevism (Heinrich Laufenberg)"));
}

function q_immortalParty() {
  q(q_organic, "How should communist revolutionary leadership be organized?", "One world party", () => r(q_immortalParty, "Immortalism (Palingenetic)"), "Multiple communist organizations", () => r(q_immortalParty, "Immortalist Communism"));
}

function q_massparty() {
  q(q_workerscouncils, "Does the proletariat still need a separate political party after the establishment of workers' councils?", "Yes", q_electoralism, "No", q_insurrectionaryorganization);
}

function q_electoralism() {
  q(q_massparty, "Should we use electoral politics to develop class consciousness among workers?", "Yes", q_massStrikes, "No", q_socialistNationalism);
}

function q_massStrikes() {
  q(q_electoralism, "Should spontaneous mass strikes be central to the proletarian revolution?", "Yes", () => r(q_massStrikes, "Spartacism"), "No", () => r(q_massStrikes, "Classical Marxism"));
}

function q_insurrectionaryorganization() {
  q(q_massparty, "Is an insurrectionary organization necessary for the struggle against capitalism?", "Yes", q_maospontex, "No", q_situationism);
}

function q_situationism() {
  q(q_insurrectionaryorganization, "Should the dictatorship of the proletariat be anti-state?", "Yes", () => r(q_situationism, "Situationism"), "No", () => r(q_situationism, "Libertarian Marxism"));
}

function q_maospontex() {
  q(q_insurrectionaryorganization, "Should we accept the Chinese Cultural Revolution as a role model for our struggle?", "Yes", () => r(q_maospontex, "Mao-Spontex"), "No", q_capitalistRealism);
}

function q_capitalistRealism() {
  q(q_maospontex, "What should come first in the struggle against capitalism?", "Overcoming capitalist realism", () => r(q_capitalistRealism, "Acid Communism"), "Refusing work", q_areasofstruggle);
}

function q_areasofstruggle() {
  q(q_capitalistRealism, "Are ecological and social contradictions as important as class contradictions?", "Yes", () => r(q_areasofstruggle, "Post-Autonomism"), "No", () => r(q_areasofstruggle, "Autonomism"));
}

function q_demCent() {
  q(q_workerscouncils, "Should proletarian organization be based on democratic centralism?", "Yes", q_leninsParty, "No", q_guerrillaFoco);
}

function q_guerrillaFoco() {
  q(q_demCent, "Can a small guerrilla force create the conditions for revolution before a mass party exists?", "Yes", () => r(q_guerrillaFoco, "Focoism"), "No", q_organic);
}

function q_organic() {
  q(q_guerrillaFoco, "Should proletarian organization be based on organic centralism?", "Yes", () => r(q_organic, "Italian Left-Communism (Programma)"), "No", q_reform, "The revolution is the proletarian organization itself", q_immortalParty);
}

function q_reform() {
  q(q_organic, "Should we reform capitalism in the short term?", "Yes", () => r(q_reform, "Classical Social Democracy"), "No", () => r(q_reform, "De Leonism"));
}

function q_leninsParty() {
  q(q_demCent, "Did Lenin's Bolshevik Party betray the October Revolution?", "Yes", q_proletarianculture, "No", q_communistFuturism);
}

function q_proletarianculture() {
  q(q_leninsParty, "Should workers create a distinct proletarian culture of their own?", "Yes", q_gastevism, "No", () => r(q_proletarianculture, "Workers' Oppositionism"));
}

function q_gastevism() {
  q(q_proletarianculture, "Should workers be scientifically trained to work in sync with the production process?", "Yes", () => r(q_gastevism, "Gastevism"), "No", () => r(q_gastevism, "Vperedism"));
}

function q_communistFuturism() {
  q(q_leninsParty, "Should Futurism be central to our revolutionary program?", "Yes", () => r(q_communistFuturism, "Communist Futurism"), "No", q_stalinCope);
}

function q_stalinCope() {
  q(q_communistFuturism, "Can socialism be built up in one country?", "Yes", q_commodityUnderSocialism, "No", q_natLib);
}

function q_commodityUnderSocialism() {
  q(q_stalinCope, "Can commodity production continue under socialism?", "Yes", q_classStruggleSocialism, "No", () => r(q_commodityUnderSocialism, "Leninism"));
}

function q_natLib() {
  q(q_stalinCope, "Do you support national liberation in contemporary society?", "Yes", q_dws, "No", () => r(q_natLib, "Italian Left-Communism (Battaglia)"));
}

function q_dws() {
  q(q_natLib, "Do you subscribe to the theory of the degenerated workers' state?", "Yes", q_trotskyCurrent, "No", q_workersDemocracyStalin);
}

function q_trotskyCurrent() {
  q(q_dws, "Could nuclear war create an opening for world revolution?", "Yes", () => r(q_trotskyCurrent, "Posadism"), "No", () => r(q_trotskyCurrent, "Orthodox Trotskyism"));
}

function q_workersDemocracyStalin() {
  q(q_dws, "Did the working class lose democratic control over the Soviet state under Stalin?", "Yes", q_sovietRulingClass, "No", () => r(q_workersDemocracyStalin, "Left Marxism-Leninism"));
}

function q_sovietRulingClass() {
  q(q_workersDemocracyStalin, "Did the Soviet bureaucracy become a ruling class outside capitalism?", "Yes", () => r(q_sovietRulingClass, "Shachtmanism"), "No", () => r(q_sovietRulingClass, "Heterodox Trotskyism"));
}

function q_classStruggleSocialism() {
  q(q_commodityUnderSocialism, "Does class struggle continue under socialism?", "Yes", q_chinaBourgeois, "No", q_khrushBrezhnev);
}

function q_khrushBrezhnev() {
  q(q_classStruggleSocialism, "How does socialist society advance toward full communism?", "Planned Development", () => r(q_khrushBrezhnev, "Marxism-Leninism (Khrushchev)"), "Organic Development", () => r(q_khrushBrezhnev, "Developed Socialism"));
}

function q_chinaBourgeois() {
  q(q_classStruggleSocialism, "Was the Chinese revolution a bourgeois revolution?", "Yes", () => r(q_chinaBourgeois, "Anti-Revisionist Marxism-Leninism"), "No", q_peopleWar);
}

function q_peopleWar() {
  q(q_chinaBourgeois, "Should protracted guerrilla warfare be used to remove the old society?", "Yes", q_universalPPW, "No", q_natCom);
}

function q_universalPPW() {
  q(q_peopleWar, "Are these tactics applicable across all countries?", "Yes", () => r(q_universalPPW, "Marxism-Leninism-Maoism, principally Maoism"), "No", q_laborAristocracy);
}

function q_laborAristocracy() {
  q(q_universalPPW, "Is the First World working class anti-revolutionary?", "Yes", () => r(q_laborAristocracy, "Maoism Third-Worldism"), "No", () => r(q_laborAristocracy, "Marxism-Leninism-Maoism"));
}

function q_natCom() {
  q(q_peopleWar, "Should the revolution's main priority be the nation's liberation?", "Yes", q_songun, "No", () => r(q_natCom, "Marxism-Leninism"));
}

function q_songun() {
  q(q_natCom, "Is prioritizing resources for the military necessary?", "Yes", () => r(q_songun, "Juche"), "No", () => r(q_songun, "National Communism"));
}

function q_partyElites() {
  q(q_socialistNationalism, "Should there be a small party of elites to engage in political activity?", "Yes", () => r(q_partyElites, "Council Communism (Organizational Dualism)"), "No", () => r(q_partyElites, "Council Communism (Organizational Unitarism)"));
}

function q_communization() {
  q(q_dotp, "Is class struggle still fundamental to revolution?", "Yes", q_prefigurative, "No", q_postLeftEthnicity);
}

function q_prefigurative() {
  q(q_communization, "Should we prefigure the institutions of a post-capitalist society before capitalism is abolished?", "Yes", q_anarchosyn, "No", q_beyondRational);
}

function q_beyondRational() {
  q(q_prefigurative, "Does going beyond rational consciousness and conventional ways of thinking play an important role in the conception of a liberated society?", "Yes", q_collectiveLife, "No", q_invariantCommunization);
}

function q_collectiveLife() {
  q(q_beyondRational, "Should transcending the individual self through shared experience be the basis of collective life?", "Yes", () => r(q_collectiveLife, "Acéphaleism"), "No", () => r(q_collectiveLife, "Surrealism"));
}

function q_invariantCommunization() {
  q(q_beyondRational, "Is communization an invariant revolutionary possibility throughout the history of capitalism?", "Yes", () => r(q_invariantCommunization, "Communization (Troploin)"), "No", q_subsumption);
}

function q_subsumption() {
  q(q_invariantCommunization, "Does dividing capitalist history into phases of formal and real subsumption explain why communization is possible in the current cycle of struggle?", "Yes", () => r(q_subsumption, "Communization (Théorie Communiste)"), "No", () => r(q_subsumption, "Communization (Endnotes)"));
}

function q_postLeftEthnicity() {
  q(q_communization, "Should stateless communities be ethnically homogeneous?", "Yes", () => r(q_postLeftEthnicity, "National Anarchism"), "No", q_gemeinwesen);
}

function q_gemeinwesen() {
  q(q_postLeftEthnicity, "Should revolution aim to create a human Gemeinwesen?", "Yes", () => r(q_gemeinwesen, "Camattism"), "No", q_nihlism);
}

function q_technologyHierarchy() {
  q(q_insurrection, "Does technology tend to produce hierarchy?", "Yes", q_technologyRepurposed, "No", () => r(q_technologyHierarchy, "Post-Left Anarchism"));
}

function q_technologyRepurposed() {
  q(q_technologyHierarchy, "Can technology be repurposed without preserving the hierarchies of the society that created it?", "Yes", () => r(q_technologyRepurposed, "Post-Civilization"), "No", q_preAgriculturalLife);
}

function q_preAgriculturalLife() {
  q(q_technologyRepurposed, "Should we actively move toward a society based on pre-agricultural ways of life?", "Yes", () => r(q_preAgriculturalLife, "Anarcho-Primitivism"), "No", () => r(q_preAgriculturalLife, "Anti-Civilization"));
}

function q_nihlism() {
  q(q_gemeinwesen, "Are there no demands to make, no utopian visions to uphold, and no political programs to follow—only resistance as pure negation?", "Yes", () => r(q_nihlism, "Anarcho-Nihilism"), "No", q_egoism);
}

function q_egoism() {
  q(q_nihlism, "Should revolt be grounded in the self-interest of the unique individual?", "Yes", q_egoCom, "No", q_insurrection);
}

function q_egoCom() {
  q(q_egoism, "Will each individual's struggle to liberate their ego from society's abstractions lead to communism?", "Yes", () => r(q_egoCom, "Ego-Communism"), "No", q_illegalism);
}

function q_insurrection() {
  q(q_egoism, "Should insurrection be central to revolutionary practice?", "Yes", q_collectiveInsurrection, "No", q_technologyHierarchy);
}

function q_collectiveInsurrection() {
  q(q_insurrection, "Should insurrection grow out of autonomous forms of collective life?", "Yes", q_formsOfLife, "No", () => r(q_collectiveInsurrection, "Insurrectionary Anarchism"));
}

function q_formsOfLife() {
  q(q_collectiveInsurrection, "What should form the basis of a revolutionary break with capitalist society?", "Forms of life", () => r(q_formsOfLife, "Communization (Tiqqun)"), "Autonomous communes", () => r(q_formsOfLife, "Communization (The Invisible Committee)"));
}

function q_illegalism() {
  q(q_egoCom, "Is crime an inherently revolutionary act?", "Yes", () => r(q_illegalism, "Illegalism"), "No", () => r(q_illegalism, "Individualist Anarchism"));
}

function q_anarchosyn() {
  q(q_prefigurative, "Should there be an anarchist federation that is loosely organized and treats different anarchist ideas equally?", "Yes", q_anarchoUnions, "No", q_bookchin);
}

function q_anarchistTendencies() {
  q(q_anarchoUnions, "Should different anarchist tendencies be united within a common theoretical and organizational framework?", "Yes", () => r(q_anarchistTendencies, "Synthesis Anarchism"), "No", () => r(q_anarchistTendencies, "Anarchism Without Adjectives"));
}

function q_anarchoUnions() {
  q(q_anarchosyn, "Should revolutionary unions be the primary organizational basis of our struggle and future society?", "Yes", q_proudhon, "No", q_anarchistTendencies);
}

function q_proudhon() {
  q(q_anarchoUnions, "Should revolutionary unions, as prefigurative institutions, gradually replace capitalist social relations?", "Yes", () => r(q_proudhon, "Proudhonian Mutualism"), "No", q_myth);
}

function q_myth() {
  q(q_proudhon, "Should we adopt the myth of our victory as our movement's unifier?", "Yes", () => r(q_myth, "Sorelianism"), "No", () => r(q_myth, "Anarcho-Syndicalism"));
}

function q_bookchin() {
  q(q_anarchosyn, "Should the state be opposed through local direct democracy?", "Yes", q_demconf, "No", q_platform);
}

function q_demconf() {
  q(q_bookchin, "Should societal and political structures emphasize Jineology (feminism) and multiculturalism?", "Yes", () => r(q_demconf, "Democratic Confederalism"), "No", () => r(q_demconf, "Libertarian Municipalism"));
}

function q_platform() {
  q(q_bookchin, "Should the anarchist organization uphold collective responsibility and theoretical and tactical unity?", "Yes", q_massMvmtRoot, "No", q_vouchers);
}

function q_massMvmtRoot() {
  q(q_platform, "Should the principles and organizational structure of an anarchist organization be based on the federative relationship among its members, rather than a strict and centralized one?", "Yes", () => r(q_massMvmtRoot, "Especifismo"), "No", () => r(q_massMvmtRoot, "Platformism"));
}

function q_vouchers() {
  q(q_platform, "Should labor vouchers be given in exchange for work?", "Yes", () => r(q_vouchers, "Anarcho-Collectivism"), "No", () => r(q_vouchers, "Anarcho-Communism"));
}

function q_weed() {
  q(q_communism, "Should all conflict be avoided when attempting change?", "Yes", q_experts, "No", q_transition);
}

function q_experts() {
  q(q_weed, "Should an expert committee optimize distribution to eliminate scarcity?", "Yes", () => r(q_experts, "Technocracy"), "No", q_utopianSchool);
}

function q_utopianSchool() {
  q(q_experts, "How should work be assigned?", "Cooperation", () => r(q_utopianSchool, "Owenism"), "Variety", () => r(q_utopianSchool, "Fourierism"), "Skill", () => r(q_utopianSchool, "Saint-Simonianism"));
}

function q_transition() {
  q(q_weed, "Which method should be used to abolish capitalism?", "Election", q_postPolitical, "Revolution", q_dugin, "A revolutionary coup", () => r(q_transition, "Blanquism"), "Terror", () => r(q_transition, "Narodnism"));
}

function q_postPolitical() {
  q(q_transition, "Is present-day society post-political?", "Yes", () => r(q_postPolitical, "Smiley Fascism"), "No", q_sovietAssociation);
}

function q_sovietAssociation() {
  q(q_postPolitical, "Should we avoid anything that associates us with Soviet socialism, even the communist label?", "Yes", q_newEconomicInstitutions, "No", () => r(q_sovietAssociation, "Eurocommunism"));
}

function q_newEconomicInstitutions() {
  q(q_sovietAssociation, "Does building socialism require new economic institutions beyond social-democratic reforms?", "Yes", () => r(q_newEconomicInstitutions, "Socialism of the 21st Century"), "No", () => r(q_newEconomicInstitutions, "Democratic Socialism"));
}

function q_dugin() {
  q(q_transition, "Should we create multipolarity between civilizations?", "Yes", q_eurasianism, "No", q_authSoc);
}

function q_eurasianism() {
  q(q_dugin, "Should the economy be subordinated to nations collective dasein", "Yes", () => r(q_eurasianism, "Fourth Theory"), "No", () => r(q_eurasianism, "Left-Eurasianism"));
}

function q_authSoc() {
  q(q_dugin, "Should socialism be built and maintained through centralized authority?", "Yes", q_natSocAuth, "No", q_agrSoc);
}

function q_natSocAuth() {
  q(q_authSoc, "Should the nation come before all else?", "Yes", q_natSynd, "No", q_benefactor);
}

function q_benefactor() {
  q(q_natSocAuth, "Should all aspects of life be subjected to state planning?", "Yes", () => r(q_benefactor, "Benefactorism"), "No", () => r(q_benefactor, "State Socialism"));
}

function q_natSynd() {
  q(q_natSocAuth, "Should state-coordinated unions organize society?", "Yes", q_natvfu, "No", q_sovietModel);
}

function q_natvfu() {
  q(q_natSynd, "Does the victory of the nation require the construction of a new culture?", "Yes", q_futurism, "No", q_traditionalValues);
}

function q_traditionalValues() {
  q(q_natvfu, "Should the state hold ultimate political authority over the syndicates?", "Yes", () => r(q_traditionalValues, "Falangism (De Jons)"), "No", () => r(q_traditionalValues, "National Syndicalism"));
}

function q_futurism() {
  q(q_natvfu, "Should professional groups participate in policymaking?", "Yes", q_fumivFascfu, "No", () => r(q_natvfu, "Political Futurism"));
}

function q_fumivFascfu() {
  q(q_futurism, "What does the construction of a new culture mean for religion?", "Reconstruction", () => r(q_fumivFascfu, "Fiumanism"), "Abolition", () => r(q_fumivFascfu, "Fascist Futurism"));
}

function q_sovietModel() {
  q(q_natSynd, "Should the economy be modeled on the Soviet planned economy?", "Yes", q_nazbolGoal, "No", q_nazbol);
}

function q_nazbolGoal() {
  q(q_sovietModel, "What should the goal of the nationalist movement be?", "National Liberation", () => r(q_nazbolGoal, "National Bolshevism (Niekisch)"), "Empire Building", q_nazbolOrthodoxy);
}

function q_nazbolOrthodoxy() {
  q(q_nazbolGoal, "Should compromises to ideological orthodoxy be made under any circumstances?", "Yes", () => r(q_nazbolOrthodoxy, "National Bolshevism (Limonov)"), "No", () => r(q_nazbolOrthodoxy, "National Bolshevism (NBF)"));
}

function q_nazbol() {
  q(q_sovietModel, "How should the will of the people be executed?", "Vanguard", () => r(q_nazbol, "Ba'athism"), "Parliament", () => r(q_nazbol, "Tridemism"), "Direct Democracy", () => r(q_nazbol, "Third International Theory"));
}

function q_agrSoc() {
  q(q_authSoc, "Should the economy be centered on agriculture?", "Yes", () => r(q_agrSoc, "Agrarian Socialism"), "No", () => r(q_agrSoc, "Libertarian Socialism"));
}

/* PRO-PRIVATE PROPERTY TREE */

function q_constitution() {
  q(q_privateProperty, "Should the state take active measures to shape public life?", "Yes", q_stateFunctions, "No", q_anarchoMonarchism, "The state should not exist", q_counterEcon);
}

function q_anarchoMonarchism() {
  q(q_constitution, "Could a monarch coexist with freedom from bureaucratic control?", "Yes", () => r(q_anarchoMonarchism, "Anarcho-Monarchism"), "No", q_minarchy);
}

function q_minarchy() {
  q(q_anarchoMonarchism, "Should the state only enforce courts, property, and defense?", "Yes", q_objectivism, "No", q_distBert);
}

function q_objectivism() {
  q(q_minarchy, "Are individual rights grounded in our nature as rational beings?", "Yes", () => r(q_objectivism, "Objectivism"), "No", () => r(q_objectivism, "Minarchism"));
}

function q_distBert() {
  q(q_minarchy, "Should property be mainly owned by families and guilds?", "Yes", () => r(q_distBert, "Libertarian Distributism"), "No", q_singleTax);
}

function q_singleTax() {
  q(q_distBert, "Should the only tax be a levy on public resource usage?", "Yes", () => r(q_singleTax, "Geolibertarianism"), "No", q_ubi);
}

function q_ubi() {
  q(q_singleTax, "Should there be a universal basic income?", "Yes", () => r(q_ubi, "Social Libertarianism"), "No", q_bertWar);
}

function q_bertWar() {
  q(q_ubi, "Should freedom be spread around the globe by force?", "Yes", () => r(q_bertWar, "Neo-Libertarianism"), "No", q_bertTrad);
}

function q_bertTrad() {
  q(q_bertWar, "Should local communities ensure law and order?", "Yes", () => r(q_bertTrad, "Paleolibertarianism"), "No", () => r(q_bertTrad, "Right-Libertarianism"));
}

function q_counterEcon() {
  q(q_constitution, "Which method should be used to bring down the state?", "Illegal Trade", q_redMarket, "Insurrection", q_anDist, "Peaceful non-participation", () => r(q_counterEcon, "Voluntaryism"));
}

function q_redMarket() {
  q(q_counterEcon, "Should coercive markets be tolerated?", "Yes", () => r(q_redMarket, "Avaritionism"), "No", () => r(q_redMarket, "Agorism"));
}

function q_anDist() {
  q(q_counterEcon, "Should property be mainly owned by families and guilds?", "Yes", () => r(q_anDist, "Anarcho-Distributism"), "No", q_landRent);
}

function q_landRent() {
  q(q_anDist, "Should homesteaded property include the land it is built on?", "Yes", q_coop, "No", () => r(q_landRent, "Geo-Anarchism"));
}

function q_coop() {
  q(q_landRent, "Should property titles granted by subsidies and the state be voided?", "Yes", () => r(q_coop, "Left-Rothbardianism"), "No", q_covenant);
}

function q_covenant() {
  q(q_coop, "Should covenant communities expel unwelcome individuals?", "Yes", q_separation, "No", () => r(q_covenant, "Anarcho-Capitalism"));
}

function q_separation() {
  q(q_covenant, "How should separation of covenants occur?", "Peacefully", () => r(q_separation, "Hoppeanism"), "Aggressively", () => r(q_separation, "Nilssonianism"));
}

function q_stateFunctions() {
  q(q_constitution, "Who should assume state functions?", "Elected officials", q_futarchy, "Strongman", q_pragmaticStrongman, "Sovereign", q_sovereignOrganic);
}

function q_futarchy() {
  q(q_stateFunctions, "Should prediction markets choose which policies best meet public goals?", "Yes", () => r(q_futarchy, "Futarchy"), "No", q_dist);
}

function q_dist() {
  q(q_futarchy, "Should property be mainly owned by families and guilds?", "Yes", q_distNeeds, "No", q_lvt);
}

function q_distNeeds() {
  q(q_dist, "Should people's needs be met unconditionally?", "Yes", () => r(q_distNeeds, "Social Distributism"), "No", () => r(q_distNeeds, "Distributism"));
}

function q_lvt() {
  q(q_dist, "Should land rents be given back to society?", "Yes", q_geoWelf, "No", q_socialCredit);
}

function q_socialCredit() {
  q(q_lvt, "Should publicly issued credit fund a dividend for everyone?", "Yes", () => r(q_socialCredit, "Social Credit"), "No", q_trad);
}

function q_geoWelf() {
  q(q_lvt, "Should the revenue from land rents be spent on welfare?", "Yes", () => r(q_geoWelf, "Social Georgism"), "No", () => r(q_geoWelf, "Georgism"));
}

function q_trad() {
  q(q_socialCredit, "Should social institutions favor stability over reform?", "Yes", q_conservativeLiberalism, "No", q_needs);
}

function q_conservativeLiberalism() {
  q(q_trad, "Should tradition be defended through limits on state power and the protection of individual liberty?", "Yes", () => r(q_conservativeLiberalism, "Conservative Liberalism"), "No", q_safetyNet);
}

function q_safetyNet() {
  q(q_conservativeLiberalism, "Should a social safety net protect the poor?", "Yes", q_deuxCentQuaranteSixFromages, "No", q_conIntervention);
}

function q_deuxCentQuaranteSixFromages() {
  q(q_safetyNet, "Who should primarily be accountable to the public?", "State officials", () => r(q_deuxCentQuaranteSixFromages, "Dirigisme"), "Social elites", () => r(q_deuxCentQuaranteSixFromages, "Paternalistic Conservatism"));
}

function q_conIntervention() {
  q(q_safetyNet, "Should the government intervene in wars overseas?", "Yes", () => r(q_conIntervention, "Mesoconservatism"), "No", q_con);
}

function q_con() {
  q(q_conIntervention, "Which element is most important for social stability?", "Institutions", () => r(q_con, "Classical conservatism"), "Identity", q_identityLevel, "Values", () => r(q_con, "Liberal conservatism"));
}

function q_identityLevel() {
  q(q_con, "Which identity level should hold more power?", "National", () => r(q_identityLevel, "National conservatism"), "Regional", () => r(q_identityLevel, "Paleoconservatism"));
}

function q_needs() {
  q(q_trad, "Should people's needs be met unconditionally?", "Yes", q_socCorp, "No", q_regulation);
}

function q_socCorp() {
  q(q_needs, "Should the state enforce collective bargaining?", "Yes", () => r(q_socCorp, "Social Corporatism"), "No", () => r(q_socCorp, "Social Democracy"));
}

function q_regulation() {
  q(q_needs, "Should the economy be tightly regulated?", "Yes", q_fairness, "No", q_nationalLiberalism);
}

function q_fairness() {
  q(q_regulation, "Which kind of fairness should regulation aim to achieve?", "Fair competition", () => r(q_fairness, "Ordoliberalism"), "Fair outcomes", q_tripartite);
}

function q_tripartite() {
  q(q_fairness, "Should the state enforce collective bargaining?", "Yes", () => r(q_tripartite, "Tripartite Corporatism"), "No", q_liberalJobs);
}

function q_liberalJobs() {
  q(q_tripartite, "Should jobs be created if the market doesn't offer enough?", "Yes", () => r(q_liberalJobs, "Social Liberalism"), "No", () => r(q_liberalJobs, "Progressive liberalism"));
}

function q_nationalLiberalism() {
  q(q_regulation, "Should tariffs and subsidies protect strategic interests?", "Yes", () => r(q_nationalLiberalism, "National liberalism"), "No", q_mobility);
}

function q_mobility() {
  q(q_nationalLiberalism, "Should the state subsidize job training and higher education?", "Yes", () => r(q_mobility, "Third way"), "No", q_hegemony);
}

function q_hegemony() {
  q(q_mobility, "What should be the primary means of generating global power?", "Economic leverage", () => r(q_hegemony, "Neoliberalism"), "Military readiness", () => r(q_hegemony, "Neoconservatism"));
}

function q_pragmaticStrongman() {
  q(q_stateFunctions, "Should the regime follow set principles or objectives?", "Yes", q_racism, "No", q_strongmanLegit);
}

function q_strongmanLegit() {
  q(q_pragmaticStrongman, "Where should the strongman's authority mainly come from?", "Charisma", q_bonapartism, "Armed forces", () => r(q_strongmanLegit, "Stratocracy"), "Connections", () => r(q_strongmanLegit, "Patronalism"));
}

function q_bonapartism() {
  q(q_strongmanLegit, "Should a strong executive claim authority directly from the people through plebiscites?", "Yes", () => r(q_bonapartism, "Bonapartism"), "No", () => r(q_bonapartism, "Personal Autocracy"));
}

function q_racism() {
  q(q_pragmaticStrongman, "Should racial identity define membership in the political community?", "Yes", q_traditionalState, "No", q_total);
}

function q_traditionalState() {
  q(q_racism, "Should the state, the movement, and the people retain distinct roles within a unified political order?", "Yes", () => r(q_traditionalState, "Schmittianism"), "No", q_naziLarp);
}

function q_naziLarp() {
  q(q_traditionalState, "How should the struggle for the race manifest itself?", "Politics", q_artaman, "Guerrilla", () => r(q_naziLarp, "Nazi maoism"), "Terrorism", () => r(q_naziLarp, "Siegism"));
}

function q_artaman() {
  q(q_naziLarp, "Should rural life be actively promoted to strengthen the race?", "Yes", () => r(q_artaman, "Agrarian nazism"), "No", q_raceLarp);
}

function q_raceLarp() {
  q(q_artaman, "What gives that race such superiority?", "Biology", () => r(q_raceLarp, "National Socialism"), "Spirits", () => r(q_raceLarp, "Esoteric Fascism"));
}

function q_total() {
  q(q_racism, "Should the state have a role in all aspects of society?", "Yes", q_palingenesis, "No", q_corpo);
}

function q_palingenesis() {
  q(q_total, "Should we secure the nation through a rebirth or revival?", "Yes", q_religiousRebirth, "No", q_castes);
}

function q_religiousRebirth() {
  q(q_palingenesis, "Should religious faith be essential to national rebirth?", "Yes", q_fashClergy, "No", () => r(q_religiousRebirth, "Fascism"));
}

function q_fashClergy() {
  q(q_religiousRebirth, "Should clergy lead the movement?", "Yes", () => r(q_fashClergy, "Clerical Fascism"), "No", q_spiritualRenewal);
}

function q_spiritualRenewal() {
  q(q_fashClergy, "Should spiritual renewal take priority over building political and economic institutions?", "Yes", () => r(q_spiritualRenewal, "Legionarism"), "No", () => r(q_spiritualRenewal, "Falangism (Primo De Rivera)"));
}

function q_castes() {
  q(q_palingenesis, "Should a system of castes be in place?", "Yes", q_control, "No", () => r(q_castes, "Jacobinism"));
}

function q_control() {
  q(q_castes, "How should control over society be ensured?", "Apathy", () => r(q_control, "Fordism"), "Terror", () => r(q_control, "Orwellianism"));
}

function q_corpo() {
  q(q_total, "Should professional groups participate in policymaking?", "Yes", q_neosocialism, "No", q_natDist);
}

function q_corpoFocus() {
  q(q_neosocialism, "Whose interests should hold primacy during bargaining?", "State", () => r(q_corpoFocus, "State Corporatism"), "Labor", () => r(q_corpoFocus, "Yellow Socialism"), "Business", () => r(q_corpoFocus, "Developmentalism"));
}

function q_neosocialism() {
  q(q_corpo, "Should national planning replace class struggle?", "Yes", () => r(q_neosocialism, "Neosocialism"), "No", q_corpoFocus);
}

function q_natDist() {
  q(q_corpo, "Should property be mainly owned by families and guilds?", "Yes", () => r(q_natDist, "National Distributism"), "No", q_nationalLandPolicy);
}

function q_nationalLandPolicy() {
  q(q_natDist, "Should the state own all land and lease it for use?", "Yes", () => r(q_nationalLandPolicy, "National Georgism"), "No", q_authWelf);
}

function q_authWelf() {
  q(q_nationalLandPolicy, "Should compliant citizens receive extensive welfare?", "Yes", () => r(q_authWelf, "Social Authoritarianism"), "No", q_soe);
}

function q_soe() {
  q(q_authWelf, "Should the state get involved in the allocation of capital?", "Yes", q_zeBugz, "No", q_klepto);
}

function q_zeBugz() {
  q(q_soe, "Should all actors in supply chains be of equal concern?", "Yes", () => r(q_zeBugz, "Stakeholder Capitalism"), "No", () => r(q_zeBugz, "State Capitalism"));
}

function q_klepto() {
  q(q_soe, "Should state regulations favor large conglomerates?", "Yes", q_megacorporatocracy, "No", () => r(q_klepto, "Autocratic Capitalism"));
}

function q_megacorporatocracy() {
  q(q_klepto, "Should a single corporation dominate political and economic life?", "Yes", () => r(q_megacorporatocracy, "Megacorporatocracy"), "No", () => r(q_megacorporatocracy, "Corporatocracy"));
}

function q_sovereignOrganic() {
  q(q_stateFunctions, "Should spiritual, economic and political groups be merged?", "Yes", q_technologicalCivilization, "No", q_sovereignType);
}

function q_technologicalCivilization() {
  q(q_sovereignOrganic, "Should civilization be revitalized through advanced technology?", "Yes", () => r(q_technologicalCivilization, "Archeofuturism"), "No", q_reactionaryEsotericism);
}

function q_spiritualFunctions() {
  q(q_reactionaryEsotericism, "Who should assume spiritual functions?", "Clerics", q_religiousCorporatism, "Warriors", () => r(q_spiritualFunctions, "Superfascism"), "Bureaucrats", () => r(q_spiritualFunctions, "Scholar-Bureaucracy"));
}

function q_reactionaryEsotericism() {
  q(q_technologicalCivilization, "Should hidden spiritual traditions guide the political order?", "Yes", () => r(q_reactionaryEsotericism, "Reactionary Esotericism"), "No", q_spiritualFunctions);
}

function q_religiousCorporatism() {
  q(q_spiritualFunctions, "Should religious occupational associations shape public policy?", "Yes", () => r(q_religiousCorporatism, "Religious Corporatism"), "No", () => r(q_religiousCorporatism, "Integralism"));
}

function q_sovereignType() {
  q(q_sovereignOrganic, "Where should the sovereign's legitimacy come from?", "Inheritance", q_reactionaryism, "Wisdom", () => r(q_sovereignType, "Noocracy"), "God", q_guelph, "Selection", q_electMon, "Strength", q_weak);
}

function q_reactionaryism() {
  q(q_sovereignType, "Should the pre-revolutionary monarchy and social order be restored?", "Yes", q_reactionaryProperty, "No", q_sovereignRole);
}

function q_reactionaryProperty() {
  q(q_reactionaryism, "Should productive property be spread among families and guilds?", "Yes", () => r(q_reactionaryProperty, "Distributist Reactionaryism"), "No", () => r(q_reactionaryProperty, "Reactionaryism"));
}

function q_sovereignRole() {
  q(q_reactionaryism, "What should be the sovereign's primary role?", "Judgment", () => r(q_sovereignRole, "Feudal Monarchy"), "Commandment", q_absolute, "Management", q_bismarckism);
}

function q_bismarckism() {
  q(q_sovereignRole, "Should the state provide social insurance to contain socialism?", "Yes", () => r(q_bismarckism, "Bismarckism"), "No", () => r(q_bismarckism, "Cameralism"));
}

function q_absolute() {
  q(q_sovereignRole, "Should the sovereign be equivalent to the state?", "Yes", () => r(q_absolute, "Absolute Monarchy"), "No", () => r(q_absolute, "Hereditary Monarchy"));
}

function q_guelph() {
  q(q_sovereignType, "Which authority should hold primacy over the state?", "Spiritual", () => r(q_guelph, "Theocracy"), "Temporal", q_temporalReligion);
}

function q_temporalReligion() {
  q(q_guelph, "Should temporal authority lead religious institutions?", "Yes", () => r(q_temporalReligion, "Caesaropapism"), "No", () => r(q_temporalReligion, "Divine Monarchy"));
}

function q_electMon() {
  q(q_sovereignType, "What should grant the right to select the sovereign?", "Birthright", () => r(q_electMon, "Aristocracy"), "Shareholding", q_landianAccelerationism, "Land Ownership", () => r(q_electMon, "Aristotelian timocracy"), "Military Honors", () => r(q_electMon, "Platonic timocracy"));
}

function q_landianAccelerationism() {
  q(q_electMon, "Should techno-capitalism accelerate without democratic restraint?", "Yes", () => r(q_landianAccelerationism, "Landian Accelerationism"), "No", () => r(q_landianAccelerationism, "Neocameralism"));
}

function q_weak() {
  q(q_sovereignType, "Should the weak be subjugated?", "Yes", () => r(q_weak, "Kraterocracy"), "No", () => r(q_weak, "Combatocracy"));
}
