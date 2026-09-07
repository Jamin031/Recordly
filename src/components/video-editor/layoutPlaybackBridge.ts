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

export interface LayoutPreviewScreenTarget {
	alpha: number;
}

export interface LayoutPreviewWebcamStyleTarget {
	left?: string;
	top?: string;
	width?: string;
	height?: string;
	opacity?: string;
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

/**
 * Preview/export integration uses `undefined` as the compatibility boundary:
 * legacy projects that do not provide a layout timeline keep their existing renderer,
 * while an explicitly provided timeline (including an empty one) enables presenter mode.
 */
export function createOptionalLayoutPlaybackFrame(
	timeMs: number,
	events: LayoutEvent[] | undefined,
	stageWidth: number,
	stageHeight: number,
	webcamAspectRatio?: number,
): LayoutPlaybackFrame | null {
	if (events === undefined) {
		return null;
	}

	return createLayoutPlaybackFrame(
		timeMs,
		events,
		stageWidth,
		stageHeight,
		webcamAspectRatio,
	);
}

/**
 * Applies the resolved frame to the two preview surfaces without depending on Pixi or DOM
 * concrete classes. VideoPlayback can pass its Pixi container and webcam element style here.
 */
export function applyLayoutPlaybackFrameToPreview(
	frame: LayoutPlaybackFrame | null,
	screen: LayoutPreviewScreenTarget,
	webcamStyle: LayoutPreviewWebcamStyleTarget,
): void {
	if (!frame) {
		screen.alpha = 1;
		return;
	}

	screen.alpha = frame.screenAlpha;
	webcamStyle.left = `${frame.webcam.x}px`;
	webcamStyle.top = `${frame.webcam.y}px`;
	webcamStyle.width = `${frame.webcam.width}px`;
	webcamStyle.height = `${frame.webcam.height}px`;
	webcamStyle.opacity = `${frame.webcam.opacity}`;
}
