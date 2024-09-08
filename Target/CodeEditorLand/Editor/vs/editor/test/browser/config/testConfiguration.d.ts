import { EditorConfiguration, type IEnvConfiguration } from "../../../browser/config/editorConfiguration.js";
import { type BareFontInfo, FontInfo } from "../../../common/config/fontInfo.js";
import type { TestCodeEditorCreationOptions } from "../testCodeEditor.js";
export declare class TestConfiguration extends EditorConfiguration {
    constructor(opts: Readonly<TestCodeEditorCreationOptions>);
    protected _readEnvConfiguration(): IEnvConfiguration;
    protected _readFontInfo(styling: BareFontInfo): FontInfo;
}
