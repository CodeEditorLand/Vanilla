import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { ChatEditorInput } from "vs/workbench/contrib/chat/browser/chatEditorInput";
export declare function clearChatEditor(accessor: ServicesAccessor, chatEditorInput?: ChatEditorInput): Promise<void>;
