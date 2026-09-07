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

/**
 * Converts an editable layout timeline into renderer-ready pixel geometry.
 * Preview and export should both consume this function so their framing stays identical.
 */
export function createLayoutPlaybackFrame(
	timeMs: number,
	events: LayoutEvent[],
	stageWidth: number,
	stageHeight: number,
): LayoutPlaybackFrame {
	const state = resolveLayoutAtTime(timeMs, events);
	const width = Math.max(0, stageWidth * state.cameraScale);
	const height = Math.max(0, stageHeight * state.cameraScale);
	const centerX = stageWidth * state.cameraX;
	const centerY = stageHeight * state.cameraY;

	return {
		screenAlpha: state.screenOpacity,
		webcam: {
			x: centerX - width / 2,
			y: centerY - height / 2,
			width,
			height,
			opacity: state.cameraOpacity,
		},
	};
}
