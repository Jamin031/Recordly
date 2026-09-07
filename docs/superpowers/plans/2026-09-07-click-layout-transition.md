# Click-triggered Layout Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build editable click-triggered Presenter -> Screen/PIP transitions and shortcut-triggered Screen/PIP -> Presenter transitions in Recordly.

**Architecture:** Add a deterministic layout-state resolver and timeline data model, persist it with editor state, feed recording click/shortcut timestamps into that model, and consume the same resolver from preview and export rendering. Existing zoom/cursor behavior remains separate.

**Tech Stack:** TypeScript, React, Electron, existing Recordly timeline/editor state, existing preview/export renderer.

**Spec:** `docs/superpowers/specs/2026-09-07-click-layout-transition-design.md`

## Global Constraints

- No AI decision-making in V0.1.
- Layout events are non-destructive and editable after recording.
- Ordinary clicks while already in Screen/PIP must not repeatedly trigger the same transition.
- Preview and export must resolve layout animation identically.
- Existing projects without layout data must remain compatible.

---

### Task 1: Layout data model and resolver

**Files:**
- Modify: `src/components/video-editor/types.ts`
- Create: focused layout resolver module near existing video-editor helpers
- Test: colocated/existing test location following repository conventions

**Interfaces:**
- Produces `LayoutMode`, layout event/region types, defaults, and a pure function that resolves interpolated layout state for a media timestamp.

- [ ] Write failing tests for Presenter state, Screen/PIP state, forward transition, return transition, and duplicate same-mode events.
- [ ] Run tests and verify the expected failures.
- [ ] Implement the minimal layout types/defaults/resolver.
- [ ] Run tests and verify they pass.
- [ ] Commit.

### Task 2: Project persistence

**Files:**
- Modify: `src/components/video-editor/projectPersistence.ts`
- Modify editor state ownership where layout regions are initialized/loaded.
- Test persistence/migration behavior.

**Interfaces:**
- Consumes layout event/region types from Task 1.
- Produces backward-compatible `.recordly` serialization/deserialization.

- [ ] Write failing tests for save/load and legacy project loading.
- [ ] Run tests and verify failure.
- [ ] Add layout persistence with safe defaults for legacy projects.
- [ ] Run tests and verify pass.
- [ ] Commit.

### Task 3: Preview and export rendering parity

**Files:**
- Modify: `src/components/video-editor/VideoPlayback.tsx` and/or preview composition path actually owning webcam transforms.
- Modify: `src/lib/exporter/modernVideoExporter.ts`
- Modify: `src/lib/exporter/modernFrameRenderer.ts` or the shared render path identified during implementation.
- Test pure resolver integration where practical.

**Interfaces:**
- Consumes resolved layout state at current media time.
- Produces matching screen/webcam opacity, scale, and position in preview and exported frames.

- [ ] Write failing tests around shared layout-state-to-render-properties mapping.
- [ ] Verify failure.
- [ ] Wire the resolver into preview.
- [ ] Wire the same semantics into export.
- [ ] Verify tests and build/typecheck.
- [ ] Commit.

### Task 4: Editable Layout timeline track

**Files:**
- Modify existing timeline components identified from repository structure.
- Modify settings panel/selection state as needed.

**Interfaces:**
- Consumes layout events/regions.
- Produces timeline selection, move/delete/manual-add operations and basic transition controls.

- [ ] Add failing state/reducer tests where existing timeline logic permits.
- [ ] Add Layout track rendering.
- [ ] Add move/delete/manual-add operations.
- [ ] Add selected-event controls for mode, webcam placement/size, transition duration/easing.
- [ ] Run tests/typecheck.
- [ ] Commit.

### Task 5: Recording click and return-shortcut capture

**Files:**
- Modify the actual recording/cursor event capture path after locating it in the repo.
- Modify recording metadata handoff into editor state.
- Modify keyboard shortcut registration/help where appropriate.

**Interfaces:**
- Produces click-triggered `presenter -> screen-pip` events only when currently in Presenter mode.
- Produces explicit `screen-pip -> presenter` events from a dedicated shortcut.

- [ ] Locate existing cursor click timestamp capture and shortcut infrastructure.
- [ ] Write failing tests for the event-state machine independently of OS hooks.
- [ ] Implement Presenter -> Screen/PIP click state transition.
- [ ] Implement return-to-Presenter shortcut event.
- [ ] Ensure subsequent screen clicks do not create duplicate layout transitions.
- [ ] Feed recorded events into editor layout state.
- [ ] Run tests/typecheck.
- [ ] Commit.

### Task 6: End-to-end verification

**Files:**
- No new production files unless a defect is found.

- [ ] Run the repository test suite relevant to editor/recording/export.
- [ ] Run lint/typecheck/build commands from package scripts.
- [ ] Manually verify a sample flow: Presenter -> click -> Screen/PIP -> shortcut -> Presenter.
- [ ] Reopen saved project and verify layout events remain editable.
- [ ] Export sample and compare transition timing/geometry with preview.
- [ ] Fix only defects discovered by these checks, with regression tests first.
- [ ] Commit final verification fixes if any.
