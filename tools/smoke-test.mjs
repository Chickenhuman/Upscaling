#!/usr/bin/env node

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  cardCatalog,
  encounterTemplates,
  levelCurve,
  relicCatalog,
  starterDeckIds,
} from "../src/data/cards.js";
import {
  characters,
  contentMeta,
  dialoguePages,
  endings,
  storyPages,
} from "../src/data/content.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const cardIds = new Set(cardCatalog.map((card) => card.id));
const characterIds = new Set(characters.map((character) => character.id));

assert(contentMeta.rating === "15+", "rating metadata must be 15+");
assert(characters.length >= 5, "at least five characters are required");
assert(characters.every((character) => character.age >= 18), "all romance characters must be adults");
assert(storyPages.length >= 100, "story content must expose at least 100 pages");
assert(dialoguePages.length >= 100, "dialogue content must expose at least 100 pages");
assert(endings.length >= 8, "at least eight endings are required");
assert(cardCatalog.length >= 45, "at least forty-five cards are required");
assert(relicCatalog.length >= 10, "at least ten relics are required");
assert(levelCurve.reduce((sum, week) => sum + week.estimatedMinutes, 0) >= 60, "full run estimate must be at least 60 minutes");
assert(encounterTemplates.length >= 10, "encounter variety is too low");
assert(starterDeckIds.every((id) => cardIds.has(id)), "starter deck references an unknown card");
assert(storyPages.every((page) => characterIds.has(page.characterId)), "story page references an unknown character");
assert(dialoguePages.every((page) => characterIds.has(page.speakerId)), "dialogue page references an unknown speaker");

[
  "assets/images/title-bg.png",
  "assets/images/characters.png",
  "assets/images/battle-bg.png",
  "assets/images/card-sheet.png",
  "assets/images/map-bg.png",
  "assets/images/ending-bg.png",
  "docs/GAME_DESIGN.md",
  "docs/PLAYER_MANUAL.md",
  "docs/DEVLOG.md",
  "docs/RELEASE_CHECKLIST.md",
].forEach((path) => {
  assert(existsSync(resolve(path)), `missing required file: ${path}`);
});

console.log("Smoke test passed.");
