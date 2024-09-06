import { ThemeIcon } from "vs/base/common/themables";
/**
 * Only to be used by the iconRegistry.
 */
export declare function getAllCodicons(): ThemeIcon[];
/**
 * Derived icons, that could become separate icons.
 * These mappings should be moved into the mapping file in the vscode-codicons repo at some point.
 */
export declare const codiconsDerived: {
    readonly dialogError: any;
    readonly dialogWarning: any;
    readonly dialogInfo: any;
    readonly dialogClose: any;
    readonly treeItemExpanded: any;
    readonly treeFilterOnTypeOn: any;
    readonly treeFilterOnTypeOff: any;
    readonly treeFilterClear: any;
    readonly treeItemLoading: any;
    readonly menuSelection: any;
    readonly menuSubmenu: any;
    readonly menuBarMore: any;
    readonly scrollbarButtonLeft: any;
    readonly scrollbarButtonRight: any;
    readonly scrollbarButtonUp: any;
    readonly scrollbarButtonDown: any;
    readonly toolBarMore: any;
    readonly quickInputBack: any;
    readonly dropDownButton: any;
    readonly symbolCustomColor: any;
    readonly exportIcon: any;
    readonly workspaceUnspecified: any;
    readonly newLine: any;
    readonly thumbsDownFilled: any;
    readonly thumbsUpFilled: any;
    readonly gitFetch: any;
    readonly lightbulbSparkleAutofix: any;
    readonly debugBreakpointPending: any;
};
/**
 * The Codicon library is a set of default icons that are built-in in VS Code.
 *
 * In the product (outside of base) Codicons should only be used as defaults. In order to have all icons in VS Code
 * themeable, component should define new, UI component specific icons using `iconRegistry.registerIcon`.
 * In that call a Codicon can be named as default.
 */
export declare const Codicon: any;
