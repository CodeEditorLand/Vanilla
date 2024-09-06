import { MarshalledId } from "vs/base/common/marshallingIds";
import { CommentThread } from "vs/editor/common/languages";
export interface MarshalledCommentThread {
    $mid: MarshalledId.CommentThread;
    commentControlHandle: number;
    commentThreadHandle: number;
}
export interface MarshalledCommentThreadInternal extends MarshalledCommentThread {
    thread: CommentThread;
}
