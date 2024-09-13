import { localize } from "../../../../nls.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
const CONTEXT_RESPONSE_VOTE = new RawContextKey(
  "chatSessionResponseVote",
  "",
  {
    type: "string",
    description: localize(
      "interactiveSessionResponseVote",
      "When the response has been voted up, is set to 'up'. When voted down, is set to 'down'. Otherwise an empty string."
    )
  }
);
const CONTEXT_VOTE_UP_ENABLED = new RawContextKey(
  "chatVoteUpEnabled",
  false,
  {
    type: "boolean",
    description: localize(
      "chatVoteUpEnabled",
      "True when the chat vote up action is enabled."
    )
  }
);
const CONTEXT_RESPONSE_DETECTED_AGENT_COMMAND = new RawContextKey(
  "chatSessionResponseDetectedAgentOrCommand",
  false,
  {
    type: "boolean",
    description: localize(
      "chatSessionResponseDetectedAgentOrCommand",
      "When the agent or command was automatically detected"
    )
  }
);
const CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING = new RawContextKey("chatResponseSupportsIssueReporting", false, {
  type: "boolean",
  description: localize(
    "chatResponseSupportsIssueReporting",
    "True when the current chat response supports issue reporting."
  )
});
const CONTEXT_RESPONSE_FILTERED = new RawContextKey(
  "chatSessionResponseFiltered",
  false,
  {
    type: "boolean",
    description: localize(
      "chatResponseFiltered",
      "True when the chat response was filtered out by the server."
    )
  }
);
const CONTEXT_RESPONSE_ERROR = new RawContextKey(
  "chatSessionResponseError",
  false,
  {
    type: "boolean",
    description: localize(
      "chatResponseErrored",
      "True when the chat response resulted in an error."
    )
  }
);
const CONTEXT_CHAT_REQUEST_IN_PROGRESS = new RawContextKey(
  "chatSessionRequestInProgress",
  false,
  {
    type: "boolean",
    description: localize(
      "interactiveSessionRequestInProgress",
      "True when the current request is still in progress."
    )
  }
);
const CONTEXT_RESPONSE = new RawContextKey(
  "chatResponse",
  false,
  {
    type: "boolean",
    description: localize("chatResponse", "The chat item is a response.")
  }
);
const CONTEXT_REQUEST = new RawContextKey(
  "chatRequest",
  false,
  {
    type: "boolean",
    description: localize("chatRequest", "The chat item is a request")
  }
);
const CONTEXT_CHAT_EDIT_APPLIED = new RawContextKey(
  "chatEditApplied",
  false,
  {
    type: "boolean",
    description: localize(
      "chatEditApplied",
      "True when the chat text edits have been applied."
    )
  }
);
const CONTEXT_CHAT_INPUT_HAS_TEXT = new RawContextKey(
  "chatInputHasText",
  false,
  {
    type: "boolean",
    description: localize(
      "interactiveInputHasText",
      "True when the chat input has text."
    )
  }
);
const CONTEXT_CHAT_INPUT_HAS_FOCUS = new RawContextKey(
  "chatInputHasFocus",
  false,
  {
    type: "boolean",
    description: localize(
      "interactiveInputHasFocus",
      "True when the chat input has focus."
    )
  }
);
const CONTEXT_IN_CHAT_INPUT = new RawContextKey(
  "inChatInput",
  false,
  {
    type: "boolean",
    description: localize(
      "inInteractiveInput",
      "True when focus is in the chat input, false otherwise."
    )
  }
);
const CONTEXT_IN_CHAT_SESSION = new RawContextKey(
  "inChat",
  false,
  {
    type: "boolean",
    description: localize(
      "inChat",
      "True when focus is in the chat widget, false otherwise."
    )
  }
);
const CONTEXT_CHAT_ENABLED = new RawContextKey(
  "chatIsEnabled",
  false,
  {
    type: "boolean",
    description: localize(
      "chatIsEnabled",
      "True when chat is enabled because a default chat participant is activated with an implementation."
    )
  }
);
const CONTEXT_CHAT_PANEL_PARTICIPANT_REGISTERED = new RawContextKey("chatPanelParticipantRegistered", false, {
  type: "boolean",
  description: localize(
    "chatParticipantRegistered",
    "True when a default chat participant is registered for the panel."
  )
});
const CONTEXT_CHAT_EXTENSION_INVALID = new RawContextKey(
  "chatExtensionInvalid",
  false,
  {
    type: "boolean",
    description: localize(
      "chatExtensionInvalid",
      "True when the installed chat extension is invalid and needs to be updated."
    )
  }
);
const CONTEXT_CHAT_INPUT_CURSOR_AT_TOP = new RawContextKey(
  "chatCursorAtTop",
  false
);
const CONTEXT_CHAT_INPUT_HAS_AGENT = new RawContextKey(
  "chatInputHasAgent",
  false
);
const CONTEXT_CHAT_LOCATION = new RawContextKey(
  "chatLocation",
  void 0
);
const CONTEXT_IN_QUICK_CHAT = new RawContextKey(
  "quickChatHasFocus",
  false,
  {
    type: "boolean",
    description: localize(
      "inQuickChat",
      "True when the quick chat UI has focus, false otherwise."
    )
  }
);
export {
  CONTEXT_CHAT_EDIT_APPLIED,
  CONTEXT_CHAT_ENABLED,
  CONTEXT_CHAT_EXTENSION_INVALID,
  CONTEXT_CHAT_INPUT_CURSOR_AT_TOP,
  CONTEXT_CHAT_INPUT_HAS_AGENT,
  CONTEXT_CHAT_INPUT_HAS_FOCUS,
  CONTEXT_CHAT_INPUT_HAS_TEXT,
  CONTEXT_CHAT_LOCATION,
  CONTEXT_CHAT_PANEL_PARTICIPANT_REGISTERED,
  CONTEXT_CHAT_REQUEST_IN_PROGRESS,
  CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING,
  CONTEXT_IN_CHAT_INPUT,
  CONTEXT_IN_CHAT_SESSION,
  CONTEXT_IN_QUICK_CHAT,
  CONTEXT_REQUEST,
  CONTEXT_RESPONSE,
  CONTEXT_RESPONSE_DETECTED_AGENT_COMMAND,
  CONTEXT_RESPONSE_ERROR,
  CONTEXT_RESPONSE_FILTERED,
  CONTEXT_RESPONSE_VOTE,
  CONTEXT_VOTE_UP_ENABLED
};
//# sourceMappingURL=chatContextKeys.js.map
