import type { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { type Snippet } from "./snippetsFile.js";
export declare function pickSnippet(accessor: ServicesAccessor, languageIdOrSnippets: string | Snippet[]): Promise<Snippet | undefined>;
