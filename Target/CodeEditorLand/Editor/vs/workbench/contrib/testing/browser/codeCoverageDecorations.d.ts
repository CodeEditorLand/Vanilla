import { IMarkdownString } from "vs/base/common/htmlContent";
import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Range } from "vs/editor/common/core/range";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { ITextModel } from "vs/editor/common/model";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { ITestCoverageService } from "vs/workbench/contrib/testing/common/testCoverageService";
import { CoverageDetails, DetailType, IStatementCoverage } from "vs/workbench/contrib/testing/common/testTypes";
export declare class CodeCoverageDecorations extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly coverage;
    private readonly log;
    private loadingCancellation?;
    private readonly displayedStore;
    private readonly hoveredStore;
    private readonly summaryWidget;
    private decorationIds;
    private hoveredSubject?;
    private details?;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, coverage: ITestCoverageService, configurationService: IConfigurationService, log: ILogService);
    private updateEditorStyles;
    private hoverInlineDecoration;
    private hoverLineNumber;
    private apply;
    private clear;
    private loadDetails;
}
type CoverageDetailsWithBranch = CoverageDetails | {
    type: DetailType.Branch;
    branch: number;
    detail: IStatementCoverage;
};
type DetailRange = {
    range: Range;
    primary: boolean;
    metadata: {
        detail: CoverageDetailsWithBranch;
        description: IMarkdownString | undefined;
    };
};
export declare class CoverageDetailsModel {
    readonly details: CoverageDetails[];
    readonly ranges: DetailRange[];
    constructor(details: CoverageDetails[], textModel: ITextModel);
    /** Gets the markdown description for the given detail */
    describe(detail: CoverageDetailsWithBranch, model: ITextModel): IMarkdownString | undefined;
}
export {};
