import { describe, expect, it } from "vitest";
import { withNormalizedLayoutEvents } from "./projectEditorLayout";

describe("project editor layout adapter", () => {
	it("keeps layout events absent for legacy editor state", () => {
		const normalizedEditor = { marker: "normalized" } as never;
		const result = withNormalizedLayoutEvents({}, normalizedEditor);
		expect(result.layoutEvents).toBeUndefined();
		expect(Object.prototype.hasOwnProperty.call(result, "layoutEvents")).toBe(false);
	});

	it("preserves an explicit empty layout track as feature opt-in", () => {
		const normalizedEditor = { marker: "normalized" } as never;
		const result = withNormalizedLayoutEvents(
			{ layoutEvents: [] } as never,
			normalizedEditor,
		);

		expect(result.layoutEvents).toEqual([]);
		expect(Object.prototype.hasOwnProperty.call(result, "layoutEvents")).toBe(true);
	});

	it("normalizes layout events without mutating the normalized editor state", () => {
		const normalizedEditor = { marker: "normalized" } as never;
		const result = withNormalizedLayoutEvents(
			{
				layoutEvents: [
					{
						id: "screen-1",
						timeMs: 1200,
						mode: "screen-pip",
						source: "click",
						transitionDurationMs: 650,
					},
				],
			} as never,
			normalizedEditor,
		);

		expect(result.layoutEvents).toHaveLength(1);
		expect(result.layoutEvents?.[0]).toMatchObject({
			id: "screen-1",
			mode: "screen-pip",
			 source: "click",
		});
		expect(normalizedEditor).toEqual({ marker: "normalized" });
	});
});
