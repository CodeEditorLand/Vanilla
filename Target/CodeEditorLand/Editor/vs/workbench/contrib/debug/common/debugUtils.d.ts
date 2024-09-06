import { CancellationToken } from "vs/base/common/cancellation";
import { Position } from "vs/editor/common/core/position";
import { IRange } from "vs/editor/common/core/range";
import { ITextModel } from "vs/editor/common/model";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IConfigPresentation, IDebuggerContribution, IDebugSession } from "vs/workbench/contrib/debug/common/debug";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare function formatPII(value: string, excludePII: boolean, args: {
    [key: string]: string;
} | undefined): string;
/**
 * Filters exceptions (keys marked with "!") from the given object. Used to
 * ensure exception data is not sent on web remotes, see #97628.
 */
export declare function filterExceptionsFromTelemetry<T extends {
    [key: string]: unknown;
}>(data: T): Partial<T>;
export declare function isSessionAttach(session: IDebugSession): boolean;
/**
 * Returns the session or any parent which is an extension host debug session.
 * Returns undefined if there's none.
 */
export declare function getExtensionHostDebugSession(session: IDebugSession): IDebugSession | void;
export declare function isDebuggerMainContribution(dbg: IDebuggerContribution): any;
export declare function getExactExpressionStartAndEnd(lineContent: string, looseStart: number, looseEnd: number): {
    start: number;
    end: number;
};
export declare function getEvaluatableExpressionAtPosition(languageFeaturesService: ILanguageFeaturesService, model: ITextModel, position: Position, token?: CancellationToken): Promise<{
    range: IRange;
    matchingExpression: string;
} | null>;
export declare function isUri(s: string | undefined): boolean;
export declare function convertToDAPaths(message: DebugProtocol.ProtocolMessage, toUri: boolean): DebugProtocol.ProtocolMessage;
export declare function convertToVSCPaths(message: DebugProtocol.ProtocolMessage, toUri: boolean): DebugProtocol.ProtocolMessage;
export declare function getVisibleAndSorted<T extends {
    presentation?: IConfigPresentation;
}>(array: T[]): T[];
export declare function saveAllBeforeDebugStart(configurationService: IConfigurationService, editorService: IEditorService): Promise<void>;
export declare const sourcesEqual: (a: DebugProtocol.Source | undefined, b: DebugProtocol.Source | undefined) => boolean;
