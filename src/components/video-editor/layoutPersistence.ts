import {
  DEFAULT_LAYOUT_TRANSITION_DURATION_MS,
  type LayoutEvent,
  type LayoutEventSource,
  type LayoutMode,
  type LayoutTransitionEasing,
} from "./layoutTransitions";

const LAYOUT_MODES = new Set<LayoutMode>(["presenter", "screen-pip"]);
const LAYOUT_SOURCES = new Set<LayoutEventSource>(["click", "shortcut", "manual"]);
const LAYOUT_EASINGS = new Set<LayoutTransitionEasing>([
  "recordly",
  "smooth",
  "snappy",
  "linear",
]);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function normalizePersistedLayoutEvents(value: unknown): LayoutEvent[] {
  if (!Array.isArray(value)) return [];

  const normalized: LayoutEvent[] = [];

  for (const candidate of value) {
    if (!candidate || typeof candidate !== "object") continue;

    const raw = candidate as Record<string, unknown>;
    if (typeof raw.id !== "string" || raw.id.length === 0) continue;
    if (!LAYOUT_MODES.has(raw.targetMode as LayoutMode)) continue;
    if (!LAYOUT_SOURCES.has(raw.source as LayoutEventSource)) continue;

    const timeMs = typeof raw.timeMs === "number" && Number.isFinite(raw.timeMs)
      ? Math.max(0, raw.timeMs)
      : 0;
    const transitionDurationMs =
      typeof raw.transitionDurationMs === "number" &&
      Number.isFinite(raw.transitionDurationMs) &&
      raw.transitionDurationMs >= 0
        ? raw.transitionDurationMs
        : DEFAULT_LAYOUT_TRANSITION_DURATION_MS;

    const event: LayoutEvent = {
      id: raw.id,
      timeMs,
      targetMode: raw.targetMode as LayoutMode,
      source: raw.source as LayoutEventSource,
      transitionDurationMs,
    };

    if (LAYOUT_EASINGS.has(raw.easing as LayoutTransitionEasing)) {
      event.easing = raw.easing as LayoutTransitionEasing;
    }
    if (typeof raw.webcamPositionX === "number" && Number.isFinite(raw.webcamPositionX)) {
      event.webcamPositionX = clamp01(raw.webcamPositionX);
    }
    if (typeof raw.webcamPositionY === "number" && Number.isFinite(raw.webcamPositionY)) {
      event.webcamPositionY = clamp01(raw.webcamPositionY);
    }
    if (typeof raw.webcamScale === "number" && Number.isFinite(raw.webcamScale)) {
      event.webcamScale = clamp01(raw.webcamScale);
    }

    normalized.push(event);
  }

  return normalized.sort((a, b) => a.timeMs - b.timeMs);
}
