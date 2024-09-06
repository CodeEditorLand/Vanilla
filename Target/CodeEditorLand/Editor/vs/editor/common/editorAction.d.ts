import { IEditorAction } from "vs/editor/common/editorCommon";
import { ICommandMetadata } from "vs/platform/commands/common/commands";
import { ContextKeyExpression, IContextKeyService } from "vs/platform/contextkey/common/contextkey";
export declare class InternalEditorAction implements IEditorAction {
    readonly id: string;
    readonly label: string;
    readonly alias: string;
    readonly metadata: ICommandMetadata | undefined;
    private readonly _precondition;
    private readonly _run;
    private readonly _contextKeyService;
    constructor(id: string, label: string, alias: string, metadata: ICommandMetadata | undefined, _precondition: ContextKeyExpression | undefined, _run: (args: unknown) => Promise<void>, _contextKeyService: IContextKeyService);
    isSupported(): boolean;
    run(args: unknown): Promise<void>;
}
