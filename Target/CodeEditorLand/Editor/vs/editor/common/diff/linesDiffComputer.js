class LinesDiff {
  constructor(changes, moves, hitTimeout) {
    this.changes = changes;
    this.moves = moves;
    this.hitTimeout = hitTimeout;
  }
}
class MovedText {
  lineRangeMapping;
  /**
   * The diff from the original text to the moved text.
   * Must be contained in the original/modified line range.
   * Can be empty if the text didn't change (only moved).
   */
  changes;
  constructor(lineRangeMapping, changes) {
    this.lineRangeMapping = lineRangeMapping;
    this.changes = changes;
  }
  flip() {
    return new MovedText(
      this.lineRangeMapping.flip(),
      this.changes.map((c) => c.flip())
    );
  }
}
export {
  LinesDiff,
  MovedText
};
