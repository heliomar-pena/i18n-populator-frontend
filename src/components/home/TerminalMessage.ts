import {
  from,
  concatMap,
  of,
  delay,
  tap,
  iif,
  mergeMap,
  map,
  finalize,
} from "rxjs";
import type { Message, MessageAnimation } from "./TerminalMessage.type";
import styles from "./TerminalMessage.module.css";

const animationClasses: Record<MessageAnimation, string> = {
  write: styles["TerminalMessage__message--write"],
  fade: styles["TerminalMessage__message--fade"],
};

const buildDepthClass = (depth: number) => {
  return `TerminalMessage__message--depth-${depth}`;
};

const writeMessage = (
  element: HTMLLIElement,
  message: Message,
) => {
  const chars = [...(message.text ?? [])];
  const duration = message.duration / chars.length;

  return from(chars).pipe(
    concatMap((char) =>
      of(char).pipe(
        delay(duration),
        tap((char) => {
          element.textContent += char;
        }),
      ),
    ),
    delay(300),
    finalize(() => {
      element.classList.add(styles["TerminalMessage__message--write-finished"]);
    }),
  );
};

const renderMessage = (
  element: HTMLLIElement,
  message: Message,
) => {
  return of(message.text).pipe(
    tap((text) => {
      element.textContent = text;
    }),
    delay(message.duration ?? 0),
  );
};

class MessageUI extends HTMLElement {
  connectedCallback() {
    const rawMessages = this.dataset.messages ?? "[]";
    const messages = JSON.parse(rawMessages) as Message[];
    const ulElement = document.createElement("ul");
    this.appendChild(ulElement);
    ulElement.classList.add(styles["TerminalMessage"]);

    from(messages)
      .pipe(
        concatMap((message) =>
          of(message).pipe(
            map((msg) => {
              const element = document.createElement("li");
              const normalClass = styles.TerminalMessage__message;
              const depthClass = buildDepthClass(message.depth ?? 0);
              const animationClass =
                animationClasses[message.animation ?? "fade"];

              element.classList.add(normalClass, depthClass, animationClass);
              ulElement.appendChild(element);

              return { msg, element };
            }),
            mergeMap(({ msg, element }) =>
              iif(
                () => msg.animation === "write",
                writeMessage(element, msg),
                renderMessage(element, msg),
              ),
            ),
          ),
        ),
      )
      .subscribe();
  }
}

customElements.define("message-ui", MessageUI);
