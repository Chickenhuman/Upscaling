#!/usr/bin/env node

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  assetManifest,
  balanceTargets,
  fullRunMinutes,
  horseRoster,
  oddsConfig,
  raceMeetings,
  starterStrategyDeckIds,
  strategyCardCatalog,
  trackConditions,
} from "../src/data/cards.js";
import {
  characters,
  contentMeta,
  dialoguePages,
  endings,
  storyChapters,
  storyPages,
} from "../src/data/content.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const characterIds = new Set(characters.map((character) => character.id));
const horseIds = new Set(horseRoster.map((horse) => horse.id));
const cardIds = new Set(strategyCardCatalog.map((card) => card.id));
const conditionIds = new Set(trackConditions.map((condition) => condition.id));

assert(contentMeta.title === "네온 더비 로맨스", "content title must match the rebuilt game");
assert(contentMeta.rating === "15+", "rating metadata must be 15+");
assert(characters.length >= 5, "at least five characters are required");
assert(characters.every((character) => character.age >= 18), "all romance characters must be adults");
assert(horseRoster.length >= 5, "at least five racehorses are required");
assert(trackConditions.length >= 5, "at least five track conditions are required");
assert(raceMeetings.length >= 5, "at least five race meetings are required");
assert(strategyCardCatalog.length >= 18, "at least eighteen strategy cards are required");
assert(starterStrategyDeckIds.length >= 8, "starter strategy deck is too small");
assert(starterStrategyDeckIds.every((id) => cardIds.has(id)), "starter deck references an unknown strategy card");
assert(storyChapters.length >= 7, "story chapter count is too low");
assert(storyPages.length >= 100, "story content must expose at least 100 pages");
assert(dialoguePages.length >= 100, "dialogue content must expose at least 100 pages");
assert(endings.length >= 8, "at least eight endings are required");
assert(fullRunMinutes >= 60, "full run estimate must be at least 60 minutes");
assert(balanceTargets.maxFocus === 3, "strategy focus budget should be three");
assert(oddsConfig.minBet > 0 && oddsConfig.maxBet > oddsConfig.minBet, "bet limits are invalid");
assert(raceMeetings.every((meeting) => conditionIds.has(meeting.conditionId)), "race meeting references an unknown condition");
assert(storyChapters.every((chapter) => horseIds.has(chapter.focusHorseId)), "story chapter references an unknown horse");
assert(
  storyChapters.every((chapter) => chapter.lines.every((line) => line.speakerId === "narrator" || characterIds.has(line.speakerId))),
  "story line references an unknown speaker",
);
assert(storyPages.every((page) => characterIds.has(page.characterId)), "story page references an unknown character");
assert(dialoguePages.every((page) => characterIds.has(page.speakerId)), "dialogue page references an unknown speaker");

[
  assetManifest.titleBackground,
  assetManifest.raceBackground,
  assetManifest.bettingBackground,
  assetManifest.dialogueBackground,
  assetManifest.horseSpriteSheet,
  ...assetManifest.conceptImages,
  "./assets/concepts/title-screen-concept-a.png",
  "./assets/concepts/racehorse-cast-banner.png",
  "./assets/horses/black-gold-gallop-sprite.png",
  "./assets/characters/hana.png",
  "./assets/characters/sora.png",
  "./assets/characters/riri.png",
  "./assets/characters/mirae.png",
  "./assets/characters/jun.png",
  "./docs/GAME_DESIGN.md",
  "./docs/PLAYER_MANUAL.md",
  "./docs/DEVLOG.md",
  "./docs/RELEASE_CHECKLIST.md",
  "./docs/UI_FIRST_PIPELINE.md",
].forEach((path) => {
  assert(existsSync(resolve(path)), `missing required file: ${path}`);
});

console.log("Smoke test passed.");
