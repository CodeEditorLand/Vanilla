import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { ChatEditorInput } from "../chatEditorInput.js";
async function clearChatEditor(accessor, chatEditorInput) {
  const editorService = accessor.get(IEditorService);
  if (!chatEditorInput) {
    const editorInput = editorService.activeEditor;
    chatEditorInput = editorInput instanceof ChatEditorInput ? editorInput : void 0;
  }
  if (chatEditorInput instanceof ChatEditorInput) {
    const identifier = editorService.findEditors(
      chatEditorInput.resource
    )[0];
    await editorService.replaceEditors(
      [
        {
          editor: chatEditorInput,
          replacement: {
            resource: ChatEditorInput.getNewEditorUri(),
            options: { pinned: true }
          }
        }
      ],
      identifier.groupId
    );
  }
}
export {
  clearChatEditor
};
