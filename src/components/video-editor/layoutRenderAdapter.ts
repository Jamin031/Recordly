import { resolveLayoutAtTime, type LayoutEvent } from "./layoutTransitions";

export interface LayoutRenderRect {
	x: number;
	y: number;
	width: number;
	height: number;
	opacity: number;
}

export interface LayoutRenderFrame {
	mode: "presenter" | "screen-pip";
	screenOpacity: number;
	webcam: LayoutRenderRect;
}

/**
 * Converts the timeline layout state into stage-space geometry.
 * This adapter is renderer-agnostic so preview and export can share the same
 * layout math instead of maintaining separate CSS/Pixi implementations.
 */
export function resolveLayoutRenderFrame(
	timeMs: number,
	events: LayoutEvent[],
	stageWidth: number,
	stageHeight: number,
): LayoutRenderFrame {
	const state = resolveLayoutAtTime(timeMs, events);
	const safeWidth = Math.max(0, stageWidth);
	const safeHeight = Math.max(0, stageHeight);
	const width = safeWidth * state.cameraScale;
	const height = safeHeight * state.cameraScale;
	const centerX = safeWidth * state.cameraX;
	const centerY = safeHeight * state.cameraY;

	return {
		mode: state.mode,
		screenOpacity: state.screenOpacity,
		webcam: {
			x: centerX - width / 2,
			y: centerY - height / 2,
			width,
			height,
			opacity: state.cameraOpacity,
		},
	};
}