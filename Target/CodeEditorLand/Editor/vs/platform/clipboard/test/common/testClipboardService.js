class TestClipboardService {
  _serviceBrand;
  text = void 0;
  async writeText(text, type) {
    this.text = text;
  }
  async readText(type) {
    return this.text ?? "";
  }
  findText = void 0;
  async readFindText() {
    return this.findText ?? "";
  }
  async writeFindText(text) {
    this.findText = text;
  }
  resources = void 0;
  async writeResources(resources) {
    this.resources = resources;
  }
  async readResources() {
    return this.resources ?? [];
  }
  async hasResources() {
    return Array.isArray(this.resources) && this.resources.length > 0;
  }
}
export {
  TestClipboardService
};
