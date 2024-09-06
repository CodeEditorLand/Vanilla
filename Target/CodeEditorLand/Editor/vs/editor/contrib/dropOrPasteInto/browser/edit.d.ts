import { HierarchicalKind } from "vs/base/common/hierarchicalKind";
import { URI } from "vs/base/common/uri";
import { Range } from "vs/editor/common/core/range";
import { DocumentDropEdit, DocumentPasteEdit, DropYieldTo, WorkspaceEdit } from "vs/editor/common/languages";
/**
 * Given a {@link DropOrPasteEdit} and set of ranges, creates a {@link WorkspaceEdit} that applies the insert text from
 * the {@link DropOrPasteEdit} at each range plus any additional edits.
 */
export declare function createCombinedWorkspaceEdit(uri: URI, ranges: readonly Range[], edit: DocumentPasteEdit | DocumentDropEdit): WorkspaceEdit;
export declare function sortEditsByYieldTo<T extends {
    readonly kind: HierarchicalKind | undefined;
    readonly handledMimeType?: string;
    readonly yieldTo?: readonly DropYieldTo[];
}>(edits: readonly T[]): T[];
