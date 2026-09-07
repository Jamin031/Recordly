import { describe, expect, it } from "vitest";
import {
	DEFAULT_LAYOUT_PRESET,
	resolveLayoutAtTime,
	type LayoutEvent,
} from "./layoutResolver";

const events: LayoutEvent[] = [
	{ id: "screen", timeMs: 1000, targetMode: "screen-pip", source: "click", transitionDurationMs: 600 },
	{ id: "presenter", timeMs: 3000, targetMode: "presenter", source: "shortcut", transitionDurationMs: 600 },
];

describe("resolveLayoutAtTime", () => {
	it("starts in presenter mode", () => {
		const state = resolveLayoutAtTime(0, events);
		expect(state.mode).toBe("presenter");
		expect(state.screenOpacity).toBe(0);
		expect(state.webcamScale).toBe(1);
	});

	it("interpolates presenter to screen/pip after a click", () => {
		const state = resolveLayoutAtTime(1300, events);
		expect(state.progress).toBeCloseTo(0.5, 2);
		expect(state.screenOpacity).toBeGreaterThan(0);
		expect(state.screenOpacity).toBeLessThan(1);
		expect(state.webcamScale).toBeLessThan(1);
		expect(state.webcamScale).toBeGreaterThan(DEFAULT_LAYOUT_PRESET.screenPip.webcamScale);
	});

	it("holds screen/pip after the transition", () => {
		const state = resolveLayoutAtTime(2000, events);
		expect(state.mode).toBe("screen-pip");
		expect(state.screenOpacity).toBe(1);
		expect(state.webcamScale).toBe(DEFAULT_LAYOUT_PRESET.screenPip.webcamScale);
	});

	it("interpolates back to presenter after the shortcut", () => {
		const state = resolveLayoutAtTime(3300, events);
		expect(state.progress).toBeCloseTo(0.5, 2);
		expect(state.screenOpacity).toBeGreaterThan(0);
		expect(state.screenOpacity).toBeLessThan(1);
		expect(state.webcamScale).toBeGreaterThan(DEFAULT_LAYOUT_PRESET.screenPip.webcamScale);
		expect(state.webcamScale).toBeLessThan(1);
	});

	it("ignores duplicate events that target the current mode", () => {
		const duplicateEvents: LayoutEvent[] = [
			...events,
			{ id: "duplicate-screen-click", timeMs: 1800, targetMode: "screen-pip", source: "click", transitionDurationMs: 600 },
		];
		const state = resolveLayoutAtTime(1900, duplicateEvents);
		expect(state.mode).toBe("screen-pip");
		expect(state.screenOpacity).toBe(1);
	});
});
