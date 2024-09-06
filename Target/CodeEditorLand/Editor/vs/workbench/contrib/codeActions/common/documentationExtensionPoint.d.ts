declare enum DocumentationExtensionPointFields {
    when = "when",
    title = "title",
    command = "command"
}
interface RefactoringDocumentationExtensionPoint {
    readonly [DocumentationExtensionPointFields.title]: string;
    readonly [DocumentationExtensionPointFields.when]: string;
    readonly [DocumentationExtensionPointFields.command]: string;
}
export interface DocumentationExtensionPoint {
    readonly refactoring?: readonly RefactoringDocumentationExtensionPoint[];
}
export declare const documentationExtensionPointDescriptor: {
    extensionPoint: string;
    deps: any[];
    jsonSchema: IConfigurationPropertySchema;
};
export {};
