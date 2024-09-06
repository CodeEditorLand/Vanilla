import { IDisposable } from "vs/base/common/lifecycle";
import { AccessibleContentProvider, AccessibleViewType, ExtensionContentProvider } from "vs/platform/accessibility/browser/accessibleView";
import { ContextKeyExpression } from "vs/platform/contextkey/common/contextkey";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export interface IAccessibleViewImplentation {
    type: AccessibleViewType;
    priority: number;
    name: string;
    /**
     * @returns the provider or undefined if the view should not be shown
     */
    getProvider: (accessor: ServicesAccessor) => AccessibleContentProvider | ExtensionContentProvider | undefined;
    when?: ContextKeyExpression | undefined;
}
export declare const AccessibleViewRegistry: {
    _implementations: IAccessibleViewImplentation[];
    register(implementation: IAccessibleViewImplentation): IDisposable;
    getImplementations(): IAccessibleViewImplentation[];
};
