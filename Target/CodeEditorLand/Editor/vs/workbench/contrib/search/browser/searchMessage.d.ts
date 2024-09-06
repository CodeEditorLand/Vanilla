import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { TextSearchCompleteMessage } from "../../../services/search/common/searchExtTypes.js";
export declare const renderSearchMessage: (message: TextSearchCompleteMessage, instantiationService: IInstantiationService, notificationService: INotificationService, openerService: IOpenerService, commandService: ICommandService, disposableStore: DisposableStore, triggerSearch: () => void) => HTMLElement;
