import {
  cardCatalog,
  encounterTemplates,
  levelCurve,
  relicCatalog,
  starterDeckIds,
} from "./data/cards.js";
import {
  characters,
  contentMeta,
  dialoguePages,
  endings,
  storyPages,
} from "./data/content.js";

const SAVE_KEY = "card-cafe-loop-save-v1";
const META_KEY = "card-cafe-loop-meta-v1";

const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");
const cardById = new Map(cardCatalog.map((card) => [card.id, card]));
const characterById = new Map(characters.map((character) => [character.id, character]));
const routeById = contentMeta.routes;

const familyLabel = {
  charm: "매력",
  focus: "집중",
  wit: "기지",
  snack: "간식",
  synergy: "연계",
  risk: "승부",
};

const meta = loadMeta();
const state = {
  screen: "title",
  previousScreen: "title",
  run: null,
  reward: null,
  ending: null,
  menuOpen: false,
  toast: "",
};

function loadMeta() {
  const fallback = {
    endingsUnlocked: [],
    clearedRuns: 0,
    failedBoss: false,
    memories: 0,
    settings: {
      textSize: "보통",
      reducedMotion: false,
    },
  };
  try {
    const parsed = JSON.parse(localStorage.getItem(META_KEY) || "{}");
    return { ...fallback, ...parsed, settings: { ...fallback.settings, ...(parsed.settings || {}) } };
  } catch {
    return fallback;
  }
}

function saveMeta() {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

function saveGame() {
  if (!state.run) {
    toast("저장할 회차가 없습니다.");
    return;
  }
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      screen: state.screen,
      run: state.run,
      reward: state.reward,
      ending: state.ending,
      savedAt: new Date().toISOString(),
    }),
  );
  toast("진행을 저장했습니다.");
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) {
    toast("저장 데이터가 없습니다.");
    return;
  }
  try {
    const loaded = JSON.parse(raw);
    state.run = loaded.run;
    state.reward = loaded.reward || null;
    state.ending = loaded.ending || null;
    state.screen = loaded.screen || "map";
    state.menuOpen = false;
    render();
    toast("이어하기를 불러왔습니다.");
  } catch {
    toast("저장 데이터를 읽지 못했습니다.");
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function sample(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function toast(message) {
  state.toast = message;
  renderModal();
  window.setTimeout(() => {
    if (state.toast === message) {
      state.toast = "";
      renderModal();
    }
  }, 2200);
}

function setScreen(screen) {
  state.previousScreen = state.screen;
  state.screen = screen;
  render();
}

function currentWeek() {
  return levelCurve[state.run.weekIndex] || levelCurve[levelCurve.length - 1];
}

function portraitPosition(characterId) {
  const index = Math.max(0, characters.findIndex((character) => character.id === characterId));
  const positions = ["0%", "25%", "50%", "75%", "100%"];
  return positions[index] || "50%";
}

function cardArtPosition(cardId) {
  const cardIndex = Math.abs(hash(cardId)) % 16;
  const x = (cardIndex % 4) * 33.333;
  const y = Math.floor(cardIndex / 4) * 33.333;
  return `--art-x: ${x}%; --art-y: ${y}%;`;
}

function hash(text) {
  let value = 0;
  for (let index = 0; index < text.length; index += 1) {
    value = (value << 5) - value + text.charCodeAt(index);
    value |= 0;
  }
  return value;
}

function createRun(characterId) {
  const affinity = Object.fromEntries(
    characters.map((character) => [
      character.id,
      {
        [character.affinityHooks.stat]: 0,
        bond: 0,
      },
    ]),
  );

  return {
    seed: `${Date.now()}-${characterId}`,
    characterId,
    hp: 96,
    maxHp: 96,
    weekIndex: 0,
    nodeIndex: 0,
    estimatedMinutes: 0,
    deck: [...starterDeckIds],
    relics: [],
    gold: 20,
    affinity,
    storyCursor: 0,
    dialogueCursor: 0,
    fightsWon: 0,
    choicesMade: 0,
    bossWins: 0,
    battle: null,
    log: ["새 회차가 시작되었습니다."],
  };
}

function startNewRun(characterId) {
  state.run = createRun(characterId);
  state.reward = null;
  state.ending = null;
  showVN("intro");
}

function selectedCharacter() {
  return characterById.get(state.run.characterId) || characters[0];
}

function getRoutePages(source) {
  const character = selectedCharacter();
  return source.filter((page) => page.characterId === character.id || page.speakerId === character.id);
}

function getStoryPage(mode) {
  const pages = getRoutePages(storyPages);
  const offset = mode === "rest" ? 4 : mode === "event" ? 1 : mode === "victory" ? 2 : 0;
  return pages[(state.run.storyCursor + state.run.weekIndex + offset) % pages.length];
}

function getDialoguePage(mode) {
  const pages = getRoutePages(dialoguePages);
  const offset = mode === "intro" ? 0 : mode === "rest" ? 3 : mode === "victory" ? 2 : 1;
  return pages[(state.run.dialogueCursor + state.run.nodeIndex + offset) % pages.length];
}

function showVN(mode = "event") {
  state.run.vnMode = mode;
  setScreen("vn");
}

function applyAffinity(affinity) {
  if (!affinity || !state.run) {
    return;
  }
  const character = characterById.get(affinity.characterId) || selectedCharacter();
  const stat = affinity.stat || character.affinityHooks.stat;
  const target = state.run.affinity[character.id] || {};
  target[stat] = (target[stat] || 0) + (affinity.amount || 1);
  target.bond = (target.bond || 0) + (affinity.amount || 1);
  state.run.affinity[character.id] = target;
}

function chooseVN(choiceIndex) {
  const mode = state.run.vnMode || "event";
  const story = getStoryPage(mode);
  const dialogue = getDialoguePage(mode);
  const storyChoice = story.choices?.[choiceIndex % story.choices.length];
  const reply = dialogue.replies?.[choiceIndex % dialogue.replies.length];
  applyAffinity(storyChoice?.affinity);
  applyAffinity(reply?.affinity);
  state.run.choicesMade += 1;
  state.run.storyCursor += 1;
  state.run.dialogueCursor += 1;
  state.run.gold += choiceIndex === 0 ? 4 : 2;
  state.run.log.unshift(`${selectedCharacter().name}와의 인연이 깊어졌습니다.`);

  if (mode === "intro") {
    setScreen("map");
    return;
  }

  if (mode === "victory") {
    createReward("battle");
    return;
  }

  if (mode === "rest") {
    state.run.hp = clamp(state.run.hp + 18 + relicValue("restHeal"), 1, state.run.maxHp);
    progressNode("휴식을 마쳤습니다.");
    return;
  }

  if (mode === "event") {
    const candidates = cardCatalog.filter((card) => card.rarity === "common" && card.family !== "risk");
    state.run.deck.push(sample(candidates).id);
    progressNode("이벤트 보상으로 카드 한 장을 얻었습니다.");
    return;
  }

  setScreen("map");
}

function relicValue(key) {
  return state.run.relics.reduce((total, relicId) => {
    const relic = relicCatalog.find((candidate) => candidate.id === relicId);
    return total + (relic?.effects?.[key] || 0);
  }, 0);
}

function relicMultiplier(key) {
  const bonus = relicValue(key);
  if (!bonus) {
    return 1;
  }
  return bonus > 1 ? bonus : 1 + bonus;
}

function progressNode(message) {
  const week = currentWeek();
  state.run.nodeIndex += 1;
  state.run.log.unshift(message);

  if (state.run.nodeIndex >= week.encounters) {
    state.run.estimatedMinutes += week.estimatedMinutes;
    state.run.nodeIndex = 0;
    state.run.weekIndex += 1;
    if (state.run.weekIndex >= levelCurve.length) {
      completeRun(false);
      return;
    }
  }
  setScreen("map");
}

function getEncounterForWeek(type) {
  const week = currentWeek();
  const pool = encounterTemplates.filter((encounter) => encounter.tier <= week.tier + 1);
  const fallback = pool[pool.length - 1] || encounterTemplates[0];
  const base = week.boss && type === "boss"
    ? encounterTemplates[encounterTemplates.length - 1]
    : sample(pool.filter((encounter) => Math.abs(encounter.tier - week.tier) <= 1)) || fallback;
  const bossMultiplier = type === "boss" ? 1.22 : 1;
  const eliteMultiplier = type === "elite" ? 1.14 : 1;
  const tierMultiplier = 1 + Math.max(0, week.tier - base.tier) * 0.08;
  return {
    ...base,
    type,
    maxHp: Math.round(base.hp * bossMultiplier * eliteMultiplier * tierMultiplier),
    hp: Math.round(base.hp * bossMultiplier * eliteMultiplier * tierMultiplier),
    attack: Math.round(base.attack * bossMultiplier * eliteMultiplier * tierMultiplier),
    turns: base.turns + (type === "boss" ? 1 : 0),
  };
}

function selectNode(type) {
  if (type === "event") {
    showVN("event");
    return;
  }
  if (type === "rest") {
    showVN("rest");
    return;
  }
  if (type === "shop") {
    state.run.gold = Math.max(0, state.run.gold - 12);
    state.run.hp = clamp(state.run.hp + 12, 1, state.run.maxHp);
    const candidates = cardCatalog.filter((card) => ["common", "uncommon"].includes(card.rarity));
    state.run.deck.push(sample(candidates).id);
    progressNode("상점에서 덱을 다듬었습니다.");
    return;
  }
  startBattle(type);
}

function startBattle(type = "battle") {
  const encounter = getEncounterForWeek(type);
  state.run.battle = {
    encounter,
    drawPile: shuffle(state.run.deck),
    discardPile: [],
    hand: [],
    energy: 3,
    guard: 0,
    momentum: 0,
    turn: 0,
    playedFamilies: [],
    log: [`${encounter.name}이 등장했습니다.`],
  };
  startTurn();
  setScreen("battle");
}

function drawCards(amount) {
  const battle = state.run.battle;
  for (let index = 0; index < amount; index += 1) {
    if (battle.drawPile.length === 0) {
      battle.drawPile = shuffle(battle.discardPile);
      battle.discardPile = [];
    }
    const nextCard = battle.drawPile.pop();
    if (nextCard) {
      battle.hand.push(nextCard);
    }
  }
}

function startTurn() {
  const battle = state.run.battle;
  battle.turn += 1;
  battle.energy = 3 + Math.min(2, Math.floor(relicValue("tempoBonus") / 2));
  battle.guard = 0;
  drawCards(5);
  battle.log.unshift(`${battle.turn}턴 시작`);
}

function playCard(handIndex) {
  const battle = state.run.battle;
  if (!battle) {
    return;
  }
  const cardId = battle.hand[handIndex];
  const card = cardById.get(cardId);
  if (!card || card.cost > battle.energy) {
    toast("에너지가 부족합니다.");
    return;
  }

  battle.hand.splice(handIndex, 1);
  battle.energy -= card.cost;

  const effect = card.effects || {};
  const familyKey = `${card.family}Multiplier`;
  const outputBase =
    (effect.charm || 0) * relicMultiplier("charmMultiplier") +
    (effect.wit || 0) * relicMultiplier("witMultiplier") +
    (effect.focus || 0) * 0.82 * relicMultiplier("focusMultiplier");
  const comboBonus = battle.playedFamilies.includes(card.family) ? effect.combo || 0 : Math.ceil((effect.combo || 0) / 2);
  const variance = effect.variance ? Math.round(effect.variance * (Math.random() - 0.35)) : 0;
  const momentumBonus = Math.floor(battle.momentum * 0.18);
  const damage = Math.max(0, Math.round((outputBase + comboBonus + momentumBonus + variance) * relicMultiplier(familyKey)));
  const guardGain = Math.round(((effect.guard || 0) + (effect.focus || 0) * 0.45) * relicMultiplier("guardMultiplier"));
  const healGain = Math.round((effect.heal || 0) * relicMultiplier("healMultiplier"));
  const tempoGain = effect.tempo || 0;
  const drawValue = effect.draw || 0;
  const preventedRisk = clamp(relicValue("riskMitigation"), 0, 0.8);
  const selfDamage = Math.ceil((effect.selfDamage || 0) * (1 - preventedRisk));

  battle.encounter.hp = Math.max(0, battle.encounter.hp - damage);
  battle.guard += guardGain;
  battle.momentum += tempoGain;
  battle.energy += Math.min(2, Math.floor(tempoGain / 3));
  state.run.hp = clamp(state.run.hp + healGain - selfDamage, 0, state.run.maxHp);
  battle.playedFamilies.push(card.family);
  battle.discardPile.push(card.id);

  if (drawValue >= 1) {
    drawCards(Math.floor(drawValue));
  } else if (drawValue > 0 && Math.random() < drawValue) {
    drawCards(1);
  }

  battle.log.unshift(`${card.name}: ${damage} 설득, ${guardGain} 방어, ${healGain} 회복`);

  if (battle.encounter.hp <= 0) {
    winBattle();
    return;
  }
  if (state.run.hp <= 0) {
    loseRun(true);
    return;
  }
  render();
}

function endTurn() {
  const battle = state.run.battle;
  if (!battle) {
    return;
  }
  battle.discardPile.push(...battle.hand);
  battle.hand = [];
  const overtime = battle.turn > battle.encounter.turns ? 1 + (battle.turn - battle.encounter.turns) * 0.18 : 1;
  const incoming = Math.max(0, Math.round(battle.encounter.attack * overtime - battle.guard));
  state.run.hp = clamp(state.run.hp - incoming, 0, state.run.maxHp);
  battle.log.unshift(`${battle.encounter.name}의 반격: ${incoming} 피해`);
  if (state.run.hp <= 0) {
    loseRun(battle.encounter.type === "boss");
    return;
  }
  startTurn();
  render();
}

function winBattle() {
  const battle = state.run.battle;
  const wasFinalBoss = state.run.weekIndex === levelCurve.length - 1 && battle.encounter.type === "boss";
  const battleType = battle.encounter.type;
  state.run.fightsWon += 1;
  if (battle.encounter.type === "boss") {
    state.run.bossWins += 1;
  }
  state.run.gold += battle.encounter.type === "elite" ? 18 : battle.encounter.type === "boss" ? 28 : 10;
  state.run.hp = clamp(state.run.hp + (battleType === "boss" ? 8 : 5), 1, state.run.maxHp);
  state.run.lastBattleType = battleType;
  state.run.battle = null;

  if (wasFinalBoss) {
    completeRun(true);
    return;
  }

  showVN("victory");
}

function loseRun(failedBoss) {
  meta.failedBoss = Boolean(failedBoss);
  meta.memories += 1;
  saveMeta();
  state.run.battle = null;
  state.ending = endings.find((ending) => ending.id === "ending-loop-again");
  unlockEnding(state.ending.id);
  setScreen("ending");
}

function createReward(source) {
  const battleType = source === "battle" ? state.run.lastBattleType || "battle" : source;
  const candidates = draftCards(3);
  const shouldRelic = battleType === "elite" || battleType === "boss" || Math.random() < 0.22;
  const relic = shouldRelic ? draftRelic() : null;
  state.reward = {
    cards: candidates,
    relic,
  };
  setScreen("reward");
}

function draftCards(count) {
  const ownedFamilies = new Set(state.run.deck.map((id) => cardById.get(id)?.family));
  const pool = cardCatalog.filter((card) => {
    if (card.rarity === "starter") {
      return false;
    }
    return ownedFamilies.has(card.family) || card.family === "synergy" || state.run.deck.length < 16;
  });
  const picked = new Map();
  while (picked.size < count && picked.size < pool.length) {
    const roll = Math.random();
    const rarity = roll > 0.93 ? "rare" : roll > 0.66 ? "uncommon" : "common";
    const rarityPool = pool.filter((card) => card.rarity === rarity && !picked.has(card.id));
    const card = sample(rarityPool.length ? rarityPool : pool.filter((item) => !picked.has(item.id)));
    picked.set(card.id, card);
  }
  return [...picked.values()];
}

function draftRelic() {
  const unowned = relicCatalog.filter((relic) => !state.run.relics.includes(relic.id));
  if (!unowned.length) {
    return null;
  }
  return sample(unowned);
}

function chooseReward(cardId) {
  if (cardId) {
    state.run.deck.push(cardId);
    state.run.log.unshift(`${cardById.get(cardId)?.name || "카드"}를 덱에 추가했습니다.`);
  }
  if (state.reward?.relic) {
    addRelic(state.reward.relic.id);
  }
  state.reward = null;
  progressNode("보상을 정리했습니다.");
}

function addRelic(relicId) {
  if (!relicId || state.run.relics.includes(relicId)) {
    return;
  }
  const relic = relicCatalog.find((candidate) => candidate.id === relicId);
  state.run.relics.push(relicId);
  const maxHp = relic?.effects?.maxHp || 0;
  if (maxHp) {
    state.run.maxHp += maxHp;
    state.run.hp += maxHp;
  }
  state.run.log.unshift(`${relic?.name || "유물"}을 얻었습니다.`);
}

function completeRun(victorious) {
  if (!victorious) {
    state.ending = chooseEnding(false);
  } else {
    meta.clearedRuns += 1;
    state.run.estimatedMinutes += 6;
    state.ending = chooseEnding(true);
  }
  unlockEnding(state.ending.id);
  meta.memories += 1;
  saveMeta();
  setScreen("ending");
}

function chooseEnding(victorious) {
  if (!victorious) {
    return endings.find((ending) => ending.id === "ending-loop-again");
  }
  const totalAffinity = Object.values(state.run.affinity).reduce(
    (sum, entry) => sum + Object.values(entry).reduce((inner, value) => inner + value, 0),
    0,
  );
  if (totalAffinity >= 55) {
    return endings.find((ending) => ending.id === "ending-team-bright-table");
  }
  const character = selectedCharacter();
  const stat = character.affinityHooks.stat;
  const affinity = state.run.affinity[character.id]?.[stat] || 0;
  const routeEnding = endings.find((ending) => ending.route === character.route);
  if (affinity >= 18 && routeEnding) {
    return routeEnding;
  }
  return endings.find((ending) => ending.id === "ending-solo-master-builder") || endings[0];
}

function unlockEnding(endingId) {
  if (!meta.endingsUnlocked.includes(endingId)) {
    meta.endingsUnlocked.push(endingId);
  }
  saveMeta();
}

function render() {
  const renderer = {
    title: renderTitle,
    select: renderSelect,
    vn: renderVN,
    map: renderMap,
    battle: renderBattle,
    reward: renderReward,
    deck: renderDeck,
    gallery: renderGallery,
    settings: renderSettings,
    ending: renderEnding,
  }[state.screen] || renderTitle;
  app.innerHTML = renderer();
  bindActions();
  renderModal();
}

function renderTopbar(title = "카드 카페 루프") {
  const canOpenMenu = state.screen !== "title" && state.screen !== "select";
  return `
    <header class="topbar">
      <div class="brand-mark"><span class="brand-dot"></span><span>${escapeHtml(title)}</span></div>
      <div class="button-row">
        ${state.run ? `<button class="ghost-btn" data-action="deck">덱</button>` : ""}
        ${canOpenMenu ? `<button class="icon-btn" data-action="menu" aria-label="메뉴">≡</button>` : ""}
      </div>
    </header>
  `;
}

function renderTitle() {
  const hasSave = Boolean(localStorage.getItem(SAVE_KEY));
  const minutes = levelCurve.reduce((sum, week) => sum + week.estimatedMinutes, 0);
  return `
    <main class="screen title-screen">
      ${renderTopbar()}
      <section class="title-copy">
        <span class="eyebrow">15+ Bright VN Deckbuilder</span>
        <h1>카드 카페 루프</h1>
        <p class="subtitle">웃음으로 덱을 섞고, 대화로 루트를 열고, 매주 다른 결말에 가까워지는 로맨스 로그라이크.</p>
        <div class="button-row title-actions">
          <button class="primary-btn" data-action="new">새 게임</button>
          <button class="secondary-btn" data-action="load" ${hasSave ? "" : "disabled"}>이어하기</button>
          <button class="secondary-btn" data-action="gallery">엔딩</button>
          <button class="ghost-btn" data-action="settings">설정</button>
        </div>
      </section>
      <footer class="footer-strip">
        <div class="pill-row">
          <span class="pill">성인 캐릭터 ${contentMeta.counts.characters}명</span>
          <span class="pill">스토리 ${contentMeta.counts.storyPages}p</span>
          <span class="pill">대사 ${contentMeta.counts.dialoguePages}p</span>
          <span class="pill">풀런 ${minutes}분</span>
        </div>
        <span>Release Candidate 1.0</span>
      </footer>
    </main>
  `;
}

function renderSelect() {
  return `
    <main class="screen select-screen">
      ${renderTopbar("동행 선택")}
      <section class="screen-header">
        <div class="screen-title">
          <span class="eyebrow">Route Select</span>
          <h2>첫 번째 카드를 함께 뒤집을 동료</h2>
        </div>
        <button class="ghost-btn" data-action="title">타이틀</button>
      </section>
      <section class="character-grid">
        ${characters.map(renderCharacterCard).join("")}
      </section>
    </main>
  `;
}

function renderCharacterCard(character) {
  const stat = character.affinityHooks.stat;
  return `
    <article class="character-card">
      <div class="character-portrait" style="--portrait-x: ${portraitPosition(character.id)}"></div>
      <div class="character-info">
        <div>
          <h3>${escapeHtml(character.name)} · ${character.age}</h3>
          <p class="small-copy">${escapeHtml(routeById[character.route]?.title || character.route)} / ${escapeHtml(stat)}</p>
        </div>
        <p class="small-copy">${escapeHtml(character.bio)}</p>
        <div class="pill-row">
          ${character.tags.slice(2, 5).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <button class="primary-btn" data-action="start" data-character="${escapeHtml(character.id)}">선택</button>
      </div>
    </article>
  `;
}

function renderVN() {
  const mode = state.run.vnMode || "event";
  const story = getStoryPage(mode);
  const dialogue = getDialoguePage(mode);
  const speaker = characterById.get(dialogue.speakerId) || selectedCharacter();
  const choices = story.choices?.length ? story.choices : [{ label: "계속" }, { label: "미소 짓기" }];
  return `
    <main class="screen vn-screen">
      ${renderTopbar(story.title)}
      <section class="dialogue-box">
        <div class="speaker-portrait" style="--portrait-x: ${portraitPosition(speaker.id)}"></div>
        <div class="dialogue-copy">
          <div class="pill-row">
            <span class="pill">${escapeHtml(speaker.name)}</span>
            <span class="pill">${escapeHtml(routeById[speaker.route]?.title || speaker.route)}</span>
          </div>
          <p class="dialogue-text">${escapeHtml(story.text)}</p>
          <p class="dialogue-text"><strong>${escapeHtml(dialogue.line)}</strong></p>
          <div class="choice-row">
            ${choices.slice(0, 3).map((choice, index) => `
              <button class="primary-btn choice-btn" data-action="vn-choice" data-index="${index}">
                ${escapeHtml(choice.label)}
              </button>
            `).join("")}
          </div>
        </div>
      </section>
    </main>
  `;
}

function renderMap() {
  const run = state.run;
  const week = currentWeek();
  const character = selectedCharacter();
  const routeStat = character.affinityHooks.stat;
  const progress = Math.round(((run.weekIndex + run.nodeIndex / week.encounters) / levelCurve.length) * 100);
  const bossReady = week.boss && run.nodeIndex >= week.encounters - 1;
  const nodes = bossReady
    ? [{ type: "boss", title: "피날레 결투", copy: "이번 주의 보스 노드입니다.", tone: "primary" }]
    : [
        { type: week.elite ? "elite" : "battle", title: week.elite ? "엘리트 결투" : "카드 결투", copy: "보상 카드와 골드를 노립니다.", tone: "primary" },
        { type: "event", title: "대화 이벤트", copy: "호감도와 루트 단서를 얻습니다.", tone: "secondary" },
        { type: week.rest ? "rest" : "shop", title: week.rest ? "휴식" : "반짝 상점", copy: week.rest ? "체력을 회복하고 마음을 정리합니다." : "골드로 카드와 회복을 챙깁니다.", tone: "secondary" },
      ];
  return `
    <main class="screen map-screen">
      ${renderTopbar("주간 지도")}
      <section class="screen-header">
        <div class="screen-title">
          <span class="eyebrow">${escapeHtml(week.act)} · Week ${week.week}</span>
          <h2>${escapeHtml(week.title)}</h2>
        </div>
        <div class="stat-row">
          <span class="pill">HP ${run.hp}/${run.maxHp}</span>
          <span class="pill">Gold ${run.gold}</span>
          <span class="pill">${escapeHtml(character.name)} ${run.affinity[character.id]?.[routeStat] || 0}</span>
        </div>
      </section>
      <section class="map-layout">
        <div class="map-main">
          <div class="panel">
            <div class="progress-track"><div class="progress-fill" style="--value: ${progress}%"></div></div>
            <div class="node-row" style="margin-top: 18px;">
              ${nodes.map((node) => `
                <button class="node-card" data-action="node" data-type="${node.type}">
                  <span class="tag">${escapeHtml(node.type)}</span>
                  <strong>${escapeHtml(node.title)}</strong>
                  <span class="small-copy">${escapeHtml(node.copy)}</span>
                </button>
              `).join("")}
            </div>
          </div>
        </div>
        <aside class="map-side">
          <div class="panel">
            <h3>회차 상태</h3>
            <div class="pill-row" style="margin-top: 10px;">
              <span class="pill">노드 ${run.nodeIndex + 1}/${week.encounters}</span>
              <span class="pill">승리 ${run.fightsWon}</span>
              <span class="pill">예상 ${run.estimatedMinutes + week.estimatedMinutes}분</span>
            </div>
          </div>
          <div class="panel">
            <h3>최근 기록</h3>
            <p class="small-copy" style="margin-top: 10px;">${escapeHtml(run.log.slice(0, 4).join(" · "))}</p>
          </div>
          <div class="panel">
            <h3>유물</h3>
            <div class="pill-row" style="margin-top: 10px;">
              ${run.relics.length ? run.relics.map((id) => `<span class="pill">${escapeHtml(relicCatalog.find((relic) => relic.id === id)?.name || id)}</span>`).join("") : `<span class="pill">없음</span>`}
            </div>
          </div>
        </aside>
      </section>
    </main>
  `;
}

function renderBattle() {
  const run = state.run;
  const battle = run.battle;
  const enemy = battle.encounter;
  const enemyProgress = Math.round((enemy.hp / enemy.maxHp) * 100);
  const hpProgress = Math.round((run.hp / run.maxHp) * 100);
  return `
    <main class="screen battle-screen">
      ${renderTopbar("카드 결투")}
      <section class="battle-layout">
        <div class="battle-field">
          <div class="enemy-panel panel">
            <div class="screen-header" style="margin-bottom: 0;">
              <div>
                <span class="eyebrow">${escapeHtml(enemy.type)}</span>
                <h2>${escapeHtml(enemy.name)}</h2>
              </div>
              <span class="pill">ATK ${enemy.attack}</span>
            </div>
            <div class="progress-track"><div class="progress-fill" style="--value: ${enemyProgress}%"></div></div>
            <p class="small-copy">${enemy.hp}/${enemy.maxHp} · 제한 ${enemy.turns}턴 · ${escapeHtml(enemy.text)}</p>
          </div>
          <div class="hand">
            ${battle.hand.map((cardId, index) => renderBattleCard(cardById.get(cardId), index, battle.energy)).join("")}
          </div>
        </div>
        <aside class="battle-side">
          <div class="panel">
            <h3>플레이어</h3>
            <div class="progress-track" style="margin-top: 12px;"><div class="progress-fill" style="--value: ${hpProgress}%"></div></div>
            <div class="pill-row" style="margin-top: 12px;">
              <span class="pill">HP ${run.hp}/${run.maxHp}</span>
              <span class="pill">Energy ${battle.energy}</span>
              <span class="pill">Guard ${battle.guard}</span>
              <span class="pill">Tempo ${battle.momentum}</span>
            </div>
          </div>
          <div class="panel">
            <h3>결투 로그</h3>
            <div class="combat-log" style="margin-top: 10px;">${battle.log.slice(0, 7).map((line) => `<div>${escapeHtml(line)}</div>`).join("")}</div>
          </div>
          <button class="primary-btn" data-action="end-turn">턴 종료</button>
        </aside>
      </section>
    </main>
  `;
}

function renderBattleCard(card, index, energy) {
  if (!card) {
    return "";
  }
  const disabled = card.cost > energy;
  return `
    <button class="card-btn family-${escapeHtml(card.family)} ${disabled ? "is-disabled" : ""}" data-action="play-card" data-index="${index}">
      <div class="card-art" style="${cardArtPosition(card.id)}"></div>
      <div class="card-meta">
        <strong>${escapeHtml(card.name)}</strong>
        <span class="cost-badge">${card.cost}</span>
      </div>
      <p class="card-text">${escapeHtml(card.text)}</p>
      <span class="tag">${escapeHtml(familyLabel[card.family] || card.family)} · ${escapeHtml(card.rarity)}</span>
    </button>
  `;
}

function renderReward() {
  const reward = state.reward || { cards: [], relic: null };
  return `
    <main class="screen battle-screen">
      ${renderTopbar("보상")}
      <section class="screen-header">
        <div class="screen-title">
          <span class="eyebrow">Reward</span>
          <h2>덱에 섞을 한 장</h2>
        </div>
      </section>
      <section class="panel">
        <div class="reward-row">
          ${reward.cards.map((card) => `
            <button class="reward-card family-${escapeHtml(card.family)}" data-action="reward" data-card="${escapeHtml(card.id)}">
              <div class="card-art" style="${cardArtPosition(card.id)}"></div>
              <strong>${escapeHtml(card.name)}</strong>
              <p class="small-copy">${escapeHtml(card.text)}</p>
              <span class="tag">${escapeHtml(familyLabel[card.family] || card.family)} · ${escapeHtml(card.rarity)}</span>
            </button>
          `).join("")}
          <button class="reward-card" data-action="reward" data-card="">
            <div class="card-art" style="--art-x: 100%; --art-y: 100%;"></div>
            <strong>건너뛰기</strong>
            <p class="small-copy">현재 덱의 리듬을 유지합니다.</p>
            <span class="tag">skip</span>
          </button>
        </div>
        ${reward.relic ? `
          <div class="relic-row" style="margin-top: 16px;">
            <article class="relic-card">
              <h3>${escapeHtml(reward.relic.name)}</h3>
              <p class="small-copy" style="margin-top: 8px;">${escapeHtml(reward.relic.text)}</p>
            </article>
          </div>
        ` : ""}
      </section>
    </main>
  `;
}

function renderDeck() {
  const run = state.run;
  const counts = run.deck.reduce((map, id) => {
    map.set(id, (map.get(id) || 0) + 1);
    return map;
  }, new Map());
  return `
    <main class="screen deck-screen">
      ${renderTopbar("덱")}
      <section class="screen-header">
        <div class="screen-title">
          <span class="eyebrow">Deck</span>
          <h2>${run.deck.length}장의 루프 덱</h2>
        </div>
        <button class="primary-btn" data-action="map">지도</button>
      </section>
      <section class="split-layout">
        <div class="split-main">
          <div class="deck-grid">
            ${[...counts.entries()].map(([id, count]) => {
              const card = cardById.get(id);
              return `
                <article class="deck-card family-${escapeHtml(card.family)}">
                  <strong>${escapeHtml(card.name)} × ${count}</strong>
                  <p class="small-copy">${escapeHtml(card.text)}</p>
                  <span class="tag">${escapeHtml(familyLabel[card.family] || card.family)} · cost ${card.cost}</span>
                </article>
              `;
            }).join("")}
          </div>
        </div>
        <aside class="split-side panel">
          <h3>유물</h3>
          <div class="relic-row" style="margin-top: 12px;">
            ${run.relics.length ? run.relics.map((id) => {
              const relic = relicCatalog.find((candidate) => candidate.id === id);
              return `<article class="relic-card"><strong>${escapeHtml(relic.name)}</strong><p class="small-copy">${escapeHtml(relic.text)}</p></article>`;
            }).join("") : `<div class="empty">아직 획득한 유물이 없습니다.</div>`}
          </div>
        </aside>
      </section>
    </main>
  `;
}

function renderGallery() {
  return `
    <main class="screen gallery-screen">
      ${renderTopbar("엔딩")}
      <section class="screen-header">
        <div class="screen-title">
          <span class="eyebrow">Gallery</span>
          <h2>해금한 결말</h2>
        </div>
        <button class="primary-btn" data-action="title">타이틀</button>
      </section>
      <section class="gallery-grid">
        ${endings.map((ending) => {
          const unlocked = meta.endingsUnlocked.includes(ending.id);
          return `
            <article class="ending-card">
              <span class="tag">${unlocked ? "unlocked" : "locked"}</span>
              <h3>${escapeHtml(unlocked ? ending.title : "????")}</h3>
              <p class="small-copy">${escapeHtml(unlocked ? ending.summary : "아직 이 결말의 페이지는 닫혀 있습니다.")}</p>
            </article>
          `;
        }).join("")}
      </section>
    </main>
  `;
}

function renderSettings() {
  return `
    <main class="screen settings-screen">
      ${renderTopbar("설정")}
      <section class="screen-header">
        <div class="screen-title">
          <span class="eyebrow">Settings</span>
          <h2>표시 옵션</h2>
        </div>
        <button class="primary-btn" data-action="${state.run ? "map" : "title"}">돌아가기</button>
      </section>
      <section class="panel" style="display: grid; gap: 12px;">
        <label class="setting-line">
          <span>텍스트 크기</span>
          <select data-action="setting-text">
            ${["작게", "보통", "크게"].map((value) => `<option ${meta.settings.textSize === value ? "selected" : ""}>${value}</option>`).join("")}
          </select>
        </label>
        <label class="setting-line">
          <span>움직임 줄이기</span>
          <input type="checkbox" data-action="setting-motion" ${meta.settings.reducedMotion ? "checked" : ""} />
        </label>
      </section>
    </main>
  `;
}

function renderEnding() {
  const ending = state.ending || endings[0];
  const run = state.run;
  return `
    <main class="screen ending-screen">
      ${renderTopbar("엔딩")}
      <section class="title-copy">
        <span class="eyebrow">Ending</span>
        <h1>${escapeHtml(ending.title)}</h1>
        <p class="subtitle">${escapeHtml(ending.summary)}</p>
        <div class="pill-row" style="margin-top: 20px;">
          <span class="pill">해금 ${meta.endingsUnlocked.length}/${endings.length}</span>
          <span class="pill">클리어 ${meta.clearedRuns}</span>
          ${run ? `<span class="pill">예상 플레이 ${run.estimatedMinutes}분</span>` : ""}
        </div>
        <div class="button-row title-actions">
          <button class="primary-btn" data-action="new">새 회차</button>
          <button class="secondary-btn" data-action="gallery">엔딩</button>
          <button class="ghost-btn" data-action="title">타이틀</button>
        </div>
      </section>
    </main>
  `;
}

function bindActions() {
  document.querySelectorAll("[data-action]").forEach((element) => {
    if (element.tagName === "SELECT" || element.type === "checkbox") {
      element.addEventListener("change", handleAction);
    } else {
      element.addEventListener("click", handleAction);
    }
  });
}

function handleAction(event) {
  const target = event.currentTarget;
  const action = target.dataset.action;
  if (["new", "title", "gallery", "settings", "deck", "map"].includes(action)) {
    state.menuOpen = false;
  }
  if (action === "new") setScreen("select");
  if (action === "title") {
    state.menuOpen = false;
    setScreen("title");
  }
  if (action === "start") startNewRun(target.dataset.character);
  if (action === "load") loadGame();
  if (action === "save") saveGame();
  if (action === "gallery") setScreen("gallery");
  if (action === "settings") setScreen("settings");
  if (action === "deck" && state.run) setScreen("deck");
  if (action === "map" && state.run) setScreen("map");
  if (action === "menu") {
    state.menuOpen = !state.menuOpen;
    renderModal();
  }
  if (action === "continue") {
    state.menuOpen = false;
    renderModal();
  }
  if (action === "vn-choice") chooseVN(Number(target.dataset.index || 0));
  if (action === "node") selectNode(target.dataset.type);
  if (action === "play-card") playCard(Number(target.dataset.index || 0));
  if (action === "end-turn") endTurn();
  if (action === "reward") chooseReward(target.dataset.card);
  if (action === "setting-text") {
    meta.settings.textSize = target.value;
    saveMeta();
    toast("설정을 저장했습니다.");
  }
  if (action === "setting-motion") {
    meta.settings.reducedMotion = target.checked;
    saveMeta();
    toast("설정을 저장했습니다.");
  }
}

function renderModal() {
  modalRoot.innerHTML = `
    ${state.menuOpen ? renderPauseMenu() : ""}
    ${state.toast ? `<div class="toast">${escapeHtml(state.toast)}</div>` : ""}
  `;
  modalRoot.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", handleAction);
  });
}

function renderPauseMenu() {
  return `
    <div class="modal-backdrop">
      <section class="menu-panel">
        <h2>메뉴</h2>
        <button class="primary-btn" data-action="continue">계속하기</button>
        <button class="secondary-btn" data-action="save">저장하기</button>
        <button class="secondary-btn" data-action="load">불러오기</button>
        <button class="secondary-btn" data-action="deck">덱 보기</button>
        <button class="secondary-btn" data-action="settings">설정</button>
        <button class="danger-btn" data-action="title">타이틀로</button>
      </section>
    </div>
  `;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.screen !== "title" && state.screen !== "select") {
    state.menuOpen = !state.menuOpen;
    renderModal();
  }
  if (state.screen === "battle" && /^[1-9]$/.test(event.key)) {
    playCard(Number(event.key) - 1);
  }
  if (state.screen === "vn" && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    chooseVN(0);
  }
});

render();
