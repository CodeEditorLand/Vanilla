import { IconLabel } from "../../../../base/browser/ui/iconLabel/iconLabel.js";
import type { IListRenderer } from "../../../../base/browser/ui/list/list.js";
import { type Event } from "../../../../base/common/event.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { ILanguageService } from "../../../common/languages/language.js";
import { IModelService } from "../../../common/services/model.js";
import type { CompletionItem } from "./suggest.js";
export declare function getAriaId(index: number): string;
export interface ISuggestionTemplateData {
    readonly root: HTMLElement;
    /**
     * Flexbox
     * < ------------- left ------------ >     < --- right -- >
     * <icon><label><signature><qualifier>     <type><readmore>
     */
    readonly left: HTMLElement;
    readonly right: HTMLElement;
    readonly icon: HTMLElement;
    readonly colorspan: HTMLElement;
    readonly iconLabel: IconLabel;
    readonly iconContainer: HTMLElement;
    readonly parametersLabel: HTMLElement;
    readonly qualifierLabel: HTMLElement;
    /**
     * Showing either `CompletionItem#details` or `CompletionItemLabel#type`
     */
    readonly detailsLabel: HTMLElement;
    readonly readMore: HTMLElement;
    readonly disposables: DisposableStore;
    readonly configureFont: () => void;
}
export declare class ItemRenderer implements IListRenderer<CompletionItem, ISuggestionTemplateData> {
    private readonly _editor;
    private readonly _modelService;
    private readonly _languageService;
    private readonly _themeService;
    private readonly _onDidToggleDetails;
    readonly onDidToggleDetails: Event<void>;
    readonly templateId = "suggestion";
    constructor(_editor: ICodeEditor, _modelService: IModelService, _languageService: ILanguageService, _themeService: IThemeService);
    dispose(): void;
    renderTemplate(container: HTMLElement): ISuggestionTemplateData;
    renderElement(element: CompletionItem, index: number, data: ISuggestionTemplateData): void;
    disposeTemplate(templateData: ISuggestionTemplateData): void;
}
