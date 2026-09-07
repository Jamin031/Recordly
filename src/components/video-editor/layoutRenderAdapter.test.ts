import { describe, expect, it } from "vitest";
import { resolveLayoutRenderFrame } from "./layoutRenderAdapter";
import type { LayoutEvent } from "./layoutTransitions";

const screenEvent: LayoutEvent = {
	id: "layout-screen",
	timeMs: 1000,
	mode: "screen-pip",
	source: "click",
	transitionDurationMs: 650,
	easing: "smooth",
};

describe("resolveLayoutRenderFrame", () => {
	it("starts with the webcam filling the stage and the screen hidden", () => {
		const frame = resolveLayoutRenderFrame(0, [], 1280, 720);
		expect(frame.screenOpacity).toBe(0);
		expect(frame.webcam.width).toBe(1280);
		expect(frame.webcam.height).toBe(720);
		expect(frame.webcam.x).toBe(0);
		expect(frame.webcam.y).toBe(0);
	});

	it("moves the webcam toward the lower-right while revealing the screen", () => {
		const frame = resolveLayoutRenderFrame(1325, [screenEvent], 1280, 720);
		expect(frame.screenOpacity).toBeGreaterThan(0);
		expect(frame.screenOpacity).toBeLessThan(1);
		expect(frame.webcam.width).toBeLessThan(1280);
		expect(frame.webcam.x).toBeGreaterThan(0);
		expect(frame.webcam.y).toBeGreaterThan(0);
	});

	it("holds the screen visible with a lower-right webcam after the transition", () => {
		const frame = resolveLayoutRenderFrame(2000, [screenEvent], 1280, 720);
		expect(frame.screenOpacity).toBe(1);
		expect(frame.webcam.width).toBeCloseTo(1280 * 0.26);
		expect(frame.webcam.x + frame.webcam.width / 2).toBeCloseTo(1280 * 0.84);
		expect(frame.webcam.y + frame.webcam.height / 2).toBeCloseTo(720 * 0.82);
	});
});