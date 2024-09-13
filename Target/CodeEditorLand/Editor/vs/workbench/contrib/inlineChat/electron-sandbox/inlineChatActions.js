var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { disposableTimeout } from "../../../../base/common/async.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { localize2 } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  StartVoiceChatAction,
  StopListeningAction,
  VOICE_KEY_HOLD_THRESHOLD
} from "../../chat/electron-sandbox/actions/voiceChatActions.js";
import {
  HasSpeechProvider,
  ISpeechService
} from "../../speech/common/speechService.js";
import {
  AbstractInlineChatAction,
  setHoldForSpeech
} from "../browser/inlineChatActions.js";
import {
  CTX_INLINE_CHAT_VISIBLE,
  InlineChatConfigKeys
} from "../common/inlineChat.js";
class HoldToSpeak extends AbstractInlineChatAction {
  static {
    __name(this, "HoldToSpeak");
  }
  constructor() {
    super({
      id: "inlineChat.holdForSpeech",
      precondition: ContextKeyExpr.and(
        HasSpeechProvider,
        CTX_INLINE_CHAT_VISIBLE
      ),
      title: localize2("holdForSpeech", "Hold for Speech"),
      keybinding: {
        when: EditorContextKeys.textInputFocus,
        weight: KeybindingWeight.WorkbenchContrib,
        primary: KeyMod.CtrlCmd | KeyCode.KeyI
      }
    });
  }
  runInlineChatCommand(accessor, ctrl, editor, ...args) {
    holdForSpeech(accessor, ctrl, this);
  }
}
function holdForSpeech(accessor, ctrl, action) {
  const configService = accessor.get(IConfigurationService);
  const speechService = accessor.get(ISpeechService);
  const keybindingService = accessor.get(IKeybindingService);
  const commandService = accessor.get(ICommandService);
  if (!configService.getValue(
    InlineChatConfigKeys.HoldToSpeech || !speechService.hasSpeechProvider
  )) {
    return;
  }
  const holdMode = keybindingService.enableKeybindingHoldMode(action.desc.id);
  if (!holdMode) {
    return;
  }
  let listening = false;
  const handle = disposableTimeout(() => {
    commandService.executeCommand(StartVoiceChatAction.ID, {
      voice: { disableTimeout: true }
    });
    listening = true;
  }, VOICE_KEY_HOLD_THRESHOLD);
  holdMode.finally(() => {
    if (listening) {
      commandService.executeCommand(StopListeningAction.ID).finally(() => {
        ctrl.acceptInput();
      });
    }
    handle.dispose();
  });
}
__name(holdForSpeech, "holdForSpeech");
setHoldForSpeech(holdForSpeech);
export {
  HoldToSpeak
};
//# sourceMappingURL=inlineChatActions.js.map
