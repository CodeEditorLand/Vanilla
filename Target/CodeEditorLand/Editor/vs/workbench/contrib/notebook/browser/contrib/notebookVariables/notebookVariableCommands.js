import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { URI } from "../../../../../../base/common/uri.js";
import { localize } from "../../../../../../nls.js";
import {
  Action2,
  registerAction2
} from "../../../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../../../platform/clipboard/common/clipboardService.js";
import {
  INotebookKernelService
} from "../../../common/notebookKernelService.js";
import { INotebookService } from "../../../common/notebookService.js";
const COPY_NOTEBOOK_VARIABLE_VALUE_ID = "workbench.debug.viewlet.action.copyWorkspaceVariableValue";
const COPY_NOTEBOOK_VARIABLE_VALUE_LABEL = localize(
  "copyWorkspaceVariableValue",
  "Copy Value"
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: COPY_NOTEBOOK_VARIABLE_VALUE_ID,
        title: COPY_NOTEBOOK_VARIABLE_VALUE_LABEL,
        f1: false
      });
    }
    run(accessor, context) {
      const clipboardService = accessor.get(IClipboardService);
      if (context.value) {
        clipboardService.writeText(context.value);
      }
    }
  }
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "_executeNotebookVariableProvider",
        title: localize(
          "executeNotebookVariableProvider",
          "Execute Notebook Variable Provider"
        ),
        f1: false
      });
    }
    async run(accessor, resource) {
      if (!resource) {
        return [];
      }
      const uri = URI.revive(resource);
      const notebookKernelService = accessor.get(INotebookKernelService);
      const notebookService = accessor.get(INotebookService);
      const notebookTextModel = notebookService.getNotebookTextModel(uri);
      if (!notebookTextModel) {
        return [];
      }
      const selectedKernel = notebookKernelService.getMatchingKernel(
        notebookTextModel
      ).selected;
      if (selectedKernel && selectedKernel.hasVariableProvider) {
        const variables = selectedKernel.provideVariables(
          notebookTextModel.uri,
          void 0,
          "named",
          0,
          CancellationToken.None
        );
        return await variables.map((variable) => {
          return variable;
        }).toPromise();
      }
      return [];
    }
  }
);
export {
  COPY_NOTEBOOK_VARIABLE_VALUE_ID,
  COPY_NOTEBOOK_VARIABLE_VALUE_LABEL
};
//# sourceMappingURL=notebookVariableCommands.js.map
