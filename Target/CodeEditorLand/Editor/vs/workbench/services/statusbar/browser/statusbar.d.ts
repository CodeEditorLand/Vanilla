import type { IMarkdownString } from "../../../../base/common/htmlContent.js";
import type { DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import type { ThemeColor } from "../../../../base/common/themables.js";
import type { Command } from "../../../../editor/common/languages.js";
import type { ColorIdentifier } from "../../../../platform/theme/common/colorRegistry.js";
import type { IAuxiliaryStatusbarPart, IStatusbarEntryContainer } from "../../../browser/parts/statusbar/statusbarPart.js";
export declare const IStatusbarService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IStatusbarService>;
export interface IStatusbarService extends IStatusbarEntryContainer {
    readonly _serviceBrand: undefined;
    /**
     * Get the status bar part that is rooted in the provided container.
     */
    getPart(container: HTMLElement): IStatusbarEntryContainer;
    /**
     * Creates a new auxililary status bar part in the provided container.
     */
    createAuxiliaryStatusbarPart(container: HTMLElement): IAuxiliaryStatusbarPart;
    /**
     * Create a scoped status bar service that only operates on the provided
     * status entry container.
     */
    createScoped(statusbarEntryContainer: IStatusbarEntryContainer, disposables: DisposableStore): IStatusbarService;
}
export declare enum StatusbarAlignment {
    LEFT = 0,
    RIGHT = 1
}
export interface IStatusbarEntryLocation {
    /**
     * The identifier of another status bar entry to
     * position relative to.
     */
    id: string;
    /**
     * The alignment of the status bar entry relative
     * to the referenced entry.
     */
    alignment: StatusbarAlignment;
    /**
     * Whether to move the entry close to the location
     * so that it appears as if both this entry and
     * the location belong to each other.
     */
    compact?: boolean;
}
export declare function isStatusbarEntryLocation(thing: unknown): thing is IStatusbarEntryLocation;
export interface IStatusbarEntryPriority {
    /**
     * The main priority of the entry that
     * defines the order of appearance:
     * either a number or a reference to
     * another status bar entry to position
     * relative to.
     *
     * May not be unique across all entries.
     */
    readonly primary: number | IStatusbarEntryLocation;
    /**
     * The secondary priority of the entry
     * is used in case the main priority
     * matches another one's priority.
     *
     * Should be unique across all entries.
     */
    readonly secondary: number;
}
export declare function isStatusbarEntryPriority(thing: unknown): thing is IStatusbarEntryPriority;
export declare const ShowTooltipCommand: Command;
export interface IStatusbarStyleOverride {
    readonly priority: number;
    readonly foreground?: ColorIdentifier;
    readonly background?: ColorIdentifier;
    readonly border?: ColorIdentifier;
}
export type StatusbarEntryKind = "standard" | "warning" | "error" | "prominent" | "remote" | "offline";
export declare const StatusbarEntryKinds: StatusbarEntryKind[];
/**
 * A declarative way of describing a status bar entry
 */
export interface IStatusbarEntry {
    /**
     * The (short) name to show for the entry like 'Language Indicator',
     * 'Git Status' etc.
     */
    readonly name: string;
    /**
     * The text to show for the entry. You can embed icons in the text by leveraging the syntax:
     *
     * `My text $(icon name) contains icons like $(icon name) this one.`
     */
    readonly text: string;
    /**
     * Text to be read out by the screen reader.
     */
    readonly ariaLabel: string;
    /**
     * Role of the status bar entry which defines how a screen reader interacts with it.
     * Default is 'button'.
     */
    readonly role?: string;
    /**
     * An optional tooltip text to show when you hover over the entry
     */
    readonly tooltip?: string | IMarkdownString | HTMLElement;
    /**
     * An optional color to use for the entry.
     *
     * @deprecated Use `kind` instead to support themable hover styles.
     */
    readonly color?: string | ThemeColor;
    /**
     * An optional background color to use for the entry.
     *
     * @deprecated Use `kind` instead to support themable hover styles.
     */
    readonly backgroundColor?: string | ThemeColor;
    /**
     * An optional command to execute on click.
     *
     * Can use the special `ShowTooltipCommand` to
     * show the tooltip on click if provided.
     */
    readonly command?: string | Command | typeof ShowTooltipCommand;
    /**
     * Whether to show a beak above the status bar entry.
     */
    readonly showBeak?: boolean;
    /**
     * Will enable a spinning icon in front of the text to indicate progress. When `true` is
     * specified, `loading` will be used.
     */
    readonly showProgress?: boolean | "loading" | "syncing";
    /**
     * The kind of status bar entry. This applies different colors to the entry.
     */
    readonly kind?: StatusbarEntryKind;
    /**
     * Enables the status bar entry to appear in all opened windows. Automatically will add
     * the entry to new auxiliary windows opening.
     */
    readonly showInAllWindows?: boolean;
}
export interface IStatusbarEntryAccessor extends IDisposable {
    /**
     * Allows to update an existing status bar entry.
     */
    update(properties: IStatusbarEntry): void;
}