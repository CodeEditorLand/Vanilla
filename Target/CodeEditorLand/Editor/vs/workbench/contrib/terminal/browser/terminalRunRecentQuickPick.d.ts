import { IContextKey } from "vs/platform/contextkey/common/contextkey";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { ITerminalInstance } from "vs/workbench/contrib/terminal/browser/terminal";
export declare function showRunRecentQuickPick(accessor: ServicesAccessor, instance: ITerminalInstance, terminalInRunCommandPicker: IContextKey<boolean>, type: "command" | "cwd", filterMode?: "fuzzy" | "contiguous", value?: string): Promise<void>;
