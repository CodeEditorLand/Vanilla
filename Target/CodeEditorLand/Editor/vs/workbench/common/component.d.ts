import type { Event } from "../../base/common/event.js";
import type { DisposableStore } from "../../base/common/lifecycle.js";
import type { IStorageService, IStorageValueChangeEvent, StorageScope, StorageTarget } from "../../platform/storage/common/storage.js";
import { Themable, type IThemeService } from "../../platform/theme/common/themeService.js";
import { type MementoObject } from "./memento.js";
export declare class Component extends Themable {
    private readonly id;
    private readonly memento;
    constructor(id: string, themeService: IThemeService, storageService: IStorageService);
    getId(): string;
    protected getMemento(scope: StorageScope, target: StorageTarget): MementoObject;
    protected reloadMemento(scope: StorageScope): void;
    protected onDidChangeMementoValue(scope: StorageScope, disposables: DisposableStore): Event<IStorageValueChangeEvent>;
    protected saveState(): void;
}
