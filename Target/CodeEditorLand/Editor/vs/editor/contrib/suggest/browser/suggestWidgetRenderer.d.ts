import { IconLabel } from "vs/base/browser/ui/iconLabel/iconLabel";
import { IListRenderer } from "vs/base/browser/ui/list/list";
import { Event } from "vs/base/common/event";
import { DisposableStore } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IModelService } from "vs/editor/common/services/model";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { CompletionItem } from "./suggest";
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
