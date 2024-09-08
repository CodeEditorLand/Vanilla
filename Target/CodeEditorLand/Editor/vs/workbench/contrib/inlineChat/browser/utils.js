import {
  AsyncIterableSource
} from "../../../../base/common/async.js";
import { EditOperation } from "../../../../editor/common/core/editOperation.js";
import {
  TrackedRangeStickiness
} from "../../../../editor/common/model.js";
import { getNWords } from "../../chat/common/chatWordCounter.js";
async function performAsyncTextEdit(model, edit, progress, obs) {
  const [id] = model.deltaDecorations(
    [],
    [
      {
        range: edit.range,
        options: {
          description: "asyncTextEdit",
          stickiness: TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges
        }
      }
    ]
  );
  let first = true;
  for await (const part of edit.newText) {
    if (model.isDisposed()) {
      break;
    }
    const range = model.getDecorationRange(id);
    if (!range) {
      throw new Error(
        "FAILED to perform async replace edit because the anchor decoration was removed"
      );
    }
    const edit2 = first ? EditOperation.replace(range, part) : EditOperation.insert(range.getEndPosition(), part);
    obs?.start();
    model.pushEditOperations(null, [edit2], (undoEdits) => {
      progress?.report(undoEdits);
      return null;
    });
    obs?.stop();
    first = false;
  }
}
function asProgressiveEdit(interval, edit, wordsPerSec, token) {
  wordsPerSec = Math.max(30, wordsPerSec);
  const stream = new AsyncIterableSource();
  let newText = edit.text ?? "";
  interval.cancelAndSet(() => {
    if (token.isCancellationRequested) {
      return;
    }
    const r = getNWords(newText, 1);
    stream.emitOne(r.value);
    newText = newText.substring(r.value.length);
    if (r.isFullString) {
      interval.cancel();
      stream.resolve();
      d.dispose();
    }
  }, 1e3 / wordsPerSec);
  const d = token.onCancellationRequested(() => {
    interval.cancel();
    stream.resolve();
    d.dispose();
  });
  return {
    range: edit.range,
    newText: stream.asyncIterable
  };
}
export {
  asProgressiveEdit,
  performAsyncTextEdit
};
