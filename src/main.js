import {
  assetManifest,
  balanceTargets,
  economyCurve,
  fullRunMinutes,
  horseRoster,
  oddsConfig,
  raceMeetings,
  starterStrategyDeckIds,
  strategyCardCatalog,
  trackConditions,
} from "./data/cards.js";
import {
  bettingBarks,
  characters,
  contentMeta,
  endings,
  raceCommentary,
  storyChapters,
} from "./data/content.js";

const SAVE_KEY = "neon-derby-romance-save-v1";
const META_KEY = "neon-derby-romance-meta-v1";

const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");

const characterById = new Map(characters.map((character) => [character.id, character]));
const horseById = new Map(horseRoster.map((horse) => [horse.id, horse]));
const conditionById = new Map(trackConditions.map((condition) => [condition.id, condition]));
const cardById = new Map(strategyCardCatalog.map((card) => [card.id, card]));
const endingByRoute = new Map(endings.map((ending) => [ending.route, ending]));

const characterAssets = {
  hana: "./assets/characters/hana.png",
  sora: "./assets/characters/sora.png",
  riri: "./assets/characters/riri.png",
  mirae: "./assets/characters/mirae.png",
  jun: "./assets/characters/jun.png",
};

const routeLabel = {
  warmth: "햇살 카페 루트",
  trust: "새침 분석 루트",
  sync: "네온 중계 루트",
  charm: "무대 트릭 루트",
  insight: "기록 보관 루트",
  team: "팀 라운지",
  solo: "솔로 결승선",
  neutral: "재도전",
};

const statLabel = {
  start: "출발",
  stamina: "지구",
  sprint: "스퍼트",
  nerve: "침착",
  warmth: "온기",
  trust: "신뢰",
  sync: "싱크",
  charm: "매력",
  insight: "통찰",
};

const familyLabel = {
  insight: "단서",
  guard: "안전",
  start: "출발",
  sprint: "스퍼트",
  nerve: "침착",
  stamina: "지구",
  odds: "배당",
};

const rarityLabel = {
  starter: "기본",
  common: "일반",
  uncommon: "희귀",
  rare: "전설",
};

const tutorialSteps = [
  {
    title: "대화로 밤을 연다",
    body: "각 장은 전형적인 미연시 화면으로 시작됩니다. 대화를 읽고 선택지를 고르면 동료 호감도, 칩, 말 단서가 바뀝니다.",
  },
  {
    title: "전략 카드를 먼저 고른다",
    body: "베팅 전 손패에서 최대 3 포커스만큼 카드를 사용합니다. 카드는 말의 점수, 단서, 환급, 배당 보너스를 바꿉니다.",
  },
  {
    title: "칩은 허구의 진행 자원",
    body: "현실 화폐와 연결되지 않는 게임 내 칩입니다. 각 장의 목표 칩을 모으면 다음 이야기와 보상이 열립니다.",
  },
  {
    title: "엔딩은 관계와 선택으로 갈린다",
    body: "최종 장에서 누구와 새벽을 맞을지 선택합니다. 여러 동료와 고르게 가까우면 팀 엔딩도 열립니다.",
  },
];

const meta = loadMeta();
const state = {
  screen: "title",
  previousScreen: "title",
  run: null,
  race: null,
  rewards: null,
  ending: null,
  menuOpen: false,
  toast: "",
};

function loadMeta() {
  const fallback = {
    endingsUnlocked: [],
    clearedRuns: 0,
    tutorialSeen: false,
    settings: {
      textSize: "보통",
      reducedMotion: false,
      volume: 70,
      textSpeed: "보통",
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
    toast("저장할 진행이 없습니다.");
    return;
  }
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      version: 1,
      screen: state.screen,
      run: state.run,
      race: state.race,
      rewards: state.rewards,
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
    state.run = normalizeRun(loaded.run);
    state.race = loaded.race || null;
    state.rewards = loaded.rewards || null;
    state.ending = loaded.ending || null;
    state.menuOpen = false;
    setScreen(loaded.screen || "vn");
    toast("이어하기를 불러왔습니다.");
  } catch {
    toast("저장 데이터를 읽지 못했습니다.");
  }
}

function normalizeRun(run) {
  const fresh = createRun(run?.characterId || characters[0].id);
  const merged = {
    ...fresh,
    ...(run || {}),
    affinity: { ...fresh.affinity, ...(run?.affinity || {}) },
    insight: { ...fresh.insight, ...(run?.insight || {}) },
    deck: Array.isArray(run?.deck) ? run.deck.filter((id) => cardById.has(id)) : fresh.deck,
    hand: Array.isArray(run?.hand) ? run.hand.filter((id) => cardById.has(id)) : fresh.hand,
    selectedCards: Array.isArray(run?.selectedCards) ? run.selectedCards.filter((id) => cardById.has(id)) : [],
    log: Array.isArray(run?.log) ? run.log : fresh.log,
  };
  if (!horseById.has(merged.selectedHorseId)) {
    merged.selectedHorseId = horseRoster[0].id;
  }
  return merged;
}

function createRun(characterId) {
  const affinity = Object.fromEntries(characters.map((character) => [character.id, 0]));
  const insight = Object.fromEntries(horseRoster.map((horse) => [horse.id, 0]));
  const run = {
    seed: `${Date.now()}-${characterId}`,
    characterId,
    chapterIndex: 0,
    lineIndex: 0,
    meetingIndex: 0,
    chips: economyCurve.startingChips,
    bet: 30,
    races: 0,
    racesInChapter: 0,
    emergencyUses: 0,
    tutorialStep: 0,
    tutorialDone: meta.tutorialSeen,
    deck: [...starterStrategyDeckIds],
    hand: [],
    selectedCards: [],
    selectedHorseId: horseRoster[0].id,
    affinity,
    insight,
    log: ["찢어진 우승권을 들고 패덕 카페의 밤을 시작했습니다."],
  };
  run.hand = drawHand(run);
  return run;
}

function syncSettings() {
  document.documentElement.dataset.textSize = meta.settings.textSize;
  document.documentElement.dataset.reducedMotion = meta.settings.reducedMotion ? "true" : "false";
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

function hashSeed(seedText) {
  let hash = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    hash ^= seedText.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seedText) {
  let value = hashSeed(seedText) || 1;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, seedText) {
  const rng = createRng(seedText);
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function sample(items, seedText) {
  return shuffle(items, seedText)[0];
}

function drawHand(run) {
  const expanded = [];
  while (expanded.length < 8) {
    expanded.push(...run.deck);
  }
  return shuffle(expanded, `${run.seed}:hand:${run.races}:${run.deck.length}`).slice(0, 5);
}

function currentChapter() {
  return storyChapters[Math.min(state.run?.chapterIndex || 0, storyChapters.length - 1)];
}

function currentMeeting() {
  const run = state.run;
  return raceMeetings[(run?.meetingIndex || 0) % raceMeetings.length];
}

function currentCondition() {
  return conditionById.get(currentMeeting().conditionId) || trackConditions[0];
}

function selectedCharacter() {
  return characterById.get(state.run?.characterId) || characters[0];
}

function selectedCards() {
  return (state.run?.selectedCards || []).map((id) => cardById.get(id)).filter(Boolean);
}

function selectedCardCost() {
  return selectedCards().reduce((sum, card) => sum + card.cost, 0);
}

function storyGoalText(chapter = currentChapter()) {
  if (!chapter.fundingGoal) {
    return "최종 선택";
  }
  return `${chapter.fundingGoal}칩`;
}

function baseHorsePower(horse, condition, run, extraInsight = 0) {
  const fit = horse.conditionFit[condition.id] || 0;
  const clue = (run.insight[horse.id] || 0) + extraInsight;
  return horse.basePower + horse[condition.stat] * 0.34 + fit * 2.6 + clue * 0.72;
}

function computeOddsMap(run = state.run) {
  const condition = currentCondition();
  const meeting = currentMeeting();
  const powers = horseRoster.map((horse) => ({
    horse,
    power: Math.max(18, baseHorsePower(horse, condition, run)),
  }));
  const total = powers.reduce((sum, entry) => sum + entry.power, 0);
  return new Map(
    powers.map(({ horse, power }) => {
      const raw = (total / power) * oddsConfig.houseTake * (0.9 + meeting.volatility * 0.08);
      return [horse.id, clamp(Number(raw.toFixed(2)), oddsConfig.minOdds, oddsConfig.maxOdds)];
    }),
  );
}

function cardImpactForHorse(horse, odds, cards = selectedCards()) {
  const condition = currentCondition();
  const impact = cards.reduce(
    (impact, card) => {
      const effect = card.effects;
      impact.score += effect.score || 0;
      impact.insight += effect.insight || 0;
      impact.refund = Math.max(impact.refund, effect.refund || 0);
      impact.stability += effect.stability || 0;
      impact.payoutMultiplier += effect.payoutMultiplier || 0;
      if (effect.stat) {
        const statFit = effect.stat === condition.stat ? 1 : 0.55;
        impact.score += (effect.statBoost || 0) * statFit * (0.75 + horse[effect.stat] / 360);
      }
      if (effect.underdogScore) {
        impact.score += effect.underdogScore * clamp((odds - 2.2) / 5.2, 0.25, 1);
      }
      return impact;
    },
    { score: 0, insight: 0, refund: 0, stability: 0, payoutMultiplier: 0 },
  );
  impact.score *= 0.62;
  impact.stability *= 0.8;
  return impact;
}

function draftRewards() {
  const run = state.run;
  const owned = new Set(run.deck);
  const candidates = strategyCardCatalog.filter((card) => card.rarity !== "starter" || !owned.has(card.id));
  const rareBias = run.chapterIndex > 2 ? ["rare", "uncommon"] : ["common", "uncommon"];
  const preferred = candidates.filter((card) => rareBias.includes(card.rarity));
  const pool = preferred.length >= 3 ? preferred : candidates;
  return shuffle(pool, `${run.seed}:reward:${run.chapterIndex}:${run.races}`).slice(0, balanceTargets.rewardChoices);
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

function startNewRun(characterId) {
  state.run = createRun(characterId);
  state.race = null;
  state.rewards = null;
  state.ending = null;
  setScreen(meta.tutorialSeen ? "vn" : "tutorial");
}

function nextTutorial() {
  state.run.tutorialStep += 1;
  if (state.run.tutorialStep >= tutorialSteps.length) {
    state.run.tutorialDone = true;
    meta.tutorialSeen = true;
    saveMeta();
    setScreen("vn");
    return;
  }
  render();
}

function skipTutorial() {
  state.run.tutorialDone = true;
  meta.tutorialSeen = true;
  saveMeta();
  setScreen("vn");
}

function advanceVN() {
  const chapter = currentChapter();
  if (state.run.lineIndex < chapter.lines.length) {
    state.run.lineIndex += 1;
    render();
    return;
  }
  chooseVNChoice(0);
}

function applyChoice(choice) {
  if (!choice || !state.run) {
    return;
  }
  const run = state.run;
  if (choice.chips) {
    run.chips += choice.chips;
  }
  if (choice.insight?.horseId) {
    run.insight[choice.insight.horseId] = (run.insight[choice.insight.horseId] || 0) + (choice.insight.amount || 1);
  }
  const affinity = choice.affinity;
  if (!affinity) {
    return;
  }
  if (affinity.all) {
    characters.forEach((character) => {
      run.affinity[character.id] += affinity.all;
    });
  }
  if (affinity.characterId === "all") {
    characters.forEach((character) => {
      run.affinity[character.id] += affinity.amount || 1;
    });
  } else if (affinity.characterId === "selected") {
    run.affinity[run.characterId] += affinity.amount || 1;
  } else if (characterById.has(affinity.characterId)) {
    run.affinity[affinity.characterId] += affinity.amount || 1;
  }
}

function chooseVNChoice(index) {
  const chapter = currentChapter();
  const choice = chapter.choices[index] || chapter.choices[0];
  applyChoice(choice);
  state.run.log.unshift(choice?.response || "대화를 이어 갔습니다.");

  if (chapter.id === "finale") {
    finishRun(index);
    return;
  }

  state.run.selectedCards = [];
  state.run.hand = drawHand(state.run);
  setScreen("betting");
}

function toggleStrategyCard(cardId) {
  const run = state.run;
  const card = cardById.get(cardId);
  if (!card) {
    return;
  }
  if (run.selectedCards.includes(cardId)) {
    run.selectedCards = run.selectedCards.filter((id) => id !== cardId);
    render();
    return;
  }
  if (selectedCardCost() + card.cost > balanceTargets.maxFocus) {
    toast("이번 베팅의 포커스가 부족합니다.");
    return;
  }
  run.selectedCards.push(cardId);
  render();
}

function setBet(value) {
  const maxBet = Math.min(oddsConfig.maxBet, state.run.chips);
  state.run.bet = clamp(Number(value) || oddsConfig.minBet, oddsConfig.minBet, Math.max(oddsConfig.minBet, maxBet));
  render();
}

function startRace() {
  const run = state.run;
  const meeting = currentMeeting();
  const condition = currentCondition();
  const oddsMap = computeOddsMap(run);
  const selectedHorse = horseById.get(run.selectedHorseId) || horseRoster[0];
  const stake = clamp(run.bet, oddsConfig.minBet, Math.min(oddsConfig.maxBet, run.chips));
  const selectedImpact = cardImpactForHorse(selectedHorse, oddsMap.get(selectedHorse.id));
  const rng = createRng(`${run.seed}:race:${run.races}:${run.selectedHorseId}:${run.chips}`);
  const entries = horseRoster
    .map((horse) => {
      const isSelected = horse.id === selectedHorse.id;
      const impact = isSelected ? selectedImpact : { score: 0, insight: 0, stability: 0 };
      const noiseRange = Math.max(12, 42 * meeting.volatility - (impact.stability || 0));
      const noise = (rng() - 0.48) * noiseRange;
      const score = baseHorsePower(horse, condition, run, impact.insight || 0) + (impact.score || 0) + noise;
      return { horse, score: Number(score.toFixed(1)) };
    })
    .sort((left, right) => right.score - left.score);

  const winner = entries[0].horse;
  const won = winner.id === selectedHorse.id;
  const odds = oddsMap.get(selectedHorse.id) || oddsConfig.minOdds;
  const payoutMultiplier = 1 + selectedImpact.payoutMultiplier;
  const payout = won ? Math.round(stake * odds * payoutMultiplier) : 0;
  const refund = won ? 0 : Math.round(stake * selectedImpact.refund);
  run.chips = Math.max(0, run.chips - stake + payout + refund);
  run.races += 1;
  run.racesInChapter += 1;
  run.meetingIndex += 1;
  run.insight[selectedHorse.id] += Math.round(2 + selectedImpact.insight + (won ? 3 : 1));
  run.affinity[run.characterId] += won ? 2 : 1;
  run.log.unshift(
    won
      ? `${selectedHorse.name} 적중. ${payout}칩을 회수했습니다.`
      : `${selectedHorse.name}은 ${entries.findIndex((entry) => entry.horse.id === selectedHorse.id) + 1}착. ${refund}칩을 돌려받았습니다.`,
  );

  state.race = {
    meeting,
    condition,
    selectedHorseId: selectedHorse.id,
    winnerId: winner.id,
    entries,
    stake,
    odds,
    payout,
    refund,
    won,
    commentary: raceCommentary[run.races % raceCommentary.length],
  };
  run.selectedCards = [];
  setScreen("race");
}

function continueAfterRace() {
  const run = state.run;
  const chapter = currentChapter();
  const goalReached = !chapter.fundingGoal || run.chips >= chapter.fundingGoal;
  const deadlineMissed = !goalReached && run.racesInChapter >= balanceTargets.maxRacesPerChapter;

  if (!goalReached && run.chips < oddsConfig.minBet) {
    if (run.emergencyUses < 2) {
      run.chips += oddsConfig.emergencyChips;
      run.emergencyUses += 1;
      run.log.unshift("하나가 비상 쿠폰을 칩으로 바꿔 주었습니다.");
      toast("비상 칩을 받았습니다.");
    } else {
      state.ending = endings.find((ending) => ending.id === "ending-broke-rerun") || endings[0];
      unlockEnding(state.ending.id);
      setScreen("ending");
      return;
    }
  }

  if (deadlineMissed) {
    state.ending = endings.find((ending) => ending.id === "ending-broke-rerun") || endings[0];
    state.run.log.unshift("취재 시간이 끝나 단서를 다음 밤으로 넘겼습니다.");
    unlockEnding(state.ending.id);
    setScreen("ending");
    return;
  }

  if (goalReached) {
    if (run.chapterIndex >= storyChapters.length - 2) {
      run.chapterIndex = storyChapters.length - 1;
      run.lineIndex = 0;
      setScreen("vn");
      return;
    }
    state.rewards = draftRewards();
    setScreen("reward");
    return;
  }

  run.hand = drawHand(run);
  setScreen("betting");
}

function chooseReward(cardId) {
  const run = state.run;
  if (cardById.has(cardId)) {
    run.deck.push(cardId);
    run.log.unshift(`${cardById.get(cardId).name} 카드를 덱에 넣었습니다.`);
  } else {
    run.chips += 35;
    run.log.unshift("보상 대신 취재비 35칩을 챙겼습니다.");
  }
  run.chapterIndex += 1;
  run.lineIndex = 0;
  run.racesInChapter = 0;
  run.selectedCards = [];
  run.hand = drawHand(run);
  state.rewards = null;
  setScreen("vn");
}

function finishRun(choiceIndex) {
  const run = state.run;
  const averageAffinity = characters.reduce((sum, character) => sum + run.affinity[character.id], 0) / characters.length;
  let ending;
  if (choiceIndex === 1 || averageAffinity >= 13) {
    ending = endingByRoute.get("team");
  } else if (choiceIndex === 2) {
    ending = endingByRoute.get("solo");
  } else {
    const best = characters.reduce((winner, character) => {
      return run.affinity[character.id] > run.affinity[winner.id] ? character : winner;
    }, selectedCharacter());
    ending = endings.find((candidate) => candidate.characterId === best.id) || endingByRoute.get(best.route);
  }
  state.ending = ending || endings[0];
  meta.clearedRuns += 1;
  unlockEnding(state.ending.id);
  setScreen("ending");
}

function unlockEnding(endingId) {
  if (!meta.endingsUnlocked.includes(endingId)) {
    meta.endingsUnlocked.push(endingId);
    saveMeta();
  }
}

function render() {
  syncSettings();
  const renderer = {
    title: renderTitle,
    select: renderSelect,
    tutorial: renderTutorial,
    vn: renderVN,
    betting: renderBetting,
    race: renderRace,
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

function renderHud(title = contentMeta.title) {
  const canMenu = state.screen !== "title" && state.screen !== "select";
  return `
    <header class="game-hud">
      <div class="hud-title">
        <span class="diamond-mark"></span>
        <strong>${escapeHtml(title)}</strong>
      </div>
      <nav class="hud-actions" aria-label="빠른 메뉴">
        ${state.run ? `<button class="icon-btn" data-action="deck" aria-label="덱">D</button>` : ""}
        ${state.run ? `<button class="icon-btn" data-action="save" aria-label="저장">S</button>` : ""}
        ${canMenu ? `<button class="icon-btn" data-action="menu" aria-label="메뉴">≡</button>` : ""}
      </nav>
    </header>
  `;
}

function renderTitle() {
  const hasSave = Boolean(localStorage.getItem(SAVE_KEY));
  return `
    <main class="screen title-screen">
      ${renderHud()}
      <section class="title-copy">
        <span class="eyebrow">15+ 비주얼 노벨 전략 카드 로그라이크</span>
        <h1>${escapeHtml(contentMeta.title)}</h1>
        <p class="subtitle">패덕 카페의 동료들과 전략 카드를 조합해 야간 경주의 진실, 칩 목표, 로맨스 엔딩을 동시에 쫓는 밝은 네온 로맨스.</p>
        <div class="button-row title-actions">
          <button class="primary-btn" data-action="new">새 게임</button>
          <button class="secondary-btn" data-action="load" ${hasSave ? "" : "disabled"}>이어하기</button>
          <button class="secondary-btn" data-action="gallery">엔딩 갤러리</button>
          <button class="ghost-btn" data-action="settings">설정</button>
        </div>
      </section>
      <footer class="footer-strip">
        <span>캐릭터 ${characters.length}명 · 엔딩 ${endings.length}종 · 목표 ${fullRunMinutes}분</span>
        <span>UI-first Neon Derby build</span>
      </footer>
    </main>
  `;
}

function renderSelect() {
  return `
    <main class="screen select-screen">
      ${renderHud("동행 선택")}
      <section class="screen-header">
        <div>
          <span class="eyebrow">루트 선택</span>
          <h2>오늘 밤 함께 뛰어들 동료</h2>
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
  return `
    <article class="character-card">
      <div class="character-stage">
        <img src="${characterAssets[character.id]}" alt="${escapeHtml(character.name)}" />
      </div>
      <div class="character-info">
        <span class="tag">${escapeHtml(routeLabel[character.route] || character.route)}</span>
        <h3>${escapeHtml(character.name)} · ${character.age}</h3>
        <p>${escapeHtml(character.role)}</p>
        <p>${escapeHtml(character.bio)}</p>
        <button class="primary-btn" data-action="start" data-character="${escapeHtml(character.id)}">함께 시작</button>
      </div>
    </article>
  `;
}

function renderTutorial() {
  const step = tutorialSteps[state.run.tutorialStep] || tutorialSteps[0];
  return `
    <main class="screen vn-screen">
      ${renderHud("튜토리얼")}
      <section class="tutorial-shell">
        <div class="tutorial-art">${renderCharacterSprite(state.run.characterId, "tutorial-sprite")}</div>
        <article class="tutorial-card">
          <span class="eyebrow">튜토리얼 ${state.run.tutorialStep + 1}/${tutorialSteps.length}</span>
          <h2>${escapeHtml(step.title)}</h2>
          <p>${escapeHtml(step.body)}</p>
          <div class="button-row">
            <button class="primary-btn" data-action="tutorial-next">${state.run.tutorialStep + 1 >= tutorialSteps.length ? "시작" : "다음"}</button>
            <button class="ghost-btn" data-action="tutorial-skip">건너뛰기</button>
          </div>
        </article>
      </section>
    </main>
  `;
}

function renderVN() {
  const run = state.run;
  const chapter = currentChapter();
  const choosing = run.lineIndex >= chapter.lines.length;
  const line = choosing ? { speakerId: run.characterId, text: chapter.summary } : chapter.lines[run.lineIndex];
  const speaker = line.speakerId === "narrator" ? null : characterById.get(line.speakerId);
  const displayCharacter = speaker || selectedCharacter();
  return `
    <main class="screen vn-screen">
      ${renderHud(chapter.title)}
      <section class="vn-stage">
        <div class="vn-cast">
          ${renderCharacterSprite(displayCharacter.id, "vn-sprite")}
        </div>
        ${choosing ? `
          <aside class="choice-stack">
            ${chapter.choices.map((choice, index) => `
              <button class="choice-card" data-action="vn-choice" data-index="${index}">
                <span>${index + 1}</span>
                ${escapeHtml(choice.label)}
              </button>
            `).join("")}
          </aside>
        ` : ""}
        <section class="dialogue-panel">
          <div class="nameplate">${escapeHtml(speaker?.name || "나레이션")}</div>
          <p>${escapeHtml(line.text)}</p>
          <div class="dialogue-meta">
            <span>${escapeHtml(chapter.location)}</span>
            <span>${Math.min(run.lineIndex + 1, chapter.lines.length)}/${chapter.lines.length}</span>
          </div>
          ${choosing ? "" : `<button class="advance-chip" data-action="vn-advance" aria-label="다음">⌄</button>`}
        </section>
      </section>
    </main>
  `;
}

function renderBetting() {
  const run = state.run;
  const chapter = currentChapter();
  const meeting = currentMeeting();
  const condition = currentCondition();
  const oddsMap = computeOddsMap(run);
  const maxBet = Math.min(oddsConfig.maxBet, run.chips);
  const chosenHorse = horseById.get(run.selectedHorseId) || horseRoster[0];
  const chosenImpact = cardImpactForHorse(chosenHorse, oddsMap.get(chosenHorse.id));
  return `
    <main class="screen betting-screen">
      ${renderHud("전략 베팅")}
      <section class="betting-layout">
        <aside class="run-panel">
          <span class="eyebrow">${escapeHtml(chapter.title)}</span>
          <h2>${escapeHtml(meeting.title)}</h2>
          <p>${escapeHtml(meeting.purseHint)}</p>
          <div class="meter-line">
            <span>보유 칩</span>
            <strong>${run.chips}</strong>
          </div>
          <div class="meter-line">
            <span>다음 장 목표</span>
            <strong>${storyGoalText(chapter)}</strong>
          </div>
          <div class="meter-line">
            <span>남은 레이스</span>
            <strong>${Math.max(0, balanceTargets.maxRacesPerChapter - run.racesInChapter)}</strong>
          </div>
          <div class="condition-card">
            <span>${escapeHtml(condition.label)}</span>
            <p>${escapeHtml(condition.description)}</p>
            <b>핵심 능력: ${escapeHtml(statLabel[condition.stat])}</b>
          </div>
          <p class="bark">${escapeHtml(bettingBarks[run.races % bettingBarks.length])}</p>
        </aside>
        <section class="horse-grid">
          ${horseRoster.map((horse) => renderHorseCard(horse, oddsMap.get(horse.id))).join("")}
        </section>
        <aside class="strategy-panel">
          <div class="strategy-head">
            <div>
              <span class="eyebrow">전략 카드</span>
              <h3>포커스 ${selectedCardCost()}/${balanceTargets.maxFocus}</h3>
            </div>
            <button class="ghost-btn" data-action="redraw">다시 뽑기</button>
          </div>
          <div class="strategy-hand">
            ${run.hand.map((cardId) => renderStrategyCard(cardById.get(cardId))).join("")}
          </div>
          <div class="bet-box">
            <label>
              <span>베팅 칩</span>
              <input type="range" min="${oddsConfig.minBet}" max="${Math.max(oddsConfig.minBet, maxBet)}" value="${run.bet}" data-action="bet-range" />
            </label>
            <input class="bet-input" type="number" min="${oddsConfig.minBet}" max="${Math.max(oddsConfig.minBet, maxBet)}" value="${run.bet}" data-action="bet-input" />
            <div class="preview-row">
              <span>선택: ${escapeHtml(chosenHorse.name)}</span>
              <strong>${(oddsMap.get(chosenHorse.id) * (1 + chosenImpact.payoutMultiplier)).toFixed(2)}배</strong>
            </div>
            <button class="primary-btn wide-btn" data-action="race" ${run.chips < oddsConfig.minBet ? "disabled" : ""}>레이스 시작</button>
          </div>
        </aside>
      </section>
    </main>
  `;
}

function renderHorseCard(horse, odds) {
  const run = state.run;
  const selected = run.selectedHorseId === horse.id;
  const impact = selected ? cardImpactForHorse(horse, odds) : null;
  const condition = currentCondition();
  return `
    <button class="horse-card ${selected ? "is-selected" : ""}" data-action="horse" data-id="${escapeHtml(horse.id)}">
      <div class="horse-top">
        <span class="horse-color" style="--horse-color: ${horse.color}"></span>
        <div>
          <strong>${escapeHtml(horse.name)}</strong>
          <small>${escapeHtml(horse.epithet)}</small>
        </div>
        <b>${odds.toFixed(2)}x</b>
      </div>
      <p>${escapeHtml(horse.profile)}</p>
      <div class="stat-bars">
        ${["start", "stamina", "sprint", "nerve"].map((stat) => `
          <span class="${condition.stat === stat ? "hot-stat" : ""}">
            ${escapeHtml(statLabel[stat])}
            <i style="--value:${horse[stat]}%"></i>
          </span>
        `).join("")}
      </div>
      ${impact ? `<em>카드 보정 +${Math.round(impact.score)} · 단서 +${impact.insight}</em>` : ""}
    </button>
  `;
}

function renderStrategyCard(card) {
  if (!card) {
    return "";
  }
  const selected = state.run.selectedCards.includes(card.id);
  const disabled = !selected && selectedCardCost() + card.cost > balanceTargets.maxFocus;
  return `
    <button class="strategy-card family-${escapeHtml(card.family)} ${selected ? "is-selected" : ""} ${disabled ? "is-disabled" : ""}" data-action="strategy" data-id="${escapeHtml(card.id)}">
      <span class="card-cost">${card.cost}</span>
      <strong>${escapeHtml(card.name)}</strong>
      <p>${escapeHtml(card.text)}</p>
      <small>${escapeHtml(familyLabel[card.family] || card.family)} · ${escapeHtml(rarityLabel[card.rarity] || card.rarity)}</small>
    </button>
  `;
}

function renderRace() {
  const race = state.race;
  const selectedHorse = horseById.get(race.selectedHorseId);
  const winner = horseById.get(race.winnerId);
  const topScore = Math.max(...race.entries.map((entry) => entry.score));
  return `
    <main class="screen race-screen">
      ${renderHud(race.meeting.title)}
      <section class="race-layout">
        <div class="race-track">
          ${race.entries.map((entry, index) => {
            const finish = clamp(48 + (entry.score / topScore) * 45 - index * 2, 42, 94);
            return `
              <div class="race-lane ${entry.horse.id === race.winnerId ? "is-winner" : ""}">
                <span>${index + 1}</span>
                <div class="horse-runner" style="--row-y:${entry.horse.spriteRow * 25}%; --finish:${finish}%"></div>
                <strong>${escapeHtml(entry.horse.name)}</strong>
                <b>${entry.score}</b>
              </div>
            `;
          }).join("")}
        </div>
        <aside class="race-result">
          <span class="eyebrow">${race.won ? "적중" : "아쉬운 결과"}</span>
          <h2>${escapeHtml(winner.name)} 우승</h2>
          <p>${escapeHtml(race.commentary)}</p>
          <div class="result-grid">
            <span>내 선택</span><strong>${escapeHtml(selectedHorse.name)}</strong>
            <span>베팅</span><strong>${race.stake}칩</strong>
            <span>배당</span><strong>${race.odds.toFixed(2)}배</strong>
            <span>${race.won ? "회수" : "환급"}</span><strong>${race.won ? race.payout : race.refund}칩</strong>
          </div>
          <button class="primary-btn wide-btn" data-action="race-continue">계속</button>
        </aside>
      </section>
    </main>
  `;
}

function renderReward() {
  const rewards = state.rewards || draftRewards();
  return `
    <main class="screen reward-screen">
      ${renderHud("보상 선택")}
      <section class="reward-shell">
        <span class="eyebrow">덱 강화</span>
        <h2>다음 장으로 가져갈 전략</h2>
        <div class="reward-grid">
          ${rewards.map((card) => `
            <button class="reward-card family-${escapeHtml(card.family)}" data-action="reward" data-id="${escapeHtml(card.id)}">
              <strong>${escapeHtml(card.name)}</strong>
              <p>${escapeHtml(card.text)}</p>
              <span>${escapeHtml(rarityLabel[card.rarity])}</span>
            </button>
          `).join("")}
          <button class="reward-card" data-action="reward" data-id="chips">
            <strong>취재비 확보</strong>
            <p>카드 대신 35칩을 얻고 다음 장으로 넘어갑니다.</p>
            <span>안전 보상</span>
          </button>
        </div>
      </section>
    </main>
  `;
}

function renderDeck() {
  const counts = state.run.deck.reduce((map, id) => {
    map.set(id, (map.get(id) || 0) + 1);
    return map;
  }, new Map());
  return `
    <main class="screen deck-screen">
      ${renderHud("전략 덱")}
      <section class="screen-header">
        <div>
          <span class="eyebrow">현재 덱</span>
          <h2>${state.run.deck.length}장의 전략 카드</h2>
        </div>
        <button class="primary-btn" data-action="${state.previousScreen === "race" ? "race" : "betting"}">돌아가기</button>
      </section>
      <section class="deck-grid">
        ${[...counts.entries()].map(([id, count]) => {
          const card = cardById.get(id);
          return `
            <article class="deck-card family-${escapeHtml(card.family)}">
              <span class="card-cost">${card.cost}</span>
              <strong>${escapeHtml(card.name)} × ${count}</strong>
              <p>${escapeHtml(card.text)}</p>
            </article>
          `;
        }).join("")}
      </section>
    </main>
  `;
}

function renderGallery() {
  return `
    <main class="screen gallery-screen">
      ${renderHud("엔딩 갤러리")}
      <section class="screen-header">
        <div>
          <span class="eyebrow">해금 기록</span>
          <h2>다시 볼 수 있는 새벽</h2>
        </div>
        <button class="primary-btn" data-action="title">타이틀</button>
      </section>
      <section class="gallery-grid">
        ${endings.map((ending) => {
          const unlocked = meta.endingsUnlocked.includes(ending.id);
          return `
            <article class="ending-card ${unlocked ? "is-unlocked" : ""}">
              <span>${unlocked ? "해금" : "잠김"}</span>
              <h3>${escapeHtml(unlocked ? ending.title : "????")}</h3>
              <p>${escapeHtml(unlocked ? ending.summary : "아직 이 결말의 페이지는 닫혀 있습니다.")}</p>
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
      ${renderHud("설정")}
      <section class="settings-shell">
        <span class="eyebrow">표시와 접근성</span>
        <h2>플레이 환경</h2>
        <label class="setting-line">
          <span>텍스트 크기</span>
          <select data-action="setting-text">
            ${["작게", "보통", "크게"].map((value) => `<option ${meta.settings.textSize === value ? "selected" : ""}>${value}</option>`).join("")}
          </select>
        </label>
        <label class="setting-line">
          <span>텍스트 속도</span>
          <select data-action="setting-speed">
            ${["느리게", "보통", "빠르게"].map((value) => `<option ${meta.settings.textSpeed === value ? "selected" : ""}>${value}</option>`).join("")}
          </select>
        </label>
        <label class="setting-line">
          <span>음량</span>
          <input type="range" min="0" max="100" value="${meta.settings.volume}" data-action="setting-volume" />
        </label>
        <label class="setting-line compact-line">
          <span>움직임 줄이기</span>
          <input type="checkbox" data-action="setting-motion" ${meta.settings.reducedMotion ? "checked" : ""} />
        </label>
        <button class="primary-btn" data-action="${state.run ? state.previousScreen || "betting" : "title"}">돌아가기</button>
      </section>
    </main>
  `;
}

function renderEnding() {
  const ending = state.ending || endings[0];
  return `
    <main class="screen ending-screen">
      ${renderHud("엔딩")}
      <section class="title-copy ending-copy">
        <span class="eyebrow">결말</span>
        <h1>${escapeHtml(ending.title)}</h1>
        <p class="subtitle">${escapeHtml(ending.summary)}</p>
        <div class="pill-row">
          <span class="pill">해금 ${meta.endingsUnlocked.length}/${endings.length}</span>
          <span class="pill">클리어 ${meta.clearedRuns}</span>
          ${state.run ? `<span class="pill">최종 칩 ${state.run.chips}</span>` : ""}
        </div>
        <div class="button-row title-actions">
          <button class="primary-btn" data-action="new">새 회차</button>
          <button class="secondary-btn" data-action="gallery">엔딩 갤러리</button>
          <button class="ghost-btn" data-action="title">타이틀</button>
        </div>
      </section>
    </main>
  `;
}

function renderCharacterSprite(characterId, className = "") {
  const character = characterById.get(characterId) || characters[0];
  return `<img class="character-sprite ${className}" src="${characterAssets[character.id]}" alt="${escapeHtml(character.name)}" />`;
}

function renderModal() {
  modalRoot.innerHTML = `
    ${state.menuOpen ? renderPauseMenu() : ""}
    ${state.toast ? `<div class="toast" role="status">${escapeHtml(state.toast)}</div>` : ""}
  `;
  bindActions(modalRoot);
}

function renderPauseMenu() {
  return `
    <div class="modal-backdrop">
      <section class="pause-menu">
        <span class="eyebrow">ESC 메뉴</span>
        <h2>잠시 숨 고르기</h2>
        <div class="menu-grid">
          <button class="primary-btn" data-action="continue">계속하기</button>
          <button class="secondary-btn" data-action="save">저장하기</button>
          <button class="secondary-btn" data-action="load">불러오기</button>
          ${state.run ? `<button class="secondary-btn" data-action="deck">전략 덱</button>` : ""}
          <button class="secondary-btn" data-action="settings">설정</button>
          <button class="ghost-btn" data-action="title">타이틀로</button>
        </div>
      </section>
    </div>
  `;
}

function bindActions(root = document) {
  root.querySelectorAll("[data-action]").forEach((element) => {
    const eventName = element.tagName === "SELECT" || element.type === "checkbox" || element.type === "range" || element.type === "number"
      ? "change"
      : "click";
    element.addEventListener(eventName, handleAction);
  });
}

function handleAction(event) {
  const target = event.currentTarget;
  const action = target.dataset.action;
  if (["new", "title", "gallery", "settings", "deck", "betting"].includes(action)) {
    state.menuOpen = false;
  }

  if (action === "new") setScreen("select");
  if (action === "title") setScreen("title");
  if (action === "start") startNewRun(target.dataset.character);
  if (action === "load") loadGame();
  if (action === "save") saveGame();
  if (action === "gallery") setScreen("gallery");
  if (action === "settings") setScreen("settings");
  if (action === "deck" && state.run) setScreen("deck");
  if (action === "betting" && state.run) setScreen("betting");
  if (action === "race" && state.race && state.screen === "deck") setScreen("race");
  if (action === "menu") {
    state.menuOpen = !state.menuOpen;
    renderModal();
  }
  if (action === "continue") {
    state.menuOpen = false;
    renderModal();
  }
  if (action === "tutorial-next") nextTutorial();
  if (action === "tutorial-skip") skipTutorial();
  if (action === "vn-advance") advanceVN();
  if (action === "vn-choice") chooseVNChoice(Number(target.dataset.index || 0));
  if (action === "horse") {
    state.run.selectedHorseId = target.dataset.id;
    render();
  }
  if (action === "strategy") toggleStrategyCard(target.dataset.id);
  if (action === "redraw") {
    state.run.hand = drawHand({ ...state.run, races: state.run.races + 1 });
    state.run.selectedCards = [];
    render();
  }
  if (action === "bet-range" || action === "bet-input") setBet(target.value);
  if (action === "race" && state.screen === "betting") startRace();
  if (action === "race-continue") continueAfterRace();
  if (action === "reward") chooseReward(target.dataset.id);
  if (action === "setting-text") {
    meta.settings.textSize = target.value;
    saveMeta();
    render();
  }
  if (action === "setting-speed") {
    meta.settings.textSpeed = target.value;
    saveMeta();
  }
  if (action === "setting-volume") {
    meta.settings.volume = Number(target.value);
    saveMeta();
  }
  if (action === "setting-motion") {
    meta.settings.reducedMotion = target.checked;
    saveMeta();
    render();
  }
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (state.screen !== "title" && state.screen !== "select") {
      state.menuOpen = !state.menuOpen;
      renderModal();
    }
    return;
  }
  if ((event.key === "Enter" || event.key === " ") && state.screen === "vn" && !state.menuOpen) {
    event.preventDefault();
    advanceVN();
  }
  if (/^[1-5]$/.test(event.key) && state.screen === "betting" && !state.menuOpen) {
    const cardId = state.run.hand[Number(event.key) - 1];
    if (cardId) {
      toggleStrategyCard(cardId);
    }
  }
});

syncSettings();
render();
