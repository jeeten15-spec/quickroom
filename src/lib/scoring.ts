import { scoringRules, temperatureThresholds, type ScoreInput } from "@/config/scoring";

export type ScoreResult = {
  score: number;
  reasons: { id: string; label: string; points: number }[];
  temperature: "HOT" | "WARM" | "NURTURE";
};

export function scoreLead(input: ScoreInput): ScoreResult {
  const reasons = scoringRules
    .filter((rule) => rule.test(input))
    .map((rule) => ({ id: rule.id, label: rule.label, points: rule.points }));
  const score = reasons.reduce((sum, r) => sum + r.points, 0);
  const temperature: ScoreResult["temperature"] =
    score >= temperatureThresholds.hot ? "HOT" : score >= temperatureThresholds.warm ? "WARM" : "NURTURE";
  return { score, reasons, temperature };
}
