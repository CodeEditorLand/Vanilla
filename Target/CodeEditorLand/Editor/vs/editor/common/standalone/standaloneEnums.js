var L=(F=>(F[F.Unknown=0]="Unknown",F[F.Disabled=1]="Disabled",F[F.Enabled=2]="Enabled",F))(L||{}),s=(N=>(N[N.Invoke=1]="Invoke",N[N.Auto=2]="Auto",N))(s||{}),W=(F=>(F[F.None=0]="None",F[F.KeepWhitespace=1]="KeepWhitespace",F[F.InsertAsSnippet=4]="InsertAsSnippet",F))(W||{}),G=(h=>(h[h.Method=0]="Method",h[h.Function=1]="Function",h[h.Constructor=2]="Constructor",h[h.Field=3]="Field",h[h.Variable=4]="Variable",h[h.Class=5]="Class",h[h.Struct=6]="Struct",h[h.Interface=7]="Interface",h[h.Module=8]="Module",h[h.Property=9]="Property",h[h.Event=10]="Event",h[h.Operator=11]="Operator",h[h.Unit=12]="Unit",h[h.Value=13]="Value",h[h.Constant=14]="Constant",h[h.Enum=15]="Enum",h[h.EnumMember=16]="EnumMember",h[h.Keyword=17]="Keyword",h[h.Text=18]="Text",h[h.Color=19]="Color",h[h.File=20]="File",h[h.Reference=21]="Reference",h[h.Customcolor=22]="Customcolor",h[h.Folder=23]="Folder",h[h.TypeParameter=24]="TypeParameter",h[h.User=25]="User",h[h.Issue=26]="Issue",h[h.Snippet=27]="Snippet",h))(G||{}),V=(c=>(c[c.Deprecated=1]="Deprecated",c))(V||{}),z=(F=>(F[F.Invoke=0]="Invoke",F[F.TriggerCharacter=1]="TriggerCharacter",F[F.TriggerForIncompleteCompletions=2]="TriggerForIncompleteCompletions",F))(z||{}),X=(F=>(F[F.EXACT=0]="EXACT",F[F.ABOVE=1]="ABOVE",F[F.BELOW=2]="BELOW",F))(X||{}),Y=(U=>(U[U.NotSet=0]="NotSet",U[U.ContentFlush=1]="ContentFlush",U[U.RecoverFromMarkers=2]="RecoverFromMarkers",U[U.Explicit=3]="Explicit",U[U.Paste=4]="Paste",U[U.Undo=5]="Undo",U[U.Redo=6]="Redo",U))(Y||{}),k=(N=>(N[N.LF=1]="LF",N[N.CRLF=2]="CRLF",N))(k||{}),Z=(F=>(F[F.Text=0]="Text",F[F.Read=1]="Read",F[F.Write=2]="Write",F))(Z||{}),Q=(_=>(_[_.None=0]="None",_[_.Keep=1]="Keep",_[_.Brackets=2]="Brackets",_[_.Advanced=3]="Advanced",_[_.Full=4]="Full",_))(Q||{}),q=(u=>(u[u.acceptSuggestionOnCommitCharacter=0]="acceptSuggestionOnCommitCharacter",u[u.acceptSuggestionOnEnter=1]="acceptSuggestionOnEnter",u[u.accessibilitySupport=2]="accessibilitySupport",u[u.accessibilityPageSize=3]="accessibilityPageSize",u[u.ariaLabel=4]="ariaLabel",u[u.ariaRequired=5]="ariaRequired",u[u.autoClosingBrackets=6]="autoClosingBrackets",u[u.autoClosingComments=7]="autoClosingComments",u[u.screenReaderAnnounceInlineSuggestion=8]="screenReaderAnnounceInlineSuggestion",u[u.autoClosingDelete=9]="autoClosingDelete",u[u.autoClosingOvertype=10]="autoClosingOvertype",u[u.autoClosingQuotes=11]="autoClosingQuotes",u[u.autoIndent=12]="autoIndent",u[u.automaticLayout=13]="automaticLayout",u[u.autoSurround=14]="autoSurround",u[u.bracketPairColorization=15]="bracketPairColorization",u[u.guides=16]="guides",u[u.codeLens=17]="codeLens",u[u.codeLensFontFamily=18]="codeLensFontFamily",u[u.codeLensFontSize=19]="codeLensFontSize",u[u.colorDecorators=20]="colorDecorators",u[u.colorDecoratorsLimit=21]="colorDecoratorsLimit",u[u.columnSelection=22]="columnSelection",u[u.comments=23]="comments",u[u.contextmenu=24]="contextmenu",u[u.copyWithSyntaxHighlighting=25]="copyWithSyntaxHighlighting",u[u.cursorBlinking=26]="cursorBlinking",u[u.cursorSmoothCaretAnimation=27]="cursorSmoothCaretAnimation",u[u.cursorStyle=28]="cursorStyle",u[u.cursorSurroundingLines=29]="cursorSurroundingLines",u[u.cursorSurroundingLinesStyle=30]="cursorSurroundingLinesStyle",u[u.cursorWidth=31]="cursorWidth",u[u.disableLayerHinting=32]="disableLayerHinting",u[u.disableMonospaceOptimizations=33]="disableMonospaceOptimizations",u[u.domReadOnly=34]="domReadOnly",u[u.dragAndDrop=35]="dragAndDrop",u[u.dropIntoEditor=36]="dropIntoEditor",u[u.experimentalEditContextEnabled=37]="experimentalEditContextEnabled",u[u.emptySelectionClipboard=38]="emptySelectionClipboard",u[u.experimentalWhitespaceRendering=39]="experimentalWhitespaceRendering",u[u.extraEditorClassName=40]="extraEditorClassName",u[u.fastScrollSensitivity=41]="fastScrollSensitivity",u[u.find=42]="find",u[u.fixedOverflowWidgets=43]="fixedOverflowWidgets",u[u.folding=44]="folding",u[u.foldingStrategy=45]="foldingStrategy",u[u.foldingHighlight=46]="foldingHighlight",u[u.foldingImportsByDefault=47]="foldingImportsByDefault",u[u.foldingMaximumRegions=48]="foldingMaximumRegions",u[u.unfoldOnClickAfterEndOfLine=49]="unfoldOnClickAfterEndOfLine",u[u.fontFamily=50]="fontFamily",u[u.fontInfo=51]="fontInfo",u[u.fontLigatures=52]="fontLigatures",u[u.fontSize=53]="fontSize",u[u.fontWeight=54]="fontWeight",u[u.fontVariations=55]="fontVariations",u[u.formatOnPaste=56]="formatOnPaste",u[u.formatOnType=57]="formatOnType",u[u.glyphMargin=58]="glyphMargin",u[u.gotoLocation=59]="gotoLocation",u[u.hideCursorInOverviewRuler=60]="hideCursorInOverviewRuler",u[u.hover=61]="hover",u[u.inDiffEditor=62]="inDiffEditor",u[u.inlineSuggest=63]="inlineSuggest",u[u.inlineEdit=64]="inlineEdit",u[u.letterSpacing=65]="letterSpacing",u[u.lightbulb=66]="lightbulb",u[u.lineDecorationsWidth=67]="lineDecorationsWidth",u[u.lineHeight=68]="lineHeight",u[u.lineNumbers=69]="lineNumbers",u[u.lineNumbersMinChars=70]="lineNumbersMinChars",u[u.linkedEditing=71]="linkedEditing",u[u.links=72]="links",u[u.matchBrackets=73]="matchBrackets",u[u.minimap=74]="minimap",u[u.mouseStyle=75]="mouseStyle",u[u.mouseWheelScrollSensitivity=76]="mouseWheelScrollSensitivity",u[u.mouseWheelZoom=77]="mouseWheelZoom",u[u.multiCursorMergeOverlapping=78]="multiCursorMergeOverlapping",u[u.multiCursorModifier=79]="multiCursorModifier",u[u.multiCursorPaste=80]="multiCursorPaste",u[u.multiCursorLimit=81]="multiCursorLimit",u[u.occurrencesHighlight=82]="occurrencesHighlight",u[u.overviewRulerBorder=83]="overviewRulerBorder",u[u.overviewRulerLanes=84]="overviewRulerLanes",u[u.padding=85]="padding",u[u.pasteAs=86]="pasteAs",u[u.parameterHints=87]="parameterHints",u[u.peekWidgetDefaultFocus=88]="peekWidgetDefaultFocus",u[u.placeholder=89]="placeholder",u[u.definitionLinkOpensInPeek=90]="definitionLinkOpensInPeek",u[u.quickSuggestions=91]="quickSuggestions",u[u.quickSuggestionsDelay=92]="quickSuggestionsDelay",u[u.readOnly=93]="readOnly",u[u.readOnlyMessage=94]="readOnlyMessage",u[u.renameOnType=95]="renameOnType",u[u.renderControlCharacters=96]="renderControlCharacters",u[u.renderFinalNewline=97]="renderFinalNewline",u[u.renderLineHighlight=98]="renderLineHighlight",u[u.renderLineHighlightOnlyWhenFocus=99]="renderLineHighlightOnlyWhenFocus",u[u.renderValidationDecorations=100]="renderValidationDecorations",u[u.renderWhitespace=101]="renderWhitespace",u[u.revealHorizontalRightPadding=102]="revealHorizontalRightPadding",u[u.roundedSelection=103]="roundedSelection",u[u.rulers=104]="rulers",u[u.scrollbar=105]="scrollbar",u[u.scrollBeyondLastColumn=106]="scrollBeyondLastColumn",u[u.scrollBeyondLastLine=107]="scrollBeyondLastLine",u[u.scrollPredominantAxis=108]="scrollPredominantAxis",u[u.selectionClipboard=109]="selectionClipboard",u[u.selectionHighlight=110]="selectionHighlight",u[u.selectOnLineNumbers=111]="selectOnLineNumbers",u[u.showFoldingControls=112]="showFoldingControls",u[u.showUnused=113]="showUnused",u[u.snippetSuggestions=114]="snippetSuggestions",u[u.smartSelect=115]="smartSelect",u[u.smoothScrolling=116]="smoothScrolling",u[u.stickyScroll=117]="stickyScroll",u[u.stickyTabStops=118]="stickyTabStops",u[u.stopRenderingLineAfter=119]="stopRenderingLineAfter",u[u.suggest=120]="suggest",u[u.suggestFontSize=121]="suggestFontSize",u[u.suggestLineHeight=122]="suggestLineHeight",u[u.suggestOnTriggerCharacters=123]="suggestOnTriggerCharacters",u[u.suggestSelection=124]="suggestSelection",u[u.tabCompletion=125]="tabCompletion",u[u.tabIndex=126]="tabIndex",u[u.unicodeHighlighting=127]="unicodeHighlighting",u[u.unusualLineTerminators=128]="unusualLineTerminators",u[u.useShadowDOM=129]="useShadowDOM",u[u.useTabStops=130]="useTabStops",u[u.wordBreak=131]="wordBreak",u[u.wordSegmenterLocales=132]="wordSegmenterLocales",u[u.wordSeparators=133]="wordSeparators",u[u.wordWrap=134]="wordWrap",u[u.wordWrapBreakAfterCharacters=135]="wordWrapBreakAfterCharacters",u[u.wordWrapBreakBeforeCharacters=136]="wordWrapBreakBeforeCharacters",u[u.wordWrapColumn=137]="wordWrapColumn",u[u.wordWrapOverride1=138]="wordWrapOverride1",u[u.wordWrapOverride2=139]="wordWrapOverride2",u[u.wrappingIndent=140]="wrappingIndent",u[u.wrappingStrategy=141]="wrappingStrategy",u[u.showDeprecated=142]="showDeprecated",u[u.inlayHints=143]="inlayHints",u[u.editorClassName=144]="editorClassName",u[u.pixelRatio=145]="pixelRatio",u[u.tabFocusMode=146]="tabFocusMode",u[u.layoutInfo=147]="layoutInfo",u[u.wrappingInfo=148]="wrappingInfo",u[u.defaultColorDecorators=149]="defaultColorDecorators",u[u.colorDecoratorsActivatedOn=150]="colorDecoratorsActivatedOn",u[u.inlineCompletionsAccessibilityVerbose=151]="inlineCompletionsAccessibilityVerbose",u))(q||{}),A=(F=>(F[F.TextDefined=0]="TextDefined",F[F.LF=1]="LF",F[F.CRLF=2]="CRLF",F))(A||{}),J=(N=>(N[N.LF=0]="LF",N[N.CRLF=1]="CRLF",N))(J||{}),R=(F=>(F[F.Left=1]="Left",F[F.Center=2]="Center",F[F.Right=3]="Right",F))(R||{}),f=(N=>(N[N.Increase=0]="Increase",N[N.Decrease=1]="Decrease",N))(f||{}),$=(D=>(D[D.None=0]="None",D[D.Indent=1]="Indent",D[D.IndentOutdent=2]="IndentOutdent",D[D.Outdent=3]="Outdent",D))($||{}),H=(D=>(D[D.Both=0]="Both",D[D.Right=1]="Right",D[D.Left=2]="Left",D[D.None=3]="None",D))(H||{}),v=(N=>(N[N.Type=1]="Type",N[N.Parameter=2]="Parameter",N))(v||{}),j=(N=>(N[N.Automatic=0]="Automatic",N[N.Explicit=1]="Explicit",N))(j||{}),P=(N=>(N[N.Invoke=0]="Invoke",N[N.Automatic=1]="Automatic",N))(P||{}),M=(a=>(a[a.DependsOnKbLayout=-1]="DependsOnKbLayout",a[a.Unknown=0]="Unknown",a[a.Backspace=1]="Backspace",a[a.Tab=2]="Tab",a[a.Enter=3]="Enter",a[a.Shift=4]="Shift",a[a.Ctrl=5]="Ctrl",a[a.Alt=6]="Alt",a[a.PauseBreak=7]="PauseBreak",a[a.CapsLock=8]="CapsLock",a[a.Escape=9]="Escape",a[a.Space=10]="Space",a[a.PageUp=11]="PageUp",a[a.PageDown=12]="PageDown",a[a.End=13]="End",a[a.Home=14]="Home",a[a.LeftArrow=15]="LeftArrow",a[a.UpArrow=16]="UpArrow",a[a.RightArrow=17]="RightArrow",a[a.DownArrow=18]="DownArrow",a[a.Insert=19]="Insert",a[a.Delete=20]="Delete",a[a.Digit0=21]="Digit0",a[a.Digit1=22]="Digit1",a[a.Digit2=23]="Digit2",a[a.Digit3=24]="Digit3",a[a.Digit4=25]="Digit4",a[a.Digit5=26]="Digit5",a[a.Digit6=27]="Digit6",a[a.Digit7=28]="Digit7",a[a.Digit8=29]="Digit8",a[a.Digit9=30]="Digit9",a[a.KeyA=31]="KeyA",a[a.KeyB=32]="KeyB",a[a.KeyC=33]="KeyC",a[a.KeyD=34]="KeyD",a[a.KeyE=35]="KeyE",a[a.KeyF=36]="KeyF",a[a.KeyG=37]="KeyG",a[a.KeyH=38]="KeyH",a[a.KeyI=39]="KeyI",a[a.KeyJ=40]="KeyJ",a[a.KeyK=41]="KeyK",a[a.KeyL=42]="KeyL",a[a.KeyM=43]="KeyM",a[a.KeyN=44]="KeyN",a[a.KeyO=45]="KeyO",a[a.KeyP=46]="KeyP",a[a.KeyQ=47]="KeyQ",a[a.KeyR=48]="KeyR",a[a.KeyS=49]="KeyS",a[a.KeyT=50]="KeyT",a[a.KeyU=51]="KeyU",a[a.KeyV=52]="KeyV",a[a.KeyW=53]="KeyW",a[a.KeyX=54]="KeyX",a[a.KeyY=55]="KeyY",a[a.KeyZ=56]="KeyZ",a[a.Meta=57]="Meta",a[a.ContextMenu=58]="ContextMenu",a[a.F1=59]="F1",a[a.F2=60]="F2",a[a.F3=61]="F3",a[a.F4=62]="F4",a[a.F5=63]="F5",a[a.F6=64]="F6",a[a.F7=65]="F7",a[a.F8=66]="F8",a[a.F9=67]="F9",a[a.F10=68]="F10",a[a.F11=69]="F11",a[a.F12=70]="F12",a[a.F13=71]="F13",a[a.F14=72]="F14",a[a.F15=73]="F15",a[a.F16=74]="F16",a[a.F17=75]="F17",a[a.F18=76]="F18",a[a.F19=77]="F19",a[a.F20=78]="F20",a[a.F21=79]="F21",a[a.F22=80]="F22",a[a.F23=81]="F23",a[a.F24=82]="F24",a[a.NumLock=83]="NumLock",a[a.ScrollLock=84]="ScrollLock",a[a.Semicolon=85]="Semicolon",a[a.Equal=86]="Equal",a[a.Comma=87]="Comma",a[a.Minus=88]="Minus",a[a.Period=89]="Period",a[a.Slash=90]="Slash",a[a.Backquote=91]="Backquote",a[a.BracketLeft=92]="BracketLeft",a[a.Backslash=93]="Backslash",a[a.BracketRight=94]="BracketRight",a[a.Quote=95]="Quote",a[a.OEM_8=96]="OEM_8",a[a.IntlBackslash=97]="IntlBackslash",a[a.Numpad0=98]="Numpad0",a[a.Numpad1=99]="Numpad1",a[a.Numpad2=100]="Numpad2",a[a.Numpad3=101]="Numpad3",a[a.Numpad4=102]="Numpad4",a[a.Numpad5=103]="Numpad5",a[a.Numpad6=104]="Numpad6",a[a.Numpad7=105]="Numpad7",a[a.Numpad8=106]="Numpad8",a[a.Numpad9=107]="Numpad9",a[a.NumpadMultiply=108]="NumpadMultiply",a[a.NumpadAdd=109]="NumpadAdd",a[a.NUMPAD_SEPARATOR=110]="NUMPAD_SEPARATOR",a[a.NumpadSubtract=111]="NumpadSubtract",a[a.NumpadDecimal=112]="NumpadDecimal",a[a.NumpadDivide=113]="NumpadDivide",a[a.KEY_IN_COMPOSITION=114]="KEY_IN_COMPOSITION",a[a.ABNT_C1=115]="ABNT_C1",a[a.ABNT_C2=116]="ABNT_C2",a[a.AudioVolumeMute=117]="AudioVolumeMute",a[a.AudioVolumeUp=118]="AudioVolumeUp",a[a.AudioVolumeDown=119]="AudioVolumeDown",a[a.BrowserSearch=120]="BrowserSearch",a[a.BrowserHome=121]="BrowserHome",a[a.BrowserBack=122]="BrowserBack",a[a.BrowserForward=123]="BrowserForward",a[a.MediaTrackNext=124]="MediaTrackNext",a[a.MediaTrackPrevious=125]="MediaTrackPrevious",a[a.MediaStop=126]="MediaStop",a[a.MediaPlayPause=127]="MediaPlayPause",a[a.LaunchMediaPlayer=128]="LaunchMediaPlayer",a[a.LaunchMail=129]="LaunchMail",a[a.LaunchApp2=130]="LaunchApp2",a[a.Clear=131]="Clear",a[a.MAX_VALUE=132]="MAX_VALUE",a))(M||{}),b=(D=>(D[D.Hint=1]="Hint",D[D.Info=2]="Info",D[D.Warning=4]="Warning",D[D.Error=8]="Error",D))(b||{}),I=(N=>(N[N.Unnecessary=1]="Unnecessary",N[N.Deprecated=2]="Deprecated",N))(I||{}),g=(N=>(N[N.Inline=1]="Inline",N[N.Gutter=2]="Gutter",N))(g||{}),l=(N=>(N[N.Normal=1]="Normal",N[N.Underlined=2]="Underlined",N))(l||{}),m=(B=>(B[B.UNKNOWN=0]="UNKNOWN",B[B.TEXTAREA=1]="TEXTAREA",B[B.GUTTER_GLYPH_MARGIN=2]="GUTTER_GLYPH_MARGIN",B[B.GUTTER_LINE_NUMBERS=3]="GUTTER_LINE_NUMBERS",B[B.GUTTER_LINE_DECORATIONS=4]="GUTTER_LINE_DECORATIONS",B[B.GUTTER_VIEW_ZONE=5]="GUTTER_VIEW_ZONE",B[B.CONTENT_TEXT=6]="CONTENT_TEXT",B[B.CONTENT_EMPTY=7]="CONTENT_EMPTY",B[B.CONTENT_VIEW_ZONE=8]="CONTENT_VIEW_ZONE",B[B.CONTENT_WIDGET=9]="CONTENT_WIDGET",B[B.OVERVIEW_RULER=10]="OVERVIEW_RULER",B[B.SCROLLBAR=11]="SCROLLBAR",B[B.OVERLAY_WIDGET=12]="OVERLAY_WIDGET",B[B.OUTSIDE_EDITOR=13]="OUTSIDE_EDITOR",B))(m||{}),S=(c=>(c[c.AIGenerated=1]="AIGenerated",c))(S||{}),T=(N=>(N[N.Invoke=0]="Invoke",N[N.Automatic=1]="Automatic",N))(T||{}),O=(F=>(F[F.TOP_RIGHT_CORNER=0]="TOP_RIGHT_CORNER",F[F.BOTTOM_RIGHT_CORNER=1]="BOTTOM_RIGHT_CORNER",F[F.TOP_CENTER=2]="TOP_CENTER",F))(O||{}),E=(D=>(D[D.Left=1]="Left",D[D.Center=2]="Center",D[D.Right=4]="Right",D[D.Full=7]="Full",D))(E||{}),p=(F=>(F[F.Word=0]="Word",F[F.Line=1]="Line",F[F.Suggest=2]="Suggest",F))(p||{}),C=(_=>(_[_.Left=0]="Left",_[_.Right=1]="Right",_[_.None=2]="None",_[_.LeftOfInjectedText=3]="LeftOfInjectedText",_[_.RightOfInjectedText=4]="RightOfInjectedText",_))(C||{}),K=(_=>(_[_.Off=0]="Off",_[_.On=1]="On",_[_.Relative=2]="Relative",_[_.Interval=3]="Interval",_[_.Custom=4]="Custom",_))(K||{}),y=(F=>(F[F.None=0]="None",F[F.Text=1]="Text",F[F.Blocks=2]="Blocks",F))(y||{}),r=(N=>(N[N.Smooth=0]="Smooth",N[N.Immediate=1]="Immediate",N))(r||{}),n=(F=>(F[F.Auto=1]="Auto",F[F.Hidden=2]="Hidden",F[F.Visible=3]="Visible",F))(n||{}),d=(N=>(N[N.LTR=0]="LTR",N[N.RTL=1]="RTL",N))(d||{}),e=(F=>(F.Off="off",F.OnCode="onCode",F.On="on",F))(e||{}),t=(F=>(F[F.Invoke=1]="Invoke",F[F.TriggerCharacter=2]="TriggerCharacter",F[F.ContentChange=3]="ContentChange",F))(t||{}),i=(x=>(x[x.File=0]="File",x[x.Module=1]="Module",x[x.Namespace=2]="Namespace",x[x.Package=3]="Package",x[x.Class=4]="Class",x[x.Method=5]="Method",x[x.Property=6]="Property",x[x.Field=7]="Field",x[x.Constructor=8]="Constructor",x[x.Enum=9]="Enum",x[x.Interface=10]="Interface",x[x.Function=11]="Function",x[x.Variable=12]="Variable",x[x.Constant=13]="Constant",x[x.String=14]="String",x[x.Number=15]="Number",x[x.Boolean=16]="Boolean",x[x.Array=17]="Array",x[x.Object=18]="Object",x[x.Key=19]="Key",x[x.Null=20]="Null",x[x.EnumMember=21]="EnumMember",x[x.Struct=22]="Struct",x[x.Event=23]="Event",x[x.Operator=24]="Operator",x[x.TypeParameter=25]="TypeParameter",x))(i||{}),o=(c=>(c[c.Deprecated=1]="Deprecated",c))(o||{}),u1=(w=>(w[w.Hidden=0]="Hidden",w[w.Blink=1]="Blink",w[w.Smooth=2]="Smooth",w[w.Phase=3]="Phase",w[w.Expand=4]="Expand",w[w.Solid=5]="Solid",w))(u1||{}),a1=(w=>(w[w.Line=1]="Line",w[w.Block=2]="Block",w[w.Underline=3]="Underline",w[w.LineThin=4]="LineThin",w[w.BlockOutline=5]="BlockOutline",w[w.UnderlineThin=6]="UnderlineThin",w))(a1||{}),F1=(D=>(D[D.AlwaysGrowsWhenTypingAtEdges=0]="AlwaysGrowsWhenTypingAtEdges",D[D.NeverGrowsWhenTypingAtEdges=1]="NeverGrowsWhenTypingAtEdges",D[D.GrowsOnlyWhenTypingBefore=2]="GrowsOnlyWhenTypingBefore",D[D.GrowsOnlyWhenTypingAfter=3]="GrowsOnlyWhenTypingAfter",D))(F1||{}),N1=(D=>(D[D.None=0]="None",D[D.Same=1]="Same",D[D.Indent=2]="Indent",D[D.DeepIndent=3]="DeepIndent",D))(N1||{});export{L as AccessibilitySupport,s as CodeActionTriggerType,W as CompletionItemInsertTextRule,G as CompletionItemKind,V as CompletionItemTag,z as CompletionTriggerKind,X as ContentWidgetPositionPreference,Y as CursorChangeReason,k as DefaultEndOfLine,Z as DocumentHighlightKind,Q as EditorAutoIndentStrategy,q as EditorOption,A as EndOfLinePreference,J as EndOfLineSequence,R as GlyphMarginLane,f as HoverVerbosityAction,$ as IndentAction,H as InjectedTextCursorStops,v as InlayHintKind,j as InlineCompletionTriggerKind,P as InlineEditTriggerKind,M as KeyCode,b as MarkerSeverity,I as MarkerTag,g as MinimapPosition,l as MinimapSectionHeaderStyle,m as MouseTargetType,S as NewSymbolNameTag,T as NewSymbolNameTriggerKind,O as OverlayWidgetPositionPreference,E as OverviewRulerLane,p as PartialAcceptTriggerKind,C as PositionAffinity,K as RenderLineNumbersType,y as RenderMinimap,r as ScrollType,n as ScrollbarVisibility,d as SelectionDirection,e as ShowLightbulbIconMode,t as SignatureHelpTriggerKind,i as SymbolKind,o as SymbolTag,u1 as TextEditorCursorBlinkingStyle,a1 as TextEditorCursorStyle,F1 as TrackedRangeStickiness,N1 as WrappingIndent};
