import { describe, expect, it } from "vitest";
import type { LayoutEvent } from "./layoutTransitions";
import {
	applyRenderableVideoPlaybackLayoutAtTime,
	applyVideoPlaybackLayoutAtTime,
	getRenderableLayoutEvents,
} from "./videoPlaybackLayout";

const enterScreen: LayoutEvent = {
	id: "screen",
	timeMs: 1000,
	mode: "screen-pip",
	source: "click",
	transitionDurationMs: 650,
	easing: "smooth",
};

describe("getRenderableLayoutEvents", () => {
	it("keeps layout disabled when the project has no layout timeline", () => {
		expect(getRenderableLayoutEvents(undefined, true)).toBeUndefined();
	});

	it("keeps an explicit empty layout timeline enabled when webcam is available", () => {
		expect(getRenderableLayoutEvents([], true)).toEqual([]);
	});

	it("falls back to legacy screen rendering when webcam is unavailable", () => {
		expect(getRenderableLayoutEvents([enterScreen], false)).toBeUndefined();
	});
});

describe("applyVideoPlaybackLayoutAtTime", () => {
	it("leaves legacy preview screen visible and returns null when layout timeline is omitted", () => {
		const screen = { alpha: 0 };
		const webcamStyle: Record<string, string | undefined> = {};

		const frame = applyVideoPlaybackLayoutAtTime(0, undefined, {
			screen,
			webcamStyle,
			stageWidth: 1280,
			stageHeight: 720,
		});

		expect(screen.alpha).toBe(1);
		expect(frame).toBeNull();
	});

	it("uses millisecond timeline time directly for the click transition and returns the applied frame", () => {
		const screen = { alpha: 1 };
		const cursor = { alpha: 1 };
		const webcamStyle: Record<string, string | undefined> = {};

		const frame = applyVideoPlaybackLayoutAtTime(2000, [enterScreen], {
			screen,
			cursor,
			webcamStyle,
			stageWidth: 1280,
			stageHeight: 720,
			webcamAspectRatio: 16 / 9,
		});

		expect(frame).not.toBeNull();
		expect(frame?.screenAlpha).toBe(1);
		expect(screen.alpha).toBe(1);
		expect(cursor.alpha).toBe(1);
		expect(Number.parseFloat(webcamStyle.width ?? "0")).toBeLessThan(1280);
		expect(Number.parseFloat(webcamStyle.left ?? "0")).toBeGreaterThan(640);
	});

	it("keeps the separate cursor hidden with the screen in initial Presenter mode", () => {
		const screen = { alpha: 1 };
		const cursor = { alpha: 1 };
		const webcamStyle: Record<string, string | undefined> = {};

		const frame = applyVideoPlaybackLayoutAtTime(0, [], {
			screen,
			cursor,
			webcamStyle,
			stageWidth: 1280,
			stageHeight: 720,
			webcamAspectRatio: 16 / 9,
		});

		expect(frame?.screenAlpha).toBe(0);
		expect(screen.alpha).toBe(0);
		expect(cursor.alpha).toBe(0);
	});
});

describe("applyRenderableVideoPlaybackLayoutAtTime", () => {
	it("preserves explicit empty timeline semantics when webcam is available", () => {
		const screen = { alpha: 1 };
		const cursor = { alpha: 1 };
		const webcamStyle: Record<string, string | undefined> = {};

		const frame = applyRenderableVideoPlaybackLayoutAtTime(0, [], true, {
			screen,
			cursor,
			webcamStyle,
			stageWidth: 1280,
			stageHeight: 720,
			webcamAspectRatio: 16 / 9,
		});

		expect(frame?.screenAlpha).toBe(0);
		expect(screen.alpha).toBe(0);
		expect(cursor.alpha).toBe(0);
	});

	it("forces legacy screen and cursor visibility when webcam is unavailable", () => {
		const screen = { alpha: 0 };
		const cursor = { alpha: 0 };
		const webcamStyle: Record<string, string | undefined> = {};

		const frame = applyRenderableVideoPlaybackLayoutAtTime(0, [], false, {
			screen,
			cursor,
			webcamStyle,
			stageWidth: 1280,
			stageHeight: 720,
		});

		expect(frame).toBeNull();
		expect(screen.alpha).toBe(1);
		expect(cursor.alpha).toBe(1);
	});
});
