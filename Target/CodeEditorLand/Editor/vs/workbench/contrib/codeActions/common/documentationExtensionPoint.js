import*as t from"../../../../nls.js";import{languagesExtPoint as o}from"../../../services/language/common/languageService.js";var e=(n=>(n.when="when",n.title="title",n.command="command",n))(e||{});const i=Object.freeze({type:"object",description:t.localize("contributes.documentation","Contributed documentation."),properties:{refactoring:{type:"array",description:t.localize("contributes.documentation.refactorings","Contributed documentation for refactorings."),items:{type:"object",description:t.localize("contributes.documentation.refactoring","Contributed documentation for refactoring."),required:["title","when","command"],properties:{title:{type:"string",description:t.localize("contributes.documentation.refactoring.title","Label for the documentation used in the UI.")},when:{type:"string",description:t.localize("contributes.documentation.refactoring.when","When clause.")},command:{type:"string",description:t.localize("contributes.documentation.refactoring.command","Command executed.")}}}}}}),c={extensionPoint:"documentation",deps:[o],jsonSchema:i};export{c as documentationExtensionPointDescriptor};
