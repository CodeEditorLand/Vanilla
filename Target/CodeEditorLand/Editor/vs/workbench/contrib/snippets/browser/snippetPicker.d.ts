import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { Snippet } from "vs/workbench/contrib/snippets/browser/snippetsFile";
export declare function pickSnippet(accessor: ServicesAccessor, languageIdOrSnippets: string | Snippet[]): Promise<Snippet | undefined>;
