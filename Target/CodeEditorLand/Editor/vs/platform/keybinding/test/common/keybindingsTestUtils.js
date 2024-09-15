var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { decodeKeybinding, ResolvedKeybinding } from "../../../../base/common/keybindings.js";
import { OperatingSystem } from "../../../../base/common/platform.js";
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
__name(createUSLayoutResolvedKeybinding, "createUSLayoutResolvedKeybinding");
export {
  createUSLayoutResolvedKeybinding
};
//# sourceMappingURL=keybindingsTestUtils.js.map
