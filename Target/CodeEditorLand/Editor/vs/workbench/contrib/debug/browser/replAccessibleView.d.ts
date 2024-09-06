import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { AccessibleViewType, IAccessibleViewContentProvider, IAccessibleViewService } from "vs/platform/accessibility/browser/accessibleView";
import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { Repl } from "vs/workbench/contrib/debug/browser/repl";
import { IReplElement } from "vs/workbench/contrib/debug/common/debug";
export declare class ReplAccessibleView implements IAccessibleViewImplentation {
    priority: number;
    name: string;
    when: any;
    type: AccessibleViewType;
    getProvider(accessor: ServicesAccessor): ReplOutputAccessibleViewProvider | undefined;
}
declare class ReplOutputAccessibleViewProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _replView;
    private readonly _focusedElement;
    private readonly _accessibleViewService;
    readonly id: any;
    private _content;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    private readonly _onDidResolveChildren;
    readonly onDidResolveChildren: Event<void>;
    readonly verbositySettingKey: any;
    readonly options: {
        type: any;
    };
    private _elementPositionMap;
    private _treeHadFocus;
    constructor(_replView: Repl, _focusedElement: IReplElement | undefined, _accessibleViewService: IAccessibleViewService);
    provideContent(): string;
    onClose(): void;
    onOpen(): void;
    private _updateContent;
}
export {};
