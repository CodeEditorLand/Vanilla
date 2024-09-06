import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
export declare class ActiveWindowManager extends Disposable {
    private readonly disposables;
    private firstActiveWindowIdPromise;
    private activeWindowId;
    constructor({ onDidOpenMainWindow, onDidFocusMainWindow, getActiveWindowId, }: {
        onDidOpenMainWindow: Event<number>;
        onDidFocusMainWindow: Event<number>;
        getActiveWindowId(): Promise<number | undefined>;
    });
    private setActiveWindow;
    getActiveClientId(): Promise<string | undefined>;
}
