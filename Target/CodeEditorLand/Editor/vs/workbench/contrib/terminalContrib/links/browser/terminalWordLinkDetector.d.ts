import type { IBufferLine, Terminal } from "@xterm/xterm";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IProductService } from "vs/platform/product/common/productService";
import { ITerminalLinkDetector, ITerminalSimpleLink } from "vs/workbench/contrib/terminalContrib/links/browser/links";
export declare class TerminalWordLinkDetector extends Disposable implements ITerminalLinkDetector {
    readonly xterm: Terminal;
    private readonly _configurationService;
    private readonly _productService;
    static id: string;
    readonly maxLinkLength = 100;
    private _separatorRegex;
    constructor(xterm: Terminal, _configurationService: IConfigurationService, _productService: IProductService);
    detect(lines: IBufferLine[], startLine: number, endLine: number): ITerminalSimpleLink[];
    private _parseWords;
    private _refreshSeparatorCodes;
}
