import assert from "assert";
import * as fs from "fs";
import { FileAccess } from "../../../../../base/common/network.js";
import * as path from "../../../../../base/common/path.js";
import { Promises } from "../../../../../base/node/pfs.js";
function toIResolvedKeybinding(kb) {
  return {
    label: kb.getLabel(),
    ariaLabel: kb.getAriaLabel(),
    electronAccelerator: kb.getElectronAccelerator(),
    userSettingsLabel: kb.getUserSettingsLabel(),
    isWYSIWYG: kb.isWYSIWYG(),
    isMultiChord: kb.hasMultipleChords(),
    dispatchParts: kb.getDispatchChords(),
    singleModifierDispatchParts: kb.getSingleModifierDispatchChords()
  };
}
function assertResolveKeyboardEvent(mapper, keyboardEvent, expected) {
  const actual = toIResolvedKeybinding(
    mapper.resolveKeyboardEvent(keyboardEvent)
  );
  assert.deepStrictEqual(actual, expected);
}
function assertResolveKeybinding(mapper, keybinding, expected) {
  const actual = mapper.resolveKeybinding(keybinding).map(toIResolvedKeybinding);
  assert.deepStrictEqual(actual, expected);
}
function readRawMapping(file) {
  return fs.promises.readFile(
    FileAccess.asFileUri(
      `vs/workbench/services/keybinding/test/node/${file}.js`
    ).fsPath
  ).then((buff) => {
    const contents = buff.toString();
    const func = new Function("define", contents);
    let rawMappings = null;
    func((value) => {
      rawMappings = value;
    });
    return rawMappings;
  });
}
function assertMapping(writeFileIfDifferent, mapper, file) {
  const filePath = path.normalize(
    FileAccess.asFileUri(
      `vs/workbench/services/keybinding/test/node/${file}`
    ).fsPath
  );
  return fs.promises.readFile(filePath).then((buff) => {
    const expected = buff.toString().replace(/\r\n/g, "\n");
    const actual = mapper.dumpDebugInfo().replace(/\r\n/g, "\n");
    if (actual !== expected && writeFileIfDifferent) {
      const destPath = filePath.replace(
        /[\/\\]out[\/\\]vs[\/\\]workbench/,
        "/src/vs/workbench"
      );
      Promises.writeFile(destPath, actual);
    }
    assert.deepStrictEqual(actual, expected);
  });
}
export {
  assertMapping,
  assertResolveKeybinding,
  assertResolveKeyboardEvent,
  readRawMapping
};
