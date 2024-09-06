import{Disposable as s}from"../../../vs/base/common/lifecycle.js";import*as o from"../../../vs/editor/common/viewEvents.js";class u extends s{_shouldRender;constructor(){super(),this._shouldRender=!0}shouldRender(){return this._shouldRender}forceShouldRender(){this._shouldRender=!0}setShouldRender(){this._shouldRender=!0}onDidRender(){this._shouldRender=!1}onCompositionStart(e){return!1}onCompositionEnd(e){return!1}onConfigurationChanged(e){return!1}onCursorStateChanged(e){return!1}onDecorationsChanged(e){return!1}onFlushed(e){return!1}onFocusChanged(e){return!1}onLanguageConfigurationChanged(e){return!1}onLineMappingChanged(e){return!1}onLinesChanged(e){return!1}onLinesDeleted(e){return!1}onLinesInserted(e){return!1}onRevealRangeRequest(e){return!1}onScrollChanged(e){return!1}onThemeChanged(e){return!1}onTokensChanged(e){return!1}onTokensColorsChanged(e){return!1}onZonesChanged(e){return!1}handleEvents(e){let i=!1;for(let t=0,a=e.length;t<a;t++){const n=e[t];switch(n.type){case o.ViewEventType.ViewCompositionStart:this.onCompositionStart(n)&&(i=!0);break;case o.ViewEventType.ViewCompositionEnd:this.onCompositionEnd(n)&&(i=!0);break;case o.ViewEventType.ViewConfigurationChanged:this.onConfigurationChanged(n)&&(i=!0);break;case o.ViewEventType.ViewCursorStateChanged:this.onCursorStateChanged(n)&&(i=!0);break;case o.ViewEventType.ViewDecorationsChanged:this.onDecorationsChanged(n)&&(i=!0);break;case o.ViewEventType.ViewFlushed:this.onFlushed(n)&&(i=!0);break;case o.ViewEventType.ViewFocusChanged:this.onFocusChanged(n)&&(i=!0);break;case o.ViewEventType.ViewLanguageConfigurationChanged:this.onLanguageConfigurationChanged(n)&&(i=!0);break;case o.ViewEventType.ViewLineMappingChanged:this.onLineMappingChanged(n)&&(i=!0);break;case o.ViewEventType.ViewLinesChanged:this.onLinesChanged(n)&&(i=!0);break;case o.ViewEventType.ViewLinesDeleted:this.onLinesDeleted(n)&&(i=!0);break;case o.ViewEventType.ViewLinesInserted:this.onLinesInserted(n)&&(i=!0);break;case o.ViewEventType.ViewRevealRangeRequest:this.onRevealRangeRequest(n)&&(i=!0);break;case o.ViewEventType.ViewScrollChanged:this.onScrollChanged(n)&&(i=!0);break;case o.ViewEventType.ViewTokensChanged:this.onTokensChanged(n)&&(i=!0);break;case o.ViewEventType.ViewThemeChanged:this.onThemeChanged(n)&&(i=!0);break;case o.ViewEventType.ViewTokensColorsChanged:this.onTokensColorsChanged(n)&&(i=!0);break;case o.ViewEventType.ViewZonesChanged:this.onZonesChanged(n)&&(i=!0);break;default:console.info("View received unknown event: "),console.info(n)}}i&&(this._shouldRender=!0)}}export{u as ViewEventHandler};
