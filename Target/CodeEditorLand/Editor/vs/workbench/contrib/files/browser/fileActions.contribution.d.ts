import { ICommandAction } from "vs/platform/action/common/action";
import { ContextKeyExpression } from "vs/platform/contextkey/common/contextkey";
export declare function appendEditorTitleContextMenuItem(id: string, title: string, when: ContextKeyExpression | undefined, group: string, supportsMultiSelect: boolean, order?: number): void;
export declare function appendToCommandPalette({ id, title, category, metadata }: ICommandAction, when?: ContextKeyExpression): void;
