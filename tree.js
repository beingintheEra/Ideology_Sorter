const TREE_COLORS = ["#49ce5a", "#ed555d", "#efaf4e", "#65a9eb", "#b982e7"];
const TREE_NODE_WIDTH = 156;
const TREE_NODE_HEIGHT = 78;
const TREE_COLUMN_GAP = 226;
const TREE_ROW_GAP = 102;

function buildTreeAtlas(graph, rootId) {
  let leafIndex = 0;
  let maxDepth = 0;
  const nodes = [];
  const edges = [];

  function add(target, depth, key, active = new Set()) {
    const isResult = target.type === "result";
    if (!isResult && active.has(target.id)) throw new Error(`A question cycle starts at ${target.id}`);
    maxDepth = Math.max(maxDepth, depth);
    const node = {
      key, target, depth, x: 35 + depth * TREE_COLUMN_GAP,
      y: 0, label: isResult ? target.name : graph.get(target.id)?.question
    };
    if (!node.label) throw new Error(`Question ${target.id} is missing`);
    nodes.push(node);
    if (isResult) {
      node.y = 78 + leafIndex++ * TREE_ROW_GAP;
      return node;
    }
    const choices = graph.get(target.id).choices;
    const nextActive = new Set(active);
    nextActive.add(target.id);
    const children = choices.map((choice, index) => {
      const child = add(choice.target, depth + 1, `${key}.${index}`, nextActive);
      edges.push({ from: node, to: child, label: choice.label, index });
      return child;
    });
    node.y = children.length ? (children[0].y + children[children.length - 1].y) / 2 : 78 + leafIndex++ * TREE_ROW_GAP;
    return node;
  }

  const root = add({ type: "question", id: rootId }, 0, "root");
  return {
    nodes, edges, root,
    width: 70 + maxDepth * TREE_COLUMN_GAP + TREE_NODE_WIDTH,
    height: 156 + (leafIndex - 1) * TREE_ROW_GAP
  };
}

function flagUrl(name) {
  return getFlagUrl(name);
}

function paintTreeAtlas(stage, layout, prefix) {
  stage.replaceChildren();
  stage.style.width = `${layout.width}px`;
  stage.style.height = `${layout.height}px`;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "tree-links");
  svg.setAttribute("width", layout.width);
  svg.setAttribute("height", layout.height);
  svg.setAttribute("aria-hidden", "true");
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  TREE_COLORS.forEach((color, index) => {
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    for (const [attr, value] of Object.entries({
      id: `tree-arrow-${prefix}-${index}`, viewBox: "0 0 10 10", refX: "8", refY: "5",
      markerWidth: "7", markerHeight: "7", orient: "auto"
    })) marker.setAttribute(attr, value);
    const shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
    shape.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    shape.setAttribute("fill", color);
    marker.appendChild(shape);
    defs.appendChild(marker);
  });
  svg.appendChild(defs);
  for (const edge of layout.edges) {
    const startX = edge.from.x + TREE_NODE_WIDTH;
    const endX = edge.to.x - 11;
    const middleX = (startX + endX) / 2;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${startX} ${edge.from.y} C ${middleX} ${edge.from.y}, ${middleX} ${edge.to.y}, ${endX} ${edge.to.y}`);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", TREE_COLORS[edge.index % TREE_COLORS.length]);
    path.setAttribute("stroke-width", "4");
    path.setAttribute("marker-end", `url(#tree-arrow-${prefix}-${edge.index % TREE_COLORS.length})`);
    path.setAttribute("data-tree-to", edge.to.key);
    svg.appendChild(path);
  }
  stage.appendChild(svg);

  for (const edge of layout.edges) {
    const badge = document.createElement("span");
    badge.className = "tree-answer-label";
    badge.textContent = edge.label;
    badge.title = edge.label;
    badge.style.left = `${(edge.from.x + TREE_NODE_WIDTH + edge.to.x) / 2}px`;
    badge.style.top = `${(edge.from.y + edge.to.y) / 2}px`;
    badge.style.backgroundColor = TREE_COLORS[edge.index % TREE_COLORS.length];
    stage.appendChild(badge);
  }

  for (const node of layout.nodes) {
    const result = node.target.type === "result";
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tree-cell ${result ? "tree-result-cell" : "tree-question-cell"}${node === layout.root ? " tree-start-cell" : ""}`;
    button.style.left = `${node.x}px`;
    button.style.top = `${node.y - TREE_NODE_HEIGHT / 2}px`;
    button.title = result ? `View ${node.label}` : `Answer: ${node.label}`;
    button.dataset.treeKey = node.key;
    if (result) {
      const flag = document.createElement("img");
      flag.src = flagUrl(node.label);
      flag.alt = "";
      flag.loading = "lazy";
      flag.decoding = "async";
      flag.onerror = () => { flag.onerror = null; flag.src = "./assets/flags/null.svg"; };
      const text = document.createElement("span");
      text.textContent = node.label;
      button.append(flag, text);
      button.addEventListener("click", () => renderResult(node.label));
    } else {
      button.textContent = node.label;
      button.addEventListener("click", () => {
        state.history = [];
        window[node.target.id]();
      });
    }
    stage.appendChild(button);
  }
}

function renderTree() {
  setView("tree");
  const app = clearApp();
  const page = document.createElement("section");
  page.className = "tree-page";
  app.appendChild(page);

  try {
    if (!treeState.graph) treeState.graph = collectTreeGraph();
    const graph = treeState.graph;
    const root = graph.get("q_privateProperty");
    if (!root || root.choices.length !== 2 || root.choices.some(choice => choice.target.type !== "question")) {
      throw new Error("The private-property branches are missing.");
    }
    const branchNames = ["Pro-private property tree", "Anti-private property tree"];
    const branches = root.choices.map((choice, index) => ({
      label: branchNames[index], answer: choice.label, id: choice.target.id, index,
      layout: buildTreeAtlas(graph, choice.target.id)
    }));
    const allResults = [...new Set(branches.flatMap(branch =>
      branch.layout.nodes.filter(node => node.target.type === "result").map(node => node.label)
    ))].sort();

    const info = document.createElement("div");
    info.className = "tree-info";
    const finder = document.createElement("div");
    finder.className = "tree-finder";
    const title = document.createElement("h2");
    title.textContent = `All ${allResults.length} possible results, alphabetically`;
    const search = document.createElement("input");
    search.type = "search";
    search.className = "tree-search";
    search.placeholder = "Search a result";
    search.setAttribute("aria-label", "Search results");
    const picker = document.createElement("select");
    picker.className = "tree-picker";
    picker.setAttribute("aria-label", "Select a result to locate in the tree");
    const view = makeButton("View result", () => {
      if (treeState.selectedResult) renderResult(treeState.selectedResult);
    });
    view.classList.add("tree-view-result");
    view.disabled = true;
    function fillPicker(filter = "") {
      const current = picker.value;
      picker.replaceChildren();
      const empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "Select result to locate…";
      picker.appendChild(empty);
      for (const name of allResults) {
        if (filter && !name.toLowerCase().includes(filter.toLowerCase())) continue;
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        picker.appendChild(option);
      }
      picker.value = [...picker.options].some(option => option.value === current) ? current : "";
    }
    fillPicker();
    finder.append(title, search, picker, view);

    const legendPanel = document.createElement("div");
    const legendTitle = document.createElement("h2");
    legendTitle.textContent = "Legend · select a box to view it";
    const legend = document.createElement("div");
    legend.className = "tree-legend";
    for (const [text, type] of [["Start", "start"], ["Question", "question"], ["Result", "result"]]) {
      const box = document.createElement("div");
      box.className = `tree-legend-box tree-legend-${type}`;
      box.textContent = text;
      legend.appendChild(box);
    }
    legendPanel.append(legendTitle, legend);
    info.append(finder, legendPanel);
    page.appendChild(info);

    const start = document.createElement("div");
    start.className = "tree-root";
    const rootButton = makeButton(root.question, () => {
      state.history = [];
      q_privateProperty();
    });
    rootButton.classList.add("tree-root-button");
    start.appendChild(rootButton);
    page.appendChild(start);

    for (const branch of branches) {
      const section = document.createElement("section");
      section.className = "tree-branch";
      const heading = document.createElement("h2");
      heading.className = "tree-heading";
      heading.textContent = branch.label;
      const answer = document.createElement("span");
      answer.className = "tree-branch-answer";
      answer.textContent = branch.answer;
      heading.prepend(answer);
      const tools = document.createElement("div");
      tools.className = "tree-tools";
      const scroller = document.createElement("div");
      scroller.className = "tree-scroller";
      scroller.tabIndex = 0;
      scroller.setAttribute("aria-label", `${branch.label}; scroll in both directions`);
      const canvas = document.createElement("div");
      canvas.className = "tree-canvas";
      const stage = document.createElement("div");
      stage.className = "tree-stage";
      paintTreeAtlas(stage, branch.layout, `branch-${branch.index}`);
      canvas.appendChild(stage);
      scroller.appendChild(canvas);
      branch.section = section;
      branch.scroller = scroller;
      branch.canvas = canvas;
      branch.stage = stage;
      for (const [label, factor] of [["−", 1 / 1.25], ["+", 1.25], ["Reset zoom", 0]]) {
        const zoomButton = makeButton(label, () => setZoom(factor ? treeState.zoom * factor : 1));
        zoomButton.classList.add("tree-tool-button");
        tools.appendChild(zoomButton);
      }
      section.append(heading, tools, scroller);
      page.appendChild(section);
    }
    const home = makeButton("Home", renderWelcome);
    home.classList.add("tree-home-button");
    page.appendChild(home);

    function setZoom(value) {
      const previous = treeState.zoom;
      treeState.zoom = Math.max(.55, Math.min(1.8, value));
      for (const branch of branches) {
        const centerX = (branch.scroller.scrollLeft + branch.scroller.clientWidth / 2) / previous;
        const centerY = (branch.scroller.scrollTop + branch.scroller.clientHeight / 2) / previous;
        branch.canvas.style.width = `${branch.layout.width * treeState.zoom}px`;
        branch.canvas.style.height = `${branch.layout.height * treeState.zoom}px`;
        branch.stage.style.transform = `scale(${treeState.zoom})`;
        branch.scroller.scrollLeft = centerX * treeState.zoom - branch.scroller.clientWidth / 2;
        branch.scroller.scrollTop = centerY * treeState.zoom - branch.scroller.clientHeight / 2;
      }
    }
    setZoom(treeState.zoom);

    function locate(name) {
      const branch = branches.find(item => item.layout.nodes.some(node => node.target.type === "result" && node.label === name));
      if (!branch) return;
      const target = branch.layout.nodes.find(node => node.target.type === "result" && node.label === name);
      treeState.selectedResult = name;
      view.disabled = false;
      picker.value = name;
      for (const item of branches) {
        item.stage.classList.toggle("tree-search-active", item === branch);
        for (const node of item.stage.querySelectorAll(".tree-cell")) {
          const key = node.dataset.treeKey;
          node.classList.toggle("tree-located", item === branch && key === target.key);
          node.classList.toggle("tree-route", item === branch && (key === target.key || target.key.startsWith(`${key}.`)));
        }
        for (const path of item.stage.querySelectorAll(".tree-links path[data-tree-to]")) {
          const key = path.getAttribute("data-tree-to");
          path.classList.toggle("tree-route", item === branch && target.key.startsWith(`${key}.`));
        }
      }
      branch.section.scrollIntoView({ block: "start", behavior: "smooth" });
      branch.scroller.scrollLeft = Math.max(0, (target.x + TREE_NODE_WIDTH / 2) * treeState.zoom - branch.scroller.clientWidth / 2);
      branch.scroller.scrollTop = Math.max(0, target.y * treeState.zoom - branch.scroller.clientHeight / 2);
    }
    search.addEventListener("input", () => fillPicker(search.value.trim()));
    search.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      if (!search.value.trim()) return;
      const first = allResults.find(name => name.toLowerCase().includes(search.value.trim().toLowerCase()));
      if (first) locate(first);
    });
    picker.addEventListener("change", () => { if (picker.value) locate(picker.value); });
    requestAnimationFrame(() => {
      for (const branch of branches) {
        branch.scroller.scrollLeft = 0;
        branch.scroller.scrollTop = Math.max(0, branch.layout.root.y * treeState.zoom - branch.scroller.clientHeight / 2);
      }
      if (treeState.selectedResult) locate(treeState.selectedResult);
    });
  } catch (error) {
    const message = document.createElement("p");
    message.textContent = `The tree could not be loaded: ${error.message}`;
    page.replaceChildren(message, makeButton("Home", renderWelcome));
  }
}
