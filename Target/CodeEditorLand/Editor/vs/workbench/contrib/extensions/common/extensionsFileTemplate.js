import{localize as e}from"../../../../nls.js";import{EXTENSION_IDENTIFIER_PATTERN as o}from"../../../../platform/extensionManagement/common/extensionManagement.js";const s="vscode://schemas/extensions",a={id:s,allowComments:!0,allowTrailingCommas:!0,type:"object",title:e("app.extensions.json.title","Extensions"),additionalProperties:!1,properties:{recommendations:{type:"array",description:e("app.extensions.json.recommendations","List of extensions which should be recommended for users of this workspace. The identifier of an extension is always '${publisher}.${name}'. For example: 'vscode.csharp'."),items:{type:"string",pattern:o,errorMessage:e("app.extension.identifier.errorMessage","Expected format '${publisher}.${name}'. Example: 'vscode.csharp'.")}},unwantedRecommendations:{type:"array",description:e("app.extensions.json.unwantedRecommendations","List of extensions recommended by VS Code that should not be recommended for users of this workspace. The identifier of an extension is always '${publisher}.${name}'. For example: 'vscode.csharp'."),items:{type:"string",pattern:o,errorMessage:e("app.extension.identifier.errorMessage","Expected format '${publisher}.${name}'. Example: 'vscode.csharp'.")}}}},m=["{","	// See https://go.microsoft.com/fwlink/?LinkId=827846 to learn about workspace recommendations.","	// Extension identifier format: ${publisher}.${name}. Example: vscode.csharp","","	// List of extensions which should be recommended for users of this workspace.",'	"recommendations": [',"		","	],","	// List of extensions recommended by VS Code that should not be recommended for users of this workspace.",'	"unwantedRecommendations": [',"		","	]","}"].join(`
`);export{m as ExtensionsConfigurationInitialContent,a as ExtensionsConfigurationSchema,s as ExtensionsConfigurationSchemaId};
