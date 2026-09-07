import { describe, expect, it } from "vitest";
import {
	applyLayoutPlaybackFrameToPreview,
	createLayoutPlaybackFrame,
	createOptionalLayoutPlaybackFrame,
} from "./layoutPlaybackBridge";
import type { LayoutEvent } from "./layoutTransitions";

const event: LayoutEvent = {
	id: "screen",
	timeMs: 1000,
	mode: "screen-pip",
	source: "click",
	transitionDurationMs: 650,
	easing: "smooth",
};

describe("createLayoutPlaybackFrame", () => {
	it("keeps the screen hidden and webcam presenter-sized before the first event", () => {
		const frame = createLayoutPlaybackFrame(0, [event], 1280, 720);
		expect(frame.screenAlpha).toBe(0);
		expect(frame.webcam.width).toBe(1280);
		expect(frame.webcam.height).toBe(720);
	});

	it("produces a visible screen and bottom-right webcam after the transition", () => {
		const frame = createLayoutPlaybackFrame(2000, [event], 1280, 720);
		expect(frame.screenAlpha).toBe(1);
		expect(frame.webcam.width).toBeLessThan(1280);
		expect(frame.webcam.x).toBeGreaterThan(640);
		expect(frame.webcam.y).toBeGreaterThan(360);
	});

	it("preserves the webcam crop aspect ratio while shrinking to PIP", () => {
		const frame = createLayoutPlaybackFrame(2000, [event], 1280, 720, 4 / 3);
		expect(frame.webcam.width / frame.webcam.height).toBeCloseTo(4 / 3, 5);
	});

	it("clamps PIP geometry inside the stage", () => {
		const customEvent: LayoutEvent = {
			...event,
			cameraScale: 0.4,
			cameraX: 1,
			cameraY: 1,
		};
		const frame = createLayoutPlaybackFrame(2000, [customEvent], 1280, 720, 16 / 9);
		expect(frame.webcam.x).toBeGreaterThanOrEqual(0);
		expect(frame.webcam.y).toBeGreaterThanOrEqual(0);
		expect(frame.webcam.x + frame.webcam.width).toBeLessThanOrEqual(1280);
		expect(frame.webcam.y + frame.webcam.height).toBeLessThanOrEqual(720);
	});
});

describe("createOptionalLayoutPlaybackFrame", () => {
	it("keeps legacy preview rendering untouched when layout events are omitted", () => {
		expect(createOptionalLayoutPlaybackFrame(0, undefined, 1280, 720)).toBeNull();
	});

	it("treats an explicitly empty layout timeline as presenter mode", () => {
		const frame = createOptionalLayoutPlaybackFrame(0, [], 1280, 720);
		expect(frame).not.toBeNull();
		expect(frame?.screenAlpha).toBe(0);
		expect(frame?.webcam.width).toBe(1280);
		expect(frame?.webcam.height).toBe(720);
	});
});

describe("applyLayoutPlaybackFrameToPreview", () => {
	it("writes screen alpha and webcam geometry to preview targets", () => {
		const screen = { alpha: 1 };
		const webcamStyle: Record<string, string> = {};
		const frame = createLayoutPlaybackFrame(2000, [event], 1280, 720, 16 / 9);

		applyLayoutPlaybackFrameToPreview(frame, screen, webcamStyle);

		expect(screen.alpha).toBe(1);
		expect(webcamStyle.left).toBe(`${frame.webcam.x}px`);
		expect(webcamStyle.top).toBe(`${frame.webcam.y}px`);
		expect(webcamStyle.width).toBe(`${frame.webcam.width}px`);
		expect(webcamStyle.height).toBe(`${frame.webcam.height}px`);
		expect(webcamStyle.opacity).toBe("1");
	});

	it("restores legacy screen alpha when no layout frame is active", () => {
		const screen = { alpha: 0 };
		const webcamStyle: Record<string, string> = {};
		applyLayoutPlaybackFrameToPreview(null, screen, webcamStyle);
		expect(screen.alpha).toBe(1);
	});
});
