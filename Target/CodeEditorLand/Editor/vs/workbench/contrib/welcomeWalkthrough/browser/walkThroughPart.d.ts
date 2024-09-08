import '../common/walkThroughUtils.js';
import './media/walkThroughPart.css';
import { IEditorOpenContext } from '../../../common/editor.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { WalkThroughInput } from './walkThroughInput.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { RawContextKey, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { IEditorGroup, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IEditorOptions } from '../../../../platform/editor/common/editor.js';
export declare const WALK_THROUGH_FOCUS: RawContextKey<boolean>;
export declare class WalkThroughPart extends EditorPane {
    private readonly instantiationService;
    private readonly openerService;
    private readonly keybindingService;
    private readonly contextKeyService;
    private readonly configurationService;
    private readonly notificationService;
    private readonly extensionService;
    static readonly ID: string;
    private readonly disposables;
    private contentDisposables;
    private content;
    private scrollbar;
    private editorFocus;
    private lastFocus;
    private size;
    private editorMemento;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, textResourceConfigurationService: ITextResourceConfigurationService, instantiationService: IInstantiationService, openerService: IOpenerService, keybindingService: IKeybindingService, storageService: IStorageService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, notificationService: INotificationService, extensionService: IExtensionService, editorGroupService: IEditorGroupsService);
    protected createEditor(container: HTMLElement): void;
    private updatedScrollPosition;
    private onTouchChange;
    private addEventListener;
    private registerFocusHandlers;
    private registerClickHandler;
    private open;
    private addFrom;
    layout(dimension: Dimension): void;
    private updateSizeClasses;
    focus(): void;
    arrowUp(): void;
    arrowDown(): void;
    private getArrowScrollHeight;
    pageUp(): void;
    pageDown(): void;
    setInput(input: WalkThroughInput, options: IEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private getEditorOptions;
    private expandMacros;
    private decorateContent;
    private multiCursorModifier;
    private saveTextEditorViewState;
    private loadTextEditorViewState;
    clearInput(): void;
    protected saveState(): void;
    dispose(): void;
}
