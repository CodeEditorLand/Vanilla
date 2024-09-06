import"../../../../../vs/base/browser/fastDomNode.js";import{TimeoutTimer as l}from"../../../../../vs/base/common/async.js";import{Disposable as o}from"../../../../../vs/base/common/lifecycle.js";import{ScrollbarVisibility as e}from"../../../../../vs/base/common/scrollable.js";class u extends o{_visibility;_visibleClassName;_invisibleClassName;_domNode;_rawShouldBeVisible;_shouldBeVisible;_isNeeded;_isVisible;_revealTimer;constructor(i,s,t){super(),this._visibility=i,this._visibleClassName=s,this._invisibleClassName=t,this._domNode=null,this._isVisible=!1,this._isNeeded=!1,this._rawShouldBeVisible=!1,this._shouldBeVisible=!1,this._revealTimer=this._register(new l)}setVisibility(i){this._visibility!==i&&(this._visibility=i,this._updateShouldBeVisible())}setShouldBeVisible(i){this._rawShouldBeVisible=i,this._updateShouldBeVisible()}_applyVisibilitySetting(){return this._visibility===e.Hidden?!1:this._visibility===e.Visible?!0:this._rawShouldBeVisible}_updateShouldBeVisible(){const i=this._applyVisibilitySetting();this._shouldBeVisible!==i&&(this._shouldBeVisible=i,this.ensureVisibility())}setIsNeeded(i){this._isNeeded!==i&&(this._isNeeded=i,this.ensureVisibility())}setDomNode(i){this._domNode=i,this._domNode.setClassName(this._invisibleClassName),this.setShouldBeVisible(!1)}ensureVisibility(){if(!this._isNeeded){this._hide(!1);return}this._shouldBeVisible?this._reveal():this._hide(!0)}_reveal(){this._isVisible||(this._isVisible=!0,this._revealTimer.setIfNotSet(()=>{this._domNode?.setClassName(this._visibleClassName)},0))}_hide(i){this._revealTimer.cancel(),this._isVisible&&(this._isVisible=!1,this._domNode?.setClassName(this._invisibleClassName+(i?" fade":"")))}}export{u as ScrollbarVisibilityController};