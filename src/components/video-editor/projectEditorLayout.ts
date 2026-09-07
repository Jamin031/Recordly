import type { ProjectEditorState } from "./projectPersistence";
import { normalizePersistedLayoutEvents } from "./layoutPersistence";
import type { LayoutEvent } from "./layoutTransitions";

/**
 * Layout-aware editor state used while the click-layout feature is being
 * threaded through preview/export. Keeping the adapter pure lets old
 * `.recordly` projects load with an empty layout track without changing
 * their existing editor settings.
 */
export type LayoutAwareProjectEditorState = ProjectEditorState & {
	layoutEvents: LayoutEvent[];
};

export function withNormalizedLayoutEvents(
	editor: Partial<ProjectEditorState> & { layoutEvents?: unknown },
	normalizedEditor: ProjectEditorState,
): LayoutAwareProjectEditorState {
	return {
		...normalizedEditor,
		layoutEvents: normalizePersistedLayoutEvents(editor.layoutEvents),
	};
}
