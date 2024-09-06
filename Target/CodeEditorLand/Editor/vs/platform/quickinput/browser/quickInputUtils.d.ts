import "vs/css!./media/quickInput";
import { IAction } from "vs/base/common/actions";
import { DisposableStore } from "vs/base/common/lifecycle";
import { IQuickInputButton } from "vs/platform/quickinput/common/quickInput";
export declare function quickInputButtonToAction(button: IQuickInputButton, id: string, run: () => unknown): IAction;
export declare function renderQuickInputDescription(description: string, container: HTMLElement, actionHandler: {
    callback: (content: string) => void;
    disposables: DisposableStore;
}): void;
