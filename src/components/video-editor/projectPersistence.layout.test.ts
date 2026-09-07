import { describe, expect, it } from "vitest";
import { normalizePersistedLayoutEvents } from "./layoutPersistence";

describe("layout event persistence", () => {
	it("defaults old projects to no layout events", () => {
		expect(normalizePersistedLayoutEvents(undefined)).toEqual([]);
	});

	it("normalizes and sorts persisted layout events", () => {
		const normalized = normalizePersistedLayoutEvents([
			{
				id: "presenter-1",
				timeMs: 4000,
				mode: "presenter",
				source: "hotkey",
				transitionDurationMs: 600,
			},
			{
				id: "screen-1",
				timeMs: 1500,
				mode: "screen-pip",
				source: "click",
				transitionDurationMs: 600,
				easing: "smooth",
				cameraX: 0.86,
				cameraY: 0.82,
				cameraScale: 0.26,
			},
		]);

		expect(normalized).toHaveLength(2);
		expect(normalized[0]).toMatchObject({
			id: "screen-1",
			mode: "screen-pip",
			source: "click",
			cameraScale: 0.26,
		});
		expect(normalized[1]).toMatchObject({
			id: "presenter-1",
			mode: "presenter",
			source: "hotkey",
		});
	});

	it("drops malformed events and clamps editable geometry", () => {
		const normalized = normalizePersistedLayoutEvents([
			null,
			{ id: "bad-mode", timeMs: 1000, mode: "focus", source: "click" },
			{
				id: "good",
				timeMs: -200,
				mode: "screen-pip",
				source: "manual",
				transitionDurationMs: 9000,
				cameraScale: 2,
				cameraX: -1,
				cameraY: 3,
			},
		]);

		expect(normalized).toHaveLength(1);
		expect(normalized[0]).toMatchObject({
			id: "good",
			timeMs: 0,
			transitionDurationMs: 4000,
			cameraScale: 1,
			cameraX: 0,
			cameraY: 1,
			easing: "smooth",
		});
	});
});
