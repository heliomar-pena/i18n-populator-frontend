import { concatMap, from, map, of, tap } from "rxjs";
import styles from "./CodeEditor.module.css";
import fileStore from "./fileStore";
import type { MessagePayload } from "./TerminalMessage.type";

class CodeEditor extends HTMLElement {
  renderTabs(files: MessagePayload[], tabsContainer: HTMLElement) {
    from(files)
      .pipe(
        concatMap((file) =>
          of(file).pipe(
            map((file) => {
              const elementLabel = document.createElement("label");
              const element = document.createElement("input");
              const elementText = document.createTextNode(
                `${file.language}.json`,
              );

              console.log(tabsContainer)

              const currentValue = (
                tabsContainer as unknown as { file?: { value: string } }
              )?.file?.value;

              element.type = "radio";
              element.id = file.language;
              element.name = "file";
              element.value = file.language;
              if (!currentValue) element.checked = true;
              element.hidden = true;

              elementLabel.htmlFor = element.id;

              elementLabel.appendChild(element);
              elementLabel.appendChild(elementText);

              elementLabel.classList.add(styles.CodeEditor__tab);
              element.classList.add(styles["CodeEditor__tab-input"]);

              return elementLabel;
            }),
            tap((element) => {
              tabsContainer.appendChild(element);
            }),
          ),
        ),
      )
      .subscribe();
  }

  connectedCallback() {
    this.classList.add(styles.CodeEditor);

    fileStore.subscribe((payloads) => {
      this.replaceChildren();

      const tabsContainer = document.createElement("form");
      tabsContainer.classList.add(styles.CodeEditor__tabs);
      this.appendChild(tabsContainer);

      this.renderTabs(payloads, tabsContainer);
    });
  }
}

customElements.define("code-editor", CodeEditor);
