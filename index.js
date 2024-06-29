class CodeEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async #loadDependencies() {
    return await new Promise((resolve, reject) => {
      if (window.hljs) resolve();

      const hljsScript = document.createElement('script');
      hljsScript.src = './highlightjs/highlight.min.js';
      document.head.appendChild(hljsScript);

      hljsScript.onload = resolve;
      hljsScript.onerror = reject;
    });
  }

  async addFile(fileName, fileContent, language = 'javascript') {
  }

  connectedCallback() {
    this.#loadDependencies().then(() => {
      const text = hljs.highlight(
        'console.log("test!");',
        { language: 'javascript' }
      ).value;
      
      this.shadowRoot.innerHTML = /*html*/`
      <head>
        <link rel="stylesheet" href="./highlightjs/css/default.min.css">
      </head>
      <script src="./highlightjs/highlight.min.js"></script>
      <div class="editor">
        <nav class="editor__header">
          </nav>
          <div class="editor__line_numbers">
          </div>
          <div class="editor__content">
            <pre>
              <code class="language-javascript">
                ${text}
              </code>
            </pre>
          </div>
        </div>
        `;
    }).catch(console.error);
  }
}

customElements.define('editor-component', CodeEditor);
