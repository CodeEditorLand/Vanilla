import type { MarshalledId } from "../../base/common/marshallingIds.js";
import type { CommentThread } from "../../editor/common/languages.js";
export interface MarshalledCommentThread {
    $mid: MarshalledId.CommentThread;
    commentControlHandle: number;
    commentThreadHandle: number;
}
export interface MarshalledCommentThreadInternal extends MarshalledCommentThread {
    thread: CommentThread;
}
