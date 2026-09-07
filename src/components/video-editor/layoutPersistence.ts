import {
	DEFAULT_LAYOUT_TRANSITION_DURATION_MS,
	type LayoutEasing,
	type LayoutEvent,
	type LayoutEventSource,
	type LayoutMode,
} from "./layoutTransitions";

function isFiniteNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function isLayoutMode(value: unknown): value is LayoutMode {
	return value === "presenter" || value === "screen-pip";
}

function isLayoutEventSource(value: unknown): value is LayoutEventSource {
	return value === "click" || value === "hotkey" || value === "manual";
}

function normalizeLayoutEasing(value: unknown): LayoutEasing {
	return value === "linear" ? "linear" : "smooth";
}

export function normalizePersistedLayoutEvents(value: unknown): LayoutEvent[] {
	if (!Array.isArray(value)) return [];

	return value
		.filter((candidate): candidate is Record<string, unknown> => {
			if (!candidate || typeof candidate !== "object") return false;
			return (
				typeof candidate.id === "string" &&
				candidate.id.trim().length > 0 &&
				isFiniteNumber(candidate.timeMs) &&
				isLayoutMode(candidate.mode) &&
				isLayoutEventSource(candidate.source)
			);
		})
		.map((candidate) => ({
			id: candidate.id as string,
			timeMs: Math.max(0, Math.round(candidate.timeMs as number)),
			mode: candidate.mode as LayoutMode,
			source: candidate.source as LayoutEventSource,
			transitionDurationMs: isFiniteNumber(candidate.transitionDurationMs)
				? clamp(Math.round(candidate.transitionDurationMs), 0, 4000)
				: DEFAULT_LAYOUT_TRANSITION_DURATION_MS,
			easing: normalizeLayoutEasing(candidate.easing),
			...(isFiniteNumber(candidate.cameraScale)
				? { cameraScale: clamp(candidate.cameraScale, 0.1, 1) }
				: {}),
			...(isFiniteNumber(candidate.cameraX) ? { cameraX: clamp(candidate.cameraX, 0, 1) } : {}),
			...(isFiniteNumber(candidate.cameraY) ? { cameraY: clamp(candidate.cameraY, 0, 1) } : {}),
		}))
		.sort((a, b) => a.timeMs - b.timeMs);
}
