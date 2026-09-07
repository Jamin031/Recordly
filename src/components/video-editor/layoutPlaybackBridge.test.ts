import { describe, expect, it } from "vitest";
import { createLayoutPlaybackFrame } from "./layoutPlaybackBridge";
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
});
