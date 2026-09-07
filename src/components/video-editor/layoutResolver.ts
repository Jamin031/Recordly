export type LayoutMode = "presenter" | "screen-pip";
export type LayoutEventSource = "click" | "shortcut" | "manual";
export type LayoutTransitionEasing = "recordly" | "smooth" | "snappy" | "linear";

export interface LayoutEvent {
	id: string;
	timeMs: number;
	targetMode: LayoutMode;
	source: LayoutEventSource;
	transitionDurationMs: number;
	easing?: LayoutTransitionEasing;
	webcamPositionX?: number;
	webcamPositionY?: number;
	webcamScale?: number;
}

export interface LayoutPose {
	webcamScale: number;
	webcamPositionX: number;
	webcamPositionY: number;
	screenOpacity: number;
}

export interface LayoutPreset {
	presenter: LayoutPose;
	screenPip: LayoutPose;
}

export interface ResolvedLayoutState extends LayoutPose {
	mode: LayoutMode;
	progress: number;
	transitioning: boolean;
}

export const DEFAULT_LAYOUT_TRANSITION_DURATION_MS = 600;

export const DEFAULT_LAYOUT_PRESET: LayoutPreset = {
	presenter: {
		webcamScale: 1,
		webcamPositionX: 0.5,
		webcamPositionY: 0.5,
		screenOpacity: 0,
	},
	screenPip: {
		webcamScale: 0.26,
		webcamPositionX: 0.86,
		webcamPositionY: 0.82,
		screenOpacity: 1,
	},
};

function clamp01(value: number) {
	return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number) {
	const t = clamp01(value);
	return t * t * (3 - 2 * t);
}

function ease(value: number, easing: LayoutTransitionEasing | undefined) {
	const t = clamp01(value);
	if (easing === "linear") return t;
	if (easing === "snappy") return 1 - (1 - t) ** 3;
	return smoothstep(t);
}

function lerp(from: number, to: number, progress: number) {
	return from + (to - from) * progress;
}

function poseForMode(mode: LayoutMode, preset: LayoutPreset): LayoutPose {
	return mode === "presenter" ? preset.presenter : preset.screenPip;
}

function targetPose(event: LayoutEvent, preset: LayoutPreset): LayoutPose {
	const base = poseForMode(event.targetMode, preset);
	return {
		...base,
		webcamScale: event.webcamScale ?? base.webcamScale,
		webcamPositionX: event.webcamPositionX ?? base.webcamPositionX,
		webcamPositionY: event.webcamPositionY ?? base.webcamPositionY,
	};
}

/** Remove same-mode events so repeated screen clicks do not restart layout animation. */
export function normalizeLayoutEvents(events: LayoutEvent[]): LayoutEvent[] {
	const sorted = [...events].sort((a, b) => a.timeMs - b.timeMs);
	const normalized: LayoutEvent[] = [];
	let mode: LayoutMode = "presenter";
	for (const event of sorted) {
		if (event.targetMode === mode) continue;
		normalized.push(event);
		mode = event.targetMode;
	}
	return normalized;
}

export function resolveLayoutAtTime(
	timeMs: number,
	events: LayoutEvent[],
	preset: LayoutPreset = DEFAULT_LAYOUT_PRESET,
): ResolvedLayoutState {
	const normalized = normalizeLayoutEvents(events);
	let previousMode: LayoutMode = "presenter";
	let previousPose = poseForMode(previousMode, preset);

	for (const event of normalized) {
		if (timeMs < event.timeMs) break;

		const destination = targetPose(event, preset);
		const duration = Math.max(0, event.transitionDurationMs || DEFAULT_LAYOUT_TRANSITION_DURATION_MS);
		const elapsed = timeMs - event.timeMs;

		if (duration > 0 && elapsed < duration) {
			const rawProgress = clamp01(elapsed / duration);
			const easedProgress = ease(rawProgress, event.easing);
			return {
				mode: previousMode,
				progress: rawProgress,
				transitioning: true,
				webcamScale: lerp(previousPose.webcamScale, destination.webcamScale, easedProgress),
				webcamPositionX: lerp(previousPose.webcamPositionX, destination.webcamPositionX, easedProgress),
				webcamPositionY: lerp(previousPose.webcamPositionY, destination.webcamPositionY, easedProgress),
				screenOpacity: lerp(previousPose.screenOpacity, destination.screenOpacity, easedProgress),
			};
		}

		previousMode = event.targetMode;
		previousPose = destination;
	}

	return {
		mode: previousMode,
		progress: 1,
		transitioning: false,
		...previousPose,
	};
}
