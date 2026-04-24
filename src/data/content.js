const routes = {
  sunny: {
    title: "햇살 루트",
    tags: ["cheer", "comfort", "picnic"],
    affinityStat: "warmth",
  },
  ember: {
    title: "새침 루트",
    tags: ["rivalry", "honesty", "spark"],
    affinityStat: "trust",
  },
  neon: {
    title: "네온 루트",
    tags: ["music", "internet", "momentum"],
    affinityStat: "sync",
  },
  stage: {
    title: "무대 루트",
    tags: ["comedy", "performance", "bravery"],
    affinityStat: "charm",
  },
  archive: {
    title: "기록 루트",
    tags: ["mystery", "care", "memory"],
    affinityStat: "insight",
  },
};

export const characters = [
  {
    id: "hana",
    name: "유하나",
    age: 24,
    pronouns: "she/her",
    archetype: "curvy cheerful airhead",
    route: "sunny",
    tags: ["adult", "romance", "cheerful", "airhead", "foodie"],
    affinityHooks: {
      likes: ["상냥한 농담", "달콤한 디저트", "실수해도 웃어넘기기"],
      dislikes: ["차가운 무시", "배고픈 채로 던전 입장"],
      stat: "warmth",
      cardRewards: ["허니 응원", "폭신한 휴식", "도넛 방패"],
    },
    bio:
      "언제나 반짝이는 기분으로 팀을 데우는 성인 카페 매니저. 자주 길을 잘못 들지만, 이상하게도 가장 좋은 보물방 앞에서 멈춘다.",
  },
  {
    id: "sora",
    name: "강소라",
    age: 22,
    pronouns: "she/her",
    archetype: "tsundere rival",
    route: "ember",
    tags: ["adult", "romance", "tsundere", "strategy", "rival"],
    affinityHooks: {
      likes: ["정면 승부", "정확한 칭찬", "말보다 행동"],
      dislikes: ["대충 넘기기", "놀림만 하는 선택지"],
      stat: "trust",
      cardRewards: ["새침 반격", "불꽃 선언", "몰래 챙긴 물약"],
    },
    bio:
      "날카로운 말투의 전직 카드 리그 선수. 관심 없는 척하면서도 플레이어의 덱을 가장 먼저 정리해 준다.",
  },
  {
    id: "riri",
    name: "리리 앰프",
    age: 19,
    pronouns: "she/her",
    archetype: "twin-drill energetic internet music idol",
    route: "neon",
    tags: ["adult", "romance", "twin-drill", "internet-music", "energetic"],
    affinityHooks: {
      likes: ["밈 감각", "즉흥 비트", "팬 채팅에 답장하기"],
      dislikes: ["저작권 무시", "무대 위 침묵"],
      stat: "sync",
      cardRewards: ["트윈드릴 템포", "댓글 폭죽", "루프 샘플러"],
    },
    bio:
      "양갈래 드릴 머리와 번쩍이는 헤드셋이 트레이드마크인 성인 인터넷 음악 크리에이터. 모든 위기를 후렴구로 바꾸려 한다.",
  },
  {
    id: "mirae",
    name: "백미래",
    age: 27,
    pronouns: "she/her",
    archetype: "deadpan stage magician",
    route: "stage",
    tags: ["adult", "romance", "deadpan", "magician", "comedy"],
    affinityHooks: {
      likes: ["진지한 리액션", "허술한 변장", "박수 타이밍"],
      dislikes: ["비밀 장치 들추기", "관객을 무시하기"],
      stat: "charm",
      cardRewards: ["모자 속 탈출", "무표정 앙코르", "꽃비 페인트"],
    },
    bio:
      "무표정으로 가장 웃긴 순간을 만드는 성인 마술사. 로맨스도 트릭처럼 은근히, 하지만 정직하게 준비한다.",
  },
  {
    id: "jun",
    name: "오준",
    age: 25,
    pronouns: "he/him",
    archetype: "romantic archivist with chaotic luck",
    route: "archive",
    tags: ["adult", "romance", "bookish", "clumsy", "support"],
    affinityHooks: {
      likes: ["기록 남기기", "잃어버린 물건 찾기", "조용한 배려"],
      dislikes: ["약속 잊기", "책갈피 접기"],
      stat: "insight",
      cardRewards: ["각주 고백", "행운의 영수증", "도서관 소나기"],
    },
    bio:
      "던전의 기록을 모으는 성인 사서. 넘어질 때마다 단서를 주워 오고, 마음을 고백할 때는 꼭 색인을 붙인다.",
  },
];

const acts = [
  {
    id: "act1",
    title: "프롤로그: 반짝 카드 카페",
    goal: "첫 덱을 고르고 동료의 취향을 파악한다.",
    locations: ["카페 앞 광장", "튜토리얼 던전", "노을빛 정류장"],
    stakes: "카페가 사라지기 전에 웃음 에너지를 모아야 한다.",
  },
  {
    id: "act2",
    title: "1막: 설탕비 미궁",
    goal: "약한 카드를 조합해 첫 콤보를 완성한다.",
    locations: ["마카롱 계단", "빙글빙글 분수", "쿠폰 보관소"],
    stakes: "잘못 고른 카드는 달콤하지만 손패를 무겁게 만든다.",
  },
  {
    id: "act3",
    title: "2막: 새벽 네온 서버",
    goal: "리듬 이벤트와 대화 선택지로 루트 태그를 강화한다.",
    locations: ["업로드 광장", "댓글 구름다리", "라이브 룸"],
    stakes: "가짜 소문이 퍼지기 전에 진짜 마음을 전해야 한다.",
  },
  {
    id: "act4",
    title: "3막: 고백 전야제",
    goal: "강화한 덱으로 보스전과 데이트 이벤트를 동시에 준비한다.",
    locations: ["불꽃 시장", "비밀 리허설장", "별빛 옥상"],
    stakes: "승리보다 중요한 선택을 놓치면 루트가 엇갈린다.",
  },
  {
    id: "act5",
    title: "피날레: 다시 여는 문",
    goal: "모은 인연과 카드로 마지막 결말을 선택한다.",
    locations: ["기억의 문", "카페 무대", "아침 공원"],
    stakes: "누구와 어떤 내일을 만들지 플레이어가 정한다.",
  },
];

const storyTemplates = [
  {
    scene: "map",
    text:
      "{char}가 {place}에서 길잡이 카드를 뒤집는다. 선택지는 가볍지만, {route}의 {stat}이 조용히 반응한다.",
    choices: ["미소로 답한다", "카드를 아껴 둔다", "장난스럽게 응원한다"],
    tags: ["story", "choice"],
  },
  {
    scene: "event",
    text:
      "{place}에 작은 문제가 생긴다. {char}는 자기 방식으로 해결하려 하고, 플레이어는 {goal}",
    choices: ["함께 돕는다", "다른 관점을 제안한다", "잠깐 쉬어 간다"],
    tags: ["story", "affinity"],
  },
  {
    scene: "battle",
    text:
      "전투 전 {char}가 손패를 살핀다. {stakes} 그래서 이번 라운드에는 {route} 태그 카드가 빛난다.",
    choices: ["공격 콤보", "방어 콤보", "응원 콤보"],
    tags: ["story", "deckbuilding"],
  },
  {
    scene: "date",
    text:
      "{place}의 조명이 부드러워진다. {char}와 나눈 농담은 설레지만 15+ 톤을 지키며, 서로의 경계를 존중한다.",
    choices: ["진심을 말한다", "작은 선물을 건넨다", "다음 약속을 잡는다"],
    tags: ["story", "romance", "safe"],
  },
  {
    scene: "rest",
    text:
      "휴식방에서 {char}가 오늘의 실수를 웃음으로 접는다. {stat} 보너스가 붙고, 덱에서 부담 카드 하나를 정리할 수 있다.",
    choices: ["카드 정리", "차 마시기", "조용히 듣기"],
    tags: ["story", "rest"],
  },
];

const dialogueTemplates = [
  {
    mood: "bright",
    line:
      "{char}: 오늘의 {route}, 시작음은 반짝! 네 선택이 틀려도 같이 다시 섞으면 돼.",
    tags: ["dialogue", "comfort"],
  },
  {
    mood: "teasing",
    line:
      "{char}: 방금 그 플레이, 일부러 멋져 보이려고 한 거지? 아니면 진짜로 {stat}이 오른 건가?",
    tags: ["dialogue", "romance"],
  },
  {
    mood: "strategy",
    line:
      "{char}: {place}에서는 손패를 세 장 남겨 둬. 웃는 얼굴도 좋지만, 이기는 얼굴은 더 좋거든.",
    tags: ["dialogue", "deckbuilding"],
  },
  {
    mood: "shy",
    line:
      "{char}: 고마워. 너무 크게 말하면 이벤트 플래그가 도망갈 것 같으니까, 지금은 작은 목소리로만.",
    tags: ["dialogue", "affinity"],
  },
  {
    mood: "comic",
    line:
      "{char}: 방금 보스가 감동해서 턴을 넘겼어. 아니, 규칙상 그런 효과는 없지만 기분은 중요하잖아.",
    tags: ["dialogue", "comedy"],
  },
];

const buildHook = (character, act, index, extraTags = []) => ({
  route: character.route,
  tags: [...routes[character.route].tags, ...extraTags],
  affinity: {
    characterId: character.id,
    stat: routes[character.route].affinityStat,
    amount: 1 + (index % 3),
  },
  unlocks:
    index % 5 === 0
      ? [character.affinityHooks.cardRewards[index % character.affinityHooks.cardRewards.length]]
      : [],
  act: act.id,
});

const interpolate = (template, character, act, index) => {
  const place = act.locations[index % act.locations.length];
  return template
    .replaceAll("{char}", character.name)
    .replaceAll("{route}", routes[character.route].title)
    .replaceAll("{stat}", routes[character.route].affinityStat)
    .replaceAll("{place}", place)
    .replaceAll("{goal}", act.goal)
    .replaceAll("{stakes}", act.stakes);
};

const makeStoryPages = () => {
  const pages = [];
  acts.forEach((act, actIndex) => {
    characters.forEach((character, charIndex) => {
      storyTemplates.forEach((template, templateIndex) => {
        const localIndex = actIndex * 25 + charIndex * 5 + templateIndex;
        pages.push({
          id: `story-${String(localIndex + 1).padStart(3, "0")}`,
          title: `${act.title} / ${character.name}`,
          act: act.id,
          characterId: character.id,
          route: character.route,
          scene: template.scene,
          text: interpolate(template.text, character, act, localIndex),
          choices: template.choices.map((label, choiceIndex) => ({
            id: `${character.id}-${act.id}-choice-${templateIndex}-${choiceIndex}`,
            label,
            tags: [character.route, template.scene],
            affinity: {
              characterId: character.id,
              stat: routes[character.route].affinityStat,
              amount: choiceIndex === 0 ? 2 : 1,
            },
          })),
          hook: buildHook(character, act, localIndex, template.tags),
        });
      });
    });
  });
  return pages;
};

const makeDialoguePages = () => {
  const pages = [];
  acts.forEach((act, actIndex) => {
    characters.forEach((character, charIndex) => {
      dialogueTemplates.forEach((template, templateIndex) => {
        const localIndex = actIndex * 25 + charIndex * 5 + templateIndex;
        pages.push({
          id: `dialogue-${String(localIndex + 1).padStart(3, "0")}`,
          speakerId: character.id,
          route: character.route,
          mood: template.mood,
          line: interpolate(template.line, character, act, localIndex),
          replies: [
            {
              label: "진심으로 받아준다",
              tags: ["kind", character.route],
              affinity: { characterId: character.id, amount: 2 },
            },
            {
              label: "가볍게 받아친다",
              tags: ["playful", character.route],
              affinity: { characterId: character.id, amount: 1 },
            },
          ],
          hook: buildHook(character, act, localIndex, template.tags),
        });
      });
    });
  });
  return pages;
};

export const storyPages = makeStoryPages();
export const dialoguePages = makeDialoguePages();

export const endings = [
  {
    id: "ending-hana-sunrise",
    title: "도넛과 아침 햇살",
    route: "sunny",
    requiredAffinity: { characterId: "hana", warmth: 18 },
    tags: ["romance", "good", "comfort"],
    summary: "하나와 새 카페를 열고, 매일의 실수를 웃음으로 바꾸는 결말.",
  },
  {
    id: "ending-sora-honest-win",
    title: "새침한 우승 고백",
    route: "ember",
    requiredAffinity: { characterId: "sora", trust: 18 },
    tags: ["romance", "good", "rival"],
    summary: "소라가 결승전 뒤 솔직한 마음을 인정하고 함께 다음 리그를 준비한다.",
  },
  {
    id: "ending-riri-neon-encore",
    title: "네온 앙코르 업로드",
    route: "neon",
    requiredAffinity: { characterId: "riri", sync: 18 },
    tags: ["romance", "good", "music"],
    summary: "리리와 공동 곡을 공개하며 팬들과 건강한 응원을 나누는 결말.",
  },
  {
    id: "ending-mirae-flower-trick",
    title: "꽃비 속 커튼콜",
    route: "stage",
    requiredAffinity: { characterId: "mirae", charm: 18 },
    tags: ["romance", "good", "comedy"],
    summary: "미래의 마지막 트릭이 고백이 되고, 두 사람은 작은 극장을 지킨다.",
  },
  {
    id: "ending-jun-index-of-us",
    title: "우리라는 색인",
    route: "archive",
    requiredAffinity: { characterId: "jun", insight: 18 },
    tags: ["romance", "good", "memory"],
    summary: "준과 함께 모험 기록을 완성하고 다음 장의 제목을 같이 정한다.",
  },
  {
    id: "ending-team-bright-table",
    title: "다섯 자리의 원탁",
    route: "team",
    requiredAffinity: { totalCompanionAffinity: 55 },
    tags: ["friendship", "true", "deckbuilding"],
    summary: "모든 동료와 균형 있게 가까워져 카페와 던전을 함께 운영한다.",
  },
  {
    id: "ending-solo-master-builder",
    title: "혼자서도 빛나는 덱",
    route: "solo",
    requiredAffinity: { clearedRuns: 3, romanceLocked: false },
    tags: ["solo", "good", "mastery"],
    summary: "연애보다 성장을 선택하고, 모두와 좋은 친구로 남는 결말.",
  },
  {
    id: "ending-loop-again",
    title: "다시 섞는 첫 장",
    route: "neutral",
    requiredAffinity: { failedBoss: true },
    tags: ["neutral", "restart", "roguelike"],
    summary: "마지막 보스에게 밀리지만 기억 조각을 지닌 채 밝은 새 회차가 열린다.",
  },
];

export const contentMeta = {
  rating: "15+",
  language: "ko",
  safetyNotes: [
    "모든 로맨스 대상은 18세 이상의 성인입니다.",
    "노골적인 성적 묘사 없이 설렘, 코미디, 상호 존중을 중심으로 구성했습니다.",
    "미성년자를 성적 대상으로 다루지 않습니다.",
  ],
  counts: {
    characters: characters.length,
    storyPages: storyPages.length,
    dialoguePages: dialoguePages.length,
    endings: endings.length,
  },
  routes,
};

export default {
  characters,
  storyPages,
  dialoguePages,
  endings,
  contentMeta,
};
