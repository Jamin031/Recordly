import type { ProjectEditorState } from "./projectPersistence";
import { normalizePersistedLayoutEvents } from "./layoutPersistence";
import type { LayoutEvent } from "./layoutTransitions";

/**
 * Layout-aware editor state used while the click-layout feature is being
 * threaded through preview/export. A missing layoutEvents field means the
 * feature is disabled for legacy projects; an explicit empty array opts in
 * to the initial Presenter layout.
 */
export type LayoutAwareProjectEditorState = ProjectEditorState & {
	layoutEvents?: LayoutEvent[];
};

export function withNormalizedLayoutEvents(
	editor: Partial<ProjectEditorState> & { layoutEvents?: unknown },
	normalizedEditor: ProjectEditorState,
): LayoutAwareProjectEditorState {
	if (!Object.prototype.hasOwnProperty.call(editor, "layoutEvents")) {
		return { ...normalizedEditor };
	}

	return {
		...normalizedEditor,
		layoutEvents: normalizePersistedLayoutEvents(editor.layoutEvents),
	};
}

/**
 * Add the layout timeline to a persisted editor snapshot without changing
 * legacy semantics. Undefined means the feature is disabled and the field
 * must stay absent; an explicit empty array is a meaningful Presenter opt-in.
 */
export function withPersistedLayoutEvents<T extends object>(
	editor: T,
	layoutEvents: LayoutEvent[] | undefined,
): T & { layoutEvents?: LayoutEvent[] } {
	if (layoutEvents === undefined) {
		return { ...editor };
	}

	return {
		...editor,
		layoutEvents: normalizePersistedLayoutEvents(layoutEvents),
	};
}
