import{BugIndicatingError as c}from"../../../vs/base/common/errors.js";class u{_isOccupied=!1;runExclusivelyOrSkip(i){if(!this._isOccupied){this._isOccupied=!0;try{i()}finally{this._isOccupied=!1}}}runExclusivelyOrThrow(i){if(this._isOccupied)throw new c("ReentrancyBarrier: reentrant call detected!");this._isOccupied=!0;try{i()}finally{this._isOccupied=!1}}get isOccupied(){return this._isOccupied}makeExclusiveOrSkip(i){return(...e)=>{if(!this._isOccupied){this._isOccupied=!0;try{return i(...e)}finally{this._isOccupied=!1}}}}}export{u as ReentrancyBarrier};
