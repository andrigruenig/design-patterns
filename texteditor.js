// texteditor.ts
var textArea = document.getElementById("text");
var editor;
var TextEditor = class {
  textArea;
  state;
  constructor(textArea2) {
    this.textArea = textArea2;
    this.state = new CleanUnsavedState(this);
  }
  setState(state) {
    this.state = state;
  }
  setStateLabel(value) {
    const stateLabel = document.getElementById("state-label");
    if (stateLabel) {
      stateLabel.innerText = value;
    }
  }
  refreshFiles() {
    showFiles(listFiles(), "files-list");
  }
  saveFile(filename) {
    localStorage.setItem(filename, this.textArea.value);
    this.refreshFiles();
  }
  openFile(filename) {
    this.textArea.value = localStorage.getItem(filename) || "";
    this.setState(new CleanSavedState(this, filename));
    this.setStateLabel(filename);
  }
  promptForFileName(initialValue = "") {
    let filename = prompt("Enter a File Name", initialValue);
    if (filename?.trim() == "") {
      return null;
    }
    if (!filename?.endsWith(".txt")) {
      filename = filename + ".txt";
    }
    return filename;
  }
  newFile() {
    this.textArea.value = "";
    this.setState(new CleanUnsavedState(this));
    this.setStateLabel("_");
  }
};
var BaseState = class {
  editor;
  constructor(editor2) {
    this.editor = editor2;
  }
  saveAs() {
    const filename = this.editor.promptForFileName();
    if (filename) {
      this.editor.saveFile(filename);
      this.editor.setState(new CleanSavedState(this.editor, filename));
      this.editor.setStateLabel(filename);
    }
  }
  newFile() {
    this.editor.newFile();
  }
};
var CleanUnsavedState = class extends BaseState {
  input() {
    this.editor.setState(new DirtyUnsavedState(this.editor));
    this.editor.setStateLabel("*");
  }
  save() {
    this.saveAs();
  }
};
var DirtyUnsavedState = class extends BaseState {
  input() {
  }
  save() {
    this.saveAs();
  }
};
var CleanSavedState = class _CleanSavedState extends BaseState {
  fileName;
  constructor(editor2, fileName) {
    super(editor2), this.fileName = fileName;
  }
  input() {
    this.editor.setState(new DirtySavedState(this.editor, this.fileName));
    this.editor.setStateLabel(`${this.fileName} *`);
  }
  save() {
    this.editor.saveFile(this.fileName);
    this.editor.setState(new _CleanSavedState(this.editor, this.fileName));
    this.editor.setStateLabel(this.fileName);
  }
};
var DirtySavedState = class extends BaseState {
  fileName;
  constructor(editor2, fileName) {
    super(editor2), this.fileName = fileName;
  }
  input() {
  }
  save() {
    this.editor.saveFile(this.fileName);
    this.editor.setState(new CleanSavedState(this.editor, this.fileName));
    this.editor.setStateLabel(this.fileName);
  }
};
document.addEventListener("DOMContentLoaded", () => {
  editor = new TextEditor(textArea);
  showFiles(listFiles(), "files-list");
  textArea.addEventListener("input", () => {
    editor.state.input();
  });
  const saveAsButton = document.getElementById("save-as-button");
  saveAsButton?.addEventListener("click", () => {
    editor.state.saveAs();
  });
  const saveButton = document.getElementById("save-button");
  saveButton?.addEventListener("click", () => {
    editor.state.save();
  });
  const newButton = document.getElementById("new-button");
  newButton?.addEventListener("click", () => {
    editor.state.newFile();
  });
  document.addEventListener("contextmenu", (event) => {
    alert("Wanna steal my source code, huh!?");
    event.preventDefault();
    return false;
  });
});
function showFiles(files, parentId) {
  const parent = document.getElementById(parentId);
  while (parent && parent.hasChildNodes() && parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  for (const file of files) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.innerHTML = file;
    item.appendChild(link);
    parent?.append(item);
    link.addEventListener("click", () => {
      editor.openFile(file);
    });
  }
}
function listFiles() {
  const files = [];
  for (let i = 0; i < localStorage.length; i++) {
    files.push(localStorage.key(i) || "");
  }
  return files;
}
