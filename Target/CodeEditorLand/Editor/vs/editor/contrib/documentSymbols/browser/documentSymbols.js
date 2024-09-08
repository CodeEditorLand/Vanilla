import { CancellationToken } from "../../../../base/common/cancellation.js";
import { assertType } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { ITextModelService } from "../../../common/services/resolverService.js";
import { IOutlineModelService } from "./outlineModel.js";
CommandsRegistry.registerCommand(
  "_executeDocumentSymbolProvider",
  async (accessor, ...args) => {
    const [resource] = args;
    assertType(URI.isUri(resource));
    const outlineService = accessor.get(IOutlineModelService);
    const modelService = accessor.get(ITextModelService);
    const reference = await modelService.createModelReference(resource);
    try {
      return (await outlineService.getOrCreate(
        reference.object.textEditorModel,
        CancellationToken.None
      )).getTopLevelSymbols();
    } finally {
      reference.dispose();
    }
  }
);
