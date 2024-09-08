import type { DisposableStore } from "../../../../base/common/lifecycle.js";
import type { ICommandService } from "../../../../platform/commands/common/commands.js";
import type { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type { INotificationService } from "../../../../platform/notification/common/notification.js";
import type { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { type TextSearchCompleteMessage } from "../../../services/search/common/searchExtTypes.js";
export declare const renderSearchMessage: (message: TextSearchCompleteMessage, instantiationService: IInstantiationService, notificationService: INotificationService, openerService: IOpenerService, commandService: ICommandService, disposableStore: DisposableStore, triggerSearch: () => void) => HTMLElement;
