import{basename as t}from"../../../../base/common/resources.js";import*as r from"../../../../nls.js";import{MarkerSeverity as l}from"../../../../platform/markers/common/markers.js";class s{static MARKERS_PANEL_TOGGLE_LABEL=r.localize("problems.view.toggle.label","Toggle Problems (Errors, Warnings, Infos)");static MARKERS_PANEL_SHOW_LABEL=r.localize2("problems.view.focus.label","Focus Problems (Errors, Warnings, Infos)");static PROBLEMS_PANEL_CONFIGURATION_TITLE=r.localize("problems.panel.configuration.title","Problems View");static PROBLEMS_PANEL_CONFIGURATION_AUTO_REVEAL=r.localize("problems.panel.configuration.autoreveal","Controls whether Problems view should automatically reveal files when opening them.");static PROBLEMS_PANEL_CONFIGURATION_VIEW_MODE=r.localize("problems.panel.configuration.viewMode","Controls the default view mode of the Problems view.");static PROBLEMS_PANEL_CONFIGURATION_SHOW_CURRENT_STATUS=r.localize("problems.panel.configuration.showCurrentInStatus","When enabled shows the current problem in the status bar.");static PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER=r.localize("problems.panel.configuration.compareOrder","Controls the order in which problems are navigated.");static PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_SEVERITY=r.localize("problems.panel.configuration.compareOrder.severity","Navigate problems ordered by severity");static PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_POSITION=r.localize("problems.panel.configuration.compareOrder.position","Navigate problems ordered by position");static MARKERS_PANEL_TITLE_PROBLEMS=r.localize2("markers.panel.title.problems","Problems");static MARKERS_PANEL_NO_PROBLEMS_BUILT=r.localize("markers.panel.no.problems.build","No problems have been detected in the workspace.");static MARKERS_PANEL_NO_PROBLEMS_ACTIVE_FILE_BUILT=r.localize("markers.panel.no.problems.activeFile.build","No problems have been detected in the current file.");static MARKERS_PANEL_NO_PROBLEMS_FILTERS=r.localize("markers.panel.no.problems.filters","No results found with provided filter criteria.");static MARKERS_PANEL_ACTION_TOOLTIP_MORE_FILTERS=r.localize("markers.panel.action.moreFilters","More Filters...");static MARKERS_PANEL_FILTER_LABEL_SHOW_ERRORS=r.localize("markers.panel.filter.showErrors","Show Errors");static MARKERS_PANEL_FILTER_LABEL_SHOW_WARNINGS=r.localize("markers.panel.filter.showWarnings","Show Warnings");static MARKERS_PANEL_FILTER_LABEL_SHOW_INFOS=r.localize("markers.panel.filter.showInfos","Show Infos");static MARKERS_PANEL_FILTER_LABEL_EXCLUDED_FILES=r.localize("markers.panel.filter.useFilesExclude","Hide Excluded Files");static MARKERS_PANEL_FILTER_LABEL_ACTIVE_FILE=r.localize("markers.panel.filter.activeFile","Show Active File Only");static MARKERS_PANEL_ACTION_TOOLTIP_FILTER=r.localize("markers.panel.action.filter","Filter Problems");static MARKERS_PANEL_ACTION_TOOLTIP_QUICKFIX=r.localize("markers.panel.action.quickfix","Show fixes");static MARKERS_PANEL_FILTER_ARIA_LABEL=r.localize("markers.panel.filter.ariaLabel","Filter Problems");static MARKERS_PANEL_FILTER_PLACEHOLDER=r.localize("markers.panel.filter.placeholder","Filter (e.g. text, **/*.ts, !**/node_modules/**)");static MARKERS_PANEL_FILTER_ERRORS=r.localize("markers.panel.filter.errors","errors");static MARKERS_PANEL_FILTER_WARNINGS=r.localize("markers.panel.filter.warnings","warnings");static MARKERS_PANEL_FILTER_INFOS=r.localize("markers.panel.filter.infos","infos");static MARKERS_PANEL_SINGLE_ERROR_LABEL=r.localize("markers.panel.single.error.label","1 Error");static MARKERS_PANEL_MULTIPLE_ERRORS_LABEL=e=>r.localize("markers.panel.multiple.errors.label","{0} Errors",""+e);static MARKERS_PANEL_SINGLE_WARNING_LABEL=r.localize("markers.panel.single.warning.label","1 Warning");static MARKERS_PANEL_MULTIPLE_WARNINGS_LABEL=e=>r.localize("markers.panel.multiple.warnings.label","{0} Warnings",""+e);static MARKERS_PANEL_SINGLE_INFO_LABEL=r.localize("markers.panel.single.info.label","1 Info");static MARKERS_PANEL_MULTIPLE_INFOS_LABEL=e=>r.localize("markers.panel.multiple.infos.label","{0} Infos",""+e);static MARKERS_PANEL_SINGLE_UNKNOWN_LABEL=r.localize("markers.panel.single.unknown.label","1 Unknown");static MARKERS_PANEL_MULTIPLE_UNKNOWNS_LABEL=e=>r.localize("markers.panel.multiple.unknowns.label","{0} Unknowns",""+e);static MARKERS_PANEL_AT_LINE_COL_NUMBER=(e,a)=>r.localize("markers.panel.at.ln.col.number","[Ln {0}, Col {1}]",""+e,""+a);static MARKERS_TREE_ARIA_LABEL_RESOURCE=(e,a,i)=>r.localize("problems.tree.aria.label.resource","{0} problems in file {1} of folder {2}",e,a,i);static MARKERS_TREE_ARIA_LABEL_MARKER=e=>{const a=e.relatedInformation.length?r.localize("problems.tree.aria.label.marker.relatedInformation"," This problem has references to {0} locations.",e.relatedInformation.length):"";switch(e.marker.severity){case l.Error:return e.marker.source?r.localize("problems.tree.aria.label.error.marker","Error: {0} at line {1} and character {2}.{3} generated by {4}",e.marker.message,e.marker.startLineNumber,e.marker.startColumn,a,e.marker.source):r.localize("problems.tree.aria.label.error.marker.nosource","Error: {0} at line {1} and character {2}.{3}",e.marker.message,e.marker.startLineNumber,e.marker.startColumn,a);case l.Warning:return e.marker.source?r.localize("problems.tree.aria.label.warning.marker","Warning: {0} at line {1} and character {2}.{3} generated by {4}",e.marker.message,e.marker.startLineNumber,e.marker.startColumn,a,e.marker.source):r.localize("problems.tree.aria.label.warning.marker.nosource","Warning: {0} at line {1} and character {2}.{3}",e.marker.message,e.marker.startLineNumber,e.marker.startColumn,a,a);case l.Info:return e.marker.source?r.localize("problems.tree.aria.label.info.marker","Info: {0} at line {1} and character {2}.{3} generated by {4}",e.marker.message,e.marker.startLineNumber,e.marker.startColumn,a,e.marker.source):r.localize("problems.tree.aria.label.info.marker.nosource","Info: {0} at line {1} and character {2}.{3}",e.marker.message,e.marker.startLineNumber,e.marker.startColumn,a);default:return e.marker.source?r.localize("problems.tree.aria.label.marker","Problem: {0} at line {1} and character {2}.{3} generated by {4}",e.marker.source,e.marker.message,e.marker.startLineNumber,e.marker.startColumn,a,e.marker.source):r.localize("problems.tree.aria.label.marker.nosource","Problem: {0} at line {1} and character {2}.{3}",e.marker.message,e.marker.startLineNumber,e.marker.startColumn,a)}};static MARKERS_TREE_ARIA_LABEL_RELATED_INFORMATION=e=>r.localize("problems.tree.aria.label.relatedinfo.message","{0} at line {1} and character {2} in {3}",e.message,e.startLineNumber,e.startColumn,t(e.resource));static SHOW_ERRORS_WARNINGS_ACTION_LABEL=r.localize("errors.warnings.show.label","Show Errors and Warnings")}export{s as default};
