import { describe, expect, it } from "vitest";
import { normalizePersistedLayoutEvents } from "./layoutPersistence";

describe("normalizePersistedLayoutEvents", () => {
  it("defaults missing layout events to an empty array", () => {
    expect(normalizePersistedLayoutEvents(undefined)).toEqual([]);
  });

  it("keeps valid layout events and normalizes optional fields", () => {
    expect(
      normalizePersistedLayoutEvents([
        {
          id: "layout-1",
          timeMs: 1200,
          targetMode: "screen-pip",
          source: "click",
          transitionDurationMs: 650,
          easing: "smooth",
          webcamPositionX: 0.9,
          webcamPositionY: 0.8,
          webcamScale: 0.25,
        },
      ]),
    ).toEqual([
      {
        id: "layout-1",
        timeMs: 1200,
        targetMode: "screen-pip",
        source: "click",
        transitionDurationMs: 650,
        easing: "smooth",
        webcamPositionX: 0.9,
        webcamPositionY: 0.8,
        webcamScale: 0.25,
      },
    ]);
  });

  it("drops invalid entries and clamps normalized webcam overrides", () => {
    expect(
      normalizePersistedLayoutEvents([
        null,
        { id: "bad-mode", timeMs: 1, targetMode: "focus", source: "manual" },
        {
          id: "layout-2",
          timeMs: -50,
          targetMode: "presenter",
          source: "shortcut",
          transitionDurationMs: -1,
          webcamPositionX: 4,
          webcamPositionY: -2,
          webcamScale: 3,
        },
      ]),
    ).toEqual([
      {
        id: "layout-2",
        timeMs: 0,
        targetMode: "presenter",
        source: "shortcut",
        transitionDurationMs: 600,
        webcamPositionX: 1,
        webcamPositionY: 0,
        webcamScale: 1,
      },
    ]);
  });
});
