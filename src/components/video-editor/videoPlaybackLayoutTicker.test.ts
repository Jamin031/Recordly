import { describe, expect, it } from "vitest";
import { applyVideoPlaybackLayoutTick } from "./videoPlaybackLayoutTicker";
import type { LayoutEvent } from "./layoutTransitions";

function createTargets() {
	return {
		screen: { alpha: 1 } as import("pixi.js").Container,
		webcam: { style: {} } as HTMLDivElement,
		stageWidth: 1280,
		stageHeight: 720,
		webcamAspectRatio: 16 / 9,
	};
}

describe("applyVideoPlaybackLayoutTick", () => {
	it("preserves legacy screen rendering when layout events are omitted", () => {
		const targets = createTargets();
		applyVideoPlaybackLayoutTick(0, undefined, targets);
		expect(targets.screen.alpha).toBe(1);
	});

	it("applies presenter mode for an explicitly enabled empty layout timeline", () => {
		const targets = createTargets();
		applyVideoPlaybackLayoutTick(0, [], targets);
		expect(targets.screen.alpha).toBe(0);
		expect(targets.webcam.style.width).toBe("1280px");
		expect(targets.webcam.style.height).toBe("720px");
	});

	it("applies screen-pip geometry after a click transition", () => {
		const targets = createTargets();
		const events: LayoutEvent[] = [
			{
				id: "click-1",
				timeMs: 1000,
				mode: "screen-pip",
				source: "click",
				transitionDurationMs: 650,
				easing: "smooth",
			},
		];
		applyVideoPlaybackLayoutTick(2000, events, targets);
		expect(targets.screen.alpha).toBe(1);
		expect(Number.parseFloat(targets.webcam.style.width)).toBeLessThan(1280);
	});
});
