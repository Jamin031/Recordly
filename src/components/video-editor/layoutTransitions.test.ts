import { describe, expect, it } from "vitest";
import {
	appendRecordingLayoutEvent,
	PRESENTER_LAYOUT_STATE,
	resolveLayoutAtTime,
} from "./layoutTransitions";

describe("layoutTransitions", () => {
	it("starts in presenter mode", () => {
		expect(resolveLayoutAtTime(0, [])).toEqual(PRESENTER_LAYOUT_STATE);
	});

	it("a click creates an editable screen-pip transition", () => {
		const events = appendRecordingLayoutEvent([], 1000, "click");
		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({ timeMs: 1000, mode: "screen-pip", source: "click" });
		expect(resolveLayoutAtTime(1650, events).screenOpacity).toBe(1);
		expect(resolveLayoutAtTime(1650, events).cameraScale).toBeCloseTo(0.26);
	});

	it("does not retrigger screen-pip for later clicks while already in screen mode", () => {
		let events = appendRecordingLayoutEvent([], 1000, "click");
		events = appendRecordingLayoutEvent(events, 3000, "click");
		expect(events).toHaveLength(1);
	});

	it("hotkey returns to presenter and a later click can enter screen-pip again", () => {
		let events = appendRecordingLayoutEvent([], 1000, "click");
		events = appendRecordingLayoutEvent(events, 3000, "hotkey");
		events = appendRecordingLayoutEvent(events, 5000, "click");
		expect(events.map((event) => event.mode)).toEqual(["screen-pip", "presenter", "screen-pip"]);
	});

	it("interpolates rather than baking an instantaneous cut", () => {
		const events = appendRecordingLayoutEvent([], 1000, "click");
		const halfway = resolveLayoutAtTime(1325, events);
		expect(halfway.screenOpacity).toBeGreaterThan(0);
		expect(halfway.screenOpacity).toBeLessThan(1);
		expect(halfway.cameraScale).toBeGreaterThan(0.26);
		expect(halfway.cameraScale).toBeLessThan(1);
	});
});
