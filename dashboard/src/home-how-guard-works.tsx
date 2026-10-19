import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { HiMiniChevronDown, HiMiniChevronUp, HiMiniDocumentCheck, HiMiniEye, HiMiniHandRaised, HiMiniPlay } from "react-icons/hi2";

import { ActionButton, Badge, SectionLabel } from "./approval-center-primitives";
import { brandMarkSvg } from "./brand-mark-geometry";
import {
  buildSampleCopy,
  currentSample,
  INITIAL_SAMPLE_STATE,
  personalizeSamples,
  SAMPLE_PHASE_DELAYS_MS,
  sampleReducer,
  sampleStepForPhase,
  type SampleDecision,
} from "./home-sample-flow";
import { useReducedMotion } from "./use-reduced-motion";

export const HOW_GUARD_WORKS_STEPS = [
  {
    title: "Guard watches",
    body: "It sits in front of AI apps like Claude Code, Codex, and Cursor, and sees what they’re about to do on this computer.",
    icon: HiMiniEye,
  },
  {
    title: "Guard pauses what’s new",
    body: "A package it hasn’t seen, a file with secrets, a new tool. Anything unfamiliar stops before it runs.",
    icon: HiMiniHandRaised,
  },
  {
    title: "You decide, Guard remembers",
    body: "Allow or block in one click. Every decision is saved as a receipt, so Guard won’t ask about the same thing twice unless you want it to.",
    icon: HiMiniDocumentCheck,
  },
] as const;

const COLLAPSE_STORAGE_KEY = "guard-collapsed-how-guard-works";

/** New installs see the walkthrough open; once Guard has a history, it starts collapsed. */
export function resolveHowGuardWorksDefaultOpen(receiptCount: number): boolean {
  return receiptCount < 20;
}

function readStoredOpen(): boolean | null {
  try {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(COLLAPSE_STORAGE_KEY) : null;
    return stored === null ? null : stored === "1";
  } catch {
    return null;
  }
}

function writeStoredOpen(open: boolean): void {
  try {
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, open ? "1" : "0");
  } catch {
    return;
  }
}

/** Lets another part of Home open the walkthrough and scroll to it (the hero's "How Guard works" button). */
export function useHowGuardWorksReveal(): { openSignal: number; reveal: () => void } {
  const [openSignal, setOpenSignal] = useState(0);
  const reducedMotion = useReducedMotion();
  const reveal = useCallback(() => {
    setOpenSignal((value) => value + 1);
    window.setTimeout(() => {
      document.getElementById("guard-how-it-works")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    }, 0);
  }, [reducedMotion]);
  return { openSignal, reveal };
}

export function HomeHowGuardWorks(props: { receiptCount: number; connectedHarnesses: string[]; openSignal?: number }) {
  const [open, setOpen] = useState<boolean>(() => readStoredOpen() ?? resolveHowGuardWorksDefaultOpen(props.receiptCount));
  useEffect(() => {
    if (props.openSignal) {
      setOpen(true);
      writeStoredOpen(true);
    }
  }, [props.openSignal]);
  const toggle = useCallback(() => {
    setOpen((previous) => {
      writeStoredOpen(!previous);
      return !previous;
    });
  }, []);

  const reducedMotion = useReducedMotion();
  const samples = useMemo(() => personalizeSamples(props.connectedHarnesses), [props.connectedHarnesses]);
  const [state, dispatch] = useReducer(sampleReducer, INITIAL_SAMPLE_STATE);
  const sample = currentSample(state, samples);
  const copy = buildSampleCopy(sample, state);
  const litStep = sampleStepForPhase(state.phase);

  useEffect(() => {
    if (state.phase !== "requested" && state.phase !== "checking") return;
    const delay = reducedMotion ? 0 : state.phase === "requested" ? SAMPLE_PHASE_DELAYS_MS.checking : SAMPLE_PHASE_DELAYS_MS.paused;
    const timer = window.setTimeout(() => dispatch({ type: "advance" }), delay);
    return () => window.clearTimeout(timer);
  }, [state.phase, reducedMotion]);

  const handleRun = useCallback(() => dispatch({ type: "run" }), []);
  const handleDecide = useCallback((decision: SampleDecision) => dispatch({ type: "decide", decision }), []);
  const running = state.phase === "requested" || state.phase === "checking" || state.phase === "paused";
  const markState = state.phase === "decided" ? (state.decision === "block" ? "blocked" : "allowed") : state.phase;

  return (
    <section id="guard-how-it-works" className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm" aria-label="How Guard protects you">
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <button type="button" onClick={toggle} className="flex min-w-0 flex-1 items-start gap-3 text-left" aria-expanded={open} aria-controls="guard-how-it-works-body">
          <div className="min-w-0 flex-1">
            <SectionLabel>How Guard protects you</SectionLabel>
            <p className="mt-1 text-sm text-slate-500">Guard sits between your AI apps and this computer. Three things happen, every time.</p>
          </div>
          {open ? (
            <HiMiniChevronUp className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : (
            <HiMiniChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
        </button>
        {open ? (
          <ActionButton onClick={handleRun} disabled={running} className="w-full shrink-0 sm:w-auto">
            <HiMiniPlay className="mr-2 h-4 w-4" aria-hidden="true" />
            {state.phase === "decided" ? "Run another sample" : "Run a sample action"}
          </ActionButton>
        ) : null}
      </div>

      {open ? (
        <div id="guard-how-it-works-body">
          <ol className="grid gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-3">
            {HOW_GUARD_WORKS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const number = index + 1;
              const lit = litStep === number;
              const done = litStep > number;
              return (
                <li key={step.title} className={`guard-how-step bg-white px-5 py-4${lit ? " guard-how-step--lit" : ""}${done ? " guard-how-step--done" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="guard-how-step-icon inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue transition-colors">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-semibold text-brand-dark">
                      <span className="mr-1.5 font-mono text-[11px] text-slate-400">{number}</span>
                      {step.title}
                    </p>
                  </div>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-500">{step.body}</p>
                </li>
              );
            })}
          </ol>

          <div className="border-t border-slate-100 bg-surface-1/60 px-5 py-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-brand-dark">Watch a sample action go through Guard</p>
              <p className="text-xs text-slate-500">This is a demonstration. Nothing runs on your computer.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)_auto_minmax(0,1fr)] sm:items-stretch">
              <div className={`guard-sample-card rounded-xl border border-slate-200 bg-white p-4${litStep === 1 ? " guard-sample-card--active" : ""}`}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">AI app</p>
                <div className="mt-2 flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 font-mono text-[11px] font-bold text-brand-dark">{sample.glyph}</span>
                  <p className="text-sm font-semibold text-brand-dark">{sample.appName}</p>
                </div>
                <div className={`guard-sample-chip mt-3 rounded-lg border border-brand-blue/20 bg-brand-blue/[0.05] px-3 py-2${state.phase === "idle" ? " guard-sample-chip--hidden" : ""}`} aria-hidden={state.phase === "idle"}>
                  <p className="text-xs font-medium text-brand-dark">{sample.action}</p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-brand-dark/70">{sample.target}</p>
                </div>
                <p className="mt-3 text-xs text-slate-500">{copy.appNote}</p>
              </div>
              <div className={`guard-sample-link${state.phase === "requested" ? " guard-sample-link--sending" : ""}`} aria-hidden="true">
                <span className="guard-sample-dot" />
              </div>
              <div className={`guard-sample-card rounded-xl border border-slate-200 bg-white p-4${litStep === 2 || state.phase === "checking" ? " guard-sample-card--active" : ""}`}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Guard</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="guard-sample-mark h-12 w-12 shrink-0" data-state={markState} dangerouslySetInnerHTML={{ __html: brandMarkSvg("#3f4174") }} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-dark">{copy.guardStatus}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{copy.guardDetail}</p>
                  </div>
                </div>
                {copy.guardTag ? (
                  <div className="mt-3">
                    <Badge tone={copy.guardTag.tone}>{copy.guardTag.label}</Badge>
                  </div>
                ) : null}
              </div>
              <div className={`guard-sample-link${state.phase === "paused" ? " guard-sample-link--sending" : ""}`} aria-hidden="true">
                <span className="guard-sample-dot" />
              </div>
              <div className={`guard-sample-card rounded-xl border border-slate-200 bg-white p-4${litStep === 3 || state.phase === "paused" ? " guard-sample-card--active" : ""}`}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">You</p>
                <div className="mt-2">
                  <p className="text-sm font-semibold text-brand-dark">{copy.youTitle}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{copy.youBody}</p>
                  {state.phase === "paused" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <SampleDecisionButton label="Allow once" decision="once" variant="primary" onDecide={handleDecide} />
                      <SampleDecisionButton label="Always allow" decision="always" variant="outline" onDecide={handleDecide} />
                      <SampleDecisionButton label="Block" decision="block" variant="danger" onDecide={handleDecide} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            {copy.receiptLine ? (
              <div className="guard-fade-in mt-3 flex flex-col gap-2 rounded-xl border border-brand-green/25 bg-brand-green/[0.05] px-4 py-3 sm:flex-row sm:items-start sm:gap-3" role="status">
                <HiMiniDocumentCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-text" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brand-dark">Sample receipt: {copy.receiptLine}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{copy.receiptNote}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function SampleDecisionButton(props: {
  label: string;
  decision: SampleDecision;
  variant: "primary" | "outline" | "danger";
  onDecide: (decision: SampleDecision) => void;
}) {
  const handleClick = useCallback(() => props.onDecide(props.decision), [props.onDecide, props.decision]);
  return (
    <ActionButton variant={props.variant} onClick={handleClick}>
      {props.label}
    </ActionButton>
  );
}
