import { compareBy } from "../../../../../base/common/arrays.js";
import {
  assertFn,
  checkAdjacentItems
} from "../../../../../base/common/assert.js";
import { isDefined } from "../../../../../base/common/types.js";
import { Position } from "../../../../../editor/common/core/position.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { TextLength } from "../../../../../editor/common/core/textLength.js";
import { RangeMapping } from "../model/mapping.js";
import {
  addLength,
  lengthBetweenPositions,
  lengthOfRange
} from "../model/rangeUtils.js";
function getAlignments(m) {
  const equalRanges1 = toEqualRangeMappings(
    m.input1Diffs.flatMap((d) => d.rangeMappings),
    m.baseRange.toRange(),
    m.input1Range.toRange()
  );
  const equalRanges2 = toEqualRangeMappings(
    m.input2Diffs.flatMap((d) => d.rangeMappings),
    m.baseRange.toRange(),
    m.input2Range.toRange()
  );
  const commonRanges = splitUpCommonEqualRangeMappings(
    equalRanges1,
    equalRanges2
  );
  let result = [];
  result.push([
    m.input1Range.startLineNumber - 1,
    m.baseRange.startLineNumber - 1,
    m.input2Range.startLineNumber - 1
  ]);
  function isFullSync(lineAlignment) {
    return lineAlignment.every((i) => i !== void 0);
  }
  for (const m2 of commonRanges) {
    const lineAlignment = [
      m2.output1Pos?.lineNumber,
      m2.inputPos.lineNumber,
      m2.output2Pos?.lineNumber
    ];
    const alignmentIsFullSync = isFullSync(lineAlignment);
    let shouldAdd = true;
    if (alignmentIsFullSync) {
      const isNewFullSyncAlignment = !result.some(
        (r) => isFullSync(r) && r.some(
          (v, idx) => v !== void 0 && v === lineAlignment[idx]
        )
      );
      if (isNewFullSyncAlignment) {
        result = result.filter(
          (r) => !r.some(
            (v, idx) => v !== void 0 && v === lineAlignment[idx]
          )
        );
      }
      shouldAdd = isNewFullSyncAlignment;
    } else {
      const isNew = !result.some(
        (r) => r.some((v, idx) => v !== void 0 && v === lineAlignment[idx])
      );
      shouldAdd = isNew;
    }
    if (shouldAdd) {
      result.push(lineAlignment);
    } else if (m2.length.isGreaterThan(new TextLength(1, 0))) {
      result.push([
        m2.output1Pos ? m2.output1Pos.lineNumber + 1 : void 0,
        m2.inputPos.lineNumber + 1,
        m2.output2Pos ? m2.output2Pos.lineNumber + 1 : void 0
      ]);
    }
  }
  const finalLineAlignment = [
    m.input1Range.endLineNumberExclusive,
    m.baseRange.endLineNumberExclusive,
    m.input2Range.endLineNumberExclusive
  ];
  result = result.filter(
    (r) => r.every((v, idx) => v !== finalLineAlignment[idx])
  );
  result.push(finalLineAlignment);
  assertFn(
    () => checkAdjacentItems(
      result.map((r) => r[0]).filter(isDefined),
      (a, b) => a < b
    ) && checkAdjacentItems(
      result.map((r) => r[1]).filter(isDefined),
      (a, b) => a <= b
    ) && checkAdjacentItems(
      result.map((r) => r[2]).filter(isDefined),
      (a, b) => a < b
    ) && result.every(
      (alignment) => alignment.filter(isDefined).length >= 2
    )
  );
  return result;
}
function toEqualRangeMappings(diffs, inputRange, outputRange) {
  const result = [];
  let equalRangeInputStart = inputRange.getStartPosition();
  let equalRangeOutputStart = outputRange.getStartPosition();
  for (const d of diffs) {
    const equalRangeMapping2 = new RangeMapping(
      Range.fromPositions(
        equalRangeInputStart,
        d.inputRange.getStartPosition()
      ),
      Range.fromPositions(
        equalRangeOutputStart,
        d.outputRange.getStartPosition()
      )
    );
    assertFn(
      () => lengthOfRange(equalRangeMapping2.inputRange).equals(
        lengthOfRange(equalRangeMapping2.outputRange)
      )
    );
    if (!equalRangeMapping2.inputRange.isEmpty()) {
      result.push(equalRangeMapping2);
    }
    equalRangeInputStart = d.inputRange.getEndPosition();
    equalRangeOutputStart = d.outputRange.getEndPosition();
  }
  const equalRangeMapping = new RangeMapping(
    Range.fromPositions(equalRangeInputStart, inputRange.getEndPosition()),
    Range.fromPositions(
      equalRangeOutputStart,
      outputRange.getEndPosition()
    )
  );
  assertFn(
    () => lengthOfRange(equalRangeMapping.inputRange).equals(
      lengthOfRange(equalRangeMapping.outputRange)
    )
  );
  if (!equalRangeMapping.inputRange.isEmpty()) {
    result.push(equalRangeMapping);
  }
  return result;
}
function splitUpCommonEqualRangeMappings(equalRangeMappings1, equalRangeMappings2) {
  const result = [];
  const events = [];
  for (const [input, rangeMappings] of [
    [0, equalRangeMappings1],
    [1, equalRangeMappings2]
  ]) {
    for (const rangeMapping of rangeMappings) {
      events.push({
        input,
        start: true,
        inputPos: rangeMapping.inputRange.getStartPosition(),
        outputPos: rangeMapping.outputRange.getStartPosition()
      });
      events.push({
        input,
        start: false,
        inputPos: rangeMapping.inputRange.getEndPosition(),
        outputPos: rangeMapping.outputRange.getEndPosition()
      });
    }
  }
  events.sort(compareBy((m) => m.inputPos, Position.compare));
  const starts = [
    void 0,
    void 0
  ];
  let lastInputPos;
  for (const event of events) {
    if (lastInputPos && starts.some((s) => !!s)) {
      const length = lengthBetweenPositions(lastInputPos, event.inputPos);
      if (!length.isZero()) {
        result.push({
          inputPos: lastInputPos,
          length,
          output1Pos: starts[0],
          output2Pos: starts[1]
        });
        if (starts[0]) {
          starts[0] = addLength(starts[0], length);
        }
        if (starts[1]) {
          starts[1] = addLength(starts[1], length);
        }
      }
    }
    starts[event.input] = event.start ? event.outputPos : void 0;
    lastInputPos = event.inputPos;
  }
  return result;
}
export {
  getAlignments
};
