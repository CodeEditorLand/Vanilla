import*as i from"./browser.js";import{IframeUtils as h}from"./iframe.js";import*as d from"../common/platform.js";class b{browserEvent;leftButton;middleButton;rightButton;buttons;target;detail;posx;posy;ctrlKey;shiftKey;altKey;metaKey;timestamp;constructor(e,t){this.timestamp=Date.now(),this.browserEvent=t,this.leftButton=t.button===0,this.middleButton=t.button===1,this.rightButton=t.button===2,this.buttons=t.buttons,this.target=t.target,this.detail=t.detail||1,t.type==="dblclick"&&(this.detail=2),this.ctrlKey=t.ctrlKey,this.shiftKey=t.shiftKey,this.altKey=t.altKey,this.metaKey=t.metaKey,typeof t.pageX=="number"?(this.posx=t.pageX,this.posy=t.pageY):(this.posx=t.clientX+this.target.ownerDocument.body.scrollLeft+this.target.ownerDocument.documentElement.scrollLeft,this.posy=t.clientY+this.target.ownerDocument.body.scrollTop+this.target.ownerDocument.documentElement.scrollTop);const a=h.getPositionOfChildWindowRelativeToAncestorWindow(e,t.view);this.posx-=a.left,this.posy-=a.top}preventDefault(){this.browserEvent.preventDefault()}stopPropagation(){this.browserEvent.stopPropagation()}}class c extends b{dataTransfer;constructor(e,t){super(e,t),this.dataTransfer=t.dataTransfer}}class y{browserEvent;deltaY;deltaX;target;constructor(e,t=0,a=0){this.browserEvent=e||null,this.target=e?e.target||e.targetNode||e.srcElement:null,this.deltaY=a,this.deltaX=t;let r=!1;if(i.isChrome){const l=navigator.userAgent.match(/Chrome\/(\d+)/);r=(l?parseInt(l[1]):123)<=122}if(e){const l=e,o=e,s=e.view?.devicePixelRatio||1;if(typeof l.wheelDeltaY<"u")r?this.deltaY=l.wheelDeltaY/(120*s):this.deltaY=l.wheelDeltaY/120;else if(typeof o.VERTICAL_AXIS<"u"&&o.axis===o.VERTICAL_AXIS)this.deltaY=-o.detail/3;else if(e.type==="wheel"){const n=e;n.deltaMode===n.DOM_DELTA_LINE?i.isFirefox&&!d.isMacintosh?this.deltaY=-e.deltaY/3:this.deltaY=-e.deltaY:this.deltaY=-e.deltaY/40}if(typeof l.wheelDeltaX<"u")i.isSafari&&d.isWindows?this.deltaX=-(l.wheelDeltaX/120):r?this.deltaX=l.wheelDeltaX/(120*s):this.deltaX=l.wheelDeltaX/120;else if(typeof o.HORIZONTAL_AXIS<"u"&&o.axis===o.HORIZONTAL_AXIS)this.deltaX=-e.detail/3;else if(e.type==="wheel"){const n=e;n.deltaMode===n.DOM_DELTA_LINE?i.isFirefox&&!d.isMacintosh?this.deltaX=-e.deltaX/3:this.deltaX=-e.deltaX:this.deltaX=-e.deltaX/40}this.deltaY===0&&this.deltaX===0&&e.wheelDelta&&(r?this.deltaY=e.wheelDelta/(120*s):this.deltaY=e.wheelDelta/120)}}preventDefault(){this.browserEvent?.preventDefault()}stopPropagation(){this.browserEvent?.stopPropagation()}}export{c as DragMouseEvent,b as StandardMouseEvent,y as StandardWheelEvent};
