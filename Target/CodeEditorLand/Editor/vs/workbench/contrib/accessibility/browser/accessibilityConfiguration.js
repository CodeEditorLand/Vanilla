var I=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var k=(i,n,o,s)=>{for(var t=s>1?void 0:s?H(n,o):n,c=i.length-1,b;c>=0;c--)(b=i[c])&&(t=(s?b(n,o,t):b(t))||t);return s&&t&&I(n,o,t),t},v=(i,n)=>(o,s)=>n(o,s,i);import{localize as e}from"../../../../nls.js";import{ConfigurationScope as C,Extensions as x}from"../../../../platform/configuration/common/configurationRegistry.js";import{Registry as g}from"../../../../platform/registry/common/platform.js";import{RawContextKey as y}from"../../../../platform/contextkey/common/contextkey.js";import{workbenchConfigurationNodeBase as D,Extensions as p}from"../../../common/configuration.js";import{AccessibilitySignal as A}from"../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";import{AccessibilityVoiceSettingId as f,ISpeechService as E,SPEECH_LANGUAGES as V}from"../../speech/common/speechService.js";import{Disposable as O}from"../../../../base/common/lifecycle.js";import{Event as F}from"../../../../base/common/event.js";import{isDefined as R}from"../../../../base/common/types.js";import{IProductService as M}from"../../../../platform/product/common/productService.js";const re=new y("accessibilityHelpIsShown",!1,!0),de=new y("accessibleViewIsShown",!1,!0),ue=new y("accessibleViewSupportsNavigation",!1,!0),ge=new y("accessibleViewVerbosityEnabled",!1,!0),ye=new y("accessibleViewGoToSymbolSupported",!1,!0),pe=new y("accessibleViewOnLastLine",!1,!0),be=new y("accessibleViewCurrentProviderId",void 0,void 0),he=new y("accessibleViewInCodeBlock",void 0,void 0),me=new y("accessibleViewContainsCodeBlocks",void 0,void 0),fe=new y("accessibleViewHasUnassignedKeybindings",void 0,void 0),we=new y("accessibleViewHasAssignedKeybindings",void 0,void 0);var K=(t=>(t.DimUnfocusedEnabled="accessibility.dimUnfocused.enabled",t.DimUnfocusedOpacity="accessibility.dimUnfocused.opacity",t.HideAccessibleView="accessibility.hideAccessibleView",t.AccessibleViewCloseOnKeyPress="accessibility.accessibleView.closeOnKeyPress",t))(K||{}),L=(s=>(s[s.Default=.75]="Default",s[s.Minimum=.2]="Minimum",s[s.Maximum=1]="Maximum",s))(L||{}),T=(d=>(d.Terminal="accessibility.verbosity.terminal",d.DiffEditor="accessibility.verbosity.diffEditor",d.Chat="accessibility.verbosity.panelChat",d.InlineChat="accessibility.verbosity.inlineChat",d.TerminalChat="accessibility.verbosity.terminalChat",d.InlineCompletions="accessibility.verbosity.inlineCompletions",d.KeybindingsEditor="accessibility.verbosity.keybindingsEditor",d.Notebook="accessibility.verbosity.notebook",d.Editor="accessibility.verbosity.editor",d.Hover="accessibility.verbosity.hover",d.Notification="accessibility.verbosity.notification",d.EmptyEditorHint="accessibility.verbosity.emptyEditorHint",d.ReplInputHint="accessibility.verbosity.replInputHint",d.Comments="accessibility.verbosity.comments",d.DiffEditorActive="accessibility.verbosity.diffEditorActive",d.Debug="accessibility.verbosity.debug",d.Walkthrough="accessibility.verbosity.walkthrough",d))(T||{});const u={type:"boolean",default:!0,tags:["accessibility"]},S=Object.freeze({id:"accessibility",title:e("accessibilityConfigurationTitle","Accessibility"),type:"object"}),a={type:"string",enum:["auto","on","off"],default:"auto",enumDescriptions:[e("sound.enabled.auto","Enable sound when a screen reader is attached."),e("sound.enabled.on","Enable sound."),e("sound.enabled.off","Disable sound.")],tags:["accessibility"]},l={type:"object",tags:["accessibility"],additionalProperties:!1,default:{sound:"auto",announcement:"auto"}},r={type:"string",enum:["auto","off"],default:"auto",enumDescriptions:[e("announcement.enabled.auto","Enable announcement, will only play when in screen reader optimized mode."),e("announcement.enabled.off","Disable announcement.")],tags:["accessibility"]},m={type:"object",tags:["accessibility"],additionalProperties:!1,default:{sound:"auto"}},z={...S,scope:C.RESOURCE,properties:{["accessibility.verbosity.terminal"]:{description:e("verbosity.terminal.description","Provide information about how to access the terminal accessibility help menu when the terminal is focused."),...u},["accessibility.verbosity.diffEditor"]:{description:e("verbosity.diffEditor.description","Provide information about how to navigate changes in the diff editor when it is focused."),...u},["accessibility.verbosity.panelChat"]:{description:e("verbosity.chat.description","Provide information about how to access the chat help menu when the chat input is focused."),...u},["accessibility.verbosity.inlineChat"]:{description:e("verbosity.interactiveEditor.description","Provide information about how to access the inline editor chat accessibility help menu and alert with hints that describe how to use the feature when the input is focused."),...u},["accessibility.verbosity.inlineCompletions"]:{description:e("verbosity.inlineCompletions.description","Provide information about how to access the inline completions hover and Accessible View."),...u},["accessibility.verbosity.keybindingsEditor"]:{description:e("verbosity.keybindingsEditor.description","Provide information about how to change a keybinding in the keybindings editor when a row is focused."),...u},["accessibility.verbosity.notebook"]:{description:e("verbosity.notebook","Provide information about how to focus the cell container or inner editor when a notebook cell is focused."),...u},["accessibility.verbosity.hover"]:{description:e("verbosity.hover","Provide information about how to open the hover in an Accessible View."),...u},["accessibility.verbosity.notification"]:{description:e("verbosity.notification","Provide information about how to open the notification in an Accessible View."),...u},["accessibility.verbosity.emptyEditorHint"]:{description:e("verbosity.emptyEditorHint","Provide information about relevant actions in an empty text editor."),...u},["accessibility.verbosity.replInputHint"]:{description:e("verbosity.replInputHint","Provide information about relevant actions For the Repl input."),...u},["accessibility.verbosity.comments"]:{description:e("verbosity.comments","Provide information about actions that can be taken in the comment widget or in a file which contains comments."),...u},["accessibility.verbosity.diffEditorActive"]:{description:e("verbosity.diffEditorActive","Indicate when a diff editor becomes the active editor."),...u},["accessibility.verbosity.debug"]:{description:e("verbosity.debug","Provide information about how to access the debug console accessibility help dialog when the debug console or run and debug viewlet is focused. Note that a reload of the window is required for this to take effect."),...u},["accessibility.accessibleView.closeOnKeyPress"]:{markdownDescription:e("terminal.integrated.accessibleView.closeOnKeyPress","On keypress, close the Accessible View and focus the element from which it was invoked."),type:"boolean",default:!0},"accessibility.signalOptions.volume":{description:e("accessibility.signalOptions.volume","The volume of the sounds in percent (0-100)."),type:"number",minimum:0,maximum:100,default:70,tags:["accessibility"]},"accessibility.signalOptions.debouncePositionChanges":{description:e("accessibility.signalOptions.debouncePositionChanges","Whether or not position changes should be debounced"),type:"boolean",default:!1,tags:["accessibility"]},"accessibility.signalOptions.experimental.delays.general":{type:"object",description:"Delays for all signals besides error and warning at position",additionalProperties:!1,properties:{announcement:{description:e("accessibility.signalOptions.delays.general.announcement","The delay in milliseconds before an announcement is made."),type:"number",minimum:0,default:3e3},sound:{description:e("accessibility.signalOptions.delays.general.sound","The delay in milliseconds before a sound is played."),type:"number",minimum:0,default:400}},tags:["accessibility"]},"accessibility.signalOptions.experimental.delays.warningAtPosition":{type:"object",additionalProperties:!1,properties:{announcement:{description:e("accessibility.signalOptions.delays.warningAtPosition.announcement","The delay in milliseconds before an announcement is made when there's a warning at the position."),type:"number",minimum:0,default:3e3},sound:{description:e("accessibility.signalOptions.delays.warningAtPosition.sound","The delay in milliseconds before a sound is played when there's a warning at the position."),type:"number",minimum:0,default:1e3}},tags:["accessibility"]},"accessibility.signalOptions.experimental.delays.errorAtPosition":{type:"object",additionalProperties:!1,properties:{announcement:{description:e("accessibility.signalOptions.delays.errorAtPosition.announcement","The delay in milliseconds before an announcement is made when there's an error at the position."),type:"number",minimum:0,default:3e3},sound:{description:e("accessibility.signalOptions.delays.errorAtPosition.sound","The delay in milliseconds before a sound is played when there's an error at the position."),type:"number",minimum:0,default:1e3}},tags:["accessibility"]},"accessibility.signals.lineHasBreakpoint":{...l,description:e("accessibility.signals.lineHasBreakpoint","Plays a signal - sound (audio cue) and/or announcement (alert) - when the active line has a breakpoint."),properties:{sound:{description:e("accessibility.signals.lineHasBreakpoint.sound","Plays a sound when the active line has a breakpoint."),...a},announcement:{description:e("accessibility.signals.lineHasBreakpoint.announcement","Announces when the active line has a breakpoint."),...r}}},"accessibility.signals.lineHasInlineSuggestion":{...m,description:e("accessibility.signals.lineHasInlineSuggestion","Plays a sound / audio cue when the active line has an inline suggestion."),properties:{sound:{description:e("accessibility.signals.lineHasInlineSuggestion.sound","Plays a sound when the active line has an inline suggestion."),...a,default:"off"}}},"accessibility.signals.lineHasError":{...l,description:e("accessibility.signals.lineHasError","Plays a signal - sound (audio cue) and/or announcement (alert) - when the active line has an error."),properties:{sound:{description:e("accessibility.signals.lineHasError.sound","Plays a sound when the active line has an error."),...a},announcement:{description:e("accessibility.signals.lineHasError.announcement","Announces when the active line has an error."),...r,default:"off"}}},"accessibility.signals.lineHasFoldedArea":{...l,description:e("accessibility.signals.lineHasFoldedArea","Plays a signal - sound (audio cue) and/or announcement (alert) - the active line has a folded area that can be unfolded."),properties:{sound:{description:e("accessibility.signals.lineHasFoldedArea.sound","Plays a sound when the active line has a folded area that can be unfolded."),...a,default:"off"},announcement:{description:e("accessibility.signals.lineHasFoldedArea.announcement","Announces when the active line has a folded area that can be unfolded."),...r}}},"accessibility.signals.lineHasWarning":{...l,description:e("accessibility.signals.lineHasWarning","Plays a signal - sound (audio cue) and/or announcement (alert) - when the active line has a warning."),properties:{sound:{description:e("accessibility.signals.lineHasWarning.sound","Plays a sound when the active line has a warning."),...a},announcement:{description:e("accessibility.signals.lineHasWarning.announcement","Announces when the active line has a warning."),...r,default:"off"}}},"accessibility.signals.positionHasError":{...l,description:e("accessibility.signals.positionHasError","Plays a signal - sound (audio cue) and/or announcement (alert) - when the active line has a warning."),properties:{sound:{description:e("accessibility.signals.positionHasError.sound","Plays a sound when the active line has a warning."),...a},announcement:{description:e("accessibility.signals.positionHasError.announcement","Announces when the active line has a warning."),...r,default:"on"}}},"accessibility.signals.positionHasWarning":{...l,description:e("accessibility.signals.positionHasWarning","Plays a signal - sound (audio cue) and/or announcement (alert) - when the active line has a warning."),properties:{sound:{description:e("accessibility.signals.positionHasWarning.sound","Plays a sound when the active line has a warning."),...a},announcement:{description:e("accessibility.signals.positionHasWarning.announcement","Announces when the active line has a warning."),...r,default:"on"}}},"accessibility.signals.onDebugBreak":{...l,description:e("accessibility.signals.onDebugBreak","Plays a signal - sound (audio cue) and/or announcement (alert) - when the debugger stopped on a breakpoint."),properties:{sound:{description:e("accessibility.signals.onDebugBreak.sound","Plays a sound when the debugger stopped on a breakpoint."),...a},announcement:{description:e("accessibility.signals.onDebugBreak.announcement","Announces when the debugger stopped on a breakpoint."),...r}}},"accessibility.signals.noInlayHints":{...l,description:e("accessibility.signals.noInlayHints","Plays a signal - sound (audio cue) and/or announcement (alert) - when trying to read a line with inlay hints that has no inlay hints."),properties:{sound:{description:e("accessibility.signals.noInlayHints.sound","Plays a sound when trying to read a line with inlay hints that has no inlay hints."),...a},announcement:{description:e("accessibility.signals.noInlayHints.announcement","Announces when trying to read a line with inlay hints that has no inlay hints."),...r}}},"accessibility.signals.taskCompleted":{...l,description:e("accessibility.signals.taskCompleted","Plays a signal - sound (audio cue) and/or announcement (alert) - when a task is completed."),properties:{sound:{description:e("accessibility.signals.taskCompleted.sound","Plays a sound when a task is completed."),...a},announcement:{description:e("accessibility.signals.taskCompleted.announcement","Announces when a task is completed."),...r}}},"accessibility.signals.taskFailed":{...l,description:e("accessibility.signals.taskFailed","Plays a signal - sound (audio cue) and/or announcement (alert) - when a task fails (non-zero exit code)."),properties:{sound:{description:e("accessibility.signals.taskFailed.sound","Plays a sound when a task fails (non-zero exit code)."),...a},announcement:{description:e("accessibility.signals.taskFailed.announcement","Announces when a task fails (non-zero exit code)."),...r}}},"accessibility.signals.terminalCommandFailed":{...l,description:e("accessibility.signals.terminalCommandFailed","Plays a signal - sound (audio cue) and/or announcement (alert) - when a terminal command fails (non-zero exit code) or when a command with such an exit code is navigated to in the accessible view."),properties:{sound:{description:e("accessibility.signals.terminalCommandFailed.sound","Plays a sound when a terminal command fails (non-zero exit code) or when a command with such an exit code is navigated to in the accessible view."),...a},announcement:{description:e("accessibility.signals.terminalCommandFailed.announcement","Announces when a terminal command fails (non-zero exit code) or when a command with such an exit code is navigated to in the accessible view."),...r}}},"accessibility.signals.terminalCommandSucceeded":{...l,description:e("accessibility.signals.terminalCommandSucceeded","Plays a signal - sound (audio cue) and/or announcement (alert) - when a terminal command succeeds (zero exit code) or when a command with such an exit code is navigated to in the accessible view."),properties:{sound:{description:e("accessibility.signals.terminalCommandSucceeded.sound","Plays a sound when a terminal command succeeds (zero exit code) or when a command with such an exit code is navigated to in the accessible view."),...a},announcement:{description:e("accessibility.signals.terminalCommandSucceeded.announcement","Announces when a terminal command succeeds (zero exit code) or when a command with such an exit code is navigated to in the accessible view."),...r}}},"accessibility.signals.terminalQuickFix":{...l,description:e("accessibility.signals.terminalQuickFix","Plays a signal - sound (audio cue) and/or announcement (alert) - when terminal Quick Fixes are available."),properties:{sound:{description:e("accessibility.signals.terminalQuickFix.sound","Plays a sound when terminal Quick Fixes are available."),...a},announcement:{description:e("accessibility.signals.terminalQuickFix.announcement","Announces when terminal Quick Fixes are available."),...r}}},"accessibility.signals.terminalBell":{...l,description:e("accessibility.signals.terminalBell","Plays a signal - sound (audio cue) and/or announcement (alert) - when the terminal bell is ringing."),properties:{sound:{description:e("accessibility.signals.terminalBell.sound","Plays a sound when the terminal bell is ringing."),...a},announcement:{description:e("accessibility.signals.terminalBell.announcement","Announces when the terminal bell is ringing."),...r}}},"accessibility.signals.diffLineInserted":{...m,description:e("accessibility.signals.diffLineInserted","Plays a sound / audio cue when the focus moves to an inserted line in Accessible Diff Viewer mode or to the next/previous change."),properties:{sound:{description:e("accessibility.signals.sound","Plays a sound when the focus moves to an inserted line in Accessible Diff Viewer mode or to the next/previous change."),...a}}},"accessibility.signals.diffLineModified":{...m,description:e("accessibility.signals.diffLineModified","Plays a sound / audio cue when the focus moves to an modified line in Accessible Diff Viewer mode or to the next/previous change."),properties:{sound:{description:e("accessibility.signals.diffLineModified.sound","Plays a sound when the focus moves to a modified line in Accessible Diff Viewer mode or to the next/previous change."),...a}}},"accessibility.signals.diffLineDeleted":{...m,description:e("accessibility.signals.diffLineDeleted","Plays a sound / audio cue when the focus moves to an deleted line in Accessible Diff Viewer mode or to the next/previous change."),properties:{sound:{description:e("accessibility.signals.diffLineDeleted.sound","Plays a sound when the focus moves to an deleted line in Accessible Diff Viewer mode or to the next/previous change."),...a}}},"accessibility.signals.notebookCellCompleted":{...l,description:e("accessibility.signals.notebookCellCompleted","Plays a signal - sound (audio cue) and/or announcement (alert) - when a notebook cell execution is successfully completed."),properties:{sound:{description:e("accessibility.signals.notebookCellCompleted.sound","Plays a sound when a notebook cell execution is successfully completed."),...a},announcement:{description:e("accessibility.signals.notebookCellCompleted.announcement","Announces when a notebook cell execution is successfully completed."),...r}}},"accessibility.signals.notebookCellFailed":{...l,description:e("accessibility.signals.notebookCellFailed","Plays a signal - sound (audio cue) and/or announcement (alert) - when a notebook cell execution fails."),properties:{sound:{description:e("accessibility.signals.notebookCellFailed.sound","Plays a sound when a notebook cell execution fails."),...a},announcement:{description:e("accessibility.signals.notebookCellFailed.announcement","Announces when a notebook cell execution fails."),...r}}},"accessibility.signals.chatRequestSent":{...l,description:e("accessibility.signals.chatRequestSent","Plays a signal - sound (audio cue) and/or announcement (alert) - when a chat request is made."),properties:{sound:{description:e("accessibility.signals.chatRequestSent.sound","Plays a sound when a chat request is made."),...a},announcement:{description:e("accessibility.signals.chatRequestSent.announcement","Announces when a chat request is made."),...r}}},"accessibility.signals.progress":{...l,description:e("accessibility.signals.progress","Plays a signal - sound (audio cue) and/or announcement (alert) - on loop while progress is occurring."),properties:{sound:{description:e("accessibility.signals.progress.sound","Plays a sound on loop while progress is occurring."),...a},announcement:{description:e("accessibility.signals.progress.announcement","Alerts on loop while progress is occurring."),...r}}},"accessibility.signals.chatResponseReceived":{...m,description:e("accessibility.signals.chatResponseReceived","Plays a sound / audio cue when the response has been received."),properties:{sound:{description:e("accessibility.signals.chatResponseReceived.sound","Plays a sound on loop while the response has been received."),...a}}},"accessibility.signals.voiceRecordingStarted":{...m,description:e("accessibility.signals.voiceRecordingStarted","Plays a sound / audio cue when the voice recording has started."),properties:{sound:{description:e("accessibility.signals.voiceRecordingStarted.sound","Plays a sound when the voice recording has started."),...a}},default:{sound:"on"}},"accessibility.signals.voiceRecordingStopped":{...m,description:e("accessibility.signals.voiceRecordingStopped","Plays a sound / audio cue when the voice recording has stopped."),properties:{sound:{description:e("accessibility.signals.voiceRecordingStopped.sound","Plays a sound when the voice recording has stopped."),...a,default:"off"}}},"accessibility.signals.clear":{...l,description:e("accessibility.signals.clear","Plays a signal - sound (audio cue) and/or announcement (alert) - when a feature is cleared (for example, the terminal, Debug Console, or Output channel)."),properties:{sound:{description:e("accessibility.signals.clear.sound","Plays a sound when a feature is cleared."),...a},announcement:{description:e("accessibility.signals.clear.announcement","Announces when a feature is cleared."),...r}}},"accessibility.signals.save":{type:"object",tags:["accessibility"],additionalProperties:!1,markdownDescription:e("accessibility.signals.save","Plays a signal - sound (audio cue) and/or announcement (alert) - when a file is saved."),properties:{sound:{description:e("accessibility.signals.save.sound","Plays a sound when a file is saved."),type:"string",enum:["userGesture","always","never"],default:"never",enumDescriptions:[e("accessibility.signals.save.sound.userGesture","Plays the sound when a user explicitly saves a file."),e("accessibility.signals.save.sound.always","Plays the sound whenever a file is saved, including auto save."),e("accessibility.signals.save.sound.never","Never plays the sound.")]},announcement:{description:e("accessibility.signals.save.announcement","Announces when a file is saved."),type:"string",enum:["userGesture","always","never"],default:"never",enumDescriptions:[e("accessibility.signals.save.announcement.userGesture","Announces when a user explicitly saves a file."),e("accessibility.signals.save.announcement.always","Announces whenever a file is saved, including auto save."),e("accessibility.signals.save.announcement.never","Never plays the announcement.")]}},default:{sound:"never",announcement:"never"}},"accessibility.signals.format":{type:"object",tags:["accessibility"],additionalProperties:!1,markdownDescription:e("accessibility.signals.format","Plays a signal - sound (audio cue) and/or announcement (alert) - when a file or notebook is formatted."),properties:{sound:{description:e("accessibility.signals.format.sound","Plays a sound when a file or notebook is formatted."),type:"string",enum:["userGesture","always","never"],default:"never",enumDescriptions:[e("accessibility.signals.format.userGesture","Plays the sound when a user explicitly formats a file."),e("accessibility.signals.format.always","Plays the sound whenever a file is formatted, including if it is set to format on save, type, or, paste, or run of a cell."),e("accessibility.signals.format.never","Never plays the sound.")]},announcement:{description:e("accessibility.signals.format.announcement","Announces when a file or notebook is formatted."),type:"string",enum:["userGesture","always","never"],default:"never",enumDescriptions:[e("accessibility.signals.format.announcement.userGesture","Announces when a user explicitly formats a file."),e("accessibility.signals.format.announcement.always","Announces whenever a file is formatted, including if it is set to format on save, type, or, paste, or run of a cell."),e("accessibility.signals.format.announcement.never","Never announces.")]}},default:{sound:"never",announcement:"never"}},"accessibility.underlineLinks":{type:"boolean",description:e("accessibility.underlineLinks","Controls whether links should be underlined in the workbench."),default:!1},"accessibility.debugWatchVariableAnnouncements":{type:"boolean",description:e("accessibility.debugWatchVariableAnnouncements","Controls whether variable changes should be announced in the debug watch view."),default:!0}}};function ve(){const i=g.as(x.Configuration);i.registerConfiguration(z),i.registerConfiguration({...D,properties:{["accessibility.dimUnfocused.enabled"]:{description:e("dimUnfocusedEnabled","Whether to dim unfocused editors and terminals, which makes it more clear where typed input will go to. This works with the majority of editors with the notable exceptions of those that utilize iframes like notebooks and extension webview editors."),type:"boolean",default:!1,tags:["accessibility"],scope:C.APPLICATION},["accessibility.dimUnfocused.opacity"]:{markdownDescription:e("dimUnfocusedOpacity","The opacity fraction (0.2 to 1.0) to use for unfocused editors and terminals. This will only take effect when {0} is enabled.","`#accessibility.dimUnfocused.enabled#`"),type:"number",minimum:.2,maximum:1,default:.75,tags:["accessibility"],scope:C.APPLICATION},["accessibility.hideAccessibleView"]:{description:e("accessibility.hideAccessibleView","Controls whether the Accessible View is hidden."),type:"boolean",default:!1,tags:["accessibility"]}}})}const B=1200;let w=class extends O{constructor(o,s){super();this.speechService=o;this.productService=s;this._register(F.runAndSubscribe(o.onDidChangeHasSpeechProvider,()=>this.updateConfiguration()))}static ID="workbench.contrib.dynamicSpeechAccessibilityConfiguration";updateConfiguration(){if(!this.speechService.hasSpeechProvider)return;const o=this.getLanguages(),s=Object.keys(o).sort((c,b)=>o[c].name.localeCompare(o[b].name));g.as(x.Configuration).registerConfiguration({...S,properties:{[f.SpeechTimeout]:{markdownDescription:e("voice.speechTimeout","The duration in milliseconds that voice speech recognition remains active after you stop speaking. For example in a chat session, the transcribed text is submitted automatically after the timeout is met. Set to `0` to disable this feature."),type:"number",default:B,minimum:0,tags:["accessibility"]},[f.SpeechLanguage]:{markdownDescription:e("voice.speechLanguage","The language that text-to-speech and speech-to-text should use. Select `auto` to use the configured display language if possible. Note that not all display languages maybe supported by speech recognition and synthesizers."),type:"string",enum:s,default:"auto",tags:["accessibility"],enumDescriptions:s.map(c=>o[c].name),enumItemLabels:s.map(c=>o[c].name)},[f.AutoSynthesize]:{type:"string",enum:["on","off","auto"],enumDescriptions:[e("accessibility.voice.autoSynthesize.on","Enable the feature. When a screen reader is enabled, note that this will disable aria updates."),e("accessibility.voice.autoSynthesize.off","Disable the feature."),e("accessibility.voice.autoSynthesize.auto","When a screen reader is detected, disable the feature. Otherwise, enable the feature.")],markdownDescription:e("autoSynthesize","Whether a textual response should automatically be read out aloud when speech was used as input. For example in a chat session, a response is automatically synthesized when voice was used as chat request."),default:this.productService.quality!=="stable"?"auto":"off",tags:["accessibility"]}}})}getLanguages(){return{auto:{name:e("speechLanguage.auto","Auto (Use Display Language)")},...V}}};w=k([v(0,E),v(1,M)],w),g.as(p.ConfigurationMigration).registerConfigurationMigrations([{key:"audioCues.volume",migrateFn:(i,n)=>[["accessibility.signalOptions.volume",{value:i}],["audioCues.volume",{value:void 0}]]}]),g.as(p.ConfigurationMigration).registerConfigurationMigrations([{key:"audioCues.debouncePositionChanges",migrateFn:i=>[["accessibility.signalOptions.debouncePositionChanges",{value:i}],["audioCues.debouncePositionChanges",{value:void 0}]]}]),g.as(p.ConfigurationMigration).registerConfigurationMigrations([{key:"accessibility.signalOptions",migrateFn:(i,n)=>{const o=P(n,"general"),s=P(n,"errorAtPosition"),t=P(n,"warningAtPosition"),c=N(n),b=W(n),h=[];return c&&h.push(["accessibility.signalOptions.volume",{value:c}]),o&&h.push(["accessibility.signalOptions.experimental.delays.general",{value:o}]),s&&h.push(["accessibility.signalOptions.experimental.delays.errorAtPosition",{value:s}]),t&&h.push(["accessibility.signalOptions.experimental.delays.warningAtPosition",{value:t}]),b&&h.push(["accessibility.signalOptions.debouncePositionChanges",{value:b}]),h.push(["accessibility.signalOptions",{value:void 0}]),h}}]),g.as(p.ConfigurationMigration).registerConfigurationMigrations([{key:"accessibility.signals.sounds.volume",migrateFn:i=>[["accessibility.signalOptions.volume",{value:i}],["accessibility.signals.sounds.volume",{value:void 0}]]}]),g.as(p.ConfigurationMigration).registerConfigurationMigrations([{key:"accessibility.signals.debouncePositionChanges",migrateFn:i=>[["accessibility.signalOptions.debouncePositionChanges",{value:i}],["accessibility.signals.debouncePositionChanges",{value:void 0}]]}]);function P(i,n){return i(`accessibility.signalOptions.experimental.delays.${n}`)||i("accessibility.signalOptions")?.["experimental.delays"]?.[`${n}`]||i("accessibility.signalOptions")?.delays?.[`${n}`]}function N(i){return i("accessibility.signalOptions.volume")||i("accessibility.signalOptions")?.volume||i("accessibility.signals.sounds.volume")||i("audioCues.volume")}function W(i){return i("accessibility.signalOptions.debouncePositionChanges")||i("accessibility.signalOptions")?.debouncePositionChanges||i("accessibility.signals.debouncePositionChanges")||i("audioCues.debouncePositionChanges")}g.as(p.ConfigurationMigration).registerConfigurationMigrations([{key:f.AutoSynthesize,migrateFn:i=>{let n;if(i===!0)n="on";else if(i===!1)n="off";else return[];return[[f.AutoSynthesize,{value:n}]]}}]),g.as(p.ConfigurationMigration).registerConfigurationMigrations([{key:"accessibility.signals.chatResponsePending",migrateFn:(i,n)=>[["accessibility.signals.progress",{value:i}],["accessibility.signals.chatResponsePending",{value:void 0}]]}]),g.as(p.ConfigurationMigration).registerConfigurationMigrations(A.allAccessibilitySignals.map(i=>i.legacySoundSettingsKey?{key:i.legacySoundSettingsKey,migrateFn:(n,o)=>{const s=[],t=i.legacyAnnouncementSettingsKey;let c;return t&&(c=o(t)??void 0,c!==void 0&&typeof c!="string"&&(c=c?"auto":"off")),s.push([`${i.legacySoundSettingsKey}`,{value:void 0}]),s.push([`${i.settingsKey}`,{value:c!==void 0?{announcement:c,sound:n}:{sound:n}}]),s}}:void 0).filter(R)),g.as(p.ConfigurationMigration).registerConfigurationMigrations(A.allAccessibilitySignals.filter(i=>!!i.legacyAnnouncementSettingsKey&&!!i.legacySoundSettingsKey).map(i=>({key:i.legacyAnnouncementSettingsKey,migrateFn:(n,o)=>{const s=[],t=o(i.settingsKey)?.sound||o(i.legacySoundSettingsKey);return n!==void 0&&typeof n!="string"&&(n=n?"auto":"off"),s.push([`${i.settingsKey}`,{value:n!==void 0?{announcement:n,sound:t}:{sound:t}}]),s.push([`${i.legacyAnnouncementSettingsKey}`,{value:void 0}]),s.push([`${i.legacySoundSettingsKey}`,{value:void 0}]),s}})));export{T as AccessibilityVerbositySettingId,f as AccessibilityVoiceSettingId,K as AccessibilityWorkbenchSettingId,w as DynamicSpeechAccessibilityConfiguration,B as SpeechTimeoutDefault,L as ViewDimUnfocusedOpacityProperties,S as accessibilityConfigurationNodeBase,re as accessibilityHelpIsShown,me as accessibleViewContainsCodeBlocks,be as accessibleViewCurrentProviderId,ye as accessibleViewGoToSymbolSupported,we as accessibleViewHasAssignedKeybindings,fe as accessibleViewHasUnassignedKeybindings,he as accessibleViewInCodeBlock,de as accessibleViewIsShown,pe as accessibleViewOnLastLine,ue as accessibleViewSupportsNavigation,ge as accessibleViewVerbosityEnabled,r as announcementFeatureBase,ve as registerAccessibilityConfiguration,a as soundFeatureBase};
