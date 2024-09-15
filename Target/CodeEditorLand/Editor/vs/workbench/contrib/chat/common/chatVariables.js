import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { Location } from "../../../../editor/common/languages.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ChatAgentLocation } from "./chatAgents.js";
import { IChatModel, IChatRequestVariableData, IChatRequestVariableEntry } from "./chatModel.js";
import { IParsedChatRequest } from "./chatParserTypes.js";
import { IChatContentReference, IChatProgressMessage } from "./chatService.js";
const IChatVariablesService = createDecorator("IChatVariablesService");
export {
  IChatVariablesService
};
//# sourceMappingURL=chatVariables.js.map
