import { type IMatch } from "./filters.js";
export declare function escapeIcons(text: string): string;
export declare function markdownEscapeEscapedIcons(text: string): string;
/**
 * Takes a label with icons (`$(iconId)xyz`)  and strips the icons out (`xyz`)
 */
export declare function stripIcons(text: string): string;
/**
 * Takes a label with icons (`$(iconId)xyz`), removes the icon syntax adds whitespace so that screen readers can read the text better.
 */
export declare function getCodiconAriaLabel(text: string | undefined): string;
export interface IParsedLabelWithIcons {
    readonly text: string;
    readonly iconOffsets?: readonly number[];
}
/**
 * Takes a label with icons (`abc $(iconId)xyz`) and returns the text (`abc xyz`) and the offsets of the icons (`[3]`)
 */
export declare function parseLabelWithIcons(input: string): IParsedLabelWithIcons;
export declare function matchesFuzzyIconAware(query: string, target: IParsedLabelWithIcons, enableSeparateSubstringMatching?: boolean): IMatch[] | null;
