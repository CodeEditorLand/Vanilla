export function devInjectNodeModuleLookupPath(injectPath: string): void;
export function removeGlobalNodeJsModuleLookupPaths(): void;
export function configurePortable(product: Partial<import("./vs/base/common/product").IProductConfiguration>): {
    portableDataPath: string;
    isPortable: boolean;
};
export function enableASARSupport(): void;
export function fileUriFromPath(path: string, config: {
    isWindows?: boolean;
    scheme?: string;
    fallbackAuthority?: string;
}): string;
