import { Event } from "vs/base/common/event";
import { DisposableStore } from "vs/base/common/lifecycle";
import { IStorageService, IStorageValueChangeEvent, StorageScope, StorageTarget } from "vs/platform/storage/common/storage";
import { IThemeService, Themable } from "vs/platform/theme/common/themeService";
import { MementoObject } from "vs/workbench/common/memento";
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
