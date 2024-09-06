export declare class IMEImpl {
    private readonly _onDidChange;
    readonly onDidChange: any;
    private _enabled;
    get enabled(): boolean;
    /**
     * Enable IME
     */
    enable(): void;
    /**
     * Disable IME
     */
    disable(): void;
}
export declare const IME: IMEImpl;
