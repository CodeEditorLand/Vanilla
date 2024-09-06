import { IDisposable } from "vs/base/common/lifecycle";
export declare class SimpleIconLabel implements IDisposable {
    private readonly _container;
    private hover?;
    constructor(_container: HTMLElement);
    set text(text: string);
    set title(title: string);
    dispose(): void;
}
