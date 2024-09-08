import { Emitter } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IInteractiveDocumentService = createDecorator("IInteractiveDocumentService");
class InteractiveDocumentService extends Disposable {
  _onWillAddInteractiveDocument = this._register(
    new Emitter()
  );
  onWillAddInteractiveDocument = this._onWillAddInteractiveDocument.event;
  _onWillRemoveInteractiveDocument = this._register(
    new Emitter()
  );
  onWillRemoveInteractiveDocument = this._onWillRemoveInteractiveDocument.event;
  constructor() {
    super();
  }
  willCreateInteractiveDocument(notebookUri, inputUri, languageId) {
    this._onWillAddInteractiveDocument.fire({
      notebookUri,
      inputUri,
      languageId
    });
  }
  willRemoveInteractiveDocument(notebookUri, inputUri) {
    this._onWillRemoveInteractiveDocument.fire({
      notebookUri,
      inputUri
    });
  }
}
export {
  IInteractiveDocumentService,
  InteractiveDocumentService
};
