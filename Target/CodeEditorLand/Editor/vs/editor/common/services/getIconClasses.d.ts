import { ThemeIcon } from "../../../base/common/themables.js";
import { URI, type URI as uri } from "../../../base/common/uri.js";
import { FileKind } from "../../../platform/files/common/files.js";
import type { ILanguageService } from "../languages/language.js";
import type { IModelService } from "./model.js";
export declare function getIconClasses(modelService: IModelService, languageService: ILanguageService, resource: uri | undefined, fileKind?: FileKind, icon?: ThemeIcon | URI): string[];
export declare function getIconClassesForLanguageId(languageId: string): string[];
