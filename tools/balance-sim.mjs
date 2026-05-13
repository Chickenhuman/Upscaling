#!/usr/bin/env node

import {
  balanceTargets,
  economyCurve,
  fullRunMinutes,
  horseRoster,
  oddsConfig,
  raceMeetings,
  starterStrategyDeckIds,
  strategyCardCatalog,
  trackConditions,
} from "../src/data/cards.js";
import { storyChapters } from "../src/data/content.js";

const cardById = new Map(strategyCardCatalog.map((card) => [card.id, card]));
const conditionById = new Map(trackConditions.map((condition) => [condition.id, condition]));

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

function shuffle(items, rng) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createRun(seedText) {
  return {
    rng: createRng(seedText),
    chips: economyCurve.startingChips,
    deck: [...starterStrategyDeckIds],
    insight: Object.fromEntries(horseRoster.map((horse) => [horse.id, 0])),
    chapterReached: 1,
    races: 0,
    emergencyUses: 0,
    won: false,
  };
}

function baseHorsePower(horse, condition, run, extraInsight = 0) {
  const fit = horse.conditionFit[condition.id] || 0;
  const clue = (run.insight[horse.id] || 0) + extraInsight;
  return horse.basePower + horse[condition.stat] * 0.34 + fit * 2.6 + clue * 0.72;
}

function computeOdds(run, meeting, condition) {
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

function drawHand(run) {
  const expanded = [];
  while (expanded.length < 8) {
    expanded.push(...run.deck);
  }
  return shuffle(expanded, run.rng).slice(0, 5).map((id) => cardById.get(id));
}

function cardImpact(card, horse, condition, odds) {
  const effect = card.effects;
  let score = effect.score || 0;
  let insight = effect.insight || 0;
  let refund = effect.refund || 0;
  let stability = effect.stability || 0;
  let payoutMultiplier = effect.payoutMultiplier || 0;
  if (effect.stat) {
    const statFit = effect.stat === condition.stat ? 1 : 0.55;
    score += (effect.statBoost || 0) * statFit * (0.75 + horse[effect.stat] / 360);
  }
  if (effect.underdogScore) {
    score += effect.underdogScore * clamp((odds - 2.2) / 5.2, 0.25, 1);
  }
  return { score: score * 0.62, insight, refund, stability: stability * 0.8, payoutMultiplier };
}

function combineImpacts(cards, horse, condition, odds) {
  return cards.reduce(
    (total, card) => {
      const impact = cardImpact(card, horse, condition, odds);
      total.score += impact.score;
      total.insight += impact.insight;
      total.refund = Math.max(total.refund, impact.refund);
      total.stability += impact.stability;
      total.payoutMultiplier += impact.payoutMultiplier;
      return total;
    },
    { score: 0, insight: 0, refund: 0, stability: 0, payoutMultiplier: 0 },
  );
}

function pickCards(hand, horse, condition, odds) {
  const ranked = hand
    .map((card) => ({ card, impact: cardImpact(card, horse, condition, odds) }))
    .sort((left, right) => {
      const leftValue = left.impact.score + left.impact.insight * 0.75 + left.impact.refund * 12 + left.impact.payoutMultiplier * 30;
      const rightValue = right.impact.score + right.impact.insight * 0.75 + right.impact.refund * 12 + right.impact.payoutMultiplier * 30;
      return rightValue - leftValue;
    });
  const picked = [];
  let focus = 0;
  for (const entry of ranked) {
    if (focus + entry.card.cost <= balanceTargets.maxFocus) {
      picked.push(entry.card);
      focus += entry.card.cost;
    }
  }
  return picked;
}

function pickHorse(run, condition, oddsMap) {
  return horseRoster
    .map((horse) => {
      const power = baseHorsePower(horse, condition, run);
      const odds = oddsMap.get(horse.id);
      const value = power * 0.78 + odds * 7 + (run.insight[horse.id] || 0) * 0.6;
      return { horse, value };
    })
    .sort((left, right) => right.value - left.value)[0].horse;
}

function runRace(run, chapterIndex) {
  const meeting = raceMeetings[(chapterIndex + run.races) % raceMeetings.length];
  const condition = conditionById.get(meeting.conditionId) || trackConditions[0];
  const oddsMap = computeOdds(run, meeting, condition);
  const selectedHorse = pickHorse(run, condition, oddsMap);
  const hand = drawHand(run);
  const pickedCards = pickCards(hand, selectedHorse, condition, oddsMap.get(selectedHorse.id));
  const impact = combineImpacts(pickedCards, selectedHorse, condition, oddsMap.get(selectedHorse.id));
  const stake = clamp(Math.round(run.chips * 0.28), oddsConfig.minBet, Math.min(oddsConfig.maxBet, run.chips));
  const entries = horseRoster
    .map((horse) => {
      const isSelected = horse.id === selectedHorse.id;
      const noiseRange = Math.max(12, 42 * meeting.volatility - (isSelected ? impact.stability : 0));
      const noise = (run.rng() - 0.48) * noiseRange;
      const score = baseHorsePower(horse, condition, run, isSelected ? impact.insight : 0) + (isSelected ? impact.score : 0) + noise;
      return { horse, score };
    })
    .sort((left, right) => right.score - left.score);

  const won = entries[0].horse.id === selectedHorse.id;
  const payout = won ? Math.round(stake * oddsMap.get(selectedHorse.id) * (1 + impact.payoutMultiplier)) : 0;
  const refund = won ? 0 : Math.round(stake * impact.refund);
  run.chips = Math.max(0, run.chips - stake + payout + refund);
  run.insight[selectedHorse.id] += Math.round(2 + impact.insight + (won ? 3 : 1));
  run.races += 1;
  return won;
}

function rewardCard(run, chapterIndex) {
  const owned = new Set(run.deck);
  const candidates = strategyCardCatalog.filter((card) => card.rarity !== "starter" || !owned.has(card.id));
  const chapterBias = chapterIndex > 2 ? ["rare", "uncommon"] : ["common", "uncommon"];
  const pool = candidates.filter((card) => chapterBias.includes(card.rarity));
  const picked = shuffle(pool.length ? pool : candidates, run.rng)[0];
  run.deck.push(picked.id);
}

function simulateRun(seedText) {
  const run = createRun(seedText);
  for (let chapterIndex = 0; chapterIndex < storyChapters.length - 1; chapterIndex += 1) {
    const goal = storyChapters[chapterIndex].fundingGoal;
    let racesThisChapter = 0;
    run.chapterReached = chapterIndex + 1;
    run.chips += 10 + chapterIndex * 3;
    while (run.chips < goal && racesThisChapter < balanceTargets.maxRacesPerChapter) {
      runRace(run, chapterIndex);
      racesThisChapter += 1;
      if (run.chips < oddsConfig.minBet) {
        if (run.emergencyUses < 2) {
          run.chips += oddsConfig.emergencyChips;
          run.emergencyUses += 1;
        } else {
          return run;
        }
      }
    }
    if (run.chips < goal) {
      return run;
    }
    rewardCard(run, chapterIndex);
  }
  run.won = true;
  run.chapterReached = storyChapters.length;
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
  const seed = process.argv[3] ?? "neon-derby-001";
  const results = [];
  for (let index = 0; index < runs; index += 1) {
    results.push(simulateRun(`${seed}:${index}`));
  }
  const wins = results.filter((result) => result.won);
  const winRate = wins.length / results.length;
  const averageChapters = results.reduce((sum, result) => sum + result.chapterReached, 0) / results.length;
  const averageRaces = results.reduce((sum, result) => sum + result.races, 0) / results.length;
  const finalChips = wins.map((result) => result.chips);
  const averageMinutes = (averageChapters / storyChapters.length) * fullRunMinutes;

  console.log("Neon Derby balance sim report");
  console.log(`Seed: ${seed}`);
  console.log(`Runs: ${runs}`);
  console.log(`Catalog: ${horseRoster.length} horses, ${strategyCardCatalog.length} strategy cards, ${raceMeetings.length} meetings`);
  console.log(`Win rate: ${formatPct(winRate)} (target ${formatPct(balanceTargets.targetWinRate[0])}-${formatPct(balanceTargets.targetWinRate[1])})`);
  console.log(`Average run length: ${averageMinutes.toFixed(1)} min (${averageChapters.toFixed(1)} chapters, ${averageRaces.toFixed(1)} races)`);
  console.log(`Target full clear length: ${fullRunMinutes} min`);
  if (finalChips.length > 0) {
    const averageFinalChips = finalChips.reduce((sum, chips) => sum + chips, 0) / finalChips.length;
    console.log(`Winner chips: avg ${averageFinalChips.toFixed(1)}, p10 ${percentile(finalChips, 10)}, p90 ${percentile(finalChips, 90)}`);
  }
  if (winRate < balanceTargets.targetWinRate[0] || winRate > balanceTargets.targetWinRate[1]) {
    console.error("Balance target missed.");
    process.exitCode = 1;
  }
}

main();
