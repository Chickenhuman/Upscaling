#!/usr/bin/env node

import {
  cardCatalog,
  encounterTemplates,
  levelCurve,
  relicCatalog,
  starterDeckIds,
} from "../src/data/cards.js";

const cardsById = new Map(cardCatalog.map((card) => [card.id, card]));
const rarityWeights = {
  common: 72,
  uncommon: 23,
  rare: 5,
};

function hashSeed(seedText) {
  let hash = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    hash ^= seedText.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seedText) {
  let state = hashSeed(seedText) || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function choice(items, rng) {
  return items[Math.floor(rng() * items.length)];
}

function weightedChoice(items, getWeight, rng) {
  const total = items.reduce((sum, item) => sum + getWeight(item), 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= getWeight(item);
    if (roll <= 0) {
      return item;
    }
  }
  return items[items.length - 1];
}

function createRun(seedText) {
  return {
    rng: createRng(seedText),
    deck: [...starterDeckIds],
    relics: [],
    hp: 96,
    maxHp: 96,
    weekReached: 1,
    fightsWon: 0,
    cardsAdded: 0,
    won: false,
  };
}

function getRelicEffects(run) {
  return run.relics.reduce((effects, relicId) => {
    const relic = relicCatalog.find((candidate) => candidate.id === relicId);
    for (const [key, value] of Object.entries(relic?.effects ?? {})) {
      effects[key] = (effects[key] ?? 0) + value;
    }
    return effects;
  }, {});
}

function multiplier(effects, key) {
  const value = effects[key];
  if (value === undefined) {
    return 1;
  }
  return value > 1 ? value : 1 + value;
}

function cardValue(card, effects, rng) {
  const cardEffects = card.effects;
  const charm = (cardEffects.charm ?? 0) * multiplier(effects, "charmMultiplier");
  const wit = (cardEffects.wit ?? 0) * multiplier(effects, "witMultiplier");
  const focus = (cardEffects.focus ?? 0) * multiplier(effects, "focusMultiplier");
  const guard = (cardEffects.guard ?? 0) * multiplier(effects, "guardMultiplier");
  const heal = (cardEffects.heal ?? 0) * multiplier(effects, "healMultiplier");
  const combo = (cardEffects.combo ?? 0) * multiplier(effects, "comboMultiplier");
  const tempo = (cardEffects.tempo ?? 0) + (effects.tempoBonus ?? 0) * 0.2;
  const draw = (cardEffects.draw ?? 0) * (3.4 + (effects.drawQuality ?? 0) * 4);
  const variance = ((cardEffects.variance ?? 0) * (rng() - 0.42));
  const riskMitigation = Math.min(0.8, effects.riskMitigation ?? 0);
  const selfDamage = (cardEffects.selfDamage ?? 0) * (1 - riskMitigation);
  const output = charm + wit + focus * 1.15 + combo + tempo + draw + variance;
  const sustain = guard + heal * 1.1;

  return { output: output * 1.25, sustain: sustain * 1.1, selfDamage };
}

function estimateTurn(run, rng) {
  const effects = getRelicEffects(run);
  const handSize = Math.min(7, 5 + (effects.drawQuality ?? 0) * 4);
  const hand = [];
  for (let index = 0; index < handSize; index += 1) {
    hand.push(cardsById.get(choice(run.deck, rng)));
  }

  let energy = 3 + Math.min(1.5, (effects.tempoBonus ?? 0) * 0.18);
  let output = effects.openingBurst ?? 0;
  let sustain = 0;
  let selfDamage = 0;

  const rankedHand = hand
    .map((card) => ({ card, value: cardValue(card, effects, rng) }))
    .sort((left, right) => {
      const leftScore = left.value.output + left.value.sustain * 0.45;
      const rightScore = right.value.output + right.value.sustain * 0.45;
      return rightScore - leftScore;
    });

  for (const entry of rankedHand) {
    if (entry.card.cost <= energy) {
      energy -= entry.card.cost;
      output += entry.value.output;
      sustain += entry.value.sustain;
      selfDamage += entry.value.selfDamage;
    }
  }

  const mastery = 1 + Math.min(2.4, run.fightsWon * 0.06 + run.relics.length * 0.05);
  return {
    output: output * mastery,
    sustain: sustain * (1 + Math.min(1.4, run.fightsWon * 0.04)),
    selfDamage,
  };
}

function scaleEncounter(template, week) {
  const bossMultiplier = week.boss ? 1.25 : 1;
  const eliteMultiplier = week.elite ? 1.12 : 1;
  const tierMultiplier = 1 + (week.tier - template.tier) * 0.08;
  return {
    ...template,
    hp: Math.round(template.hp * bossMultiplier * eliteMultiplier * tierMultiplier),
    attack: Math.round(template.attack * bossMultiplier * eliteMultiplier * tierMultiplier),
    turns: template.turns + (week.boss ? 1 : 0),
  };
}

function fight(run, encounter) {
  let encounterHp = encounter.hp;
  for (let turn = 1; turn <= encounter.turns; turn += 1) {
    const turnEstimate = estimateTurn(run, run.rng);
    encounterHp -= turnEstimate.output;
    const incoming = Math.max(0, encounter.attack * 0.75 + turn * 1.2 - turnEstimate.sustain * 0.85);
    run.hp -= incoming + turnEstimate.selfDamage;

    if (encounterHp <= 0) {
      run.fightsWon += 1;
      return true;
    }
    if (run.hp <= 0) {
      return false;
    }
  }

  run.hp -= Math.max(3, encounter.attack * 0.4);
  return encounterHp <= 0 && run.hp > 0;
}

function eligibleRewards(run) {
  const ownedFamilies = new Set(run.deck.map((id) => cardsById.get(id)?.family));
  return cardCatalog.filter((card) => {
    if (card.rarity === "starter") {
      return false;
    }
    return ownedFamilies.has(card.family) || card.family === "synergy" || run.deck.length < 17;
  });
}

function rewardCard(run) {
  const effects = getRelicEffects(run);
  const qualityBonus = effects.rewardQuality ?? 0;
  const candidates = eligibleRewards(run);
  const picked = weightedChoice(
    candidates,
    (card) => {
      const base = rarityWeights[card.rarity] ?? 1;
      return card.rarity === "rare" ? base + qualityBonus * 80 : base;
    },
    run.rng,
  );

  run.deck.push(picked.id);
  run.cardsAdded += 1;
}

function maybeRewardRelic(run, chance) {
  if (run.rng() > chance) {
    return;
  }
  const unowned = relicCatalog.filter((relic) => !run.relics.includes(relic.id));
  if (unowned.length === 0) {
    return;
  }
  const relic = weightedChoice(
    unowned,
    (candidate) => (candidate.rarity === "rare" ? 8 : candidate.rarity === "uncommon" ? 22 : 70),
    run.rng,
  );
  run.relics.push(relic.id);
  const maxHp = relic.effects.maxHp ?? 0;
  if (maxHp > 0) {
    run.maxHp += maxHp;
    run.hp += maxHp;
  }
}

function runWeek(run, week) {
  run.weekReached = week.week;
  const templates = encounterTemplates.filter((template) => template.tier <= week.tier);
  for (let index = 0; index < week.encounters; index += 1) {
    const bossPool = encounterTemplates.filter((template) => template.tier <= week.tier + 1);
    const template = week.boss && index === week.encounters - 1
      ? bossPool[bossPool.length - 1]
      : choice(templates, run.rng);
    const encounter = scaleEncounter(template, week);
    if (!fight(run, encounter)) {
      return false;
    }

    run.hp = Math.min(run.maxHp, run.hp + 5);
    if (!week.boss || index !== week.encounters - 1) {
      rewardCard(run);
    }
    maybeRewardRelic(run, week.elite && index === 0 ? 0.9 : 0.18);
  }

  if (week.rest) {
    const effects = getRelicEffects(run);
    run.hp = Math.min(run.maxHp, run.hp + 30 + (effects.restHeal ?? 0));
  } else {
    run.hp = Math.min(run.maxHp, run.hp + 8);
  }
  return true;
}

function simulateRun(seedText) {
  const run = createRun(seedText);
  for (const week of levelCurve) {
    if (!runWeek(run, week)) {
      return run;
    }
  }
  run.won = run.hp > 0;
  return run;
}

function percentile(values, pct) {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.floor((pct / 100) * sorted.length));
  return sorted[index] ?? 0;
}

function formatPct(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function main() {
  const runs = Number.parseInt(process.argv[2] ?? "5000", 10);
  const seed = process.argv[3] ?? "upscale-bright-001";
  const results = [];

  for (let index = 0; index < runs; index += 1) {
    results.push(simulateRun(`${seed}:${index}`));
  }

  const wins = results.filter((result) => result.won);
  const averageWeeks = results.reduce((sum, result) => sum + result.weekReached, 0) / results.length;
  const averageFights = results.reduce((sum, result) => sum + result.fightsWon, 0) / results.length;
  const totalMinutes = levelCurve.reduce((sum, week) => sum + week.estimatedMinutes, 0);
  const averageMinutes = results.reduce((sum, result) => {
    const completedMinutes = levelCurve
      .slice(0, Math.max(0, result.weekReached - 1))
      .reduce((weekSum, week) => weekSum + week.estimatedMinutes, 0);
    return sum + (result.won ? totalMinutes : completedMinutes + levelCurve[result.weekReached - 1].estimatedMinutes * 0.55);
  }, 0) / results.length;
  const hpOnWin = wins.map((result) => result.hp);
  const averageDeckSize = results.reduce((sum, result) => sum + result.deck.length, 0) / results.length;
  const averageRelics = results.reduce((sum, result) => sum + result.relics.length, 0) / results.length;

  console.log("Balance sim report");
  console.log(`Seed: ${seed}`);
  console.log(`Runs: ${runs}`);
  console.log(`Catalog: ${cardCatalog.length} cards, ${relicCatalog.length} relics, ${encounterTemplates.length} encounters`);
  console.log(`Win rate: ${formatPct(wins.length / results.length)}`);
  console.log(`Average run length: ${averageMinutes.toFixed(1)} min (${averageWeeks.toFixed(1)} weeks, ${averageFights.toFixed(1)} fights)`);
  console.log(`Target full clear length: ${totalMinutes} min over ${levelCurve.length} weeks`);
  console.log(`Average final deck/relics: ${averageDeckSize.toFixed(1)} cards, ${averageRelics.toFixed(1)} relics`);
  if (wins.length > 0) {
    const averageWinHp = hpOnWin.reduce((sum, hp) => sum + hp, 0) / hpOnWin.length;
    console.log(`Winner HP: avg ${averageWinHp.toFixed(1)}, p10 ${percentile(hpOnWin, 10).toFixed(1)}, p90 ${percentile(hpOnWin, 90).toFixed(1)}`);
  }
}

main();
