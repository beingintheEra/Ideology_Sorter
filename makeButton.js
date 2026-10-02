function makeButton(label, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  const lower = label.toLowerCase();

  if (lower === "yes") {
    btn.classList.add("btn-yes");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/yes.svg" alt="">
      ${label}
    `;

  } else if (lower === "no") {
    btn.classList.add("btn-no");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/no.svg" alt="">
      ${label}
    `;
  } else if (lower === "the revolution is the proletarian organization itself") {
    btn.classList.add("btn-organizational");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/group.svg" alt="">
      ${label}
    `;
  } else if (lower === "the state should not exist") {
    btn.classList.add("btn-nostate");
    btn.innerHTML = `
      <img class="btn-icon-img btn-icon-left" src="./assets/buttons/nostate.svg" alt="">
      <span class="btn-label">
      ${label}</span>
    `;
  } else if (lower === "revolution") {
    btn.classList.add("btn-revolution");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/revolution.svg" alt="">
      ${label}
    `;
  } else if (lower === "election") {
    btn.classList.add("btn-election");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/election.svg" alt="">
      ${label}
    `;
  } else if (lower === "christianity") {
    btn.classList.add("btn-christianity");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/christianity.svg" alt="">
      ${label}
    `;
  } else if (lower === "islam") {
    btn.classList.add("btn-islam");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/islam.svg" alt="">
      ${label}
    `;
  } else if (lower === "judaism") {
    btn.classList.add("btn-judaism");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/judaism.svg" alt="">
      ${label}
    `;
  } else if (lower === "confucianism") {
    btn.classList.add("btn-confucianism");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/confucianism.svg" alt="">
      ${label}
    `;
  } else if (lower === "illegal trade") {
    btn.classList.add("btn-illegaltrade");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/illegal trade.svg" alt="">
      ${label}
    `;
  } else if (lower === "insurrection") {
    btn.classList.add("btn-insurrection");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/insurrection.svg" alt="">
      ${label}
    `;
  } else if (lower === "elected officials") {
    btn.classList.add("btn-electedofficials");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/elected officials.svg" alt="">
      ${label}
    `;
  } else if (lower === "strongman") {
    btn.classList.add("btn-strongman");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/strongman.svg" alt="">
      ${label}
    `;
  } else if (lower === "sovereign") {
    btn.classList.add("btn-sovereign");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/sovereign.svg" alt="">
      ${label}
    `;
  } else if (lower === "biology") {
    btn.classList.add("btn-biology");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/biology.svg" alt="">
      ${label}
    `;
  } else if (lower === "spirits") {
    btn.classList.add("btn-spirits");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/spirits.svg" alt="">
      ${label}
    `;
  } else if (lower === "apathy") {
    btn.classList.add("btn-apathy");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/apathy.svg" alt="">
      ${label}
    `;
  } else if (lower === "terror") {
    btn.classList.add("btn-terror");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/terror.svg" alt="">
      ${label}
    `;
  } else if (lower === "reconstruction") {
    btn.classList.add("btn-reconstruction");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/reconstruction.svg" alt="">
      ${label}
    `;
  } else if (lower === "abolition") {
    btn.classList.add("btn-abolition");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/abolition.svg" alt="">
      ${label}
    `;
  } else if (lower === "inheritance") {
    btn.classList.add("btn-inheritance");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/inheritance.svg" alt="">
      ${label}
    `;
  } else if (lower === "wisdom") {
    btn.classList.add("btn-wisdom");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/wisdom.svg" alt="">
      ${label}
    `;
  } else if (lower === "god") {
    btn.classList.add("btn-god");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/god.svg" alt="">
        ${label}
      `;
  } else if (lower === "selection") {
    btn.classList.add("btn-selection");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/selection.svg" alt="">
        ${label}
        `;
  } else if (lower === "strength") {
    btn.classList.add("btn-strength");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/strength.svg" alt="">
      ${label}
    `;
  } else if (lower === "land ownership") {
    btn.classList.add("btn-landownership");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/landownership.svg" alt="">
      ${label}
    `;
  } else if (lower === "shareholding") {
    btn.classList.add("btn-shareholding");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/shareholding.svg" alt="">
      ${label}
    `;
  } else if (lower === "direct democracy") {
    btn.classList.add("btn-directdemocracy");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/direct democracy.svg" alt="">
      ${label}
    `;
  } else if (lower === "parliament") {
    btn.classList.add("btn-parliament");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/parliament.svg" alt="">
      ${label}
    `;
  } else if (lower === "vanguard") {
    btn.classList.add("btn-vanguard");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/vanguard.svg" alt="">
      ${label}
    `;
  } else if (lower === "peacefully") {
    btn.classList.add("btn-peacefully");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/peacefully.svg" alt="">
      ${label}
    `;
  } else if (lower === "aggressively") {
    btn.classList.add("btn-aggressively");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/aggressively.svg" alt="">
      ${label}
    `;
  } else if (lower === "planned development") {
    btn.classList.add("btn-planneddevelopment");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/business.svg" alt="">
      ${label}
    `;
  } else if (lower === "organic development") {
    btn.classList.add("btn-organicdevelopment");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/home.svg" alt="">
      ${label}
    `;
   } else if (lower === "institutions") {
    btn.classList.add("btn-institutions");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/institutions.svg" alt="">
      ${label}
    `;
  } else if (lower === "identity") {
    btn.classList.add("btn-identity");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/identity.svg" alt="">
      ${label}
    `;
  } else if (lower === "values") {
    btn.classList.add("btn-values");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/values.svg" alt="">
      ${label}
    `;
  } else if (lower === "national") {
    btn.classList.add("btn-national");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/national.svg" alt="">
      ${label}
    `;
  } else if (lower === "regional") {
    btn.classList.add("btn-regional");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/regional.svg" alt="">
      ${label}
    `;
  } else if (lower === "fair competition") {
    btn.classList.add("btn-faircompetition");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/fair competition.svg" alt="">
      ${label}
    `;
  } else if (lower === "fair outcomes") {
    btn.classList.add("btn-fairoutcomes");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/fair outcomes.svg" alt="">
      ${label}
    `;
  } else if (lower === "charisma") {
    btn.classList.add("btn-charisma");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/charisma.svg" alt="">
      ${label}
    `;
  } else if (lower === "armed forces") {
    btn.classList.add("btn-armedforces");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/armed forces.svg" alt="">
      ${label}
    `;
  } else if (lower === "connections") {
    btn.classList.add("btn-connections");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/connections.svg" alt="">
      ${label}
    `;
  } else if (lower === "politics") {
    btn.classList.add("btn-politics");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/politics.svg" alt="">
      ${label}
    `;
  } else if (lower === "guerrilla") {
    btn.classList.add("btn-guerrilla");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/guerrilla.svg" alt="">
      ${label}
    `;
  } else if (lower === "terrorism") {
    btn.classList.add("btn-terrorism");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/terrorism.svg" alt="">
      ${label}
    `;
  } else if (lower === "clerics") {
    btn.classList.add("btn-clerics");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/clerics.svg" alt="">
      ${label}
    `;
  } else if (lower === "warriors") {
    btn.classList.add("btn-warriors");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/warriors.svg" alt="">
      ${label}
    `;

  } else if (lower === "judgment") {
    btn.classList.add("btn-judgment");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/judgment.svg" alt="">
      ${label}
    `;
  } else if (lower === "commandment") {
    btn.classList.add("btn-commandment");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/commandment.svg" alt="">
      ${label}
    `;
  } else if (lower === "management") {
    btn.classList.add("btn-management");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/management.svg" alt="">
      ${label}
    `;

  } else if (lower === "spiritual") {
    btn.classList.add("btn-spiritual");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/spiritual.svg" alt="">
      ${label}
    `;
  } else if (lower === "temporal") {
    btn.classList.add("btn-temporal");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/temporal.svg" alt="">
      ${label}
    `;
  } else if (lower === "birthright") {
    btn.classList.add("btn-birthright");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/birthright.svg" alt="">
      ${label}
    `;
  } else if (lower === "military honors") {
    btn.classList.add("btn-militaryhonors");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/military honors.svg" alt="">
      ${label}
    `;
  } else if (lower === "state") {
    btn.classList.add("btn-state");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/state.svg" alt="">
      ${label}
    `;
  } else if (lower === "labor") {
    btn.classList.add("btn-labor");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/labor.svg" alt="">
      ${label}
    `;
  } else if (lower === "business") {
    btn.classList.add("btn-business");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/business.svg" alt="">
      ${label}
    `;
  } else if (lower === "national liberation") {
    btn.classList.add("btn-nationalliberation");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/national liberation.svg" alt="">
      ${label}
    `;
  } else if (lower === "empire building") {
    btn.classList.add("btn-empirebuilding");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/mythology.svg" alt="">
      ${label}
    `;
  } else if (lower === "state officials") {
    btn.classList.add("btn-stateofficials");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/state officials.svg" alt="">
      ${label}
    `;
  } else if (lower === "social elites") {
    btn.classList.add("btn-socialelites");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/social elites.svg" alt="">
      ${label}
    `;
  } else if (lower === "economic leverage") {
    btn.classList.add("btn-economicleverage");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/economic leverage.svg" alt="">
      ${label}
    `;
  } else if (lower === "military readiness") {
    btn.classList.add("btn-militaryreadiness");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/military readiness.svg" alt="">
      ${label}
    `;
  } else if (lower === "bureaucrats") {
    btn.classList.add("btn-bureaucrats");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/state officials.svg" alt="">
      ${label}
    `;
  } else if (lower === "peaceful non-participation") {
    btn.classList.add("btn-nonparticipation");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/hide.svg" alt="">
      ${label}
    `;
  } else if (lower === "overcoming capitalist realism") {
    btn.classList.add("btn-capitalistrealism");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/show.svg" alt="">
      ${label}
    `;
  } else if (lower === "refusing work") {
    btn.classList.add("btn-refusingwork");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/none.svg" alt="">
      ${label}
    `;
  } else if (lower === "one world party") {
    btn.classList.add("btn-worldparty");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/group.svg" alt="">
      ${label}
    `;
  } else if (lower === "multiple communist organizations") {
    btn.classList.add("btn-multipleorganizations");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/cooperation.svg" alt="">
      ${label}
    `;
  } else if (lower === "autonomous communes") {
    btn.classList.add("btn-autonomouscommunes");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/create.svg" alt="">
      ${label}
    `;
  } else if (lower === "forms of life") {
    btn.classList.add("btn-formsoflife");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/home.svg" alt="">
      ${label}
    `;
  } else if (lower === "cooperation") {
    btn.classList.add("btn-cooperation");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/cooperation.svg" alt="">
      ${label}
    `;
  } else if (lower === "variety") {
    btn.classList.add("btn-variety");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/variety.svg" alt="">
      ${label}
    `;
  } else if (lower === "skill") {
    btn.classList.add("btn-skill");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/skill.svg" alt="">
      ${label}
    `;
  } else if (lower === "a revolutionary coup") {
    btn.classList.add("btn-revolutionarycoup");
    btn.innerHTML = `
      <img class="btn-icon-img" src="./assets/buttons/coup.svg" alt="">
      ${label}
    `;
  } else {
    btn.textContent = label;
  }

  btn.addEventListener("pointermove", event => {
    const bounds = btn.getBoundingClientRect();
    btn.style.setProperty("--glow-x", `${event.clientX - bounds.left}px`);
    btn.style.setProperty("--glow-y", `${event.clientY - bounds.top}px`);
  });
  btn.addEventListener("click", onClick);
  return btn;
}
