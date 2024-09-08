import { type Event } from "../../../../../base/common/event.js";
import { type IDisposable } from "../../../../../base/common/lifecycle.js";
import type { URI } from "../../../../../base/common/uri.js";
import type { IFormatterChangeEvent, ILabelService, ResourceLabelFormatter, Verbosity } from "../../../../../platform/label/common/label.js";
import type { IWorkspace, IWorkspaceIdentifier } from "../../../../../platform/workspace/common/workspace.js";
export declare class MockLabelService implements ILabelService {
    _serviceBrand: undefined;
    registerCachedFormatter(formatter: ResourceLabelFormatter): IDisposable;
    getUriLabel(resource: URI, options?: {
        relative?: boolean | undefined;
        noPrefix?: boolean | undefined;
    }): string;
    getUriBasenameLabel(resource: URI): string;
    getWorkspaceLabel(workspace: URI | IWorkspaceIdentifier | IWorkspace, options?: {
        verbose: Verbosity;
    }): string;
    getHostLabel(scheme: string, authority?: string): string;
    getHostTooltip(): string | undefined;
    getSeparator(scheme: string, authority?: string): "/" | "\\";
    registerFormatter(formatter: ResourceLabelFormatter): IDisposable;
    onDidChangeFormatters: Event<IFormatterChangeEvent>;
}
