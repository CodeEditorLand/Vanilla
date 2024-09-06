import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { ThemeIcon } from "vs/base/common/themables";
import { URI } from "vs/base/common/uri";
import { ColorIdentifier } from "vs/platform/theme/common/colorRegistry";
export declare const IDecorationsService: any;
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
