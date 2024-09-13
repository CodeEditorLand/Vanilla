import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IActiveCodeEditor, ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { IValidEditOperation } from "../../../../editor/common/model.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { EditMode } from "../common/inlineChat.js";
import { Session, StashedSession } from "./inlineChatSession.js";
const IInlineChatSessionService = createDecorator("IInlineChatSessionService");
export {
  IInlineChatSessionService
};
//# sourceMappingURL=inlineChatSessionService.js.map
