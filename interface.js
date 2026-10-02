const treeState = { graph: null, zoom: .85, selectedResult: null };

function getFlagUrl(name) {
  const localName = RESULT_FLAG_ALIASES[name] ?? name;
  return `./assets/flags/${encodeURIComponent(localName)}.svg`;
}

function setView(view) {
  document.body.dataset.view = view;
  $("#ambient-background").hidden = view === "home";
  $("#title").hidden = view === "tree";
  if (view === "tree") setAmbientPalette(["#537d9a", "#814965", "#568063"]);
  if (view === "about") setAmbientPalette(["#63836b", "#814958", "#537597"]);
  if (view === "create") setAmbientPalette(["#75518b", "#864c68", "#477d71"]);
}

function setAmbientPalette(colors) {
  const ambient = $("#ambient-background");
  const fallback = ["#795d96", "#446e87", "#527d61", "#8b564d", "#5a628c"];
  fallback.forEach((color, index) => {
    ambient.style.setProperty(`--ambient-${"abcde"[index]}`, colors[index % colors.length] || color);
  });
}

function updateAmbientFromButtons(buttons) {
  const colors = Array.from(buttons, button => getComputedStyle(button).backgroundColor);
  if (colors.length) setAmbientPalette(colors);
}

function updateAmbientFromImage(img) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 16;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(img, 0, 0, 24, 16);
    const pixels = context.getImageData(0, 0, 24, 16).data;
    const colors = new Map();
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 120) continue;
      const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
      if (Math.max(...rgb) - Math.min(...rgb) < 25) continue;
      const bucket = rgb.map(value => Math.round(value / 40) * 40);
      const key = `rgb(${bucket.map(value => Math.min(value, 255)).join(",")})`;
      colors.set(key, (colors.get(key) || 0) + 1);
    }
    const palette = [...colors].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([color]) => color);
    if (palette.length) setAmbientPalette(palette);
  } catch {
    // Keep the result visible if its image cannot be sampled.
  }
}

function renderCreate() {
  setView("create");
  const app = clearApp();
  const page = document.createElement("section");
  page.className = "result create-page";

  function editable(element, type) {
    element.classList.add("create-editable");
    element.tabIndex = 0;
    element.setAttribute("role", "button");
    element.setAttribute("aria-label", `Change ${type}`);
    const change = () => {
      const value = prompt(`Enter new ${type}:`, element.textContent);
      if (value?.trim()) element.textContent = value.trim();
    };
    element.addEventListener("click", change);
    element.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        change();
      }
    });
    return element;
  }

  const name = editable(document.createElement("h1"), "name");
  name.textContent = "Click to change name";

  const flagWrap = document.createElement("div");
  flagWrap.className = "flag-wrap create-flag";
  flagWrap.tabIndex = 0;
  flagWrap.setAttribute("role", "button");
  flagWrap.setAttribute("aria-label", "Choose or drop a flag image");
  const flag = document.createElement("img");
  flag.className = "result-flag";
  flag.src = "./assets/flags/Drop.svg";
  flag.alt = "Click or drop an image here";
  flagWrap.appendChild(flag);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*,.svg";
  fileInput.hidden = true;
  function useFile(file) {
    if (!file || (!file.type.startsWith("image/") && !/\.svg$/i.test(file.name))) return;
    const reader = new FileReader();
    reader.onload = () => { flag.src = reader.result; };
    reader.readAsDataURL(file);
  }
  flagWrap.addEventListener("click", () => fileInput.click());
  flagWrap.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fileInput.click();
    }
  });
  flagWrap.addEventListener("dragover", event => {
    event.preventDefault();
    flagWrap.classList.add("drag-over");
  });
  flagWrap.addEventListener("dragleave", () => flagWrap.classList.remove("drag-over"));
  flagWrap.addEventListener("drop", event => {
    event.preventDefault();
    flagWrap.classList.remove("drag-over");
    useFile(Array.from(event.dataTransfer.files).find(file => file.type.startsWith("image/") || /\.svg$/i.test(file.name)));
  });
  fileInput.addEventListener("change", () => useFile(fileInput.files[0]));

  const quoteBox = document.createElement("div");
  quoteBox.className = "quote-box";
  const quote = editable(document.createElement("div"), "quote");
  quote.classList.add("quote-text");
  quote.textContent = "Click to change quote";
  const author = editable(document.createElement("div"), "author");
  author.classList.add("quote-author");
  author.textContent = "Click to change author";
  quoteBox.append(quote, author);

  page.append(name, flagWrap, quoteBox, fileInput, makeButton("Home", renderWelcome));
  app.appendChild(page);
}

function renderAbout() {
  setView("about");
  const app = clearApp();
  const page = document.createElement("section");
  page.className = "info-page";
  const heading = document.createElement("h2");
  heading.textContent = "About the test";
  page.appendChild(heading);

  const sections = [
    ["The concept", "Ideology Sorter is a branching test about political ideas. Choose the answer closest to your view and follow the questions to a result."],
    ["The distinctions", "Each answer leads to another question or a named tendency. Explore the Tree to see the routes and compare their questions."],
    ["LLM use", "Large language models helped draft parts of the code and text. They can make mistakes; the questions and results should not be treated as authoritative descriptions of political ideas."],
    ["License and source", "This project is licensed under the GNU General Public License v3.0. The source is available on GitHub."]
  ];
  for (const [title, copy] of sections) {
    const card = document.createElement("section");
    card.className = "info-card";
    const h3 = document.createElement("h3");
    h3.textContent = title;
    const p = document.createElement("p");
    p.textContent = copy;
    card.append(h3, p);
    if (title === "License and source") {
      const links = document.createElement("p");
      links.className = "info-links";
      const source = document.createElement("a");
      source.href = "https://github.com/beingintheEra/Leftwtsorter";
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.textContent = "View source on GitHub";
      const license = document.createElement("a");
      license.href = "LICENSE";
      license.textContent = "Read the GPL-3.0 license";
      links.append(source, license);
      card.appendChild(links);
    }
    page.appendChild(card);
  }
  const thanks = document.createElement("section");
  thanks.className = "info-card thanks-card";
  const thanksHeading = document.createElement("h3");
  thanksHeading.textContent = "Special thanks";
  const thanksText = document.createElement("p");
  thanksText.textContent = "Special thanks to everyone who contributed to this project <3";
  const contributors = document.createElement("p");
  contributors.className = "info-links contributor-links";
  const people = [
    ["Era", "iltarusko_"], ["Erika", "aamurusko_"],
    ["Leonor", "CouncilFem"], ["Sarah", "Brojep0451"],
    ["Jay", "greyxday"], ["Iphis", "Iphis1871"],
    ["Orphéon Maris", "orpheonmaris"], ["𝐕𝐨𝐥𝐤𝐬 𝐏𝐫𝐨𝐥𝐞𝐭𝐤𝐮𝐥𝐭", "dyffgh5242"]
  ];
  people.forEach(([name, handle], index) => {
    if (index) contributors.appendChild(document.createTextNode(" / "));
    const link = document.createElement("a");
    link.href = `https://x.com/${handle}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = name;
    contributors.appendChild(link);
  });
  thanks.append(thanksHeading, thanksText, contributors);
  page.appendChild(thanks);
  page.appendChild(makeButton("Home", renderWelcome));
  app.appendChild(page);
}

function collectTreeGraph() {
  const nodes = new Map();
  window.treeCollector = {
    target: null,
    capture(fn, question, choices) {
      const id = fn?.name;
      if (!id) throw new Error(`A tree question has no function name: ${question}`);
      if (nodes.has(id)) {
        this.target = { type: "question", id };
        return;
      }
      const node = { id, question, choices: [] };
      nodes.set(id, node);
      for (const [label, next] of choices) {
        if (!label) continue;
        if (typeof next !== "function") throw new Error(`Missing destination from ${id}: ${label}`);
        this.target = null;
        next();
        if (!this.target) throw new Error(`Missing tree node from ${id}: ${label}`);
        node.choices.push({ label, target: this.target });
      }
      this.target = { type: "question", id };
    }
  };
  try {
    q_privateProperty();
  } finally {
    window.treeCollector = null;
  }
  return nodes;
}
