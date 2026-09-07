import { describe, expect, it } from "vitest";
import type { LayoutEvent } from "./layoutTransitions";
import { applyVideoPlaybackLayoutAtTime } from "./videoPlaybackLayout";

const enterScreen: LayoutEvent = {
	id: "screen",
	timeMs: 1000,
	mode: "screen-pip",
	source: "click",
	transitionDurationMs: 650,
	easing: "smooth",
};

describe("applyVideoPlaybackLayoutAtTime", () => {
	it("leaves legacy preview screen visible when layout timeline is omitted", () => {
		const screen = { alpha: 0 };
		const webcamStyle: Record<string, string | undefined> = {};

		applyVideoPlaybackLayoutAtTime(0, undefined, {
			screen,
			webcamStyle,
			stageWidth: 1280,
			stageHeight: 720,
		});

		expect(screen.alpha).toBe(1);
	});

	it("uses millisecond timeline time directly for the click transition", () => {
		const screen = { alpha: 1 };
		const webcamStyle: Record<string, string | undefined> = {};

		applyVideoPlaybackLayoutAtTime(2000, [enterScreen], {
			screen,
			webcamStyle,
			stageWidth: 1280,
			stageHeight: 720,
			webcamAspectRatio: 16 / 9,
		});

		expect(screen.alpha).toBe(1);
		expect(Number.parseFloat(webcamStyle.width ?? "0")).toBeLessThan(1280);
		expect(Number.parseFloat(webcamStyle.left ?? "0")).toBeGreaterThan(640);
	});
});
