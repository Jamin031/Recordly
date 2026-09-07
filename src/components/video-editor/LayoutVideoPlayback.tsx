import {
	forwardRef,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ComponentPropsWithoutRef,
} from "react";
import type { LayoutEvent } from "./layoutTransitions";
import { createOptionalLayoutPlaybackFrame } from "./layoutPlaybackBridge";
import VideoPlayback, { type VideoPlaybackRef } from "./VideoPlayback";

type Props = ComponentPropsWithoutRef<typeof VideoPlayback> & {
	layoutEvents?: LayoutEvent[];
};

/**
 * Layout-aware preview wrapper.
 * Legacy callers keep VideoPlayback unchanged. Opted-in projects render the
 * webcam above the existing preview using the shared deterministic resolver.
 */
export const LayoutVideoPlayback = forwardRef<VideoPlaybackRef, Props>(
	(
		{
			layoutEvents,
			webcam,
			webcamVideoPath,
			currentTime,
			isPlaying,
			...playbackProps
		},
		ref,
	) => {
		const hostRef = useRef<HTMLDivElement | null>(null);
		const webcamRef = useRef<HTMLVideoElement | null>(null);
		const [stage, setStage] = useState({ width: 0, height: 0 });

		const webcamAvailable = Boolean(webcam?.enabled && webcamVideoPath);
		const layoutEnabled = layoutEvents !== undefined && webcamAvailable;

		useEffect(() => {
			const host = hostRef.current;
			if (!host) return;

			const updateSize = () => {
				const rect = host.getBoundingClientRect();
				setStage((current) =>
					Math.abs(current.width - rect.width) < 0.5 &&
					Math.abs(current.height - rect.height) < 0.5
						? current
						: { width: rect.width, height: rect.height },
				);
			};

			updateSize();
			if (typeof ResizeObserver === "undefined") return;
			const observer = new ResizeObserver(updateSize);
			observer.observe(host);
			return () => observer.disconnect();
		}, []);

		useEffect(() => {
			const video = webcamRef.current;
			if (!video || !layoutEnabled) return;

			const target = Math.max(0, currentTime);
			if (!isPlaying && Math.abs(video.currentTime - target) > 0.03) {
				try {
					video.currentTime = target;
				} catch {
					// Metadata may not be ready yet; the next timeline update retries.
				}
			}

			if (isPlaying) {
				video.play().catch(() => undefined);
			} else {
				video.pause();
			}
		}, [currentTime, isPlaying, layoutEnabled]);

		const frame = useMemo(() => {
			if (!layoutEnabled || stage.width <= 0 || stage.height <= 0) return null;
			const widthPercent = webcam?.width ?? webcam?.size ?? 24;
			const heightPercent = webcam?.height ?? webcam?.size ?? 24;
			return createOptionalLayoutPlaybackFrame(
				currentTime * 1000,
				layoutEvents,
				stage.width,
				stage.height,
				heightPercent > 0 ? widthPercent / heightPercent : undefined,
			);
		}, [currentTime, layoutEnabled, layoutEvents, stage.height, stage.width, webcam]);

		const delegatedWebcam = layoutEnabled && webcam ? { ...webcam, enabled: false } : webcam;

		return (
			<div ref={hostRef} className="relative h-full w-full">
				<VideoPlayback
					{...playbackProps}
					ref={ref}
					currentTime={currentTime}
					isPlaying={isPlaying}
					webcam={delegatedWebcam}
					webcamVideoPath={webcamVideoPath}
				/>
				{frame && webcamVideoPath ? (
					<div
						className="pointer-events-none absolute overflow-hidden"
						style={{
							left: frame.webcam.x,
							top: frame.webcam.y,
							width: frame.webcam.width,
							height: frame.webcam.height,
							opacity: frame.webcam.opacity,
							zIndex: 20,
						}}
					>
						<video
							ref={webcamRef}
							src={webcamVideoPath}
							className="h-full w-full object-cover"
							muted
							playsInline
							preload="auto"
							aria-hidden="true"
						/>
					</div>
				) : null}
			</div>
		);
	},
);

LayoutVideoPlayback.displayName = "LayoutVideoPlayback";
