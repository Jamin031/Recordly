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
