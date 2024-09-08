import { CharCode } from "../../../base/common/charCode.js";
class ResolvedKeybindingItem {
  _resolvedKeybindingItemBrand = void 0;
  resolvedKeybinding;
  chords;
  bubble;
  command;
  commandArgs;
  when;
  isDefault;
  extensionId;
  isBuiltinExtension;
  constructor(resolvedKeybinding, command, commandArgs, when, isDefault, extensionId, isBuiltinExtension) {
    this.resolvedKeybinding = resolvedKeybinding;
    this.chords = resolvedKeybinding ? toEmptyArrayIfContainsNull(resolvedKeybinding.getDispatchChords()) : [];
    if (resolvedKeybinding && this.chords.length === 0) {
      this.chords = toEmptyArrayIfContainsNull(
        resolvedKeybinding.getSingleModifierDispatchChords()
      );
    }
    this.bubble = command ? command.charCodeAt(0) === CharCode.Caret : false;
    this.command = this.bubble ? command.substr(1) : command;
    this.commandArgs = commandArgs;
    this.when = when;
    this.isDefault = isDefault;
    this.extensionId = extensionId;
    this.isBuiltinExtension = isBuiltinExtension;
  }
}
function toEmptyArrayIfContainsNull(arr) {
  const result = [];
  for (let i = 0, len = arr.length; i < len; i++) {
    const element = arr[i];
    if (!element) {
      return [];
    }
    result.push(element);
  }
  return result;
}
export {
  ResolvedKeybindingItem,
  toEmptyArrayIfContainsNull
};
