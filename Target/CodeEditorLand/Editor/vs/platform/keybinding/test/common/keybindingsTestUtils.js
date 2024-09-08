import {
  decodeKeybinding
} from "../../../../base/common/keybindings.js";
import { USLayoutResolvedKeybinding } from "../../common/usLayoutResolvedKeybinding.js";
function createUSLayoutResolvedKeybinding(encodedKeybinding, OS) {
  if (encodedKeybinding === 0) {
    return void 0;
  }
  const keybinding = decodeKeybinding(encodedKeybinding, OS);
  if (!keybinding) {
    return void 0;
  }
  const result = USLayoutResolvedKeybinding.resolveKeybinding(keybinding, OS);
  if (result.length > 0) {
    return result[0];
  }
  return void 0;
}
export {
  createUSLayoutResolvedKeybinding
};
