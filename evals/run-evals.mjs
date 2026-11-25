import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATASETS_DIR = join(__dirname, 'datasets');

// ANSI Color formatting
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;

console.log(`\n${bold('======================================================================')}`);
console.log(`${bold(cyan('  EXAM APP — EVALUATION HARNESS & BENCHMARK SUITE (EVALS)'))}`);
console.log(`${bold('======================================================================')}\n`);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

const startTime = Date.now();

// Suite 1: Delegation Contract Evals (AGENTS.md)
function runDelegationEvals() {
  const filePath = join(DATASETS_DIR, 'delegation-contracts.json');
  const testCases = JSON.parse(readFileSync(filePath, 'utf8'));

  console.log(`${bold('Suite 1: Hierarchical Multi-Agent Delegation Contracts (AGENTS.md)')}`);

  for (const tc of testCases) {
    totalTests++;
    const errors = [];
    const text = tc.sample_output || '';

    // Check mandatory fields
    for (const field of tc.expected_fields) {
      if (!text.toLowerCase().includes(field.toLowerCase())) {
        errors.push(`Missing mandatory contract field: "${field}"`);
      }
    }

    // Check prohibited patterns
    for (const pattern of tc.prohibited_patterns) {
      if (text.includes(pattern)) {
        errors.push(`Found prohibited pattern: "${pattern}"`);
      }
    }

    const passed = errors.length === 0;
    if (passed) {
      passedTests++;
      console.log(`  ${green('✓ PASS')} [${tc.id}] ${tc.description}`);
    } else {
      failedTests++;
      console.log(`  ${red('✗ FAIL')} [${tc.id}] ${tc.description}`);
      for (const err of errors) console.log(`      ${red('→')} ${err}`);
    }

    results.push({ id: tc.id, suite: 'Delegation', passed, errors });
  }
  console.log();
}

// Suite 2: Question Provenance & Anti-Hallucination Evals
function runProvenanceEvals() {
  const filePath = join(DATASETS_DIR, 'question-provenance.json');
  const testCases = JSON.parse(readFileSync(filePath, 'utf8'));

  console.log(`${bold('Suite 2: Question Provenance & Anti-Hallucination Integrity')}`);

  for (const tc of testCases) {
    totalTests++;
    const errors = [];
    const text = tc.sample_output || '';

    // Check expected metadata
    if (tc.expected_metadata) {
      for (const [key, val] of Object.entries(tc.expected_metadata)) {
        if (!text.toLowerCase().includes(val.toLowerCase())) {
          errors.push(`Missing expected metadata [${key}: "${val}"]`);
        }
      }
    }

    // Check anti-hallucination prohibitions
    if (tc.forbidden_hallucinations) {
      for (const forbidden of tc.forbidden_hallucinations) {
        if (text.includes(forbidden)) {
          errors.push(`Hallucination detected! Forbidden token found: "${forbidden}"`);
        }
      }
    }

    const passed = errors.length === 0;
    if (passed) {
      passedTests++;
      console.log(`  ${green('✓ PASS')} [${tc.id}] ${tc.description}`);
    } else {
      failedTests++;
      console.log(`  ${red('✗ FAIL')} [${tc.id}] ${tc.description}`);
      for (const err of errors) console.log(`      ${red('→')} ${err}`);
    }

    results.push({ id: tc.id, suite: 'Provenance', passed, errors });
  }
  console.log();
}

// Suite 3: Mock Exam Rules & Scoring Logic Evals
function runRulesEvals() {
  const filePath = join(DATASETS_DIR, 'mock-exam-rules.json');
  const testCases = JSON.parse(readFileSync(filePath, 'utf8'));

  console.log(`${bold('Suite 3: Exam Rules, Timer & Scoring Math Verification')}`);

  for (const tc of testCases) {
    totalTests++;
    const errors = [];

    if (tc.id === 'tc-rules-01-accuracy-calculation') {
      const calcPct = (tc.inputs.correct_attempts / tc.inputs.total_attempts) * 100;
      if (calcPct !== tc.expected_result.accuracy_percentage) {
        errors.push(`Accuracy mismatch: expected ${tc.expected_result.accuracy_percentage}%, got ${calcPct}%`);
      }
    } else if (tc.id === 'tc-rules-02-missed-filter-transition') {
      const latestAttempt = tc.inputs.attempts[tc.inputs.attempts.length - 1];
      const isInMissed = !latestAttempt.is_correct;
      if (isInMissed !== tc.expected_result.in_active_missed_filter) {
        errors.push(`Filter state mismatch: expected in_active_missed_filter=${tc.expected_result.in_active_missed_filter}`);
      }
      if (tc.inputs.attempts.length !== tc.expected_result.preserved_attempt_count) {
        errors.push(`Attempt history count mismatch: expected ${tc.expected_result.preserved_attempt_count}`);
      }
    } else if (tc.id === 'tc-rules-03-mock-interruption-timer') {
      const remaining = tc.inputs.initial_duration_minutes - tc.inputs.elapsed_minutes_before_exit;
      if (remaining !== tc.expected_result.remaining_minutes_on_resume) {
        errors.push(`Timer math mismatch: expected ${tc.expected_result.remaining_minutes_on_resume} min, got ${remaining} min`);
      }
    }

    const passed = errors.length === 0;
    if (passed) {
      passedTests++;
      console.log(`  ${green('✓ PASS')} [${tc.id}] ${tc.description}`);
    } else {
      failedTests++;
      console.log(`  ${red('✗ FAIL')} [${tc.id}] ${tc.description}`);
      for (const err of errors) console.log(`      ${red('→')} ${err}`);
    }

    results.push({ id: tc.id, suite: 'Rules', passed, errors });
  }
  console.log();
}

// Run all suites
runDelegationEvals();
runProvenanceEvals();
runRulesEvals();

const duration = Date.now() - startTime;
const passRate = ((passedTests / totalTests) * 100).toFixed(1);

console.log(`${bold('----------------------------------------------------------------------')}`);
console.log(`${bold('  EVALUATION SUMMARY & METRICS')}`);
console.log(`${bold('----------------------------------------------------------------------')}`);
console.log(`  Total Test Cases : ${bold(totalTests)}`);
console.log(`  Passed           : ${green(bold(passedTests))}`);
console.log(`  Failed           : ${failedTests > 0 ? red(bold(failedTests)) : '0'}`);
console.log(`  Pass Rate        : ${passedTests === totalTests ? green(bold(`${passRate}%`)) : yellow(bold(`${passRate}%`))}`);
console.log(`  Latency          : ${duration}ms`);
console.log(`${bold('======================================================================\n')}`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
