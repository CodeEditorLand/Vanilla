import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { Snippet } from "./snippetsFile.js";
export declare function pickSnippet(accessor: ServicesAccessor, languageIdOrSnippets: string | Snippet[]): Promise<Snippet | undefined>;
