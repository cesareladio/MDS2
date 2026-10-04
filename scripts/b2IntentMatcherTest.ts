// scripts/b2IntentMatcherTest.ts — Test runner CLI puro para B2 Intent Matching
//
// Ejecutar con: npm run test:b2-intents
//
// Este script vive FUERA de src/ a propósito: no forma parte del bundle de
// la app ni del build de Vite/tsc del frontend. Importa el matcher y el
// corpus directamente desde src/data como única fuente de verdad.

import { INTENT_CASES, FALSE_POSITIVE_CASES } from '../src/data/intentCases'
import { matchIntent } from '../src/data/b2IntentMatcher'

interface TestCase {
  transcript: string
  intent?: string
  label?: string
  previousIntent?: string
}

export async function runB2IntentTests() {
  const cases: TestCase[] = INTENT_CASES
  let total = 0, passed = 0, failed = 0, criticalFail = false
  const failures: any[] = []
  const mainScriptCases = cases.filter(tc => (tc.label || '').match(/guion/i))

  function fmtPct(v: number) { return (v * 100).toFixed(2) + "%" }

  for (const test of cases) {
    total++
    const ctx: any = test.previousIntent ? { previousIntent: test.previousIntent as any } : {}
    const res = matchIntent(test.transcript, ctx)
    if ((res.best.intent === test.intent && res.accepted) || (!test.intent && !res.accepted)) {
      passed++
    } else {
      failed++
      const failObj = {
        transcript: test.transcript,
        label: test.label,
        previousIntent: test.previousIntent,
        expected: test.intent,
        actual: res.best.intent,
        score: res.best.score,
        accepted: res.accepted,
        breakdown: res.candidates.find(c => c.intent === res.best.intent)?.breakdown,
        topCandidates: res.candidates.slice(0, 3)
      }
      failures.push(failObj)
      if (mainScriptCases.includes(test)) criticalFail = true
    }
  }

  // Negativos (falsos positivos)
  let falsePositiveFail = 0
  for (const test of FALSE_POSITIVE_CASES) {
    const res = matchIntent(test.transcript, {})
    if (res.accepted) {
      falsePositiveFail++
      failed++
      failures.push({ ...test, expected: 'NO_MATCH', actual: res.best.intent, score: res.best.score, accepted: true,
        failureType: 'FALSE_POSITIVE', topCandidates: res.candidates.slice(0, 3) })
    } else {
      passed++
    }
    total++
  }

  const accuracy = passed / total

  const categories = {
    script: mainScriptCases.length ? fmtPct(
      mainScriptCases.filter(tc => {
        const res = matchIntent(tc.transcript, tc.previousIntent ? { previousIntent: tc.previousIntent as any } : {})
        return res.best.intent === tc.intent && res.accepted
      }).length / mainScriptCases.length) : "-",
    paraphrase: fmtPct(passed / total),
    negative: fmtPct(1 - falsePositiveFail / (FALSE_POSITIVE_CASES.length || 1))
  }

  console.log("\nB2 INTENT MATCHER TESTS\n=========================")
  console.log(`Total:    ${total}`)
  console.log(`Passed:   ${passed}`)
  console.log(`Failed:   ${failed}`)
  console.log(`Accuracy: ${(accuracy * 100).toFixed(2)}%`)
  console.log("By category:")
  Object.entries(categories).forEach(([k, v]) => console.log(k.padEnd(12, " ") + "... " + v))
  if (criticalFail) {
    console.log("\nCRITICAL FAIL: Fallaron frases del guion original\n")
  }
  if (failures.length) {
    console.log(`\nFailures:`)
    failures.forEach(fail => {
      console.log("\n[FAIL]")
      Object.entries(fail).forEach(([k, v]) =>
        (typeof v !== 'object' || v === null) ? console.log(k + ':', v) : null)
      if (fail.breakdown) console.log("Breakdown:", fail.breakdown)
      if (fail.topCandidates) {
        console.log("Top candidates:")
        fail.topCandidates.forEach(
          (c: any) => console.log("  ", c.intent, Math.round((c.score || 0) * 100) + "%"))
      }
    })
  }

  process.exit((failed || criticalFail) ? 1 : 0)
}

runB2IntentTests()
