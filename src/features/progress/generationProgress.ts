export type ProgressStatus = "waiting" | "active" | "done" | "error";

export type ProgressState = "running" | "complete" | "error";

export type ProgressPhase = {
  agent: string;
  title: string;
  content: string;
};

export type DecoratedProgressStep = ProgressPhase & {
  status: ProgressStatus;
};

export function decorateProgressSteps(
  phases: readonly ProgressPhase[],
  activeIndex: number,
  state: ProgressState = "running"
): DecoratedProgressStep[] {
  return phases.map((phase, index) => {
    if (state === "complete") {
      return { ...phase, status: "done" };
    }

    if (state === "error" && index === activeIndex) {
      return { ...phase, status: "error" };
    }

    if (index < activeIndex) {
      return { ...phase, status: "done" };
    }

    if (index === activeIndex) {
      return { ...phase, status: "active" };
    }

    return { ...phase, status: "waiting" };
  });
}

export function getProgressPercent(activeIndex: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.ceil(((activeIndex + 1) / total) * 100));
}
