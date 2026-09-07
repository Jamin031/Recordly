import {
	applyLayoutPlaybackFrameToPreview,
	createOptionalLayoutPlaybackFrame,
	type LayoutPreviewScreenTarget,
	type LayoutPreviewWebcamStyleTarget,
} from "./layoutPlaybackBridge";
import type { LayoutEvent } from "./layoutTransitions";

export interface VideoPlaybackLayoutTargets {
	screen: LayoutPreviewScreenTarget;
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
): void {
	const frame = createOptionalLayoutPlaybackFrame(
		timeMs,
		layoutEvents,
		targets.stageWidth,
		targets.stageHeight,
		targets.webcamAspectRatio,
	);

	applyLayoutPlaybackFrameToPreview(frame, targets.screen, targets.webcamStyle);
}
