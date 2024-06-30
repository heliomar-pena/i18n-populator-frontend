const lineIsEmpty = (line) => line.trim() === "";

class CodeEditor extends HTMLElement {
  loadingDependencies = true;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.files = {};
  }

  async #loadDependencies() {
    return await new Promise((resolve, reject) => {
      if (window.hljs) {
        this.loadingDependencies = false;
        resolve();
      }

      const hljsScript = document.createElement("script");
      hljsScript.src = "./highlightjs/highlight.min.js";
      document.head.appendChild(hljsScript);

      hljsScript.onload = () => {
        this.loadingDependencies = false;
        resolve();
      };
      hljsScript.onerror = reject;
    });
  }

  async addFile(fileName, fileContent, language = "javascript") {
    if (this.loadingDependencies) {
      setTimeout(() => this.addFile(fileName, fileContent, language), 500);

      return;
    }

    const nav = this.shadowRoot.getElementById("editor_header");
    const body = this.shadowRoot.getElementById("editor_body");
    const highlightedFileContent = hljs.highlight(fileContent, { language }).value;

    const file = document.createElement("div");
    file.classList.add("editor__file");

    file.innerHTML = /*html*/ `
      <div class="editor__content">
        ${highlightedFileContent.split("\n").map(
          (line, i) => /*html*/`
            <div class="editor__line">
                <div class="editor__line_number">
                    <span>${i + 1}</span>
                </div>
                <div class="editor__line_content">
                  <pre>
                    <code>
                      ${lineIsEmpty(line) ? "&nbsp;" : line}
                    </code>
                  </pre>
                </div>
            </div>
          `
        ).join("")}
      </div>
    `;

    const tab = document.createElement("button");
    tab.classList.add("editor__tab");
    tab.textContent = fileName;
    tab.onclick = () => {
      this.shadowRoot
        .querySelectorAll(".editor__file--open")
        .forEach((file) => {
          file.classList.remove("editor__file--open");
        });

      file.classList.add("editor__file--open");
    };

    nav.appendChild(tab);
    body.appendChild(file);
  }

  connectedCallback() {
    this.#loadDependencies()
      .then(() => {
        this.shadowRoot.innerHTML = /*html*/ `
      <head>
        <link rel="stylesheet" href="./highlightjs/css/default.min.css">
        <style>
          @import url("./css/editor.css");
          @import url("./css/reset.css");
        </style>
      </head>
      <div class="editor">
        <nav class="editor__header" id="editor_header">
        </nav>
        <div class="editor__files" id="editor_body">
        </div>
      </div>
        `;
      })
      .catch(console.error);
  }
}

customElements.define("editor-component", CodeEditor);
