class Position {
  constructor(line, character) {
    this.line = line;
    this.character = character;
  }
  isBefore(other) {
    return false;
  }
  isBeforeOrEqual(other) {
    return false;
  }
  isAfter(other) {
    return false;
  }
  isAfterOrEqual(other) {
    return false;
  }
  isEqual(other) {
    return false;
  }
  compareTo(other) {
    return 0;
  }
  translate(_, _2) {
    return new Position(0, 0);
  }
  with(_) {
    return new Position(0, 0);
  }
}
class Range {
  start;
  end;
  constructor(startLine, startCol, endLine, endCol) {
    this.start = new Position(startLine, startCol);
    this.end = new Position(endLine, endCol);
  }
  isEmpty = false;
  isSingleLine = false;
  contains(positionOrRange) {
    return false;
  }
  isEqual(other) {
    return false;
  }
  intersection(range) {
    return void 0;
  }
  union(other) {
    return new Range(0, 0, 0, 0);
  }
  with(_) {
    return new Range(0, 0, 0, 0);
  }
}
class TextSearchMatchNew {
  /**
   * @param uri The uri for the matching document.
   * @param ranges The ranges associated with this match.
   * @param previewText The text that is used to preview the match. The highlighted range in `previewText` is specified in `ranges`.
   */
  constructor(uri, ranges, previewText) {
    this.uri = uri;
    this.ranges = ranges;
    this.previewText = previewText;
  }
}
class TextSearchContextNew {
  /**
   * @param uri The uri for the matching document.
   * @param text The line of context text.
   * @param lineNumber The line number of this line of context.
   */
  constructor(uri, text, lineNumber) {
    this.uri = uri;
    this.text = text;
    this.lineNumber = lineNumber;
  }
}
var ExcludeSettingOptions = /* @__PURE__ */ ((ExcludeSettingOptions2) => {
  ExcludeSettingOptions2[ExcludeSettingOptions2["None"] = 1] = "None";
  ExcludeSettingOptions2[ExcludeSettingOptions2["FilesExclude"] = 2] = "FilesExclude";
  ExcludeSettingOptions2[ExcludeSettingOptions2["SearchAndFilesExclude"] = 3] = "SearchAndFilesExclude";
  return ExcludeSettingOptions2;
})(ExcludeSettingOptions || {});
var TextSearchCompleteMessageType = /* @__PURE__ */ ((TextSearchCompleteMessageType2) => {
  TextSearchCompleteMessageType2[TextSearchCompleteMessageType2["Information"] = 1] = "Information";
  TextSearchCompleteMessageType2[TextSearchCompleteMessageType2["Warning"] = 2] = "Warning";
  return TextSearchCompleteMessageType2;
})(TextSearchCompleteMessageType || {});
export {
  ExcludeSettingOptions,
  Position,
  Range,
  TextSearchCompleteMessageType,
  TextSearchContextNew,
  TextSearchMatchNew
};
