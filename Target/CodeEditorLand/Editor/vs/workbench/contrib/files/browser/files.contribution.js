var $=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var I=(o,i,n,l)=>{for(var r=l>1?void 0:l?M(i,n):i,f=o.length-1,u;f>=0;f--)(u=o[f])&&(r=(l?u(i,n,r):u(r))||r);return l&&r&&$(i,n,r),r},z=(o,i)=>(n,l)=>i(n,l,o);import{Schemas as H}from"../../../../base/common/network.js";import{sep as x}from"../../../../base/common/path.js";import{isNative as q,isWeb as F,isWindows as A}from"../../../../base/common/platform.js";import{RedoCommand as X,UndoCommand as Y}from"../../../../editor/browser/editorExtensions.js";import{editorConfigurationBaseNode as J}from"../../../../editor/common/config/editorConfigurationSchema.js";import{ModesRegistry as Z}from"../../../../editor/common/languages/modesRegistry.js";import*as e from"../../../../nls.js";import{IConfigurationService as R}from"../../../../platform/configuration/common/configuration.js";import{Extensions as K,ConfigurationScope as t}from"../../../../platform/configuration/common/configurationRegistry.js";import{AutoSaveConfiguration as a,FILES_ASSOCIATIONS_CONFIG as Q,FILES_EXCLUDE_CONFIG as ee,FILES_READONLY_EXCLUDE_CONFIG as te,FILES_READONLY_FROM_PERMISSIONS_CONFIG as oe,FILES_READONLY_INCLUDE_CONFIG as ie,HotExitConfiguration as s}from"../../../../platform/files/common/files.js";import{SyncDescriptor as S}from"../../../../platform/instantiation/common/descriptors.js";import{InstantiationType as re,registerSingleton as ae}from"../../../../platform/instantiation/common/extensions.js";import{ILabelService as ne}from"../../../../platform/label/common/label.js";import{Registry as m}from"../../../../platform/registry/common/platform.js";import{IUndoRedoService as C}from"../../../../platform/undoRedo/common/undoRedo.js";import{EditorPaneDescriptor as N}from"../../../browser/editor.js";import{WorkbenchPhase as d,registerWorkbenchContribution2 as c}from"../../../common/contributions.js";import{EditorExtensions as y}from"../../../common/editor.js";import{GUESSABLE_ENCODINGS as O,SUPPORTED_ENCODINGS as g}from"../../../services/textfile/common/encoding.js";import{DirtyFilesIndicator as _}from"../common/dirtyFilesIndicator.js";import{BINARY_TEXT_FILE_MODE as se,FILE_EDITOR_INPUT_ID as L,LexicographicOptions as b,SortOrder as p,UndoConfirmLevel as w}from"../common/files.js";import{BinaryFileEditor as T}from"./editors/binaryFileEditor.js";import{FileEditorInputSerializer as le,FileEditorWorkingCopyEditorHandler as U}from"./editors/fileEditorHandler.js";import{FileEditorInput as E}from"./editors/fileEditorInput.js";import{TextFileEditor as W}from"./editors/textFileEditor.js";import{TextFileEditorTracker as G}from"./editors/textFileEditorTracker.js";import{TextFileSaveErrorHandler as P}from"./editors/textFileSaveErrorHandler.js";import{ExplorerService as de,UNDO_REDO_SOURCE as v}from"./explorerService.js";import{ExplorerViewletViewsContribution as V}from"./explorerViewlet.js";import{IExplorerService as D}from"./files.js";import{WorkspaceWatcher as j}from"./workspaceWatcher.js";let h=class{static ID="workbench.contrib.fileUriLabel";constructor(i){i.registerFormatter({scheme:H.file,formatting:{label:"${authority}${path}",separator:x,tildify:!A,normalizeDriveLetter:A,authorityPrefix:x+x,workspaceSuffix:""}})}};h=I([z(0,ne)],h),ae(D,de,re.Delayed),m.as(y.EditorPane).registerEditorPane(N.create(W,W.ID,e.localize("textFileEditor","Text File Editor")),[new S(E)]),m.as(y.EditorPane).registerEditorPane(N.create(T,T.ID,e.localize("binaryFileEditor","Binary File Editor")),[new S(E)]),m.as(y.EditorFactory).registerFileEditorFactory({typeId:L,createFileEditor:(o,i,n,l,r,f,u,B)=>B.createInstance(E,o,i,n,l,r,f,u),isFileEditor:o=>o instanceof E}),m.as(y.EditorFactory).registerEditorSerializer(L,le),c(U.ID,U,d.BlockRestore),c(V.ID,V,d.BlockStartup),c(G.ID,G,d.BlockStartup),c(P.ID,P,d.BlockStartup),c(h.ID,h,d.BlockStartup),c(j.ID,j,d.AfterRestored),c(_.ID,_,d.BlockStartup);const k=m.as(K.Configuration),ce=q?{type:"string",scope:t.APPLICATION,enum:[s.OFF,s.ON_EXIT,s.ON_EXIT_AND_WINDOW_CLOSE],default:s.ON_EXIT,markdownEnumDescriptions:[e.localize("hotExit.off","Disable hot exit. A prompt will show when attempting to close a window with editors that have unsaved changes."),e.localize("hotExit.onExit","Hot exit will be triggered when the last window is closed on Windows/Linux or when the `workbench.action.quit` command is triggered (command palette, keybinding, menu). All windows without folders opened will be restored upon next launch. A list of previously opened windows with unsaved files can be accessed via `File > Open Recent > More...`"),e.localize("hotExit.onExitAndWindowClose","Hot exit will be triggered when the last window is closed on Windows/Linux or when the `workbench.action.quit` command is triggered (command palette, keybinding, menu), and also for any window with a folder opened regardless of whether it's the last window. All windows without folders opened will be restored upon next launch. A list of previously opened windows with unsaved files can be accessed via `File > Open Recent > More...`")],markdownDescription:e.localize("hotExit","[Hot Exit](https://aka.ms/vscode-hot-exit) controls whether unsaved files are remembered between sessions, allowing the save prompt when exiting the editor to be skipped.",s.ON_EXIT,s.ON_EXIT_AND_WINDOW_CLOSE)}:{type:"string",scope:t.APPLICATION,enum:[s.OFF,s.ON_EXIT_AND_WINDOW_CLOSE],default:s.ON_EXIT_AND_WINDOW_CLOSE,markdownEnumDescriptions:[e.localize("hotExit.off","Disable hot exit. A prompt will show when attempting to close a window with editors that have unsaved changes."),e.localize("hotExit.onExitAndWindowCloseBrowser","Hot exit will be triggered when the browser quits or the window or tab is closed.")],markdownDescription:e.localize("hotExit","[Hot Exit](https://aka.ms/vscode-hot-exit) controls whether unsaved files are remembered between sessions, allowing the save prompt when exiting the editor to be skipped.",s.ON_EXIT,s.ON_EXIT_AND_WINDOW_CLOSE)};k.registerConfiguration({id:"files",order:9,title:e.localize("filesConfigurationTitle","Files"),type:"object",properties:{[ee]:{type:"object",markdownDescription:e.localize("exclude","Configure [glob patterns](https://aka.ms/vscode-glob-patterns) for excluding files and folders. For example, the File Explorer decides which files and folders to show or hide based on this setting. Refer to the `#search.exclude#` setting to define search-specific excludes. Refer to the `#explorer.excludeGitIgnore#` setting for ignoring files based on your `.gitignore`."),default:{"**/.git":!0,"**/.svn":!0,"**/.hg":!0,"**/CVS":!0,"**/.DS_Store":!0,"**/Thumbs.db":!0,...F?{"**/*.crswap":!0}:void 0},scope:t.RESOURCE,additionalProperties:{anyOf:[{type:"boolean",enum:[!0,!1],enumDescriptions:[e.localize("trueDescription","Enable the pattern."),e.localize("falseDescription","Disable the pattern.")],description:e.localize("files.exclude.boolean","The glob pattern to match file paths against. Set to true or false to enable or disable the pattern.")},{type:"object",properties:{when:{type:"string",pattern:"\\w*\\$\\(basename\\)\\w*",default:"$(basename).ext",markdownDescription:e.localize({key:"files.exclude.when",comment:["\\$(basename) should not be translated"]},"Additional check on the siblings of a matching file. Use \\$(basename) as variable for the matching file name.")}}}]}},[Q]:{type:"object",markdownDescription:e.localize("associations",'Configure [glob patterns](https://aka.ms/vscode-glob-patterns) of file associations to languages (for example `"*.extension": "html"`). Patterns will match on the absolute path of a file if they contain a path separator and will match on the name of the file otherwise. These have precedence over the default associations of the languages installed.'),additionalProperties:{type:"string"}},"files.encoding":{type:"string",enum:Object.keys(g),default:"utf8",description:e.localize("encoding","The default character set encoding to use when reading and writing files. This setting can also be configured per language."),scope:t.LANGUAGE_OVERRIDABLE,enumDescriptions:Object.keys(g).map(o=>g[o].labelLong),enumItemLabels:Object.keys(g).map(o=>g[o].labelLong)},"files.autoGuessEncoding":{type:"boolean",default:!1,markdownDescription:e.localize("autoGuessEncoding","When enabled, the editor will attempt to guess the character set encoding when opening files. This setting can also be configured per language. Note, this setting is not respected by text search. Only {0} is respected.","`#files.encoding#`"),scope:t.LANGUAGE_OVERRIDABLE},"files.candidateGuessEncodings":{type:"array",items:{type:"string",enum:Object.keys(O),enumDescriptions:Object.keys(O).map(o=>O[o].labelLong)},default:[],markdownDescription:e.localize("candidateGuessEncodings","List of character set encodings that the editor should attempt to guess in the order they are listed. In case it cannot be determined, {0} is respected","`#files.encoding#`"),scope:t.LANGUAGE_OVERRIDABLE},"files.eol":{type:"string",enum:[`
`,`\r
`,"auto"],enumDescriptions:[e.localize("eol.LF","LF"),e.localize("eol.CRLF","CRLF"),e.localize("eol.auto","Uses operating system specific end of line character.")],default:"auto",description:e.localize("eol","The default end of line character."),scope:t.LANGUAGE_OVERRIDABLE},"files.enableTrash":{type:"boolean",default:!0,description:e.localize("useTrash","Moves files/folders to the OS trash (recycle bin on Windows) when deleting. Disabling this will delete files/folders permanently.")},"files.trimTrailingWhitespace":{type:"boolean",default:!1,description:e.localize("trimTrailingWhitespace","When enabled, will trim trailing whitespace when saving a file."),scope:t.LANGUAGE_OVERRIDABLE},"files.trimTrailingWhitespaceInRegexAndStrings":{type:"boolean",default:!0,description:e.localize("trimTrailingWhitespaceInRegexAndStrings","When enabled, trailing whitespace will be removed from multiline strings and regexes will be removed on save or when executing 'editor.action.trimTrailingWhitespace'. This can cause whitespace to not be trimmed from lines when there isn't up-to-date token information."),scope:t.LANGUAGE_OVERRIDABLE},"files.insertFinalNewline":{type:"boolean",default:!1,description:e.localize("insertFinalNewline","When enabled, insert a final new line at the end of the file when saving it."),scope:t.LANGUAGE_OVERRIDABLE},"files.trimFinalNewlines":{type:"boolean",default:!1,description:e.localize("trimFinalNewlines","When enabled, will trim all new lines after the final new line at the end of the file when saving it."),scope:t.LANGUAGE_OVERRIDABLE},"files.autoSave":{type:"string",enum:[a.OFF,a.AFTER_DELAY,a.ON_FOCUS_CHANGE,a.ON_WINDOW_CHANGE],markdownEnumDescriptions:[e.localize({comment:["This is the description for a setting. Values surrounded by single quotes are not to be translated."],key:"files.autoSave.off"},"An editor with changes is never automatically saved."),e.localize({comment:["This is the description for a setting. Values surrounded by single quotes are not to be translated."],key:"files.autoSave.afterDelay"},"An editor with changes is automatically saved after the configured `#files.autoSaveDelay#`."),e.localize({comment:["This is the description for a setting. Values surrounded by single quotes are not to be translated."],key:"files.autoSave.onFocusChange"},"An editor with changes is automatically saved when the editor loses focus."),e.localize({comment:["This is the description for a setting. Values surrounded by single quotes are not to be translated."],key:"files.autoSave.onWindowChange"},"An editor with changes is automatically saved when the window loses focus.")],default:F?a.AFTER_DELAY:a.OFF,markdownDescription:e.localize({comment:["This is the description for a setting. Values surrounded by single quotes are not to be translated."],key:"autoSave"},"Controls [auto save](https://code.visualstudio.com/docs/editor/codebasics#_save-auto-save) of editors that have unsaved changes.",a.OFF,a.AFTER_DELAY,a.ON_FOCUS_CHANGE,a.ON_WINDOW_CHANGE,a.AFTER_DELAY),scope:t.LANGUAGE_OVERRIDABLE},"files.autoSaveDelay":{type:"number",default:1e3,minimum:0,markdownDescription:e.localize({comment:["This is the description for a setting. Values surrounded by single quotes are not to be translated."],key:"autoSaveDelay"},"Controls the delay in milliseconds after which an editor with unsaved changes is saved automatically. Only applies when `#files.autoSave#` is set to `{0}`.",a.AFTER_DELAY),scope:t.LANGUAGE_OVERRIDABLE},"files.autoSaveWorkspaceFilesOnly":{type:"boolean",default:!1,markdownDescription:e.localize("autoSaveWorkspaceFilesOnly","When enabled, will limit [auto save](https://code.visualstudio.com/docs/editor/codebasics#_save-auto-save) of editors to files that are inside the opened workspace. Only applies when {0} is enabled.","`#files.autoSave#`"),scope:t.LANGUAGE_OVERRIDABLE},"files.autoSaveWhenNoErrors":{type:"boolean",default:!1,markdownDescription:e.localize("autoSaveWhenNoErrors","When enabled, will limit [auto save](https://code.visualstudio.com/docs/editor/codebasics#_save-auto-save) of editors to files that have no errors reported in them at the time the auto save is triggered. Only applies when {0} is enabled.","`#files.autoSave#`"),scope:t.LANGUAGE_OVERRIDABLE},"files.watcherExclude":{type:"object",patternProperties:{".*":{type:"boolean"}},default:{"**/.git/objects/**":!0,"**/.git/subtree-cache/**":!0,"**/node_modules/*/**":!0,"**/.hg/store/**":!0},markdownDescription:e.localize("watcherExclude","Configure paths or [glob patterns](https://aka.ms/vscode-glob-patterns) to exclude from file watching. Paths can either be relative to the watched folder or absolute. Glob patterns are matched relative from the watched folder. When you experience the file watcher process consuming a lot of CPU, make sure to exclude large folders that are of less interest (such as build output folders)."),scope:t.RESOURCE},"files.watcherInclude":{type:"array",items:{type:"string"},default:[],description:e.localize("watcherInclude","Configure extra paths to watch for changes inside the workspace. By default, all workspace folders will be watched recursively, except for folders that are symbolic links. You can explicitly add absolute or relative paths to support watching folders that are symbolic links. Relative paths will be resolved to an absolute path using the currently opened workspace."),scope:t.RESOURCE},"files.experimentalWatcherNext":{type:"boolean",default:!1,markdownDescription:e.localize("experimentalWatcherNext","Enables a newer, experimental version of the file watcher."),scope:t.APPLICATION},"files.hotExit":ce,"files.defaultLanguage":{type:"string",markdownDescription:e.localize("defaultLanguage","The default language identifier that is assigned to new files. If configured to `${activeEditorLanguage}`, will use the language identifier of the currently active text editor if any.")},[ie]:{type:"object",patternProperties:{".*":{type:"boolean"}},default:{},markdownDescription:e.localize("filesReadonlyInclude","Configure paths or [glob patterns](https://aka.ms/vscode-glob-patterns) to mark as read-only. Glob patterns are always evaluated relative to the path of the workspace folder unless they are absolute paths. You can exclude matching paths via the `#files.readonlyExclude#` setting. Files from readonly file system providers will always be read-only independent of this setting."),scope:t.RESOURCE},[te]:{type:"object",patternProperties:{".*":{type:"boolean"}},default:{},markdownDescription:e.localize("filesReadonlyExclude","Configure paths or [glob patterns](https://aka.ms/vscode-glob-patterns) to exclude from being marked as read-only if they match as a result of the `#files.readonlyInclude#` setting. Glob patterns are always evaluated relative to the path of the workspace folder unless they are absolute paths. Files from readonly file system providers will always be read-only independent of this setting."),scope:t.RESOURCE},[oe]:{type:"boolean",markdownDescription:e.localize("filesReadonlyFromPermissions","Marks files as read-only when their file permissions indicate as such. This can be overridden via `#files.readonlyInclude#` and `#files.readonlyExclude#` settings."),default:!1},"files.restoreUndoStack":{type:"boolean",description:e.localize("files.restoreUndoStack","Restore the undo stack when a file is reopened."),default:!0},"files.saveConflictResolution":{type:"string",enum:["askUser","overwriteFileOnDisk"],enumDescriptions:[e.localize("askUser","Will refuse to save and ask for resolving the save conflict manually."),e.localize("overwriteFileOnDisk","Will resolve the save conflict by overwriting the file on disk with the changes in the editor.")],description:e.localize("files.saveConflictResolution","A save conflict can occur when a file is saved to disk that was changed by another program in the meantime. To prevent data loss, the user is asked to compare the changes in the editor with the version on disk. This setting should only be changed if you frequently encounter save conflict errors and may result in data loss if used without caution."),default:"askUser",scope:t.LANGUAGE_OVERRIDABLE},"files.dialog.defaultPath":{type:"string",pattern:"^((\\/|\\\\\\\\|[a-zA-Z]:\\\\).*)?$",patternErrorMessage:e.localize("defaultPathErrorMessage","Default path for file dialogs must be an absolute path (e.g. C:\\\\myFolder or /myFolder)."),description:e.localize("fileDialogDefaultPath","Default path for file dialogs, overriding user's home path. Only used in the absence of a context-specific path, such as most recently opened file or folder."),scope:t.MACHINE},"files.simpleDialog.enable":{type:"boolean",description:e.localize("files.simpleDialog.enable","Enables the simple file dialog for opening and saving files and folders. The simple file dialog replaces the system file dialog when enabled."),default:!1},"files.participants.timeout":{type:"number",default:6e4,markdownDescription:e.localize("files.participants.timeout","Timeout in milliseconds after which file participants for create, rename, and delete are cancelled. Use `0` to disable participants.")}}}),k.registerConfiguration({...J,properties:{"editor.formatOnSave":{type:"boolean",description:e.localize("formatOnSave","Format a file on save. A formatter must be available, the file must not be saved after delay, and the editor must not be shutting down."),scope:t.LANGUAGE_OVERRIDABLE},"editor.formatOnSaveMode":{type:"string",default:"file",enum:["file","modifications","modificationsIfAvailable"],enumDescriptions:[e.localize({key:"everything",comment:["This is the description of an option"]},"Format the whole file."),e.localize({key:"modification",comment:["This is the description of an option"]},"Format modifications (requires source control)."),e.localize({key:"modificationIfAvailable",comment:["This is the description of an option"]},"Will attempt to format modifications only (requires source control). If source control can't be used, then the whole file will be formatted.")],markdownDescription:e.localize("formatOnSaveMode","Controls if format on save formats the whole file or only modifications. Only applies when `#editor.formatOnSave#` is enabled."),scope:t.LANGUAGE_OVERRIDABLE}}}),k.registerConfiguration({id:"explorer",order:10,title:e.localize("explorerConfigurationTitle","File Explorer"),type:"object",properties:{"explorer.openEditors.visible":{type:"number",description:e.localize({key:"openEditorsVisible",comment:["Open is an adjective"]},"The initial maximum number of editors shown in the Open Editors pane. Exceeding this limit will show a scroll bar and allow resizing the pane to display more items."),default:9,minimum:1},"explorer.openEditors.minVisible":{type:"number",description:e.localize({key:"openEditorsVisibleMin",comment:["Open is an adjective"]},"The minimum number of editor slots pre-allocated in the Open Editors pane. If set to 0 the Open Editors pane will dynamically resize based on the number of editors."),default:0,minimum:0},"explorer.openEditors.sortOrder":{type:"string",enum:["editorOrder","alphabetical","fullPath"],description:e.localize({key:"openEditorsSortOrder",comment:["Open is an adjective"]},"Controls the sorting order of editors in the Open Editors pane."),enumDescriptions:[e.localize("sortOrder.editorOrder","Editors are ordered in the same order editor tabs are shown."),e.localize("sortOrder.alphabetical","Editors are ordered alphabetically by tab name inside each editor group."),e.localize("sortOrder.fullPath","Editors are ordered alphabetically by full path inside each editor group.")],default:"editorOrder"},"explorer.autoReveal":{type:["boolean","string"],enum:[!0,!1,"focusNoScroll"],default:!0,enumDescriptions:[e.localize("autoReveal.on","Files will be revealed and selected."),e.localize("autoReveal.off","Files will not be revealed and selected."),e.localize("autoReveal.focusNoScroll","Files will not be scrolled into view, but will still be focused.")],description:e.localize("autoReveal","Controls whether the Explorer should automatically reveal and select files when opening them.")},"explorer.autoRevealExclude":{type:"object",markdownDescription:e.localize("autoRevealExclude","Configure paths or [glob patterns](https://aka.ms/vscode-glob-patterns) for excluding files and folders from being revealed and selected in the Explorer when they are opened. Glob patterns are always evaluated relative to the path of the workspace folder unless they are absolute paths."),default:{"**/node_modules":!0,"**/bower_components":!0},additionalProperties:{anyOf:[{type:"boolean",description:e.localize("explorer.autoRevealExclude.boolean","The glob pattern to match file paths against. Set to true or false to enable or disable the pattern.")},{type:"object",properties:{when:{type:"string",pattern:"\\w*\\$\\(basename\\)\\w*",default:"$(basename).ext",description:e.localize("explorer.autoRevealExclude.when","Additional check on the siblings of a matching file. Use $(basename) as variable for the matching file name.")}}}]}},"explorer.enableDragAndDrop":{type:"boolean",description:e.localize("enableDragAndDrop","Controls whether the Explorer should allow to move files and folders via drag and drop. This setting only effects drag and drop from inside the Explorer."),default:!0},"explorer.confirmDragAndDrop":{type:"boolean",description:e.localize("confirmDragAndDrop","Controls whether the Explorer should ask for confirmation to move files and folders via drag and drop."),default:!0},"explorer.confirmPasteNative":{type:"boolean",description:e.localize("confirmPasteNative","Controls whether the Explorer should ask for confirmation when pasting native files and folders."),default:!0},"explorer.confirmDelete":{type:"boolean",description:e.localize("confirmDelete","Controls whether the Explorer should ask for confirmation when deleting a file via the trash."),default:!0},"explorer.enableUndo":{type:"boolean",description:e.localize("enableUndo","Controls whether the Explorer should support undoing file and folder operations."),default:!0},"explorer.confirmUndo":{type:"string",enum:[w.Verbose,w.Default,w.Light],description:e.localize("confirmUndo","Controls whether the Explorer should ask for confirmation when undoing."),default:w.Default,enumDescriptions:[e.localize("enableUndo.verbose","Explorer will prompt before all undo operations."),e.localize("enableUndo.default","Explorer will prompt before destructive undo operations."),e.localize("enableUndo.light","Explorer will not prompt before undo operations when focused.")]},"explorer.expandSingleFolderWorkspaces":{type:"boolean",description:e.localize("expandSingleFolderWorkspaces","Controls whether the Explorer should expand multi-root workspaces containing only one folder during initialization"),default:!0},"explorer.sortOrder":{type:"string",enum:[p.Default,p.Mixed,p.FilesFirst,p.Type,p.Modified,p.FoldersNestsFiles],default:p.Default,enumDescriptions:[e.localize("sortOrder.default","Files and folders are sorted by their names. Folders are displayed before files."),e.localize("sortOrder.mixed","Files and folders are sorted by their names. Files are interwoven with folders."),e.localize("sortOrder.filesFirst","Files and folders are sorted by their names. Files are displayed before folders."),e.localize("sortOrder.type","Files and folders are grouped by extension type then sorted by their names. Folders are displayed before files."),e.localize("sortOrder.modified","Files and folders are sorted by last modified date in descending order. Folders are displayed before files."),e.localize("sortOrder.foldersNestsFiles","Files and folders are sorted by their names. Folders are displayed before files. Files with nested children are displayed before other files.")],markdownDescription:e.localize("sortOrder","Controls the property-based sorting of files and folders in the Explorer. When `#explorer.fileNesting.enabled#` is enabled, also controls sorting of nested files.")},"explorer.sortOrderLexicographicOptions":{type:"string",enum:[b.Default,b.Upper,b.Lower,b.Unicode],default:b.Default,enumDescriptions:[e.localize("sortOrderLexicographicOptions.default","Uppercase and lowercase names are mixed together."),e.localize("sortOrderLexicographicOptions.upper","Uppercase names are grouped together before lowercase names."),e.localize("sortOrderLexicographicOptions.lower","Lowercase names are grouped together before uppercase names."),e.localize("sortOrderLexicographicOptions.unicode","Names are sorted in Unicode order.")],description:e.localize("sortOrderLexicographicOptions","Controls the lexicographic sorting of file and folder names in the Explorer.")},"explorer.sortOrderReverse":{type:"boolean",description:e.localize("sortOrderReverse","Controls whether the file and folder sort order, should be reversed."),default:!1},"explorer.decorations.colors":{type:"boolean",description:e.localize("explorer.decorations.colors","Controls whether file decorations should use colors."),default:!0},"explorer.decorations.badges":{type:"boolean",description:e.localize("explorer.decorations.badges","Controls whether file decorations should use badges."),default:!0},"explorer.incrementalNaming":{type:"string",enum:["simple","smart","disabled"],enumDescriptions:[e.localize("simple",'Appends the word "copy" at the end of the duplicated name potentially followed by a number.'),e.localize("smart","Adds a number at the end of the duplicated name. If some number is already part of the name, tries to increase that number."),e.localize("disabled","Disables incremental naming. If two files with the same name exist you will be prompted to overwrite the existing file.")],description:e.localize("explorer.incrementalNaming","Controls which naming strategy to use when giving a new name to a duplicated Explorer item on paste."),default:"simple"},"explorer.autoOpenDroppedFile":{type:"boolean",description:e.localize("autoOpenDroppedFile","Controls whether the Explorer should automatically open a file when it is dropped into the explorer"),default:!0},"explorer.compactFolders":{type:"boolean",description:e.localize("compressSingleChildFolders","Controls whether the Explorer should render folders in a compact form. In such a form, single child folders will be compressed in a combined tree element. Useful for Java package structures, for example."),default:!0},"explorer.copyRelativePathSeparator":{type:"string",enum:["/","\\","auto"],enumDescriptions:[e.localize("copyRelativePathSeparator.slash","Use slash as path separation character."),e.localize("copyRelativePathSeparator.backslash","Use backslash as path separation character."),e.localize("copyRelativePathSeparator.auto","Uses operating system specific path separation character.")],description:e.localize("copyRelativePathSeparator","The path separation character used when copying relative file paths."),default:"auto"},"explorer.excludeGitIgnore":{type:"boolean",markdownDescription:e.localize("excludeGitignore","Controls whether entries in .gitignore should be parsed and excluded from the Explorer. Similar to {0}.","`#files.exclude#`"),default:!1,scope:t.RESOURCE},"explorer.fileNesting.enabled":{type:"boolean",scope:t.RESOURCE,markdownDescription:e.localize("fileNestingEnabled","Controls whether file nesting is enabled in the Explorer. File nesting allows for related files in a directory to be visually grouped together under a single parent file."),default:!1},"explorer.fileNesting.expand":{type:"boolean",markdownDescription:e.localize("fileNestingExpand","Controls whether file nests are automatically expanded. {0} must be set for this to take effect.","`#explorer.fileNesting.enabled#`"),default:!0},"explorer.fileNesting.patterns":{type:"object",scope:t.RESOURCE,markdownDescription:e.localize("fileNestingPatterns","Controls nesting of files in the Explorer. {0} must be set for this to take effect. Each __Item__ represents a parent pattern and may contain a single `*` character that matches any string. Each __Value__ represents a comma separated list of the child patterns that should be shown nested under a given parent. Child patterns may contain several special tokens:\n- `${capture}`: Matches the resolved value of the `*` from the parent pattern\n- `${basename}`: Matches the parent file's basename, the `file` in `file.ts`\n- `${extname}`: Matches the parent file's extension, the `ts` in `file.ts`\n- `${dirname}`: Matches the parent file's directory name, the `src` in `src/file.ts`\n- `*`:  Matches any string, may only be used once per child pattern","`#explorer.fileNesting.enabled#`"),patternProperties:{"^[^*]*\\*?[^*]*$":{markdownDescription:e.localize("fileNesting.description","Each key pattern may contain a single `*` character which will match any string."),type:"string",pattern:"^([^,*]*\\*?[^,*]*)(, ?[^,*]*\\*?[^,*]*)*$"}},additionalProperties:!1,default:{"*.ts":"${capture}.js","*.js":"${capture}.js.map, ${capture}.min.js, ${capture}.d.ts","*.jsx":"${capture}.js","*.tsx":"${capture}.ts","tsconfig.json":"tsconfig.*.json","package.json":"package-lock.json, yarn.lock, pnpm-lock.yaml, bun.lockb"}}}}),Y.addImplementation(110,"explorer",o=>{const i=o.get(C),n=o.get(D),r=o.get(R).getValue().explorer.enableUndo;return n.hasViewFocus()&&i.canUndo(v)&&r?(i.undo(v),!0):!1}),X.addImplementation(110,"explorer",o=>{const i=o.get(C),n=o.get(D),r=o.get(R).getValue().explorer.enableUndo;return n.hasViewFocus()&&i.canRedo(v)&&r?(i.redo(v),!0):!1}),Z.registerLanguage({id:se,aliases:["Binary"],mimetypes:["text/x-code-binary"]});
