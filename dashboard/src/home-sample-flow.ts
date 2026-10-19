/**
 * A self-contained walkthrough of one action going through Guard, used on Home to
 * explain the product in plain language. Nothing here touches the daemon or real
 * receipts: it is a demonstration and is labelled as one in the UI.
 */
import { harnessDisplayName } from "./approval-center-utils";
import { normalizeHarnessSlug } from "./harness-slug";

export type SampleDecision = "once" | "always" | "block";
export type SamplePhase = "idle" | "requested" | "checking" | "paused" | "decided";

export type SampleAction = {
  id: string;
  harness: string;
  appName: string;
  glyph: string;
  action: string;
  target: string;
  noun: string;
  reason: string;
  question: string;
};

export type SampleState = {
  phase: SamplePhase;
  sampleIndex: number;
  decision: SampleDecision | null;
  runs: number;
};

export type SampleEvent = { type: "run" } | { type: "advance" } | { type: "decide"; decision: SampleDecision } | { type: "reset" };

export const SAMPLE_ACTIONS: SampleAction[] = [
  {
    id: "install-package",
    harness: "claude-code",
    appName: "Claude Code",
    glyph: "CC",
    action: "Wants to install a package",
    target: "left-pad@9.9.9",
    noun: "package",
    reason: "New package. It has never been installed on this computer.",
    question: "Claude Code wants to install left-pad@9.9.9. It’s new here.",
  },
  {
    id: "read-secrets",
    harness: "codex",
    appName: "Codex",
    glyph: "Cx",
    action: "Wants to read a file",
    target: ".env",
    noun: "file",
    reason: "This file holds secrets. Guard always asks before an app reads it.",
    question: "Codex wants to read .env, which holds your secrets.",
  },
  {
    id: "add-tool",
    harness: "cursor",
    appName: "Cursor",
    glyph: "Cu",
    action: "Wants to add a tool",
    target: "weather-tools",
    noun: "tool",
    reason: "New tool from a publisher Guard hasn’t seen on this computer.",
    question: "Cursor wants to add a new tool called weather-tools.",
  },
];

/** Delay before each phase, in milliseconds (the UI collapses these to 0 under reduced motion). */
export const SAMPLE_PHASE_DELAYS_MS: Record<Exclude<SamplePhase, "idle" | "decided">, number> = {
  requested: 0,
  checking: 1150,
  paused: 1050,
};

export const INITIAL_SAMPLE_STATE: SampleState = { phase: "idle", sampleIndex: 0, decision: null, runs: 0 };

export function sampleReducer(state: SampleState, event: SampleEvent): SampleState {
  switch (event.type) {
    case "run":
      if (state.phase !== "idle" && state.phase !== "decided") return state;
      return { phase: "requested", sampleIndex: state.phase === "decided" ? state.sampleIndex + 1 : state.sampleIndex, decision: null, runs: state.runs + 1 };
    case "advance":
      if (state.phase === "requested") return { ...state, phase: "checking" };
      if (state.phase === "checking") return { ...state, phase: "paused" };
      return state;
    case "decide":
      if (state.phase !== "paused") return state;
      return { ...state, phase: "decided", decision: event.decision };
    case "reset":
      return { ...INITIAL_SAMPLE_STATE, sampleIndex: state.sampleIndex, runs: state.runs };
    default:
      return state;
  }
}

export function currentSample(state: SampleState, samples: SampleAction[] = SAMPLE_ACTIONS): SampleAction {
  return samples[state.sampleIndex % samples.length];
}

/** Uses the person's own connected apps in the walkthrough when one matches a sample. */
export function personalizeSamples(connectedHarnesses: string[], samples: SampleAction[] = SAMPLE_ACTIONS): SampleAction[] {
  const connected = new Set(connectedHarnesses.map((harness) => normalizeHarnessSlug(harness)).filter((slug): slug is string => slug !== null));
  if (connected.size === 0) return samples;
  const spare = Array.from(connected).filter((slug) => !samples.some((sample) => sample.harness === slug));
  return samples.map((sample) => {
    if (connected.has(sample.harness)) return sample;
    const replacement = spare.shift();
    if (!replacement) return sample;
    const appName = harnessDisplayName(replacement);
    return {
      ...sample,
      harness: replacement,
      appName,
      glyph: appName.slice(0, 2),
      question: sample.question.replace(sample.appName, appName),
    };
  });
}

/** Which of the three "How Guard protects you" steps is happening right now (0 = none). */
export function sampleStepForPhase(phase: SamplePhase): 0 | 1 | 2 | 3 {
  if (phase === "requested" || phase === "checking") return 1;
  if (phase === "paused") return 2;
  if (phase === "decided") return 3;
  return 0;
}

export type SampleCopy = {
  appNote: string;
  guardStatus: string;
  guardDetail: string;
  guardTag: { tone: "attention" | "success" | "default"; label: string } | null;
  youTitle: string;
  youBody: string;
  receiptLine: string | null;
  receiptNote: string | null;
};

export function buildSampleCopy(sample: SampleAction, state: SampleState): SampleCopy {
  const { phase, decision } = state;
  if (phase === "idle") {
    return {
      appNote: "Working normally. Run the sample to see what happens when it tries something new.",
      guardStatus: "Watching",
      guardDetail: "Nothing new right now.",
      guardTag: null,
      youTitle: "Nothing to decide",
      youBody: "Guard only asks when it can’t tell an action is safe.",
      receiptLine: null,
      receiptNote: null,
    };
  }
  if (phase === "requested") {
    return {
      appNote: "The app pauses here and waits for an answer.",
      guardStatus: "Watching",
      guardDetail: "Something new is on its way.",
      guardTag: null,
      youTitle: "Nothing to decide",
      youBody: "Guard only asks when it can’t tell an action is safe.",
      receiptLine: null,
      receiptNote: null,
    };
  }
  if (phase === "checking") {
    return {
      appNote: "The app pauses here and waits for an answer.",
      guardStatus: "Checking…",
      guardDetail: "Comparing against what this computer has seen before.",
      guardTag: null,
      youTitle: "Nothing to decide",
      youBody: "Guard only asks when it can’t tell an action is safe.",
      receiptLine: null,
      receiptNote: null,
    };
  }
  if (phase === "paused") {
    return {
      appNote: "The app pauses here and waits for an answer.",
      guardStatus: "Paused",
      guardDetail: sample.reason,
      guardTag: { tone: "attention", label: "Stopped before it ran" },
      youTitle: "Your call",
      youBody: sample.question,
      receiptLine: null,
      receiptNote: null,
    };
  }
  const verb = decision === "block" ? "blocked" : "allowed";
  const receiptLine = `${sample.appName} ${verb} ${sample.target}${decision === "once" ? " (once)" : ""}`;
  return {
    appNote: decision === "block" ? "The app was told no and moved on." : "The app got its answer and continued.",
    guardStatus: "Decision saved",
    guardDetail: "Back to watching.",
    guardTag: decision === "block" ? { tone: "default", label: "Blocked" } : { tone: "success", label: "Allowed" },
    youTitle: decision === "block" ? "Blocked" : decision === "once" ? "Allowed once" : "Always allowed",
    youBody:
      decision === "block"
        ? "The app gets a clear “no” and keeps running. Nothing was installed or read."
        : decision === "once"
          ? "The app continues. Guard will ask again next time, because you chose once."
          : `The app continues, and Guard won’t ask about this exact ${sample.noun} again on this computer. If it changes, Guard checks it again.`,
    receiptLine,
    receiptNote:
      "In real use this is saved on this computer as a receipt you can look back at in Evidence." +
      (decision === "always" ? " Remembered decisions can be cleared from Home at any time." : ""),
  };
}
