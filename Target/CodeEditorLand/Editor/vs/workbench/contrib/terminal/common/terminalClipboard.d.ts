import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare function shouldPasteTerminalText(accessor: ServicesAccessor, text: string, bracketedPasteMode: boolean | undefined): Promise<boolean | {
    modifiedText: string;
}>;
