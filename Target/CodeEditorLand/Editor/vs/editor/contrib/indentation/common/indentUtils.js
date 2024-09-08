function getSpaceCnt(str, tabSize) {
  let spacesCnt = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charAt(i) === "	") {
      spacesCnt += tabSize;
    } else {
      spacesCnt++;
    }
  }
  return spacesCnt;
}
function generateIndent(spacesCnt, tabSize, insertSpaces) {
  spacesCnt = spacesCnt < 0 ? 0 : spacesCnt;
  let result = "";
  if (!insertSpaces) {
    const tabsCnt = Math.floor(spacesCnt / tabSize);
    spacesCnt = spacesCnt % tabSize;
    for (let i = 0; i < tabsCnt; i++) {
      result += "	";
    }
  }
  for (let i = 0; i < spacesCnt; i++) {
    result += " ";
  }
  return result;
}
export {
  generateIndent,
  getSpaceCnt
};
