import { type Event } from "../../../../base/common/event.js";
import severity from "../../../../base/common/severity.js";
import type { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import type { IDebugSession, IExpression, INestingReplElement, IReplElement, IReplElementSource, IStackFrame } from "./debug.js";
import { ExpressionContainer } from "./debugModel.js";
/**
 * General case of data from DAP the `output` event. {@link ReplVariableElement}
 * is used instead only if there is a `variablesReference` with no `output` text.
 */
export declare class ReplOutputElement implements INestingReplElement {
    session: IDebugSession;
    private id;
    value: string;
    severity: severity;
    sourceData?: IReplElementSource | undefined;
    readonly expression?: IExpression | undefined;
    private _count;
    private _onDidChangeCount;
    constructor(session: IDebugSession, id: string, value: string, severity: severity, sourceData?: IReplElementSource | undefined, expression?: IExpression | undefined);
    toString(includeSource?: boolean): string;
    getId(): string;
    getChildren(): Promise<IReplElement[]>;
    set count(value: number);
    get count(): number;
    get onDidChangeCount(): Event<void>;
    get hasChildren(): boolean;
}
/** Top-level variable logged via DAP output when there's no `output` string */
export declare class ReplVariableElement implements INestingReplElement {
    readonly expression: IExpression;
    readonly severity: severity;
    readonly sourceData?: IReplElementSource | undefined;
    readonly hasChildren: boolean;
    private readonly id;
    constructor(expression: IExpression, severity: severity, sourceData?: IReplElementSource | undefined);
    getChildren(): IReplElement[] | Promise<IReplElement[]>;
    toString(): string;
    getId(): string;
}
export declare class RawObjectReplElement implements IExpression, INestingReplElement {
    private id;
    name: string;
    valueObj: any;
    sourceData?: IReplElementSource | undefined;
    annotation?: string | undefined;
    private static readonly MAX_CHILDREN;
    constructor(id: string, name: string, valueObj: any, sourceData?: IReplElementSource | undefined, annotation?: string | undefined);
    getId(): string;
    get value(): string;
    get hasChildren(): boolean;
    evaluateLazy(): Promise<void>;
    getChildren(): Promise<IExpression[]>;
    toString(): string;
}
export declare class ReplEvaluationInput implements IReplElement {
    value: string;
    private id;
    constructor(value: string);
    toString(): string;
    getId(): string;
}
export declare class ReplEvaluationResult extends ExpressionContainer implements IReplElement {
    readonly originalExpression: string;
    private _available;
    get available(): boolean;
    constructor(originalExpression: string);
    evaluateExpression(expression: string, session: IDebugSession | undefined, stackFrame: IStackFrame | undefined, context: string): Promise<boolean>;
    toString(): string;
}
export declare class ReplGroup implements INestingReplElement {
    name: string;
    autoExpand: boolean;
    sourceData?: IReplElementSource | undefined;
    private children;
    private id;
    private ended;
    static COUNTER: number;
    constructor(name: string, autoExpand: boolean, sourceData?: IReplElementSource | undefined);
    get hasChildren(): boolean;
    getId(): string;
    toString(includeSource?: boolean): string;
    addChild(child: IReplElement): void;
    getChildren(): IReplElement[];
    end(): void;
    get hasEnded(): boolean;
}
export interface INewReplElementData {
    output: string;
    expression?: IExpression;
    sev: severity;
    source?: IReplElementSource;
}
export declare class ReplModel {
    private readonly configurationService;
    private replElements;
    private readonly _onDidChangeElements;
    readonly onDidChangeElements: Event<IReplElement | undefined>;
    constructor(configurationService: IConfigurationService);
    getReplElements(): IReplElement[];
    addReplExpression(session: IDebugSession, stackFrame: IStackFrame | undefined, expression: string): Promise<void>;
    appendToRepl(session: IDebugSession, { output, expression, sev, source }: INewReplElementData): void;
    startGroup(name: string, autoExpand: boolean, sourceData?: IReplElementSource): void;
    endGroup(): void;
    private addReplElement;
    removeReplExpressions(): void;
    /** Returns a new REPL model that's a copy of this one. */
    clone(): ReplModel;
}
