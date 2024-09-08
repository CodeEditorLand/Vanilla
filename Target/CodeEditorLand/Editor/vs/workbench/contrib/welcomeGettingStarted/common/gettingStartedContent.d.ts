import type { ThemeIcon } from "../../../../base/common/themables.js";
export type BuiltinGettingStartedStep = {
    id: string;
    title: string;
    description: string;
    completionEvents?: string[];
    when?: string;
    media: {
        type: "image";
        path: string | {
            hc: string;
            hcLight?: string;
            light: string;
            dark: string;
        };
        altText: string;
    } | {
        type: "svg";
        path: string;
        altText: string;
    } | {
        type: "markdown";
        path: string;
    };
};
export type BuiltinGettingStartedCategory = {
    id: string;
    title: string;
    description: string;
    isFeatured: boolean;
    next?: string;
    icon: ThemeIcon;
    when?: string;
    content: {
        type: "steps";
        steps: BuiltinGettingStartedStep[];
    };
};
export type BuiltinGettingStartedStartEntry = {
    id: string;
    title: string;
    description: string;
    icon: ThemeIcon;
    when?: string;
    content: {
        type: "startEntry";
        command: string;
    };
};
type GettingStartedWalkthroughContent = BuiltinGettingStartedCategory[];
type GettingStartedStartEntryContent = BuiltinGettingStartedStartEntry[];
export declare const startEntries: GettingStartedStartEntryContent;
export declare const walkthroughs: GettingStartedWalkthroughContent;
export {};
