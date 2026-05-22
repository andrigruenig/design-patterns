const textArea = document.getElementById("text") as HTMLTextAreaElement;
let editor: TextEditor;

interface State {
  input(): void;
  saveAs(): void;
  save(): void;
  newFile(): void;
}

class TextEditor {
  public state: State;

  constructor(public readonly textArea: HTMLTextAreaElement) {
    this.state = new CleanUnsavedState(this);
  }

  public setState(state: State) {
    this.state = state;
  }

  public setStateLabel(value: string) {
    const stateLabel = document.getElementById("state-label");
    if (stateLabel) {
      stateLabel.innerText = value;
    }
  }

  public refreshFiles() {
    showFiles(listFiles(), "files-list");
  }

  public saveFile(filename: string) {
    localStorage.setItem(filename, this.textArea.value);
    this.refreshFiles();
  }

  public openFile(filename: string) {
    this.textArea.value = localStorage.getItem(filename) || "";
    this.setState(new CleanSavedState(this, filename));
    this.setStateLabel(filename);
  }

  public promptForFileName(initialValue: string = "") {
    let filename = prompt("Enter a File Name", initialValue);
    if (filename?.trim() == "") {
      return null;
    }
    if (!filename?.endsWith(".txt")) {
      filename = filename + ".txt";
    }
    return filename;
  }

  public newFile() {
    this.textArea.value = "";
    this.setState(new CleanUnsavedState(this));
    this.setStateLabel("_");
  }
}

abstract class BaseState implements State {
  constructor(protected editor: TextEditor) {}

  public abstract input(): void;
  public abstract save(): void;

  public saveAs() {
    const filename = this.editor.promptForFileName();
    if (filename) {
      this.editor.saveFile(filename);
      this.editor.setState(new CleanSavedState(this.editor, filename));
      this.editor.setStateLabel(filename);
    }
  }

  public newFile() {
    this.editor.newFile();
  }
}

class CleanUnsavedState extends BaseState {
  public input() {
    this.editor.setState(new DirtyUnsavedState(this.editor));
    this.editor.setStateLabel("*");
  }

  public save() {
    this.saveAs();
  }
}

class DirtyUnsavedState extends BaseState {
  public input() {}

  public save() {
    this.saveAs();
  }
}

class CleanSavedState extends BaseState {
  constructor(editor: TextEditor, private readonly fileName: string) {
    super(editor);
  }

  public input() {
    this.editor.setState(new DirtySavedState(this.editor, this.fileName));
    this.editor.setStateLabel(`${this.fileName} *`);
  }

  public save() {
    this.editor.saveFile(this.fileName);
    this.editor.setState(new CleanSavedState(this.editor, this.fileName));
    this.editor.setStateLabel(this.fileName);
  }
}

class DirtySavedState extends BaseState {
  constructor(editor: TextEditor, private readonly fileName: string) {
    super(editor);
  }

  public input() {}

  public save() {
    this.editor.saveFile(this.fileName);
    this.editor.setState(new CleanSavedState(this.editor, this.fileName));
    this.editor.setStateLabel(this.fileName);
  }
}

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

function showFiles(files: string[], parentId: string) {
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

function listFiles(): string[] {
  const files: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    files.push(localStorage.key(i) || "");
  }
  return files;
}
