import { concatMap, from, fromEvent, map, of, tap } from "rxjs";
import styles from "./CodeEditor.module.css";
import fileStore from "./fileStore";
import type { MessageCollection } from "./TerminalMessage.type";

class CodeEditor extends HTMLElement {
  latestSavedValue: string = "";

  renderTabs(
    files: MessageCollection,
    tabsContainer: HTMLFormElement,
    contentContainer: HTMLPreElement,
  ) {
    from(Object.values(files))
      .pipe(
        concatMap((file) =>
          of(file).pipe(
            map((file) => {
              const elementLabel = document.createElement("label");
              const element = document.createElement("input");
              const elementText = document.createTextNode(
                `${file.language}.json`,
              );

              element.type = "radio";
              element.id = file.language;
              element.name = "file";
              element.value = file.language;
              element.hidden = true;

              elementLabel.htmlFor = element.id;

              elementLabel.appendChild(element);
              elementLabel.appendChild(elementText);

              elementLabel.classList.add(styles.CodeEditor__tab);
              element.classList.add(styles["CodeEditor__tab-input"]);

              return {
                inputElement: element,
                labelElement: elementLabel,
                file,
              };
            }),
            tap(({ inputElement, file }) => {
              if (this.latestSavedValue === file.language) {
                inputElement.checked = true;
                this.#renderCodeSection(file.language, files, contentContainer);
              }

              if (!this.latestSavedValue) {
                inputElement.checked = true;
                this.#renderCodeSection(file.language, files, contentContainer);
              }
            }),
            tap(({ labelElement }) => {
              tabsContainer.appendChild(labelElement);
            }),
          ),
        ),
      )
      .subscribe();
  }

  renderContent(
    payloads: MessageCollection,
    tabsContainer: HTMLFormElement,
    contentContainer: HTMLPreElement,
  ) {
    fromEvent(tabsContainer, "change")
      .pipe(
        tap(() => {
          contentContainer.replaceChildren();
        }),
        map((event) => {
          return (event.target as unknown as { form: HTMLFormElement }).form
            .file.value;
        }),
        tap((value) =>
          this.#renderCodeSection(value, payloads, contentContainer),
        ),
      )
      .subscribe();
  }

  #renderCodeSection(
    newSelectedValue: string,
    payloads: MessageCollection,
    contentContainer: HTMLPreElement,
  ) {
    this.latestSavedValue = newSelectedValue;
    const payload = payloads[newSelectedValue];

    if (!payload) return;

    const codeContainer = document.createElement("ol");
    codeContainer.classList.add(styles["CodeEditor__content"]);
    contentContainer.appendChild(codeContainer);

    const openBracket = document.createTextNode("{");
    const closeBracket = document.createTextNode("}");

    const key = document.createTextNode(`\t"${payload.name}"`);
    const translation = document.createTextNode(`: "${payload.translation}"`);

    const openBracketContainer = document.createElement("li");
    openBracketContainer.appendChild(openBracket);
    openBracketContainer.classList.add(styles["CodeEditor__content-item"]);
    openBracketContainer.classList.add(
      styles["CodeEditor__content-text--light"],
    );

    const keyContainer = document.createElement("span");
    keyContainer.appendChild(key);
    keyContainer.classList.add(styles["CodeEditor__content-text--light"]);

    const translationContainer = document.createElement("span");
    translationContainer.append(translation);

    const keyValueContainer = document.createElement("li");
    keyValueContainer.appendChild(keyContainer);
    keyValueContainer.appendChild(translationContainer);
    keyValueContainer.classList.add(styles["CodeEditor__content-item"]);

    const closeBracketContainer = document.createElement("li");
    closeBracketContainer.appendChild(closeBracket);
    closeBracketContainer.classList.add(styles["CodeEditor__content-item"]);
    closeBracketContainer.classList.add(
      styles["CodeEditor__content-text--light"],
    );

    codeContainer.appendChild(openBracketContainer);
    codeContainer.appendChild(keyValueContainer);
    codeContainer.appendChild(closeBracketContainer);
  }

  connectedCallback() {
    this.classList.add(styles.CodeEditor);

    fileStore.subscribe((payloads) => {
      this.replaceChildren();

      const tabsContainer = document.createElement("form");
      tabsContainer.classList.add(styles.CodeEditor__tabs);
      this.appendChild(tabsContainer);

      const contentContainer = document.createElement("pre");
      this.appendChild(contentContainer);

      this.renderContent(payloads, tabsContainer, contentContainer);
      this.renderTabs(payloads, tabsContainer, contentContainer);

      if (!Object.keys(payloads).length) {
        const waitingText = document.createElement("p");
        waitingText.textContent = "Waiting terminal to open files";
        contentContainer.appendChild(waitingText);
        contentContainer.classList.add(styles["CodeEditor__content--empty"]);
      }
    });
  }
}

customElements.define("code-editor", CodeEditor);
