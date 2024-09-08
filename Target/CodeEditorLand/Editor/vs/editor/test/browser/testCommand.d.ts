import { DisposableStore } from "../../../base/common/lifecycle.js";
import type { ServicesAccessor } from "../../../platform/instantiation/common/instantiation.js";
import type { ISingleEditOperation } from "../../common/core/editOperation.js";
import type { Selection } from "../../common/core/selection.js";
import type { ICommand } from "../../common/editorCommon.js";
import type { ITextModel } from "../../common/model.js";
export declare function testCommand(lines: string[], languageId: string | null, selection: Selection, commandFactory: (accessor: ServicesAccessor, selection: Selection) => ICommand, expectedLines: string[], expectedSelection: Selection, forceTokenization?: boolean, prepare?: (accessor: ServicesAccessor, disposables: DisposableStore) => void): void;
/**
 * Extract edit operations if command `command` were to execute on model `model`
 */
export declare function getEditOperation(model: ITextModel, command: ICommand): ISingleEditOperation[];
