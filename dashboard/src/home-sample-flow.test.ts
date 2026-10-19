import {
  buildSampleCopy,
  currentSample,
  INITIAL_SAMPLE_STATE,
  personalizeSamples,
  SAMPLE_ACTIONS,
  sampleReducer,
  sampleStepForPhase,
  type SampleState,
} from "./home-sample-flow";
import { HOW_GUARD_WORKS_STEPS, resolveHowGuardWorksDefaultOpen } from "./home-how-guard-works";
import { buildSetupAppsCopy, resolveSetupApps } from "./home-setup-card";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const JARGON_WORDS = ["MCP", "harness", "runtime", "artifact"];
function containsJargon(text: string): boolean {
  return JARGON_WORDS.some((word) => text.toLowerCase().includes(word.toLowerCase()));
}

// --- the walkthrough runs: idle → requested → checking → paused → decided → (run again)
let state: SampleState = INITIAL_SAMPLE_STATE;
assert(sampleReducer(state, { type: "advance" }).phase === "idle", "advance does nothing while idle");
assert(sampleReducer(state, { type: "decide", decision: "block" }).phase === "idle", "cannot decide before Guard pauses");
state = sampleReducer(state, { type: "run" });
assert(state.phase === "requested" && state.runs === 1, "run starts the walkthrough");
assert(sampleReducer(state, { type: "run" }).phase === "requested", "run is ignored while a sample is in flight");
state = sampleReducer(state, { type: "advance" });
assert(state.phase === "checking", "first advance moves to checking");
assert(sampleReducer(state, { type: "decide", decision: "once" }).phase === "checking", "cannot decide while checking");
state = sampleReducer(state, { type: "advance" });
assert(state.phase === "paused", "second advance pauses the action");
assert(sampleReducer(state, { type: "advance" }).phase === "paused", "paused waits for the person");
state = sampleReducer(state, { type: "decide", decision: "always" });
assert(state.phase === "decided" && state.decision === "always", "decision is recorded");
const next = sampleReducer(state, { type: "run" });
assert(next.phase === "requested" && next.sampleIndex === 1 && next.decision === null, "running again moves to the next sample");
assert(currentSample(next).id === SAMPLE_ACTIONS[1].id, "sample index selects the next sample");
assert(currentSample({ ...next, sampleIndex: SAMPLE_ACTIONS.length }).id === SAMPLE_ACTIONS[0].id, "samples wrap around");
assert(sampleReducer(state, { type: "reset" }).phase === "idle", "reset returns to idle");

// --- steps light in order
assert(sampleStepForPhase("idle") === 0 && sampleStepForPhase("requested") === 1 && sampleStepForPhase("checking") === 1, "watching step lights first");
assert(sampleStepForPhase("paused") === 2 && sampleStepForPhase("decided") === 3, "pause then decide");

// --- copy is honest and plain
for (const sample of SAMPLE_ACTIONS) {
  for (const phase of ["idle", "requested", "checking", "paused"] as const) {
    const copy = buildSampleCopy(sample, { phase, sampleIndex: 0, decision: null, runs: 1 });
    const text = [copy.appNote, copy.guardStatus, copy.guardDetail, copy.youTitle, copy.youBody, copy.guardTag?.label ?? ""].join(" ");
    assert(!containsJargon(text), `sample copy avoids jargon in ${phase} — got "${text}"`);
    assert(copy.receiptLine === null, `no receipt before a decision (${phase})`);
  }
  for (const decision of ["once", "always", "block"] as const) {
    const copy = buildSampleCopy(sample, { phase: "decided", sampleIndex: 0, decision, runs: 1 });
    assert(copy.receiptLine !== null && copy.receiptLine.includes(sample.appName), "receipt names the app");
    assert(copy.receiptLine!.includes(decision === "block" ? "blocked" : "allowed"), "receipt states the decision");
    assert(decision !== "once" || copy.receiptLine!.endsWith("(once)"), "one-time approvals are marked");
    assert(copy.receiptNote !== null && copy.receiptNote.includes("In real use"), "the sample says it is a demonstration");
    assert(!containsJargon(`${copy.youBody} ${copy.receiptNote}`), "decision copy avoids jargon");
  }
}
const pausedCopy = buildSampleCopy(SAMPLE_ACTIONS[0], { phase: "paused", sampleIndex: 0, decision: null, runs: 1 });
assert(pausedCopy.guardTag?.tone === "attention" && pausedCopy.youTitle === "Your call", "paused state asks the person");

// --- the walkthrough uses the person's own apps when it can
const personalized = personalizeSamples(["hermes", "claude-code"]);
assert(personalized[0].appName === "Claude Code", "connected sample apps keep their own sample");
assert(personalized[1].appName === "Hermes" && personalized[1].question.startsWith("Hermes "), "an unmatched connected app replaces a sample app");
assert(personalized[2].appName === "Cursor", "remaining samples keep their defaults");
assert(personalizeSamples([]) === SAMPLE_ACTIONS, "no connected apps keeps the defaults");

// --- how-it-works defaults and copy
assert(resolveHowGuardWorksDefaultOpen(0) && resolveHowGuardWorksDefaultOpen(19) && !resolveHowGuardWorksDefaultOpen(20), "walkthrough opens for new installs only");
assert(HOW_GUARD_WORKS_STEPS.length === 3, "three steps");
for (const step of HOW_GUARD_WORKS_STEPS) {
  assert(!containsJargon(`${step.title} ${step.body}`), `step copy avoids jargon — got "${step.title}"`);
}

// --- first-run setup card lists what Guard actually knows about
const setupApps = resolveSetupApps(
  [
    { harness: "cursor", active: false, workspace: null, manifest: {}, updated_at: "2026-10-17T00:00:00Z" },
    { harness: "codex", active: true, workspace: null, manifest: {}, updated_at: "2026-10-17T00:00:00Z" },
  ],
  ["claude-code", "cursor", "*"]
);
assert(setupApps.length === 2, `active installs and non-displayable names are skipped — got ${setupApps.length}`);
assert(setupApps[0].name === "Claude Code" && setupApps[0].state === "found", "observed apps are marked found");
assert(setupApps[1].name === "Cursor" && setupApps[1].state === "partial", "inactive managed installs are marked partial");
assert(!containsJargon(buildSetupAppsCopy(setupApps)) && !containsJargon(buildSetupAppsCopy([])), "setup copy avoids jargon");
assert(buildSetupAppsCopy([]).includes("run it once"), "empty state tells people how Guard will find their app");

console.log("home-sample-flow tests passed");
