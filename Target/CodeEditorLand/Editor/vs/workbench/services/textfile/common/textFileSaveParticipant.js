var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { insert } from "../../../../base/common/arrays.js";
import { raceCancellation } from "../../../../base/common/async.js";
import {
  Disposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { ILogService } from "../../../../platform/log/common/log.js";
let TextFileSaveParticipant = class extends Disposable {
  constructor(logService) {
    super();
    this.logService = logService;
  }
  saveParticipants = [];
  addSaveParticipant(participant) {
    const remove = insert(this.saveParticipants, participant);
    return toDisposable(() => remove());
  }
  async participate(model, context, progress, token) {
    model.textEditorModel?.pushStackElement();
    for (const saveParticipant of this.saveParticipants) {
      if (token.isCancellationRequested || !model.textEditorModel) {
        break;
      }
      try {
        const promise = saveParticipant.participate(
          model,
          context,
          progress,
          token
        );
        await raceCancellation(promise, token);
      } catch (err) {
        this.logService.error(err);
      }
    }
    model.textEditorModel?.pushStackElement();
  }
  dispose() {
    this.saveParticipants.splice(0, this.saveParticipants.length);
    super.dispose();
  }
};
TextFileSaveParticipant = __decorateClass([
  __decorateParam(0, ILogService)
], TextFileSaveParticipant);
export {
  TextFileSaveParticipant
};
