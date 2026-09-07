import { describe, expect, it } from "vitest";
import {
	withNormalizedLayoutEvents,
	withPersistedLayoutEvents,
} from "./projectEditorLayout";

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

describe("persisted project layout adapter", () => {
	it("does not synthesize layoutEvents for legacy projects", () => {
		const editor = { marker: "persisted" } as never;
		const result = withPersistedLayoutEvents(editor, undefined);

		expect(Object.prototype.hasOwnProperty.call(result, "layoutEvents")).toBe(false);
	});

	it("persists an explicit empty layout timeline as Presenter opt-in", () => {
		const editor = { marker: "persisted" } as never;
		const result = withPersistedLayoutEvents(editor, []);

		expect(result.layoutEvents).toEqual([]);
		expect(Object.prototype.hasOwnProperty.call(result, "layoutEvents")).toBe(true);
	});
});
