import type { IDiffProviderFactoryService } from "../../../browser/widget/diffEditor/diffProviderFactoryService.js";
import type { IDocumentDiffProvider } from "../../../common/diff/documentDiffProvider.js";
export declare class TestDiffProviderFactoryService implements IDiffProviderFactoryService {
    readonly _serviceBrand: undefined;
    createDiffProvider(): IDocumentDiffProvider;
}
