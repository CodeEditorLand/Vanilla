import type { CancellationToken } from "../../../../base/common/cancellation.js";
import type { Event } from "../../../../base/common/event.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
import type { ThemeIcon } from "../../../../base/common/themables.js";
import type { URI } from "../../../../base/common/uri.js";
import type { ColorIdentifier } from "../../../../platform/theme/common/colorRegistry.js";
export declare const IDecorationsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IDecorationsService>;
export interface IDecorationData {
    readonly weight?: number;
    readonly color?: ColorIdentifier;
    readonly letter?: string | ThemeIcon;
    readonly tooltip?: string;
    readonly strikethrough?: boolean;
    readonly bubble?: boolean;
}
export interface IDecoration extends IDisposable {
    readonly tooltip: string;
    readonly strikethrough: boolean;
    readonly labelClassName: string;
    readonly badgeClassName: string;
    readonly iconClassName: string;
}
export interface IDecorationsProvider {
    readonly label: string;
    readonly onDidChange: Event<readonly URI[]>;
    provideDecorations(uri: URI, token: CancellationToken): IDecorationData | Promise<IDecorationData | undefined> | undefined;
}
export interface IResourceDecorationChangeEvent {
    affectsResource(uri: URI): boolean;
}
export interface IDecorationsService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeDecorations: Event<IResourceDecorationChangeEvent>;
    registerDecorationsProvider(provider: IDecorationsProvider): IDisposable;
    getDecoration(uri: URI, includeChildren: boolean): IDecoration | undefined;
}
