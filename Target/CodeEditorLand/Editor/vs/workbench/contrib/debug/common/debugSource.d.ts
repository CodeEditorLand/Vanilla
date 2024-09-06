import { URI } from "vs/base/common/uri";
import { IRange } from "vs/editor/common/core/range";
import { ILogService } from "vs/platform/log/common/log";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IEditorPane } from "vs/workbench/common/editor";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare const UNKNOWN_SOURCE_LABEL: any;
/**
 * Debug URI format
 *
 * a debug URI represents a Source object and the debug session where the Source comes from.
 *
 *       debug:arbitrary_path?session=123e4567-e89b-12d3-a456-426655440000&ref=1016
 *       \___/ \____________/ \__________________________________________/ \______/
 *         |          |                             |                          |
 *      scheme   source.path                    session id            source.reference
 *
 *
 */
export declare class Source {
    readonly uri: URI;
    available: boolean;
    raw: DebugProtocol.Source;
    constructor(raw_: DebugProtocol.Source | undefined, sessionId: string, uriIdentityService: IUriIdentityService, logService: ILogService);
    get name(): any;
    get origin(): string | undefined;
    get presentationHint(): "normal" | "deemphasize" | "emphasize" | undefined;
    get reference(): number | undefined;
    get inMemory(): boolean;
    openInEditor(editorService: IEditorService, selection: IRange, preserveFocus?: boolean, sideBySide?: boolean, pinned?: boolean): Promise<IEditorPane | undefined>;
    static getEncodedDebugData(modelUri: URI): {
        name: string;
        path: string;
        sessionId?: string;
        sourceReference?: number;
    };
}
export declare function getUriFromSource(raw: DebugProtocol.Source, path: string | undefined, sessionId: string, uriIdentityService: IUriIdentityService, logService: ILogService): URI;
