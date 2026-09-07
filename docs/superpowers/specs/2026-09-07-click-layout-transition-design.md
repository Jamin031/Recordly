# Click-triggered Layout Transition Design

## Goal

Add a non-AI camera/screen layout workflow to Recordly for talking-head screen recordings.

During recording:
- Start in Presenter mode: webcam is the primary/full presentation view.
- A qualifying mouse click creates a transition into Screen/PIP mode: the screen becomes primary while the webcam smoothly shrinks and moves to a preset corner.
- A dedicated recording shortcut returns to Presenter mode.

After recording:
- Every generated transition remains editable and removable on the timeline.
- Users can change timing, webcam size/position, transition duration, and whether a recorded click should trigger a layout change.
- Users can also add layout transitions manually.

## Core principle

Clicks and shortcuts create editable layout events. They do not destructively bake the animation into the source recording.

## Data model

Introduce a layout timeline model separate from zoom regions. Initial modes:
- `presenter`
- `screen-pip`

A layout region/event stores its time range or transition timestamp, source (`click` or `manual`/`shortcut`), target mode, webcam placement/scale, and transition duration/easing.

## Runtime behavior

The preview/export renderer resolves the active layout state for the current media time and interpolates between the previous and next layout state. Preview and export must use the same resolver so the exported MP4 matches the editor preview.

## Recording behavior

The capture layer records qualifying click timestamps as layout-transition candidates. While already in Screen/PIP mode, ordinary subsequent clicks must not repeatedly re-trigger the same Presenter-to-Screen transition. A dedicated shortcut records a Screen/PIP-to-Presenter event.

## Editing behavior

Add a Layout track to the existing timeline. Generated events/regions can be moved, deleted, and manually added. Selecting one exposes controls for target mode, webcam size/position, transition duration, and easing.

## Persistence

Layout events/regions are stored in `.recordly` editor state. Older projects without layout data load normally with the current static webcam behavior.

## Scope for V0.1

Included:
- Presenter and Screen/PIP modes.
- Click-triggered Presenter -> Screen/PIP.
- Shortcut-triggered Screen/PIP -> Presenter.
- Smooth deterministic transition.
- Editable Layout timeline data.
- Project save/reopen support.
- Preview/export parity.

Excluded for now:
- AI scene detection.
- Speech/transcript-based decisions.
- B-roll automation.
- Automatic rough cutting.
- Audio processing integrations.
- Multiple arbitrary camera keyframes.

## Success criteria

A user can record a talking-head + screen session, click to reveal the screen with a smooth webcam-to-corner transition, use a shortcut to return to presenter view, then reopen the recording in the editor and adjust/remove those transition points before exporting an MP4 whose layout animation matches preview.
