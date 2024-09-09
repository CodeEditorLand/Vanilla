var g=Object.defineProperty;var y=Object.getOwnPropertyDescriptor;var f=(i,e,t,o)=>{for(var d=o>1?void 0:o?y(e,t):e,h=i.length-1,p;h>=0;h--)(p=i[h])&&(d=(o?p(e,t,d):p(d))||d);return o&&d&&g(e,t,d),d},u=(i,e)=>(t,o)=>e(t,o,i);import{derived as n,observableFromEvent as S,observableValue as c}from"../../../../base/common/observable.js";import{derivedConstOnceDefined as I}from"../../../../base/common/observableInternal/utils.js";import{Constants as a}from"../../../../base/common/uint.js";import{allowsTrueInlineDiffRendering as R}from"./components/diffEditorViewZones/diffEditorViewZones.js";import"./diffEditorViewModel.js";import{diffEditorDefaultOptions as E}from"../../../common/config/diffEditor.js";import{clampedFloat as _,clampedInt as s,boolean as r,stringSet as m}from"../../../common/config/editorOptions.js";import"../../../common/diff/rangeMapping.js";import{IAccessibilityService as v}from"../../../../platform/accessibility/common/accessibility.js";let l=class{constructor(e,t){this._accessibilityService=t;const o={...e,...b(e,E)};this._options=c(this,o)}_options;get editorOptions(){return this._options}_diffEditorWidth=c(this,0);_screenReaderMode=S(this,this._accessibilityService.onDidChangeScreenReaderOptimized,()=>this._accessibilityService.isScreenReaderOptimized());couldShowInlineViewBecauseOfSize=n(this,e=>this._options.read(e).renderSideBySide&&this._diffEditorWidth.read(e)<=this._options.read(e).renderSideBySideInlineBreakpoint);renderOverviewRuler=n(this,e=>this._options.read(e).renderOverviewRuler);renderSideBySide=n(this,e=>this.compactMode.read(e)&&this.shouldRenderInlineViewInSmartMode.read(e)?!1:this._options.read(e).renderSideBySide&&!(this._options.read(e).useInlineViewWhenSpaceIsLimited&&this.couldShowInlineViewBecauseOfSize.read(e)&&!this._screenReaderMode.read(e)));readOnly=n(this,e=>this._options.read(e).readOnly);shouldRenderOldRevertArrows=n(this,e=>!(!this._options.read(e).renderMarginRevertIcon||!this.renderSideBySide.read(e)||this.readOnly.read(e)||this.shouldRenderGutterMenu.read(e)));shouldRenderGutterMenu=n(this,e=>this._options.read(e).renderGutterMenu);renderIndicators=n(this,e=>this._options.read(e).renderIndicators);enableSplitViewResizing=n(this,e=>this._options.read(e).enableSplitViewResizing);splitViewDefaultRatio=n(this,e=>this._options.read(e).splitViewDefaultRatio);ignoreTrimWhitespace=n(this,e=>this._options.read(e).ignoreTrimWhitespace);maxComputationTimeMs=n(this,e=>this._options.read(e).maxComputationTime);showMoves=n(this,e=>this._options.read(e).experimental.showMoves&&this.renderSideBySide.read(e));isInEmbeddedEditor=n(this,e=>this._options.read(e).isInEmbeddedEditor);diffWordWrap=n(this,e=>this._options.read(e).diffWordWrap);originalEditable=n(this,e=>this._options.read(e).originalEditable);diffCodeLens=n(this,e=>this._options.read(e).diffCodeLens);accessibilityVerbose=n(this,e=>this._options.read(e).accessibilityVerbose);diffAlgorithm=n(this,e=>this._options.read(e).diffAlgorithm);showEmptyDecorations=n(this,e=>this._options.read(e).experimental.showEmptyDecorations);onlyShowAccessibleDiffViewer=n(this,e=>this._options.read(e).onlyShowAccessibleDiffViewer);compactMode=n(this,e=>this._options.read(e).compactMode);trueInlineDiffRenderingEnabled=n(this,e=>this._options.read(e).experimental.useTrueInlineView);useTrueInlineDiffRendering=n(this,e=>!this.renderSideBySide.read(e)&&this.trueInlineDiffRenderingEnabled.read(e));hideUnchangedRegions=n(this,e=>this._options.read(e).hideUnchangedRegions.enabled);hideUnchangedRegionsRevealLineCount=n(this,e=>this._options.read(e).hideUnchangedRegions.revealLineCount);hideUnchangedRegionsContextLineCount=n(this,e=>this._options.read(e).hideUnchangedRegions.contextLineCount);hideUnchangedRegionsMinimumLineCount=n(this,e=>this._options.read(e).hideUnchangedRegions.minimumLineCount);updateOptions(e){const t=b(e,this._options.get()),o={...this._options.get(),...e,...t};this._options.set(o,void 0,{changedOptions:e})}setWidth(e){this._diffEditorWidth.set(e,void 0)}_model=c(this,void 0);setModel(e){this._model.set(e,void 0)}shouldRenderInlineViewInSmartMode=this._model.map(this,e=>I(this,t=>{const o=e?.diff.read(t);return o?w(o,this.trueInlineDiffRenderingEnabled.read(t)):void 0})).flatten().map(this,e=>!!e);inlineViewHideOriginalLineNumbers=this.compactMode};l=f([u(1,v)],l);function w(i,e){return i.mappings.every(t=>M(t.lineRangeMapping)||O(t.lineRangeMapping)||e&&R(t.lineRangeMapping))}function M(i){return i.original.length===0}function O(i){return i.modified.length===0}function b(i,e){return{enableSplitViewResizing:r(i.enableSplitViewResizing,e.enableSplitViewResizing),splitViewDefaultRatio:_(i.splitViewDefaultRatio,.5,.1,.9),renderSideBySide:r(i.renderSideBySide,e.renderSideBySide),renderMarginRevertIcon:r(i.renderMarginRevertIcon,e.renderMarginRevertIcon),maxComputationTime:s(i.maxComputationTime,e.maxComputationTime,0,a.MAX_SAFE_SMALL_INTEGER),maxFileSize:s(i.maxFileSize,e.maxFileSize,0,a.MAX_SAFE_SMALL_INTEGER),ignoreTrimWhitespace:r(i.ignoreTrimWhitespace,e.ignoreTrimWhitespace),renderIndicators:r(i.renderIndicators,e.renderIndicators),originalEditable:r(i.originalEditable,e.originalEditable),diffCodeLens:r(i.diffCodeLens,e.diffCodeLens),renderOverviewRuler:r(i.renderOverviewRuler,e.renderOverviewRuler),diffWordWrap:m(i.diffWordWrap,e.diffWordWrap,["off","on","inherit"]),diffAlgorithm:m(i.diffAlgorithm,e.diffAlgorithm,["legacy","advanced"],{smart:"legacy",experimental:"advanced"}),accessibilityVerbose:r(i.accessibilityVerbose,e.accessibilityVerbose),experimental:{showMoves:r(i.experimental?.showMoves,e.experimental.showMoves),showEmptyDecorations:r(i.experimental?.showEmptyDecorations,e.experimental.showEmptyDecorations),useTrueInlineView:r(i.experimental?.useTrueInlineView,e.experimental.useTrueInlineView)},hideUnchangedRegions:{enabled:r(i.hideUnchangedRegions?.enabled??i.experimental?.collapseUnchangedRegions,e.hideUnchangedRegions.enabled),contextLineCount:s(i.hideUnchangedRegions?.contextLineCount,e.hideUnchangedRegions.contextLineCount,0,a.MAX_SAFE_SMALL_INTEGER),minimumLineCount:s(i.hideUnchangedRegions?.minimumLineCount,e.hideUnchangedRegions.minimumLineCount,0,a.MAX_SAFE_SMALL_INTEGER),revealLineCount:s(i.hideUnchangedRegions?.revealLineCount,e.hideUnchangedRegions.revealLineCount,0,a.MAX_SAFE_SMALL_INTEGER)},isInEmbeddedEditor:r(i.isInEmbeddedEditor,e.isInEmbeddedEditor),onlyShowAccessibleDiffViewer:r(i.onlyShowAccessibleDiffViewer,e.onlyShowAccessibleDiffViewer),renderSideBySideInlineBreakpoint:s(i.renderSideBySideInlineBreakpoint,e.renderSideBySideInlineBreakpoint,0,a.MAX_SAFE_SMALL_INTEGER),useInlineViewWhenSpaceIsLimited:r(i.useInlineViewWhenSpaceIsLimited,e.useInlineViewWhenSpaceIsLimited),renderGutterMenu:r(i.renderGutterMenu,e.renderGutterMenu),compactMode:r(i.compactMode,e.compactMode)}}export{l as DiffEditorOptions};
