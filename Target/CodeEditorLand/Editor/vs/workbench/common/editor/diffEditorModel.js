import"../../../platform/editor/common/editor.js";import{EditorModel as d}from"./editorModel.js";class t extends d{_originalModel;get originalModel(){return this._originalModel}_modifiedModel;get modifiedModel(){return this._modifiedModel}constructor(e,o){super(),this._originalModel=e,this._modifiedModel=o}async resolve(){await Promise.all([this._originalModel?.resolve(),this._modifiedModel?.resolve()])}isResolved(){return!!(this._originalModel?.isResolved()&&this._modifiedModel?.isResolved())}dispose(){super.dispose()}}export{t as DiffEditorModel};
