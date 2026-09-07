import {
	applyLayoutPlaybackFrameToPreview,
	createOptionalLayoutPlaybackFrame,
	type LayoutPlaybackFrame,
	type LayoutPreviewScreenTarget,
	type LayoutPreviewWebcamStyleTarget,
} from "./layoutPlaybackBridge";
import type { LayoutEvent } from "./layoutTransitions";

export interface VideoPlaybackLayoutTargets {
	screen: LayoutPreviewScreenTarget;
	cursor?: LayoutPreviewScreenTarget | null;
	webcamStyle: LayoutPreviewWebcamStyleTarget;
	stageWidth: number;
	stageHeight: number;
	webcamAspectRatio?: number;
}

/**
 * Small integration boundary used by VideoPlayback's render ticker.
 * Recordly's currentTimeRef is already milliseconds, so no time conversion belongs here.
 */
export function applyVideoPlaybackLayoutAtTime(
	timeMs: number,
	layoutEvents: LayoutEvent[] | undefined,
	targets: VideoPlaybackLayoutTargets,
): LayoutPlaybackFrame | null {
	const frame = createOptionalLayoutPlaybackFrame(
		timeMs,
		layoutEvents,
		targets.stageWidth,
		targets.stageHeight,
		targets.webcamAspectRatio,
	);

	applyLayoutPlaybackFrameToPreview(frame, targets.screen, targets.webcamStyle);

	// The cursor lives outside videoEffectsContainer in VideoPlayback's Pixi scene.
	// Keep it in lockstep with the screen so Presenter mode cannot leave a floating cursor.
	if (targets.cursor) {
		targets.cursor.alpha = frame?.screenAlpha ?? 1;
	}

	return frame;
}
