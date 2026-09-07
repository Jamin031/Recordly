import type { Container } from "pixi.js";
import type { LayoutEvent } from "./layoutTransitions";
import { applyVideoPlaybackLayout } from "./videoPlaybackLayout";

export interface VideoPlaybackLayoutTickerTargets {
	screen: Container | null;
	webcam: HTMLDivElement | null;
	stageWidth: number;
	stageHeight: number;
	webcamAspectRatio?: number;
}

/**
 * Small ticker-facing adapter for VideoPlayback. Keeping this free of React state
 * lets the Pixi ticker apply deterministic layout frames without causing rerenders.
 */
export function applyVideoPlaybackLayoutTick(
	timeMs: number,
	layoutEvents: LayoutEvent[] | undefined,
	targets: VideoPlaybackLayoutTickerTargets,
): void {
	const { screen, webcam, stageWidth, stageHeight, webcamAspectRatio } = targets;
	if (!screen || !webcam || stageWidth <= 0 || stageHeight <= 0) return;

	applyVideoPlaybackLayout({
		timeMs,
		layoutEvents,
		stageWidth,
		stageHeight,
		webcamAspectRatio,
		screen,
		webcamStyle: webcam.style,
	});
}
