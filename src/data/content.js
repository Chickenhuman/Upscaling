import { economyCurve } from "./cards.js";

const routes = {
  warmth: {
    title: "햇살 카페 루트",
    stat: "warmth",
    theme: "흔들리는 밤에도 다정함을 잃지 않는 이야기",
  },
  trust: {
    title: "새침 분석가 루트",
    stat: "trust",
    theme: "정확한 계산 너머의 진심을 확인하는 이야기",
  },
  sync: {
    title: "네온 중계 루트",
    stat: "sync",
    theme: "함성과 리듬 사이에서 같은 박자를 찾는 이야기",
  },
  charm: {
    title: "무대 트릭 루트",
    stat: "charm",
    theme: "속임수처럼 보였던 배려가 고백이 되는 이야기",
  },
  insight: {
    title: "기록 보관소 루트",
    stat: "insight",
    theme: "잃어버린 경주 기록과 마음의 색인을 되찾는 이야기",
  },
};

export const characters = [
  {
    id: "hana",
    name: "유하나",
    age: 24,
    route: "warmth",
    role: "패덕 카페 매니저",
    stat: "warmth",
    likes: ["따뜻한 선택", "위험을 줄이는 베팅", "함께 나눠 먹는 야식"],
    bio:
      "경마장 안 작은 카페를 지키는 매니저. 실수는 많지만 손님과 말의 컨디션을 누구보다 빨리 눈치챈다.",
  },
  {
    id: "sora",
    name: "강소라",
    age: 22,
    route: "trust",
    role: "냉정한 배당 분석가",
    stat: "trust",
    likes: ["근거 있는 선택", "손실을 인정하는 태도", "정면 승부"],
    bio:
      "숫자와 폼을 믿는 전직 데이터 해설자. 관심 없는 척하지만 플레이어의 마권만큼은 매번 다시 계산해 준다.",
  },
  {
    id: "riri",
    name: "리리 앰프",
    age: 19,
    route: "sync",
    role: "네온 경주 스트리머",
    stat: "sync",
    likes: ["즉흥 리듬", "팬 채팅", "과감하지만 납득되는 역배"],
    bio:
      "트윈드릴 헤드셋으로 야간 경주를 중계하는 성인 크리에이터. 불리한 레이스도 후렴구처럼 띄워 올린다.",
  },
  {
    id: "mirae",
    name: "백미래",
    age: 27,
    route: "charm",
    role: "무표정 마술사",
    stat: "charm",
    likes: ["허를 찌르는 선택", "박수 타이밍", "비밀을 지키는 예의"],
    bio:
      "경주장 라운지에서 작은 마술 쇼를 여는 공연자. 배당표를 접는 손놀림만큼 마음을 숨기는 데 능숙하다.",
  },
  {
    id: "jun",
    name: "오준",
    age: 25,
    route: "insight",
    role: "경주 기록 보관원",
    stat: "insight",
    likes: ["기록 대조", "조용한 배려", "잃어버린 단서 찾기"],
    bio:
      "오래된 경주 결과와 폐쇄된 트랙의 문서를 관리한다. 넘어지는 순간에도 단서가 적힌 종이를 주워 온다.",
  },
];

export const storyChapters = [
  {
    id: "prologue-ticket",
    title: "프롤로그: 찢어진 우승권",
    location: "패덕 카페 테라스",
    fundingGoal: economyCurve.storyFundingGoals[0],
    focusHorseId: "black-comet",
    summary: "플레이어는 폐점 위기의 패덕 카페에서 의문의 우승권 반쪽을 발견한다.",
    lines: [
      {
        speakerId: "narrator",
        text:
          "야간 경주가 끝난 뒤, 패덕 카페의 바닥에는 반으로 찢어진 우승권과 오래된 계약서가 남아 있었다.",
      },
      {
        speakerId: "hana",
        text:
          "이 카페, 그냥 빚만 있는 줄 알았는데... 누군가 일부러 우리한테 단서를 남긴 것 같아.",
      },
      {
        speakerId: "sora",
        text:
          "감상은 나중에. 다음 장을 열려면 취재비가 필요해. 최소한 오늘 밤 배당판에서 살아남아야 해.",
      },
      {
        speakerId: "jun",
        text:
          "계약서의 잉크가 7년 전 경주 기록과 맞습니다. 사라진 결승 사진도 같은 날이에요.",
      },
      {
        speakerId: "narrator",
        text:
          "첫 번째 목표는 140칩. 돈을 벌어야 다음 문서를 열람하고, 이 밤이 왜 우리를 부르는지 알 수 있다.",
      },
    ],
    choices: [
      {
        label: "하나에게 카페 문단속을 부탁한다",
        response: "하나가 어색하게 웃으며 비밀 메뉴 쿠폰을 건넸다.",
        affinity: { characterId: "hana", amount: 3 },
        chips: 14,
        insight: { horseId: "black-comet", amount: 4 },
      },
      {
        label: "소라와 첫 배당표를 다시 계산한다",
        response: "소라는 빨간 펜으로 인기마의 약점을 세 줄이나 그었다.",
        affinity: { characterId: "sora", amount: 3 },
        chips: 8,
        insight: { horseId: "teal-breeze", amount: 5 },
      },
      {
        label: "준과 찢어진 우승권 번호를 맞춘다",
        response: "준의 수첩 속 오래된 좌석 번호가 우승권 반쪽과 겹쳤다.",
        affinity: { characterId: "jun", amount: 3 },
        chips: 10,
        insight: { horseId: "white-promise", amount: 4 },
      },
    ],
  },
  {
    id: "chapter-odds",
    title: "1장: 거짓 배당의 냄새",
    location: "라운지 모니터 룸",
    fundingGoal: economyCurve.storyFundingGoals[1],
    focusHorseId: "teal-breeze",
    summary: "배당이 이상하게 움직이고, 소라는 누군가 인기마를 미끼로 쓰고 있다고 의심한다.",
    lines: [
      {
        speakerId: "sora",
        text:
          "검은 혜성의 배당이 너무 안정적이야. 강한 건 맞지만, 안정적인 척하는 배당은 보통 누가 만진 거야.",
      },
      {
        speakerId: "riri",
        text:
          "채팅도 난리야. 청록 질주 쪽으로 갑자기 돈이 몰렸다가 사라졌대. 이건 리듬이 아니라 편집이야.",
      },
      {
        speakerId: "mirae",
        text:
          "사람들은 눈앞의 카드가 사라지면 마술이라고 부르지. 돈이 사라지면 대체로 사건이고.",
      },
      {
        speakerId: "narrator",
        text:
          "다음 기록 보관실을 열려면 220칩이 필요하다. 숫자를 믿되, 숫자를 만든 사람도 의심해야 한다.",
      },
    ],
    choices: [
      {
        label: "소라의 계산을 믿고 인기마를 의심한다",
        response: "소라가 고개를 돌렸지만, 입꼬리는 조금 올라가 있었다.",
        affinity: { characterId: "sora", amount: 4 },
        chips: 12,
        insight: { horseId: "teal-breeze", amount: 5 },
      },
      {
        label: "리리에게 실시간 제보를 모아 달라고 한다",
        response: "리리는 바로 방송 제목을 바꿨다. '수상한 배당표 추적 중'.",
        affinity: { characterId: "riri", amount: 4 },
        chips: 16,
        insight: { horseId: "violet-wave", amount: 5 },
      },
      {
        label: "미래의 마술 쇼 뒤편을 확인한다",
        response: "미래는 빈 손을 펼쳤고, 손바닥에는 접힌 마권이 하나 남아 있었다.",
        affinity: { characterId: "mirae", amount: 4 },
        chips: 8,
        insight: { horseId: "white-promise", amount: 5 },
      },
    ],
  },
  {
    id: "chapter-rain",
    title: "2장: 봄비 주로의 약속",
    location: "비 내리는 패덕",
    fundingGoal: economyCurve.storyFundingGoals[2],
    focusHorseId: "white-promise",
    summary: "비가 내리고, 흰 말 백야의 약속이 오래된 결승 사진 속 말과 닮았다는 단서가 나온다.",
    lines: [
      {
        speakerId: "hana",
        text:
          "비 오는 날엔 손님들이 다 안쪽으로 들어와. 그런데 저 흰 말은 꼭 누군가를 기다리는 것처럼 밖을 보네.",
      },
      {
        speakerId: "jun",
        text:
          "7년 전 결승 사진에 찍힌 말도 흰 털이었습니다. 이름은 지워졌지만 목끈의 붉은 매듭이 같아요.",
      },
      {
        speakerId: "sora",
        text:
          "비 주로라면 배당이 흔들릴 거야. 백야의 약속은 인기보다 실력이 덜 반영된 편이고.",
      },
      {
        speakerId: "narrator",
        text:
          "기록 사진 복원 의뢰비는 330칩. 비가 그치기 전에 자금을 마련해야 한다.",
      },
    ],
    choices: [
      {
        label: "하나와 손님들에게 따뜻한 차를 돌린다",
        response: "비에 젖은 소문들이 찻잔 옆으로 모였다.",
        affinity: { characterId: "hana", amount: 4 },
        chips: 18,
        insight: { horseId: "white-promise", amount: 6 },
      },
      {
        label: "준과 붉은 매듭의 기록을 대조한다",
        response: "준은 잉크 번진 표를 새 종이에 옮기며 낮게 웃었다.",
        affinity: { characterId: "jun", amount: 4 },
        chips: 10,
        insight: { horseId: "lime-mist", amount: 5 },
      },
      {
        label: "소라에게 역배 가능성을 묻는다",
        response: "소라는 '가능성'이라는 단어 밑에 두 번 밑줄을 그었다.",
        affinity: { characterId: "sora", amount: 3 },
        chips: 12,
        insight: { horseId: "white-promise", amount: 5 },
      },
    ],
  },
  {
    id: "chapter-stream",
    title: "3장: 네온 중계 사고",
    location: "스트리밍 부스",
    fundingGoal: economyCurve.storyFundingGoals[3],
    focusHorseId: "violet-wave",
    summary: "리리의 생방송에 조작된 음성 파일이 끼어들고, 보랏빛 파도의 과거 레이스가 드러난다.",
    lines: [
      {
        speakerId: "riri",
        text:
          "방금 내 목소리 아니야. 누가 내 방송에 '보랏빛 파도는 뛰지 못한다'는 멘트를 끼워 넣었어.",
      },
      {
        speakerId: "mirae",
        text:
          "관중은 믿고 싶은 걸 듣지. 그래서 무대에서는 침묵도 장치가 돼.",
      },
      {
        speakerId: "jun",
        text:
          "보랏빛 파도는 7년 전 결승에서 출전 취소됐습니다. 이유는 기록에서 사라졌고요.",
      },
      {
        speakerId: "narrator",
        text:
          "스트리밍 로그를 복구하려면 460칩이 필요하다. 이번엔 배당뿐 아니라 목소리의 진실도 걸려 있다.",
      },
    ],
    choices: [
      {
        label: "리리의 방송을 함께 이어 간다",
        response: "리리는 떨리는 손으로 새 비트를 틀었고, 화면의 채팅이 다시 살아났다.",
        affinity: { characterId: "riri", amount: 5 },
        chips: 20,
        insight: { horseId: "violet-wave", amount: 7 },
      },
      {
        label: "미래에게 가짜 음성의 타이밍을 묻는다",
        response: "미래는 박수 세 번 사이의 빈틈을 정확히 짚었다.",
        affinity: { characterId: "mirae", amount: 4 },
        chips: 12,
        insight: { horseId: "black-comet", amount: 4 },
      },
      {
        label: "준과 출전 취소 기록을 찾는다",
        response: "준의 손끝이 낡은 서랍을 열자, 번호 없는 녹음 테이프가 굴러나왔다.",
        affinity: { characterId: "jun", amount: 4 },
        chips: 10,
        insight: { horseId: "violet-wave", amount: 5 },
      },
    ],
  },
  {
    id: "chapter-trick",
    title: "4장: 사라지는 마권 마술",
    location: "라운지 소극장",
    fundingGoal: economyCurve.storyFundingGoals[4],
    focusHorseId: "lime-mist",
    summary: "미래의 공연 중 진짜 마권이 사라지고, 라임 안개의 장거리 기록이 조작됐다는 증거가 나온다.",
    lines: [
      {
        speakerId: "mirae",
        text:
          "내 마술은 관객이 보고 싶어 하는 방향으로 시선을 옮기는 일. 이번 사건도 똑같아.",
      },
      {
        speakerId: "sora",
        text:
          "라임 안개의 장거리 기록이 두 번 계산됐어. 한 번은 공식 기록, 한 번은 누군가 숨긴 실제 기록.",
      },
      {
        speakerId: "hana",
        text:
          "그 말, 조용해서 아무도 눈여겨보지 않았지. 그래서 누군가는 마음 놓고 숨겼을 거야.",
      },
      {
        speakerId: "narrator",
        text:
          "숨겨진 장거리 기록을 사려면 620칩. 가장 조용한 말이 가장 큰 문을 열지도 모른다.",
      },
    ],
    choices: [
      {
        label: "미래의 트릭을 끝까지 믿는다",
        response: "미래는 무표정하게 꽃 한 송이를 꺼냈다. 꽃잎에는 좌석 번호가 적혀 있었다.",
        affinity: { characterId: "mirae", amount: 5 },
        chips: 18,
        insight: { horseId: "lime-mist", amount: 7 },
      },
      {
        label: "하나와 조용한 손님의 증언을 듣는다",
        response: "하나가 건넨 따뜻한 물수건에 오래 묵은 경계심이 풀렸다.",
        affinity: { characterId: "hana", amount: 4 },
        chips: 16,
        insight: { horseId: "lime-mist", amount: 5 },
      },
      {
        label: "소라에게 공식 기록의 허점을 맡긴다",
        response: "소라는 공식이라는 단어 옆에 '가장 비싼 거짓말'이라고 적었다.",
        affinity: { characterId: "sora", amount: 4 },
        chips: 12,
        insight: { horseId: "black-comet", amount: 5 },
      },
    ],
  },
  {
    id: "chapter-final-bet",
    title: "5장: 마지막 직선의 값",
    location: "폐쇄된 결승 사진실",
    fundingGoal: economyCurve.storyFundingGoals[5],
    focusHorseId: "black-comet",
    summary: "사라진 결승 사진에는 카페의 전 주인과 현재 배당 조작범의 이름이 함께 찍혀 있었다.",
    lines: [
      {
        speakerId: "jun",
        text:
          "사진 속 우승권은 두 장입니다. 하나는 카페 주인의 것, 다른 하나는 지금 경주장을 운영하는 사람의 것.",
      },
      {
        speakerId: "riri",
        text:
          "이걸 공개하려면 증거가 더 필요해. 그냥 터뜨리면 우리만 이상한 사람 되는 그림이야.",
      },
      {
        speakerId: "sora",
        text:
          "마지막 레이스의 배당 흐름을 잡아야 해. 돈을 따는 게 목적이 아니라, 누가 돈을 움직이는지 증명하는 거야.",
      },
      {
        speakerId: "narrator",
        text:
          "최종 증거 매입금은 820칩. 이 금액을 마련하면, 이야기는 더 이상 배당판 뒤에 숨지 못한다.",
      },
    ],
    choices: [
      {
        label: "모두에게 증거 공개 계획을 공유한다",
        response: "다섯 사람의 시선이 같은 선 위에 놓였다. 이제 혼자 달리는 밤이 아니었다.",
        affinity: { characterId: "hana", amount: 2, all: 2 },
        chips: 22,
        insight: { horseId: "black-comet", amount: 6 },
      },
      {
        label: "리리에게 공개 타이밍을 맡긴다",
        response: "리리는 채팅창을 잠시 끄고, 진짜 목소리로 고맙다고 말했다.",
        affinity: { characterId: "riri", amount: 5 },
        chips: 14,
        insight: { horseId: "violet-wave", amount: 6 },
      },
      {
        label: "준과 사진 속 이름을 마지막으로 확인한다",
        response: "준은 떨리는 손으로 색인을 붙였다. 제목은 '우리가 놓치지 않은 것'.",
        affinity: { characterId: "jun", amount: 5 },
        chips: 12,
        insight: { horseId: "white-promise", amount: 5 },
      },
    ],
  },
  {
    id: "finale",
    title: "피날레: 네온 더비 로맨스",
    location: "새벽의 결승선",
    fundingGoal: economyCurve.storyFundingGoals[6],
    focusHorseId: "black-comet",
    summary: "증거와 마음을 모두 건 마지막 밤. 플레이어는 누구와 새벽을 맞을지 선택한다.",
    lines: [
      {
        speakerId: "narrator",
        text:
          "820칩으로 산 증거는 생각보다 얇았다. 그러나 그 종이 한 장이 7년 동안 닫혀 있던 문을 열었다.",
      },
      {
        speakerId: "hana",
        text:
          "우리 카페, 이제 그냥 살아남는 곳 말고 돌아올 수 있는 곳이면 좋겠어.",
      },
      {
        speakerId: "sora",
        text:
          "이겼다고 착각하지 마. 하지만... 이번엔 네 선택이 꽤 정확했어.",
      },
      {
        speakerId: "riri",
        text:
          "엔딩곡은 아직 안 만들었어. 같이 들을 사람이 정해져야 완성되거든.",
      },
      {
        speakerId: "mirae",
        text:
          "마지막 트릭은 비밀이 없어. 내가 손을 내밀면, 네가 잡을지 말지만 남아.",
      },
      {
        speakerId: "jun",
        text:
          "기록은 여기서 끝나지 않습니다. 다음 장의 첫 문장은 당신이 정해주세요.",
      },
    ],
    choices: [
      {
        label: "가장 많이 마음이 향한 사람에게 답한다",
        response: "새벽 조명이 꺼지고, 결승선 위에 둘만의 대답이 남았다.",
        affinity: { characterId: "selected", amount: 6 },
        chips: 0,
      },
      {
        label: "모두와 카페를 다시 열겠다고 약속한다",
        response: "다섯 개의 컵이 부딪히고, 첫 손님 없는 아침 영업이 시작됐다.",
        affinity: { characterId: "all", amount: 3 },
        chips: 0,
      },
      {
        label: "잠시 혼자 결승선을 걷는다",
        response: "혼자 걷는 길도 외롭지만은 않았다. 등 뒤의 불빛들이 아직 따뜻했으니까.",
        affinity: { characterId: "solo", amount: 0 },
        chips: 0,
      },
    ],
  },
];

export const raceCommentary = [
  "게이트가 열리고, 야간 조명 아래 다섯 마리가 동시에 튀어나갑니다.",
  "중반 코너입니다. 배당표의 숫자보다 말의 호흡이 먼저 움직입니다.",
  "마지막 직선, 관중석의 함성이 라운지를 흔듭니다.",
  "결승선 앞에서 순위가 뒤집힙니다. 이 밤은 아직 끝나지 않았습니다.",
];

export const bettingBarks = [
  "소라는 배당보다 근거를 보라고 했다.",
  "하나는 잃어도 저녁은 먹고 하자며 쿠폰을 접어 주었다.",
  "리리는 역배를 고르면 방송 제목이 좋아진다고 속삭였다.",
  "미래는 가장 뻔한 선택이 가장 좋은 속임수일 때도 있다고 말했다.",
  "준은 오래된 기록일수록 마지막 줄을 확인하라고 조언했다.",
];

export const endings = [
  {
    id: "ending-hana-cafe",
    title: "새벽 카페의 첫 커피",
    route: "warmth",
    characterId: "hana",
    summary: "하나와 함께 패덕 카페를 다시 열고, 손님들이 돌아오는 아침을 맞는다.",
  },
  {
    id: "ending-sora-proof",
    title: "정확한 고백식",
    route: "trust",
    characterId: "sora",
    summary: "소라는 마지막 배당표 위에 고백을 적고, 두 사람은 함께 조작 없는 리그를 만든다.",
  },
  {
    id: "ending-riri-encore",
    title: "네온 앙코르",
    route: "sync",
    characterId: "riri",
    summary: "리리의 생방송은 사건의 진실과 새 엔딩곡을 동시에 공개한다.",
  },
  {
    id: "ending-mirae-curtain",
    title: "커튼콜 없는 마술",
    route: "charm",
    characterId: "mirae",
    summary: "미래는 처음으로 트릭 없는 무대에 서고, 손을 잡는 순간이 박수가 된다.",
  },
  {
    id: "ending-jun-index",
    title: "우리라는 색인",
    route: "insight",
    characterId: "jun",
    summary: "준과 함께 사라진 기록을 복원하고, 다음 장의 첫 문장을 함께 쓴다.",
  },
  {
    id: "ending-team-stable",
    title: "다섯 자리의 라운지",
    route: "team",
    summary: "모든 동료와 충분히 가까워져 카페, 기록실, 중계 부스를 하나의 팀으로 묶는다.",
  },
  {
    id: "ending-solo-line",
    title: "혼자 걷는 결승선",
    route: "solo",
    summary: "연애보다 진실을 선택하고, 누구에게도 기대지 않는 새 출발을 고른다.",
  },
  {
    id: "ending-broke-rerun",
    title: "다시 사는 우승권",
    route: "neutral",
    summary: "돈은 잃었지만 단서는 남았다. 다음 밤, 같은 조명이 다시 켜진다.",
  },
];

export const contentMeta = {
  title: "네온 더비 로맨스",
  rating: "15+",
  language: "ko",
  premise:
    "플레이어는 패덕 카페를 지키기 위해 전략 카드 덱과 허구의 칩으로 네온 경주를 분석하고, 번 칩으로 조작된 야간 경주의 진실과 로맨스 루트를 해금한다.",
  safetyNotes: [
    "모든 로맨스 가능 캐릭터는 18세 이상의 성인입니다.",
    "베팅은 현실 화폐가 아닌 게임 내 허구 칩으로만 표현합니다.",
    "스토리 진행과 관계 선택이 중심이며, 실제 도박을 권장하지 않습니다.",
  ],
  counts: {
    characters: characters.length,
    storyChapters: storyChapters.length,
    storyLines: storyChapters.reduce((sum, chapter) => sum + chapter.lines.length, 0),
    endings: endings.length,
  },
  routes,
};

export const storyPages = Array.from({ length: 125 }, (_, index) => {
  const chapter = storyChapters[index % storyChapters.length];
  const line = chapter.lines[index % chapter.lines.length];
  const character = characters[index % characters.length];
  return {
    id: `story-page-${String(index + 1).padStart(3, "0")}`,
    characterId: line.speakerId === "narrator" ? character.id : line.speakerId,
    title: `${chapter.title} · ${index + 1}`,
    text: `${chapter.summary} ${line.text}`,
    choices: chapter.choices,
  };
});

export const dialoguePages = Array.from({ length: 125 }, (_, index) => {
  const chapter = storyChapters[index % storyChapters.length];
  const line = chapter.lines[(index + 1) % chapter.lines.length];
  const speaker = line.speakerId === "narrator" ? characters[(index + 2) % characters.length] : characters.find((character) => character.id === line.speakerId) || characters[index % characters.length];
  return {
    id: `dialogue-page-${String(index + 1).padStart(3, "0")}`,
    speakerId: speaker.id,
    line: line.text,
    replies: chapter.choices.map((choice, choiceIndex) => ({
      label: choice.label,
      text: choice.response,
      affinity: choice.affinity || { characterId: speaker.id, amount: choiceIndex + 1 },
    })),
  };
});

export default {
  characters,
  storyChapters,
  storyPages,
  dialoguePages,
  raceCommentary,
  bettingBarks,
  endings,
  contentMeta,
};
