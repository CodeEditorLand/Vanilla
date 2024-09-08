import assert from "assert";
import { Position } from "../../../common/core/position.js";
import {
  EndOfLinePreference,
  EndOfLineSequence
} from "../../../common/model.js";
import { MirrorTextModel } from "../../../common/model/mirrorTextModel.js";
import { createTextModel } from "../testTextModel.js";
function testApplyEditsWithSyncedModels(original, edits, expected, inputEditsAreInvalid = false) {
  const originalStr = original.join("\n");
  const expectedStr = expected.join("\n");
  assertSyncedModels(originalStr, (model, assertMirrorModels) => {
    const inverseEdits = model.applyEdits(edits, true);
    assert.deepStrictEqual(
      model.getValue(EndOfLinePreference.LF),
      expectedStr
    );
    assertMirrorModels();
    const inverseInverseEdits = model.applyEdits(inverseEdits, true);
    assert.deepStrictEqual(
      model.getValue(EndOfLinePreference.LF),
      originalStr
    );
    if (!inputEditsAreInvalid) {
      const simplifyEdit = (edit) => {
        return {
          range: edit.range,
          text: edit.text,
          forceMoveMarkers: edit.forceMoveMarkers || false
        };
      };
      assert.deepStrictEqual(
        inverseInverseEdits.map(simplifyEdit),
        edits.map(simplifyEdit)
      );
    }
    assertMirrorModels();
  });
}
var AssertDocumentLineMappingDirection = /* @__PURE__ */ ((AssertDocumentLineMappingDirection2) => {
  AssertDocumentLineMappingDirection2[AssertDocumentLineMappingDirection2["OffsetToPosition"] = 0] = "OffsetToPosition";
  AssertDocumentLineMappingDirection2[AssertDocumentLineMappingDirection2["PositionToOffset"] = 1] = "PositionToOffset";
  return AssertDocumentLineMappingDirection2;
})(AssertDocumentLineMappingDirection || {});
function assertOneDirectionLineMapping(model, direction, msg) {
  const allText = model.getValue();
  let line = 1, column = 1, previousIsCarriageReturn = false;
  for (let offset = 0; offset <= allText.length; offset++) {
    const position = new Position(
      line,
      column + (previousIsCarriageReturn ? -1 : 0)
    );
    if (direction === 0 /* OffsetToPosition */) {
      const actualPosition = model.getPositionAt(offset);
      assert.strictEqual(
        actualPosition.toString(),
        position.toString(),
        msg + " - getPositionAt mismatch for offset " + offset
      );
    } else {
      const expectedOffset = offset + (previousIsCarriageReturn ? -1 : 0);
      const actualOffset = model.getOffsetAt(position);
      assert.strictEqual(
        actualOffset,
        expectedOffset,
        msg + " - getOffsetAt mismatch for position " + position.toString()
      );
    }
    if (allText.charAt(offset) === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
    previousIsCarriageReturn = allText.charAt(offset) === "\r";
  }
}
function assertLineMapping(model, msg) {
  assertOneDirectionLineMapping(
    model,
    1 /* PositionToOffset */,
    msg
  );
  assertOneDirectionLineMapping(
    model,
    0 /* OffsetToPosition */,
    msg
  );
}
function assertSyncedModels(text, callback, setup = null) {
  const model = createTextModel(text);
  model.setEOL(EndOfLineSequence.LF);
  assertLineMapping(model, "model");
  if (setup) {
    setup(model);
    assertLineMapping(model, "model");
  }
  const mirrorModel2 = new MirrorTextModel(
    null,
    model.getLinesContent(),
    model.getEOL(),
    model.getVersionId()
  );
  let mirrorModel2PrevVersionId = model.getVersionId();
  const disposable = model.onDidChangeContent(
    (e) => {
      const versionId = e.versionId;
      if (versionId < mirrorModel2PrevVersionId) {
        console.warn(
          "Model version id did not advance between edits (2)"
        );
      }
      mirrorModel2PrevVersionId = versionId;
      mirrorModel2.onEvents(e);
    }
  );
  const assertMirrorModels = () => {
    assertLineMapping(model, "model");
    assert.strictEqual(
      mirrorModel2.getText(),
      model.getValue(),
      "mirror model 2 text OK"
    );
    assert.strictEqual(
      mirrorModel2.version,
      model.getVersionId(),
      "mirror model 2 version OK"
    );
  };
  callback(model, assertMirrorModels);
  disposable.dispose();
  model.dispose();
  mirrorModel2.dispose();
}
export {
  assertSyncedModels,
  testApplyEditsWithSyncedModels
};
