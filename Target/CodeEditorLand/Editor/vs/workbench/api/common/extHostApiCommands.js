import{isFalsyOrEmpty as v}from"../../../base/common/arrays.js";import"../../../base/common/buffer.js";import{Schemas as g,matchesSomeScheme as h}from"../../../base/common/network.js";import{URI as p}from"../../../base/common/uri.js";import"../../../editor/common/core/position.js";import"../../../editor/common/core/range.js";import"../../../editor/common/core/selection.js";import*as y from"../../../editor/common/languages.js";import{decodeSemanticTokensDto as f}from"../../../editor/common/services/semanticTokensDto.js";import{validateWhenClauses as w}from"../../../platform/contextkey/common/contextkey.js";import"../../../platform/editor/common/editor.js";import"./extHost.protocol.js";import{ApiCommand as t,ApiCommandArgument as o,ApiCommandResult as i}from"./extHostCommands.js";import"./extHostLanguageFeatures.js";import*as n from"./extHostTypeConverters.js";import*as d from"./extHostTypes.js";import"../../contrib/notebook/common/notebookCommon.js";import"../../contrib/search/common/search.js";const x=[new t("vscode.executeDocumentHighlights","_executeDocumentHighlights","Execute document highlight provider.",[o.Uri,o.Position],new i("A promise that resolves to an array of DocumentHighlight-instances.",l(n.DocumentHighlight.to))),new t("vscode.executeDocumentSymbolProvider","_executeDocumentSymbolProvider","Execute document symbol provider.",[o.Uri],new i("A promise that resolves to an array of SymbolInformation and DocumentSymbol instances.",(e,r)=>{if(v(e))return;class a extends d.SymbolInformation{static to(c){const m=new a(c.name,n.SymbolKind.to(c.kind),c.containerName||"",new d.Location(r[0],n.Range.to(c.range)));return m.detail=c.detail,m.range=m.location.range,m.selectionRange=n.Range.to(c.selectionRange),m.children=c.children?c.children.map(a.to):[],m}detail;range;selectionRange;children;containerName}return e.map(a.to)})),new t("vscode.executeFormatDocumentProvider","_executeFormatDocumentProvider","Execute document format provider.",[o.Uri,new o("options","Formatting options",e=>!0,e=>e)],new i("A promise that resolves to an array of TextEdits.",l(n.TextEdit.to))),new t("vscode.executeFormatRangeProvider","_executeFormatRangeProvider","Execute range format provider.",[o.Uri,o.Range,new o("options","Formatting options",e=>!0,e=>e)],new i("A promise that resolves to an array of TextEdits.",l(n.TextEdit.to))),new t("vscode.executeFormatOnTypeProvider","_executeFormatOnTypeProvider","Execute format on type provider.",[o.Uri,o.Position,new o("ch","Trigger character",e=>typeof e=="string",e=>e),new o("options","Formatting options",e=>!0,e=>e)],new i("A promise that resolves to an array of TextEdits.",l(n.TextEdit.to))),new t("vscode.executeDefinitionProvider","_executeDefinitionProvider","Execute all definition providers.",[o.Uri,o.Position],new i("A promise that resolves to an array of Location or LocationLink instances.",u)),new t("vscode.experimental.executeDefinitionProvider_recursive","_executeDefinitionProvider_recursive","Execute all definition providers.",[o.Uri,o.Position],new i("A promise that resolves to an array of Location or LocationLink instances.",u)),new t("vscode.executeTypeDefinitionProvider","_executeTypeDefinitionProvider","Execute all type definition providers.",[o.Uri,o.Position],new i("A promise that resolves to an array of Location or LocationLink instances.",u)),new t("vscode.experimental.executeTypeDefinitionProvider_recursive","_executeTypeDefinitionProvider_recursive","Execute all type definition providers.",[o.Uri,o.Position],new i("A promise that resolves to an array of Location or LocationLink instances.",u)),new t("vscode.executeDeclarationProvider","_executeDeclarationProvider","Execute all declaration providers.",[o.Uri,o.Position],new i("A promise that resolves to an array of Location or LocationLink instances.",u)),new t("vscode.experimental.executeDeclarationProvider_recursive","_executeDeclarationProvider_recursive","Execute all declaration providers.",[o.Uri,o.Position],new i("A promise that resolves to an array of Location or LocationLink instances.",u)),new t("vscode.executeImplementationProvider","_executeImplementationProvider","Execute all implementation providers.",[o.Uri,o.Position],new i("A promise that resolves to an array of Location or LocationLink instances.",u)),new t("vscode.experimental.executeImplementationProvider_recursive","_executeImplementationProvider_recursive","Execute all implementation providers.",[o.Uri,o.Position],new i("A promise that resolves to an array of Location or LocationLink instances.",u)),new t("vscode.executeReferenceProvider","_executeReferenceProvider","Execute all reference providers.",[o.Uri,o.Position],new i("A promise that resolves to an array of Location-instances.",l(n.location.to))),new t("vscode.experimental.executeReferenceProvider","_executeReferenceProvider_recursive","Execute all reference providers.",[o.Uri,o.Position],new i("A promise that resolves to an array of Location-instances.",l(n.location.to))),new t("vscode.executeHoverProvider","_executeHoverProvider","Execute all hover providers.",[o.Uri,o.Position],new i("A promise that resolves to an array of Hover-instances.",l(n.Hover.to))),new t("vscode.experimental.executeHoverProvider_recursive","_executeHoverProvider_recursive","Execute all hover providers.",[o.Uri,o.Position],new i("A promise that resolves to an array of Hover-instances.",l(n.Hover.to))),new t("vscode.executeSelectionRangeProvider","_executeSelectionRangeProvider","Execute selection range provider.",[o.Uri,new o("position","A position in a text document",e=>Array.isArray(e)&&e.every(r=>d.Position.isPosition(r)),e=>e.map(n.Position.from))],new i("A promise that resolves to an array of ranges.",e=>e.map(r=>{let a;for(const s of r.reverse())a=new d.SelectionRange(n.Range.to(s),a);return a}))),new t("vscode.executeWorkspaceSymbolProvider","_executeWorkspaceSymbolProvider","Execute all workspace symbol providers.",[o.String.with("query","Search string")],new i("A promise that resolves to an array of SymbolInformation-instances.",e=>e.map(n.WorkspaceSymbol.to))),new t("vscode.prepareCallHierarchy","_executePrepareCallHierarchy","Prepare call hierarchy at a position inside a document",[o.Uri,o.Position],new i("A promise that resolves to an array of CallHierarchyItem-instances",e=>e.map(n.CallHierarchyItem.to))),new t("vscode.provideIncomingCalls","_executeProvideIncomingCalls","Compute incoming calls for an item",[o.CallHierarchyItem],new i("A promise that resolves to an array of CallHierarchyIncomingCall-instances",e=>e.map(n.CallHierarchyIncomingCall.to))),new t("vscode.provideOutgoingCalls","_executeProvideOutgoingCalls","Compute outgoing calls for an item",[o.CallHierarchyItem],new i("A promise that resolves to an array of CallHierarchyOutgoingCall-instances",e=>e.map(n.CallHierarchyOutgoingCall.to))),new t("vscode.prepareRename","_executePrepareRename","Execute the prepareRename of rename provider.",[o.Uri,o.Position],new i("A promise that resolves to a range and placeholder text.",e=>{if(e)return{range:n.Range.to(e.range),placeholder:e.text}})),new t("vscode.executeDocumentRenameProvider","_executeDocumentRenameProvider","Execute rename provider.",[o.Uri,o.Position,o.String.with("newName","The new symbol name")],new i("A promise that resolves to a WorkspaceEdit.",e=>{if(e){if(e.rejectReason)throw new Error(e.rejectReason);return n.WorkspaceEdit.to(e)}})),new t("vscode.executeLinkProvider","_executeLinkProvider","Execute document link provider.",[o.Uri,o.Number.with("linkResolveCount","Number of links that should be resolved, only when links are unresolved.").optional()],new i("A promise that resolves to an array of DocumentLink-instances.",e=>e.map(n.DocumentLink.to))),new t("vscode.provideDocumentSemanticTokensLegend","_provideDocumentSemanticTokensLegend","Provide semantic tokens legend for a document",[o.Uri],new i("A promise that resolves to SemanticTokensLegend.",e=>{if(e)return new d.SemanticTokensLegend(e.tokenTypes,e.tokenModifiers)})),new t("vscode.provideDocumentSemanticTokens","_provideDocumentSemanticTokens","Provide semantic tokens for a document",[o.Uri],new i("A promise that resolves to SemanticTokens.",e=>{if(!e)return;const r=f(e);if(r.type==="full")return new d.SemanticTokens(r.data,void 0)})),new t("vscode.provideDocumentRangeSemanticTokensLegend","_provideDocumentRangeSemanticTokensLegend","Provide semantic tokens legend for a document range",[o.Uri,o.Range.optional()],new i("A promise that resolves to SemanticTokensLegend.",e=>{if(e)return new d.SemanticTokensLegend(e.tokenTypes,e.tokenModifiers)})),new t("vscode.provideDocumentRangeSemanticTokens","_provideDocumentRangeSemanticTokens","Provide semantic tokens for a document range",[o.Uri,o.Range],new i("A promise that resolves to SemanticTokens.",e=>{if(!e)return;const r=f(e);if(r.type==="full")return new d.SemanticTokens(r.data,void 0)})),new t("vscode.executeCompletionItemProvider","_executeCompletionItemProvider","Execute completion item provider.",[o.Uri,o.Position,o.String.with("triggerCharacter","Trigger completion when the user types the character, like `,` or `(`").optional(),o.Number.with("itemResolveCount","Number of completions to resolve (too large numbers slow down completions)").optional()],new i("A promise that resolves to a CompletionList-instance.",(e,r,a)=>{if(!e)return new d.CompletionList([]);const s=e.suggestions.map(c=>n.CompletionItem.to(c,a));return new d.CompletionList(s,e.incomplete)})),new t("vscode.executeSignatureHelpProvider","_executeSignatureHelpProvider","Execute signature help provider.",[o.Uri,o.Position,o.String.with("triggerCharacter","Trigger signature help when the user types the character, like `,` or `(`").optional()],new i("A promise that resolves to SignatureHelp.",e=>{if(e)return n.SignatureHelp.to(e)})),new t("vscode.executeCodeLensProvider","_executeCodeLensProvider","Execute code lens provider.",[o.Uri,o.Number.with("itemResolveCount","Number of lenses that should be resolved and returned. Will only return resolved lenses, will impact performance)").optional()],new i("A promise that resolves to an array of CodeLens-instances.",(e,r,a)=>l(s=>new d.CodeLens(n.Range.to(s.range),s.command&&a.fromInternal(s.command)))(e))),new t("vscode.executeCodeActionProvider","_executeCodeActionProvider","Execute code action provider.",[o.Uri,new o("rangeOrSelection","Range in a text document. Some refactoring provider requires Selection object.",e=>d.Range.isRange(e),e=>d.Selection.isSelection(e)?n.Selection.from(e):n.Range.from(e)),o.String.with("kind","Code action kind to return code actions for").optional(),o.Number.with("itemResolveCount","Number of code actions to resolve (too large numbers slow down code actions)").optional()],new i("A promise that resolves to an array of Command-instances.",(e,r,a)=>l(s=>{if(s._isSynthetic){if(!s.command)throw new Error("Synthetic code actions must have a command");return a.fromInternal(s.command)}else{const c=new d.CodeAction(s.title,s.kind?new d.CodeActionKind(s.kind):void 0);return s.edit&&(c.edit=n.WorkspaceEdit.to(s.edit)),s.command&&(c.command=a.fromInternal(s.command)),c.isPreferred=s.isPreferred,c}})(e))),new t("vscode.executeDocumentColorProvider","_executeDocumentColorProvider","Execute document color provider.",[o.Uri],new i("A promise that resolves to an array of ColorInformation objects.",e=>e?e.map(r=>new d.ColorInformation(n.Range.to(r.range),n.Color.to(r.color))):[])),new t("vscode.executeColorPresentationProvider","_executeColorPresentationProvider","Execute color presentation provider.",[new o("color","The color to show and insert",e=>e instanceof d.Color,n.Color.from),new o("context","Context object with uri and range",e=>!0,e=>({uri:e.uri,range:n.Range.from(e.range)}))],new i("A promise that resolves to an array of ColorPresentation objects.",e=>e?e.map(n.ColorPresentation.to):[])),new t("vscode.executeInlayHintProvider","_executeInlayHintProvider","Execute inlay hints provider",[o.Uri,o.Range],new i("A promise that resolves to an array of Inlay objects",(e,r,a)=>e.map(n.InlayHint.to.bind(void 0,a)))),new t("vscode.executeFoldingRangeProvider","_executeFoldingRangeProvider","Execute folding range provider",[o.Uri],new i("A promise that resolves to an array of FoldingRange objects",(e,r)=>{if(e)return e.map(n.FoldingRange.to)})),new t("vscode.resolveNotebookContentProviders","_resolveNotebookContentProvider","Resolve Notebook Content Providers",[],new i("A promise that resolves to an array of NotebookContentProvider static info objects.",l(e=>({viewType:e.viewType,displayName:e.displayName,options:{transientOutputs:e.options.transientOutputs,transientCellMetadata:e.options.transientCellMetadata,transientDocumentMetadata:e.options.transientDocumentMetadata},filenamePattern:e.filenamePattern.map(r=>n.NotebookExclusiveDocumentPattern.to(r))})))),new t("vscode.executeInlineValueProvider","_executeInlineValueProvider","Execute inline value provider",[o.Uri,o.Range,new o("context","An InlineValueContext",e=>e&&typeof e.frameId=="number"&&e.stoppedLocation instanceof d.Range,e=>n.InlineValueContext.from(e))],new i("A promise that resolves to an array of InlineValue objects",e=>e.map(n.InlineValue.to))),new t("vscode.open","_workbench.open","Opens the provided resource in the editor. Can be a text or binary file, or an http(s) URL. If you need more control over the options for opening a text file, use vscode.window.showTextDocument instead.",[new o("uriOrString","Uri-instance or string (only http/https)",e=>p.isUri(e)||typeof e=="string"&&h(e,g.http,g.https),e=>e),new o("columnOrOptions","Either the column in which to open or editor options, see vscode.TextDocumentShowOptions",e=>e===void 0||typeof e=="number"||typeof e=="object",e=>e&&(typeof e=="number"?[n.ViewColumn.from(e),void 0]:[n.ViewColumn.from(e.viewColumn),n.TextEditorOpenOptions.from(e)])).optional(),o.String.with("label","").optional()],i.Void),new t("vscode.openWith","_workbench.openWith","Opens the provided resource with a specific editor.",[o.Uri.with("resource","Resource to open"),o.String.with("viewId","Custom editor view id. This should be the viewType string for custom editors or the notebookType string for notebooks. Use 'default' to use VS Code's default text editor"),new o("columnOrOptions","Either the column in which to open or editor options, see vscode.TextDocumentShowOptions",e=>e===void 0||typeof e=="number"||typeof e=="object",e=>e&&(typeof e=="number"?[n.ViewColumn.from(e),void 0]:[n.ViewColumn.from(e.viewColumn),n.TextEditorOpenOptions.from(e)])).optional()],i.Void),new t("vscode.diff","_workbench.diff","Opens the provided resources in the diff editor to compare their contents.",[o.Uri.with("left","Left-hand side resource of the diff editor"),o.Uri.with("right","Right-hand side resource of the diff editor"),o.String.with("title","Human readable title for the diff editor").optional(),new o("columnOrOptions","Either the column in which to open or editor options, see vscode.TextDocumentShowOptions",e=>e===void 0||typeof e=="object",e=>e&&[n.ViewColumn.from(e.viewColumn),n.TextEditorOpenOptions.from(e)]).optional()],i.Void),new t("vscode.changes","_workbench.changes","Opens a list of resources in the changes editor to compare their contents.",[o.String.with("title","Human readable title for the changes editor"),new o("resourceList","List of resources to compare",e=>{for(const r of e){if(r.length!==3)return!1;const[a,s,c]=r;if(!p.isUri(a)||!p.isUri(s)&&s!==void 0&&s!==null||!p.isUri(c)&&c!==void 0&&c!==null)return!1}return!0},e=>e)],i.Void),new t("vscode.prepareTypeHierarchy","_executePrepareTypeHierarchy","Prepare type hierarchy at a position inside a document",[o.Uri,o.Position],new i("A promise that resolves to an array of TypeHierarchyItem-instances",e=>e.map(n.TypeHierarchyItem.to))),new t("vscode.provideSupertypes","_executeProvideSupertypes","Compute supertypes for an item",[o.TypeHierarchyItem],new i("A promise that resolves to an array of TypeHierarchyItem-instances",e=>e.map(n.TypeHierarchyItem.to))),new t("vscode.provideSubtypes","_executeProvideSubtypes","Compute subtypes for an item",[o.TypeHierarchyItem],new i("A promise that resolves to an array of TypeHierarchyItem-instances",e=>e.map(n.TypeHierarchyItem.to))),new t("vscode.revealTestInExplorer","_revealTestInExplorer","Reveals a test instance in the explorer",[o.TestItem],i.Void),new t("vscode.experimental.editSession.continue","_workbench.editSessions.actions.continueEditSession","Continue the current edit session in a different workspace",[o.Uri.with("workspaceUri","The target workspace to continue the current edit session in")],i.Void),new t("setContext","_setContext","Set a custom context key value that can be used in when clauses.",[o.String.with("name","The context key name"),new o("value","The context key value",()=>!0,e=>e)],i.Void),new t("vscode.executeMappedEditsProvider","_executeMappedEditsProvider","Execute Mapped Edits Provider",[o.Uri,o.StringArray,new o("MappedEditsContext","Mapped Edits Context",e=>n.MappedEditsContext.is(e),e=>n.MappedEditsContext.from(e))],new i("A promise that resolves to a workspace edit or null",e=>e?n.WorkspaceEdit.to(e):null)),new t("vscode.editorChat.start","inlineChat.start","Invoke a new editor chat session",[new o("Run arguments","",e=>!0,e=>{if(e)return{initialRange:e.initialRange?n.Range.from(e.initialRange):void 0,initialSelection:d.Selection.isSelection(e.initialSelection)?n.Selection.from(e.initialSelection):void 0,message:e.message,autoSend:e.autoSend,position:e.position?n.Position.from(e.position):void 0}})],i.Void)];class Z{static register(r){x.forEach(r.registerApiCommand,r),this._registerValidateWhenClausesCommand(r)}static _registerValidateWhenClausesCommand(r){r.registerCommand(!1,"_validateWhenClauses",w)}}function l(e){return r=>{if(Array.isArray(r))return r.map(e)}}function u(e){if(!Array.isArray(e))return;const r=[];for(const a of e)y.isLocationLink(a)?r.push(n.DefinitionLink.to(a)):r.push(n.location.to(a));return r}export{Z as ExtHostApiCommands};
