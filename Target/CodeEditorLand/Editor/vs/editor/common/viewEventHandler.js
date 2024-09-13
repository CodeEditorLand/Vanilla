import{Disposable as s}from"../../base/common/lifecycle.js";import*as o from"./viewEvents.js";class u extends s{_shouldRender;constructor(){super(),this._shouldRender=!0}shouldRender(){return this._shouldRender}forceShouldRender(){this._shouldRender=!0}setShouldRender(){this._shouldRender=!0}onDidRender(){this._shouldRender=!1}onCompositionStart(e){return!1}onCompositionEnd(e){return!1}onConfigurationChanged(e){return!1}onCursorStateChanged(e){return!1}onDecorationsChanged(e){return!1}onFlushed(e){return!1}onFocusChanged(e){return!1}onLanguageConfigurationChanged(e){return!1}onLineMappingChanged(e){return!1}onLinesChanged(e){return!1}onLinesDeleted(e){return!1}onLinesInserted(e){return!1}onRevealRangeRequest(e){return!1}onScrollChanged(e){return!1}onThemeChanged(e){return!1}onTokensChanged(e){return!1}onTokensColorsChanged(e){return!1}onZonesChanged(e){return!1}handleEvents(e){let n=!1;for(let t=0,a=e.length;t<a;t++){const i=e[t];switch(i.type){case o.ViewEventType.ViewCompositionStart:this.onCompositionStart(i)&&(n=!0);break;case o.ViewEventType.ViewCompositionEnd:this.onCompositionEnd(i)&&(n=!0);break;case o.ViewEventType.ViewConfigurationChanged:this.onConfigurationChanged(i)&&(n=!0);break;case o.ViewEventType.ViewCursorStateChanged:this.onCursorStateChanged(i)&&(n=!0);break;case o.ViewEventType.ViewDecorationsChanged:this.onDecorationsChanged(i)&&(n=!0);break;case o.ViewEventType.ViewFlushed:this.onFlushed(i)&&(n=!0);break;case o.ViewEventType.ViewFocusChanged:this.onFocusChanged(i)&&(n=!0);break;case o.ViewEventType.ViewLanguageConfigurationChanged:this.onLanguageConfigurationChanged(i)&&(n=!0);break;case o.ViewEventType.ViewLineMappingChanged:this.onLineMappingChanged(i)&&(n=!0);break;case o.ViewEventType.ViewLinesChanged:this.onLinesChanged(i)&&(n=!0);break;case o.ViewEventType.ViewLinesDeleted:this.onLinesDeleted(i)&&(n=!0);break;case o.ViewEventType.ViewLinesInserted:this.onLinesInserted(i)&&(n=!0);break;case o.ViewEventType.ViewRevealRangeRequest:this.onRevealRangeRequest(i)&&(n=!0);break;case o.ViewEventType.ViewScrollChanged:this.onScrollChanged(i)&&(n=!0);break;case o.ViewEventType.ViewTokensChanged:this.onTokensChanged(i)&&(n=!0);break;case o.ViewEventType.ViewThemeChanged:this.onThemeChanged(i)&&(n=!0);break;case o.ViewEventType.ViewTokensColorsChanged:this.onTokensColorsChanged(i)&&(n=!0);break;case o.ViewEventType.ViewZonesChanged:this.onZonesChanged(i)&&(n=!0);break;default:}}n&&(this._shouldRender=!0)}}export{u as ViewEventHandler};
