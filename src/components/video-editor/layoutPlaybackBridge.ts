import { resolveLayoutAtTime, type LayoutEvent } from "./layoutTransitions";

export interface LayoutPlaybackFrame {
	screenAlpha: number;
	webcam: {
		x: number;
		y: number;
		width: number;
		height: number;
		opacity: number;
	};
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

/**
 * Converts an editable layout timeline into renderer-ready pixel geometry.
 * Preview and export should both consume this function so their framing stays identical.
 *
 * `webcamAspectRatio` is the effective cropped webcam width / height ratio. Presenter
 * mode intentionally fills the composition; PIP mode preserves the webcam crop ratio.
 */
export function createLayoutPlaybackFrame(
	timeMs: number,
	events: LayoutEvent[],
	stageWidth: number,
	stageHeight: number,
	webcamAspectRatio?: number,
): LayoutPlaybackFrame {
	const state = resolveLayoutAtTime(timeMs, events);
	const safeStageWidth = Math.max(0, stageWidth);
	const safeStageHeight = Math.max(0, stageHeight);
	const width = Math.max(0, safeStageWidth * state.cameraScale);
	const useNativeAspect =
		state.cameraScale < 0.999 &&
		typeof webcamAspectRatio === "number" &&
		Number.isFinite(webcamAspectRatio) &&
		webcamAspectRatio > 0;
	const height = useNativeAspect
		? Math.min(safeStageHeight, width / webcamAspectRatio)
		: Math.max(0, safeStageHeight * state.cameraScale);
	const centerX = safeStageWidth * state.cameraX;
	const centerY = safeStageHeight * state.cameraY;
	const x = clamp(centerX - width / 2, 0, Math.max(0, safeStageWidth - width));
	const y = clamp(centerY - height / 2, 0, Math.max(0, safeStageHeight - height));

	return {
		screenAlpha: state.screenOpacity,
		webcam: {
			x,
			y,
			width,
			height,
			opacity: state.cameraOpacity,
		},
	};
}
