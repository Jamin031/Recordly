import { describe, expect, it } from "vitest";
import { normalizeProjectEditor } from "./projectPersistence";

const baseEditor = {
  zoomRegions: [],
  trimRegions: [],
  clipRegions: [],
  speedRegions: [],
  annotationRegions: [],
  audioRegions: [],
};

describe("project layout event persistence", () => {
  it("defaults old projects to no layout events", () => {
    const normalized = normalizeProjectEditor(baseEditor as never);
    expect(normalized.layoutEvents).toEqual([]);
  });

  it("normalizes persisted layout events", () => {
    const normalized = normalizeProjectEditor({
      ...baseEditor,
      layoutEvents: [
        { id: "screen-1", timeMs: 1500, targetMode: "screen-pip", source: "click", transitionDurationMs: 600, easing: "recordly", webcamPositionX: 0.86, webcamPositionY: 0.82, webcamScale: 0.26 },
        { id: "presenter-1", timeMs: 4000, targetMode: "presenter", source: "shortcut", transitionDurationMs: 600 },
      ],
    } as never);

    expect(normalized.layoutEvents).toHaveLength(2);
    expect(normalized.layoutEvents[0]).toMatchObject({ id: "screen-1", targetMode: "screen-pip", source: "click" });
    expect(normalized.layoutEvents[1]).toMatchObject({ id: "presenter-1", targetMode: "presenter", source: "shortcut" });
  });

  it("drops malformed persisted layout events", () => {
    const normalized = normalizeProjectEditor({
      ...baseEditor,
      layoutEvents: [
        null,
        { id: "bad-mode", timeMs: 1000, targetMode: "focus", source: "click" },
        { id: "good", timeMs: 2000, targetMode: "screen-pip", source: "click", transitionDurationMs: 600 },
      ],
    } as never);

    expect(normalized.layoutEvents).toHaveLength(1);
    expect(normalized.layoutEvents[0].id).toBe("good");
  });
});
