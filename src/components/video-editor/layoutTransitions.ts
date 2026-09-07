export type LayoutMode = "presenter" | "screen-pip";
export type LayoutEventSource = "click" | "hotkey" | "manual";
export type LayoutEasing = "smooth" | "linear";

export interface LayoutEvent {
	id: string;
	timeMs: number;
	mode: LayoutMode;
	source: LayoutEventSource;
	transitionDurationMs: number;
	easing: LayoutEasing;
	cameraScale?: number;
	cameraX?: number;
	cameraY?: number;
}

export interface ResolvedLayoutState {
	mode: LayoutMode;
	cameraScale: number;
	cameraX: number;
	cameraY: number;
	cameraOpacity: number;
	screenOpacity: number;
}

export const DEFAULT_LAYOUT_TRANSITION_DURATION_MS = 650;
export const DEFAULT_SCREEN_PIP_CAMERA_SCALE = 0.26;
export const DEFAULT_SCREEN_PIP_CAMERA_X = 0.84;
export const DEFAULT_SCREEN_PIP_CAMERA_Y = 0.82;

export const PRESENTER_LAYOUT_STATE: ResolvedLayoutState = {
	mode: "presenter",
	cameraScale: 1,
	cameraX: 0.5,
	cameraY: 0.5,
	cameraOpacity: 1,
	screenOpacity: 0,
};

export const SCREEN_PIP_LAYOUT_STATE: ResolvedLayoutState = {
	mode: "screen-pip",
	cameraScale: DEFAULT_SCREEN_PIP_CAMERA_SCALE,
	cameraX: DEFAULT_SCREEN_PIP_CAMERA_X,
	cameraY: DEFAULT_SCREEN_PIP_CAMERA_Y,
	cameraOpacity: 1,
	screenOpacity: 1,
};

function clamp01(value: number): number {
	return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number): number {
	const t = clamp01(value);
	return t * t * (3 - 2 * t);
}

function interpolate(from: number, to: number, progress: number): number {
	return from + (to - from) * progress;
}

export function layoutStateForEvent(event: LayoutEvent | undefined): ResolvedLayoutState {
	if (!event || event.mode === "presenter") return { ...PRESENTER_LAYOUT_STATE };
	return {
		...SCREEN_PIP_LAYOUT_STATE,
		cameraScale: event.cameraScale ?? SCREEN_PIP_LAYOUT_STATE.cameraScale,
		cameraX: event.cameraX ?? SCREEN_PIP_LAYOUT_STATE.cameraX,
		cameraY: event.cameraY ?? SCREEN_PIP_LAYOUT_STATE.cameraY,
	};
}

/**
 * Resolves the non-destructive layout animation at a media timestamp.
 * Events describe target states; their transition begins at `timeMs`.
 */
export function resolveLayoutAtTime(timeMs: number, events: LayoutEvent[]): ResolvedLayoutState {
	const sorted = [...events].sort((a, b) => a.timeMs - b.timeMs);
	let previousState = { ...PRESENTER_LAYOUT_STATE };

	for (const event of sorted) {
		if (timeMs < event.timeMs) return previousState;

		const targetState = layoutStateForEvent(event);
		const duration = Math.max(0, event.transitionDurationMs);
		if (duration === 0 || timeMs >= event.timeMs + duration) {
			previousState = targetState;
			continue;
		}

		const rawProgress = (timeMs - event.timeMs) / duration;
		const progress = event.easing === "linear" ? clamp01(rawProgress) : smoothstep(rawProgress);
		return {
			mode: event.mode,
			cameraScale: interpolate(previousState.cameraScale, targetState.cameraScale, progress),
			cameraX: interpolate(previousState.cameraX, targetState.cameraX, progress),
			cameraY: interpolate(previousState.cameraY, targetState.cameraY, progress),
			cameraOpacity: interpolate(previousState.cameraOpacity, targetState.cameraOpacity, progress),
			screenOpacity: interpolate(previousState.screenOpacity, targetState.screenOpacity, progress),
		};
	}

	return previousState;
}

/**
 * Converts recording interactions into editable layout events.
 * A click only enters Screen/PIP while currently in Presenter mode.
 * A hotkey only returns to Presenter while currently in Screen/PIP mode.
 */
export function appendRecordingLayoutEvent(
	events: LayoutEvent[],
	timeMs: number,
	source: "click" | "hotkey",
): LayoutEvent[] {
	const current = resolveLayoutAtTime(timeMs, events).mode;
	const target: LayoutMode = source === "click" ? "screen-pip" : "presenter";
	if (current === target) return events;

	return [
		...events,
		{
			id: `layout-${Math.round(timeMs)}-${events.length + 1}`,
			timeMs,
			mode: target,
			source,
			transitionDurationMs: DEFAULT_LAYOUT_TRANSITION_DURATION_MS,
			easing: "smooth",
		},
	];
}
