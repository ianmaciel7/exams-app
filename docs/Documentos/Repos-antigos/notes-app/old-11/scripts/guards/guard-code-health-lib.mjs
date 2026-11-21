const SCORE_EPSILON = 0.05;

function countOf(list) {
  return Array.isArray(list) ? list.length : 0;
}

export function readHealthMetrics(report) {
  const score = report.health_score?.score;
  if (typeof score !== "number") {
    throw new Error("health report has no health_score.score");
  }
  return {
    score,
    complexityFindings: countOf(report.findings),
    largeFunctions: countOf(report.large_functions),
  };
}

export function evaluateHealth(metrics, floor) {
  const failures = [];
  if (metrics.score + SCORE_EPSILON < floor.minScore) {
    failures.push({
      metric: "score",
      actual: metrics.score,
      limit: floor.minScore,
    });
  }
  if (metrics.complexityFindings > floor.maxComplexityFindings) {
    failures.push({
      metric: "complexityFindings",
      actual: metrics.complexityFindings,
      limit: floor.maxComplexityFindings,
    });
  }
  if (metrics.largeFunctions > floor.maxLargeFunctions) {
    failures.push({
      metric: "largeFunctions",
      actual: metrics.largeFunctions,
      limit: floor.maxLargeFunctions,
    });
  }
  return { failures, canTighten: canTighten(metrics, floor) };
}

function canTighten(metrics, floor) {
  return (
    metrics.score - SCORE_EPSILON > floor.minScore ||
    metrics.complexityFindings < floor.maxComplexityFindings ||
    metrics.largeFunctions < floor.maxLargeFunctions
  );
}

export function tightenFloor(metrics, floor) {
  return {
    minScore: Math.max(floor.minScore, metrics.score),
    maxComplexityFindings: Math.min(
      floor.maxComplexityFindings,
      metrics.complexityFindings
    ),
    maxLargeFunctions: Math.min(
      floor.maxLargeFunctions,
      metrics.largeFunctions
    ),
  };
}
