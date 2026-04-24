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

const SAVE_KEY = "card-cafe-loop-save-v2";
const META_KEY = "card-cafe-loop-meta-v2";

const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");
const cardById = new Map(cardCatalog.map((card) => [card.id, card]));
const characterById = new Map(characters.map((character) => [character.id, character]));
const routeById = contentMeta.routes;

const characterAssets = {
  hana: "./assets/characters/hana.png",
  sora: "./assets/characters/sora.png",
  riri: "./assets/characters/riri.png",
  mirae: "./assets/characters/mirae.png",
  jun: "./assets/characters/jun.png",
};

const routeNames = {
  sunny: "햇살 루트",
  ember: "새침 루트",
  neon: "네온 루트",
  stage: "무대 루트",
  archive: "기록 루트",
  team: "원탁 루트",
  solo: "솔로 루트",
  neutral: "루프",
};

const statLabel = {
  warmth: "온기",
  trust: "신뢰",
  sync: "싱크",
  charm: "매력",
  insight: "통찰",
};

const familyLabel = {
  charm: "매력",
  focus: "집중",
  wit: "기지",
  snack: "간식",
  synergy: "연계",
  risk: "승부",
};

const rarityLabel = {
  starter: "기본",
  common: "일반",
  uncommon: "희귀",
  rare: "전설",
};

const cardNameKo = {
  warm_wave: "따뜻한 손인사",
  quick_think: "번뜩이는 생각",
  steady_breath: "차분한 숨",
  granola_square: "그래놀라 한입",
  kind_nudge: "상냥한 넛지",
  bright_idea: "반짝 아이디어",
  tiny_dare: "작은 모험",
  compliment_combo: "칭찬 콤보",
  sparkly_intro: "반짝 등장",
  room_reader: "분위기 읽기",
  high_five_chain: "하이파이브 연쇄",
  sunny_story: "햇살 이야기",
  crowd_lift: "관객의 응원",
  standing_ovation: "기립박수",
  deep_breath: "깊은 호흡",
  tidy_notes: "정리된 노트",
  color_coded_plan: "색깔별 계획",
  quiet_corner: "조용한 구석",
  laser_pointer: "레이저 포인터",
  flow_state: "몰입 상태",
  perfect_poise: "완벽한 침착",
  punny_pivot: "말장난 전환",
  clever_callback: "재치 있는 회수",
  sideways_solution: "옆길 해법",
  question_mark: "물음표 작전",
  plot_twist: "반전 한 수",
  lightbulb_barrage: "전구 난사",
  mic_drop_math: "마이크 드롭 계산",
  berry_boost: "베리 부스트",
  trail_mix: "산책 간식",
  smoothie_break: "스무디 휴식",
  pocket_pretzels: "주머니 프레첼",
  soup_thermos: "수프 보온병",
  cake_slice_share: "케이크 나눔",
  legendary_leftovers: "전설의 남은 간식",
  buddy_system: "짝꿍 시스템",
  study_group: "스터디 모임",
  snack_and_chat: "간식과 수다",
  cross_train: "교차 훈련",
  friendship_bracelet: "우정 팔찌",
  three_part_harmony: "삼중 화음",
  team_montage: "팀 몽타주",
  bold_bet: "대담한 베팅",
  midnight_oil: "밤샘 집중",
  double_or_nothing: "두 배 승부",
  spotlight_jump: "스포트라이트 점프",
  pep_talk_overdrive: "응원 과부하",
  caffeinated_sprint: "카페인 질주",
  leap_of_logic: "논리의 도약",
  glitter_glue: "반짝 접착제",
  calendar_sticker: "달력 스티커",
  snappy_retort: "재빠른 받아치기",
  tea_refill: "차 리필",
  inside_joke: "우리만의 농담",
  secret_shortcut: "비밀 지름길",
};

const relicNameKo = {
  sunny_pin: "햇살 핀",
  quiet_headphones: "조용한 헤드폰",
  pencil_case: "필통",
  lucky_lunchbox: "행운 도시락",
  gold_star_sheet: "금별 스티커",
  tempo_sneakers: "템포 운동화",
  friendship_keychain: "우정 열쇠고리",
  safety_straw: "안전 빨대",
  confetti_cannon: "꽃가루 대포",
  planning_whiteboard: "계획 화이트보드",
  bottomless_thermos: "끝없는 보온병",
  sparkle_compass: "반짝 나침반",
};

const encounterNameKo = {
  weekend_warmup: "주말 워밍업",
  pop_quiz: "기습 퀴즈",
  club_fair: "동아리 박람회",
  group_project: "조별 과제",
  rainy_commute: "비 오는 등굣길",
  talent_show: "장기자랑",
  midterm_mountain: "중간고사 산",
  pep_rally: "응원 집회",
  finals_week: "기말 주간",
  big_showcase: "대형 쇼케이스",
  graduation_glow: "졸업의 반짝임",
};

const encounterTextKo = {
  weekend_warmup: "가볍게 몸을 푸는 첫 결투.",
  pop_quiz: "빠른 질문에는 더 빠른 미소로.",
  club_fair: "선택지가 많을수록 덱도 흔들린다.",
  group_project: "호흡이 맞아야 이긴다.",
  rainy_commute: "물웅덩이보다 기분이 먼저다.",
  talent_show: "중반부의 큰 목소리 테스트.",
  midterm_mountain: "간식 없이는 오르기 힘든 산.",
  pep_rally: "열기는 높고 실수도 커진다.",
  finals_week: "밝지만 진지한 마지막 시험.",
  big_showcase: "덱이 배운 모든 것을 무대에 올린다.",
  graduation_glow: "축제처럼 시작되는 최종 결투.",
};

const tutorialSteps = [
  {
    title: "첫 장을 뒤집기 전에",
    body: "이 게임은 대화 선택으로 인연을 쌓고, 전투에서는 손패의 카드를 사용해 상대를 설득하는 미연시 덱빌딩 로그라이크입니다.",
  },
  {
    title: "카드와 에너지",
    body: "카드 왼쪽 위의 숫자가 비용입니다. 매 턴 에너지가 회복되고, 비용 안에서 카드를 여러 장 사용할 수 있습니다.",
  },
  {
    title: "방어와 턴 종료",
    body: "방어가 높을수록 상대의 반격 피해를 줄입니다. 더 쓸 카드가 없으면 턴 종료를 눌러 다음 손패를 받습니다.",
  },
  {
    title: "인연과 엔딩",
    body: "대화 선택은 동료의 인연 수치에 쌓입니다. 어떤 동료와 어떤 덱을 만들었는지에 따라 엔딩이 달라집니다.",
  },
];

const meta = loadMeta();
const state = {
  screen: "title",
  previousScreen: "title",
  run: null,
  reward: null,
  shop: null,
  ending: null,
  menuOpen: false,
  toast: "",
  fx: null,
};

function loadMeta() {
  const fallback = {
    endingsUnlocked: [],
    clearedRuns: 0,
    failedBoss: false,
    memories: 0,
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
    toast("저장할 회차가 없습니다.");
    return;
  }
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      version: 2,
      screen: state.screen,
      run: state.run,
      reward: state.reward,
      shop: state.shop,
      ending: state.ending,
      savedAt: new Date().toISOString(),
    }),
  );
  toast("진행을 저장했습니다.");
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem("card-cafe-loop-save-v1");
  if (!raw) {
    toast("저장 데이터가 없습니다.");
    return;
  }
  try {
    const loaded = JSON.parse(raw);
    state.run = normalizeRun(loaded.run);
    state.reward = loaded.reward || null;
    state.shop = loaded.shop || null;
    state.ending = loaded.ending || null;
    state.screen = loaded.screen || "map";
    state.menuOpen = false;
    render();
    toast("이어하기를 불러왔습니다.");
  } catch {
    toast("저장 데이터를 읽지 못했습니다.");
  }
}

function normalizeRun(run) {
  if (!run) {
    return createRun("hana");
  }
  return {
    ...createRun(run.characterId || "hana"),
    ...run,
    affinity: run.affinity || createRun(run.characterId || "hana").affinity,
    deck: Array.isArray(run.deck) ? run.deck.filter((id) => cardById.has(id)) : [...starterDeckIds],
    relics: Array.isArray(run.relics) ? run.relics.filter((id) => relicCatalog.some((relic) => relic.id === id)) : [],
    log: Array.isArray(run.log) ? run.log : ["저장 데이터를 복구했습니다."],
  };
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

function syncSettings() {
  document.documentElement.dataset.textSize = meta.settings.textSize;
  document.documentElement.dataset.reducedMotion = meta.settings.reducedMotion ? "true" : "false";
}

function currentWeek() {
  return levelCurve[state.run.weekIndex] || levelCurve[levelCurve.length - 1];
}

function selectedCharacter() {
  return characterById.get(state.run?.characterId) || characters[0];
}

function characterSprite(characterId, className = "") {
  const character = characterById.get(characterId) || characters[0];
  return `<img class="character-sprite ${className}" src="${characterAssets[character.id]}" alt="${escapeHtml(character.name)}" />`;
}

function cardArtPosition(cardId) {
  let value = 0;
  for (let index = 0; index < cardId.length; index += 1) {
    value = (value << 5) - value + cardId.charCodeAt(index);
    value |= 0;
  }
  const cardIndex = Math.abs(value) % 16;
  const x = (cardIndex % 4) * 33.333;
  const y = Math.floor(cardIndex / 4) * 33.333;
  return `--art-x: ${x}%; --art-y: ${y}%;`;
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
    tutorialStep: 0,
    tutorialDone: meta.tutorialSeen,
    battle: null,
    log: ["새 회차가 시작되었습니다."],
  };
}

function startNewRun(characterId) {
  state.run = createRun(characterId);
  state.reward = null;
  state.shop = null;
  state.ending = null;
  setScreen(meta.tutorialSeen ? "vn" : "tutorial");
  if (meta.tutorialSeen) {
    state.run.vnMode = "intro";
  }
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

function localizeText(text) {
  return String(text)
    .replaceAll("warmth", "온기")
    .replaceAll("trust", "신뢰")
    .replaceAll("sync", "싱크")
    .replaceAll("insight", "통찰")
    .replaceAll("charm", "매력")
    .replaceAll("route", "루트")
    .replaceAll("flag", "플래그");
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
    createReward(state.run.lastBattleType || "battle");
    return;
  }
  if (mode === "rest") {
    state.run.hp = clamp(state.run.hp + 22 + relicValue("restHeal"), 1, state.run.maxHp);
    removeWeakStarter();
    progressNode("휴식과 덱 정리를 마쳤습니다.");
    return;
  }
  if (mode === "event") {
    const candidates = cardCatalog.filter((card) => card.rarity === "common" && card.family !== "risk");
    const picked = sample(candidates);
    state.run.deck.push(picked.id);
    progressNode(`${displayCardName(picked)} 카드를 얻었습니다.`);
    return;
  }
  setScreen("map");
}

function nextTutorial() {
  state.run.tutorialStep += 1;
  if (state.run.tutorialStep >= tutorialSteps.length) {
    state.run.tutorialDone = true;
    meta.tutorialSeen = true;
    saveMeta();
    showVN("intro");
    return;
  }
  render();
}

function skipTutorial() {
  state.run.tutorialDone = true;
  meta.tutorialSeen = true;
  saveMeta();
  showVN("intro");
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

function removeWeakStarter() {
  const index = state.run.deck.findIndex((id) => ["warm_wave", "quick_think", "steady_breath"].includes(id));
  if (index >= 0 && state.run.deck.length > 8) {
    const [removed] = state.run.deck.splice(index, 1);
    state.run.log.unshift(`${displayCardName(cardById.get(removed))}를 덱에서 정리했습니다.`);
  }
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

function availableNodes() {
  const week = currentWeek();
  const bossReady = week.boss && state.run.nodeIndex >= week.encounters - 1;
  if (bossReady) {
    return [{ type: "boss", title: "피날레 결투", risk: "높음", reward: "엔딩 분기" }];
  }
  return [
    { type: week.elite && state.run.nodeIndex === 0 ? "elite" : "battle", title: week.elite && state.run.nodeIndex === 0 ? "엘리트 결투" : "카드 결투", risk: week.elite ? "중상" : "보통", reward: "카드 보상" },
    { type: "event", title: "대화 이벤트", risk: "낮음", reward: "인연과 카드" },
    { type: week.rest ? "rest" : "shop", title: week.rest ? "휴식 라운지" : "반짝 상점", risk: "안전", reward: week.rest ? "회복과 제거" : "구매 선택" },
  ];
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
    createShop();
    return;
  }
  startBattle(type);
}

function createShop() {
  state.shop = {
    cards: draftCards(3),
    relic: draftRelic(),
  };
  setScreen("shop");
}

function buyShop(kind, id) {
  if (kind === "card") {
    if (state.run.gold < 14) {
      toast("골드가 부족합니다.");
      return;
    }
    state.run.gold -= 14;
    state.run.deck.push(id);
    state.run.log.unshift(`${displayCardName(cardById.get(id))}를 구매했습니다.`);
  }
  if (kind === "relic") {
    if (state.run.gold < 22) {
      toast("골드가 부족합니다.");
      return;
    }
    state.run.gold -= 22;
    addRelic(id);
  }
  if (kind === "remove") {
    if (state.run.gold < 10) {
      toast("골드가 부족합니다.");
      return;
    }
    state.run.gold -= 10;
    removeWeakStarter();
  }
  state.shop = null;
  progressNode("상점에서 덱을 다듬었습니다.");
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
    log: [`${displayEncounterName(encounter)} 등장!`],
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
  battle.playedFamilies = [];
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
  const outputBase =
    (effect.charm || 0) * relicMultiplier("charmMultiplier") +
    (effect.wit || 0) * relicMultiplier("witMultiplier") +
    (effect.focus || 0) * 0.82 * relicMultiplier("focusMultiplier");
  const comboBonus = battle.playedFamilies.includes(card.family) ? effect.combo || 0 : Math.ceil((effect.combo || 0) / 2);
  const variance = effect.variance ? Math.round(effect.variance * (Math.random() - 0.35)) : 0;
  const momentumBonus = Math.floor(battle.momentum * 0.18);
  const damage = Math.max(0, Math.round(outputBase + comboBonus + momentumBonus + variance));
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

  const parts = [];
  if (damage) parts.push(`설득 ${damage}`);
  if (guardGain) parts.push(`방어 ${guardGain}`);
  if (healGain) parts.push(`회복 ${healGain}`);
  if (selfDamage) parts.push(`무리 ${selfDamage}`);
  battle.log.unshift(`${displayCardName(card)}: ${parts.join(" / ") || "흐름 정리"}`);
  state.fx = {
    key: `${Date.now()}-${Math.random()}`,
    text: damage ? `-${damage}` : healGain ? `+${healGain}` : `+${guardGain}`,
    type: damage ? "hit" : healGain ? "heal" : "guard",
  };

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
  battle.log.unshift(`${displayEncounterName(battle.encounter)}의 반격: ${incoming} 피해`);
  state.fx = {
    key: `${Date.now()}-${Math.random()}`,
    text: incoming ? `-${incoming}` : "막음",
    type: incoming ? "danger" : "guard",
  };
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

function createReward(source = "battle") {
  const battleType = source;
  state.reward = {
    cards: draftCards(3),
    relic: battleType === "elite" || battleType === "boss" || Math.random() < 0.26 ? draftRelic() : null,
    heal: 8,
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
  return unowned.length ? sample(unowned) : null;
}

function chooseReward(kind, id) {
  if (kind === "card" && id) {
    state.run.deck.push(id);
    state.run.log.unshift(`${displayCardName(cardById.get(id))}를 덱에 추가했습니다.`);
  }
  if (kind === "relic" && id) {
    addRelic(id);
  }
  if (kind === "heal") {
    state.run.hp = clamp(state.run.hp + (state.reward?.heal || 8), 1, state.run.maxHp);
    state.run.log.unshift("달콤한 휴식으로 체력을 회복했습니다.");
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
  state.run.log.unshift(`${displayRelicName(relic)}을 얻었습니다.`);
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

function displayCardName(card) {
  return cardNameKo[card?.id] || `${familyLabel[card?.family] || "반짝"} 카드`;
}

function displayCardText(card) {
  const effect = card?.effects || {};
  const parts = [];
  if (effect.charm) parts.push(`설득 ${effect.charm}`);
  if (effect.wit) parts.push(`기지 ${effect.wit}`);
  if (effect.focus) parts.push(`집중 ${effect.focus}`);
  if (effect.guard) parts.push(`방어 ${effect.guard}`);
  if (effect.heal) parts.push(`회복 ${effect.heal}`);
  if (effect.draw) parts.push(`드로우 ${effect.draw}`);
  if (effect.tempo) parts.push(`템포 ${effect.tempo}`);
  if (effect.combo) parts.push(`콤보 보너스`);
  if (effect.selfDamage) parts.push(`무리 ${effect.selfDamage}`);
  return parts.join(" · ") || "특수 효과";
}

function displayRelicName(relic) {
  return relicNameKo[relic?.id] || "반짝 유물";
}

function displayRelicText(relic) {
  const effects = relic?.effects || {};
  const parts = [];
  if (effects.charmMultiplier) parts.push("매력 카드 강화");
  if (effects.witMultiplier) parts.push("기지 카드 강화");
  if (effects.focusMultiplier) parts.push("집중 카드 강화");
  if (effects.guardMultiplier) parts.push("방어 강화");
  if (effects.healMultiplier) parts.push("회복 강화");
  if (effects.rewardQuality) parts.push("보상 품질 상승");
  if (effects.tempoBonus) parts.push("전투 시작 템포");
  if (effects.comboMultiplier) parts.push("콤보 강화");
  if (effects.riskMitigation) parts.push("무리 피해 감소");
  if (effects.openingBurst) parts.push("시작 설득 피해");
  if (effects.maxHp) parts.push(`최대 체력 +${effects.maxHp}`);
  if (effects.restHeal) parts.push("휴식 회복 증가");
  if (effects.drawQuality) parts.push("손패 안정화");
  return parts.join(" · ") || "회차를 돕는 유물";
}

function displayEncounterName(encounter) {
  return encounterNameKo[encounter?.id] || encounter?.name || "반짝 도전";
}

function displayEncounterText(encounter) {
  return encounterTextKo[encounter?.id] || encounter?.text || "카드를 믿고 흐름을 잡자.";
}

function render() {
  syncSettings();
  const renderer = {
    title: renderTitle,
    select: renderSelect,
    tutorial: renderTutorial,
    vn: renderVN,
    map: renderMap,
    battle: renderBattle,
    reward: renderReward,
    shop: renderShop,
    deck: renderDeck,
    gallery: renderGallery,
    settings: renderSettings,
    ending: renderEnding,
  }[state.screen] || renderTitle;
  app.innerHTML = renderer();
  bindActions();
  renderModal();
}

function renderHud(title = "카드 카페 루프") {
  const canOpenMenu = state.screen !== "title" && state.screen !== "select";
  return `
    <header class="game-hud">
      <div class="hud-title">
        <span class="diamond-mark"></span>
        <strong>${escapeHtml(title)}</strong>
      </div>
      <nav class="hud-actions" aria-label="빠른 메뉴">
        ${state.run ? `<button class="icon-btn" data-action="deck" aria-label="덱">D</button>` : ""}
        ${state.run ? `<button class="icon-btn" data-action="save" aria-label="저장">S</button>` : ""}
        ${canOpenMenu ? `<button class="icon-btn" data-action="menu" aria-label="메뉴">≡</button>` : ""}
      </nav>
    </header>
  `;
}

function renderTitle() {
  const hasSave = Boolean(localStorage.getItem(SAVE_KEY) || localStorage.getItem("card-cafe-loop-save-v1"));
  const minutes = levelCurve.reduce((sum, week) => sum + week.estimatedMinutes, 0);
  return `
    <main class="screen title-screen">
      ${renderHud()}
      <section class="title-copy">
        <span class="eyebrow">비주얼 노벨 덱빌딩 로그라이크</span>
        <h1>카드 카페 루프</h1>
        <p class="subtitle">캐릭터와 대화하고, 카드를 섞고, 매주 다른 결말을 향해 가는 밝은 로맨스 로그라이크.</p>
        <div class="button-row title-actions">
          <button class="primary-btn" data-action="new">새 게임</button>
          <button class="secondary-btn" data-action="load" ${hasSave ? "" : "disabled"}>이어하기</button>
          <button class="secondary-btn" data-action="gallery">엔딩 갤러리</button>
          <button class="ghost-btn" data-action="settings">설정</button>
        </div>
      </section>
      <footer class="footer-strip">
        <span>캐릭터 ${characters.length}명 · 엔딩 ${endings.length}종 · 풀런 ${minutes}분</span>
        <span>UI 재개발 빌드</span>
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
          <h2>오늘의 카드를 함께 뒤집을 동료</h2>
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
      <div class="character-stage">${characterSprite(character.id, "card-sprite")}</div>
      <div class="character-info">
        <span class="tag">${escapeHtml(routeNames[character.route] || character.route)}</span>
        <h3>${escapeHtml(character.name)} · ${character.age}</h3>
        <p>${escapeHtml(character.bio)}</p>
        <div class="mini-stat">
          <span>${escapeHtml(statLabel[stat] || stat)}</span>
          <b>0</b>
        </div>
        <button class="primary-btn" data-action="start" data-character="${escapeHtml(character.id)}">이 동료와 시작</button>
      </div>
    </article>
  `;
}

function renderTutorial() {
  const step = tutorialSteps[state.run.tutorialStep] || tutorialSteps[0];
  const character = selectedCharacter();
  return `
    <main class="screen vn-screen">
      ${renderHud("튜토리얼")}
      <div class="vn-stage">
        ${characterSprite(character.id, "vn-sprite")}
        <section class="tutorial-card">
          <span class="eyebrow">튜토리얼 ${state.run.tutorialStep + 1}/${tutorialSteps.length}</span>
          <h2>${escapeHtml(step.title)}</h2>
          <p>${escapeHtml(step.body)}</p>
          <div class="button-row">
            <button class="primary-btn" data-action="tutorial-next">${state.run.tutorialStep + 1 >= tutorialSteps.length ? "모험 시작" : "다음"}</button>
            <button class="ghost-btn" data-action="tutorial-skip">건너뛰기</button>
          </div>
        </section>
      </div>
    </main>
  `;
}

function renderVN() {
  const mode = state.run.vnMode || "intro";
  const story = getStoryPage(mode);
  const dialogue = getDialoguePage(mode);
  const speaker = characterById.get(dialogue.speakerId) || selectedCharacter();
  const choices = story.choices?.length ? story.choices : [{ label: "계속" }, { label: "미소 짓기" }];
  return `
    <main class="screen vn-screen">
      ${renderHud(story.title)}
      <div class="vn-stage">
        ${characterSprite(speaker.id, "vn-sprite")}
        <aside class="choice-stack">
          ${choices.slice(0, 3).map((choice, index) => `
            <button class="choice-card" data-action="vn-choice" data-index="${index}">
              <span>${index + 1}</span>
              ${escapeHtml(choice.label)}
            </button>
          `).join("")}
        </aside>
        <section class="dialogue-panel">
          <div class="nameplate">${escapeHtml(speaker.name)}</div>
          <p>${escapeHtml(localizeText(story.text))}</p>
          <p class="speaker-line">${escapeHtml(localizeText(dialogue.line))}</p>
          <button class="advance-chip" data-action="vn-choice" data-index="0" aria-label="진행">⌄</button>
        </section>
      </div>
    </main>
  `;
}

function renderMap() {
  const run = state.run;
  const week = currentWeek();
  const character = selectedCharacter();
  const routeStat = character.affinityHooks.stat;
  const progress = Math.round(((run.weekIndex + run.nodeIndex / week.encounters) / levelCurve.length) * 100);
  const nodes = availableNodes();
  return `
    <main class="screen map-screen">
      ${renderHud("주간 루트 맵")}
      <section class="map-shell">
        <div class="map-board">
          <div class="route-ribbon">
            <span>${week.act} · ${week.week}주차</span>
            <strong>${escapeHtml(week.title)}</strong>
            <div class="progress-track"><div class="progress-fill" style="--value: ${progress}%"></div></div>
          </div>
          <div class="node-graph">
            ${nodes.map((node, index) => `
              <button class="route-node route-${node.type}" data-action="node" data-type="${node.type}" style="--delay: ${index * 90}ms">
                <span class="node-icon">${nodeIcon(node.type)}</span>
                <strong>${escapeHtml(node.title)}</strong>
                <small>위험 ${escapeHtml(node.risk)} · ${escapeHtml(node.reward)}</small>
              </button>
            `).join("")}
          </div>
        </div>
        <aside class="map-sidebar">
          <section class="side-panel companion-panel">
            ${characterSprite(character.id, "mini-sprite")}
            <div>
              <span class="eyebrow">${escapeHtml(routeNames[character.route] || character.route)}</span>
              <h3>${escapeHtml(character.name)}</h3>
              <p>${escapeHtml(statLabel[routeStat] || routeStat)} ${run.affinity[character.id]?.[routeStat] || 0}</p>
            </div>
          </section>
          <section class="side-panel">
            <h3>회차 상태</h3>
            <div class="pill-row">
              <span class="pill">체력 ${run.hp}/${run.maxHp}</span>
              <span class="pill">골드 ${run.gold}</span>
              <span class="pill">승리 ${run.fightsWon}</span>
            </div>
          </section>
          <section class="side-panel">
            <h3>최근 기록</h3>
            <p class="small-copy">${escapeHtml(run.log.slice(0, 4).join(" · "))}</p>
          </section>
        </aside>
      </section>
    </main>
  `;
}

function nodeIcon(type) {
  return {
    battle: "B",
    elite: "E",
    boss: "X",
    event: "?",
    rest: "R",
    shop: "$",
  }[type] || "?";
}

function renderBattle() {
  const run = state.run;
  const battle = run.battle;
  const enemy = battle.encounter;
  const enemyProgress = Math.round((enemy.hp / enemy.maxHp) * 100);
  const hpProgress = Math.round((run.hp / run.maxHp) * 100);
  return `
    <main class="screen battle-screen">
      ${renderHud("카드 결투")}
      <section class="battle-shell">
        <div class="enemy-zone">
          <div class="enemy-card">
            <span class="eyebrow">${enemy.type === "boss" ? "보스" : enemy.type === "elite" ? "엘리트" : "결투"}</span>
            <h2>${escapeHtml(displayEncounterName(enemy))}</h2>
            <div class="progress-track"><div class="progress-fill danger-fill" style="--value: ${enemyProgress}%"></div></div>
            <p>${enemy.hp}/${enemy.maxHp} · 의도: 반격 ${enemy.attack}</p>
            <small>${escapeHtml(displayEncounterText(enemy))}</small>
          </div>
          ${state.fx ? `<div class="float-fx fx-${state.fx.type}" key="${state.fx.key}">${escapeHtml(state.fx.text)}</div>` : ""}
        </div>
        <aside class="battle-status">
          <div class="status-orb"><span>체력</span><b>${run.hp}/${run.maxHp}</b></div>
          <div class="progress-track"><div class="progress-fill" style="--value: ${hpProgress}%"></div></div>
          <div class="pill-row">
            <span class="pill">에너지 ${battle.energy}</span>
            <span class="pill">방어 ${battle.guard}</span>
            <span class="pill">템포 ${battle.momentum}</span>
          </div>
          <div class="pile-row">
            <span>드로우 ${battle.drawPile.length}</span>
            <span>버림 ${battle.discardPile.length}</span>
          </div>
          <div class="combat-log" aria-live="polite">
            ${battle.log.slice(0, 6).map((line) => `<div>${escapeHtml(line)}</div>`).join("")}
          </div>
        </aside>
        ${!run.tutorialDone ? `<section class="battle-tip">카드를 누르면 즉시 사용됩니다. 에너지가 부족하면 사용할 수 없습니다.</section>` : ""}
        <div class="hand-zone">
          ${battle.hand.map((cardId, index) => renderBattleCard(cardById.get(cardId), index, battle.energy)).join("")}
          <button class="end-turn-btn" data-action="end-turn">턴 종료</button>
        </div>
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
    <button class="battle-card family-${escapeHtml(card.family)} ${disabled ? "is-disabled" : ""}" data-action="play-card" data-index="${index}" aria-label="${escapeHtml(displayCardName(card))}">
      <div class="card-cost">${card.cost}</div>
      <div class="card-art" style="${cardArtPosition(card.id)}"></div>
      <strong>${escapeHtml(displayCardName(card))}</strong>
      <p>${escapeHtml(displayCardText(card))}</p>
      <span>${escapeHtml(familyLabel[card.family] || card.family)} · ${escapeHtml(rarityLabel[card.rarity] || card.rarity)}</span>
    </button>
  `;
}

function renderReward() {
  const reward = state.reward || { cards: [], relic: null, heal: 8 };
  return `
    <main class="screen battle-screen">
      ${renderHud("보상")}
      <section class="reward-shell">
        <span class="eyebrow">보상 선택</span>
        <h2>이번 루프에 섞을 선물</h2>
        <div class="reward-grid">
          ${reward.cards.map((card) => `
            <button class="reward-card" data-action="reward" data-kind="card" data-id="${escapeHtml(card.id)}">
              <div class="card-art" style="${cardArtPosition(card.id)}"></div>
              <strong>${escapeHtml(displayCardName(card))}</strong>
              <p>${escapeHtml(displayCardText(card))}</p>
            </button>
          `).join("")}
          ${reward.relic ? `
            <button class="reward-card relic-reward" data-action="reward" data-kind="relic" data-id="${escapeHtml(reward.relic.id)}">
              <strong>${escapeHtml(displayRelicName(reward.relic))}</strong>
              <p>${escapeHtml(displayRelicText(reward.relic))}</p>
            </button>
          ` : ""}
          <button class="reward-card" data-action="reward" data-kind="heal" data-id="">
            <strong>달콤한 휴식</strong>
            <p>체력을 ${reward.heal} 회복합니다.</p>
          </button>
        </div>
      </section>
    </main>
  `;
}

function renderShop() {
  const shop = state.shop || { cards: draftCards(3), relic: draftRelic() };
  return `
    <main class="screen map-screen">
      ${renderHud("반짝 상점")}
      <section class="reward-shell">
        <span class="eyebrow">상점 · 보유 골드 ${state.run.gold}</span>
        <h2>이번 주 덱을 다듬기</h2>
        <div class="reward-grid">
          ${shop.cards.map((card) => `
            <button class="reward-card" data-action="shop-buy" data-kind="card" data-id="${escapeHtml(card.id)}">
              <div class="card-art" style="${cardArtPosition(card.id)}"></div>
              <strong>${escapeHtml(displayCardName(card))}</strong>
              <p>${escapeHtml(displayCardText(card))}</p>
              <span>14 골드</span>
            </button>
          `).join("")}
          ${shop.relic ? `
            <button class="reward-card relic-reward" data-action="shop-buy" data-kind="relic" data-id="${escapeHtml(shop.relic.id)}">
              <strong>${escapeHtml(displayRelicName(shop.relic))}</strong>
              <p>${escapeHtml(displayRelicText(shop.relic))}</p>
              <span>22 골드</span>
            </button>
          ` : ""}
          <button class="reward-card" data-action="shop-buy" data-kind="remove" data-id="">
            <strong>기본 카드 정리</strong>
            <p>덱에서 약한 기본 카드 1장을 제거합니다.</p>
            <span>10 골드</span>
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
      ${renderHud("덱")}
      <section class="screen-header">
        <div>
          <span class="eyebrow">현재 덱</span>
          <h2>${state.run.deck.length}장의 루프 덱</h2>
        </div>
        <button class="primary-btn" data-action="map">지도</button>
      </section>
      <section class="deck-grid">
        ${[...counts.entries()].map(([id, count]) => {
          const card = cardById.get(id);
          return `
            <article class="deck-card family-${escapeHtml(card.family)}">
              <div class="card-art" style="${cardArtPosition(card.id)}"></div>
              <strong>${escapeHtml(displayCardName(card))} × ${count}</strong>
              <p>${escapeHtml(displayCardText(card))}</p>
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
          <h2>다시 볼 수 있는 결말</h2>
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
        <span class="eyebrow">표시와 소리</span>
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
        <label class="setting-line">
          <span>움직임 줄이기</span>
          <input type="checkbox" data-action="setting-motion" ${meta.settings.reducedMotion ? "checked" : ""} />
        </label>
        <button class="primary-btn" data-action="${state.run ? "map" : "title"}">돌아가기</button>
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

function bindActions() {
  document.querySelectorAll("[data-action]").forEach((element) => {
    if (element.tagName === "SELECT" || element.type === "checkbox" || element.type === "range") {
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
  if (action === "title") setScreen("title");
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
  if (action === "tutorial-next") nextTutorial();
  if (action === "tutorial-skip") skipTutorial();
  if (action === "vn-choice") chooseVN(Number(target.dataset.index || 0));
  if (action === "node") selectNode(target.dataset.type);
  if (action === "play-card") playCard(Number(target.dataset.index || 0));
  if (action === "end-turn") endTurn();
  if (action === "reward") chooseReward(target.dataset.kind, target.dataset.id);
  if (action === "shop-buy") buyShop(target.dataset.kind, target.dataset.id);
  if (action === "setting-text") {
    meta.settings.textSize = target.value;
    saveMeta();
    render();
  }
  if (action === "setting-speed") {
    meta.settings.textSpeed = target.value;
    saveMeta();
    toast("텍스트 속도를 저장했습니다.");
  }
  if (action === "setting-volume") {
    meta.settings.volume = Number(target.value);
    saveMeta();
    toast("음량을 저장했습니다.");
  }
  if (action === "setting-motion") {
    meta.settings.reducedMotion = target.checked;
    saveMeta();
    render();
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
        <span class="eyebrow">일시정지</span>
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
  if (state.screen === "battle" && event.key.toLowerCase() === "r") {
    toast("선택을 초기화했습니다.");
  }
  if (state.screen === "vn" && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    chooseVN(0);
  }
});

render();
