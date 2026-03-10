import { from, concatMap, of, delay, tap, iif, mergeMap, map, finalize } from "rxjs";
import type { Message, MessageAnimation } from "./TerminalMessage.type";
import styles from "./TerminalMessage.module.css";

const animationClasses: Record<MessageAnimation, string> = {
  write: "TerminalMessage--write",
  fade: "TerminalMessage--fade",
};

const buildDepthClass = (depth: number) => {
  return `TerminalMessage--depth-${depth}`;
};

const writeMessage = (
  container: HTMLUListElement,
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
  );
};

const renderMessage = (
  container: HTMLUListElement,
  element: HTMLLIElement,
  message: Message,
) => {
  const normalClass = styles.TerminalMessage;
  const depthClass = buildDepthClass(message.depth ?? 0);
  const animationClass = animationClasses[message.animation ?? "fade"];

  element.textContent = message.text;
  element.classList.add(normalClass, depthClass, animationClass);
  container.appendChild(element);

  return of(null).pipe(delay(message.duration ?? 0));
};

class MessageUI extends HTMLElement {
  connectedCallback() {
    const rawMessages = this.dataset.messages ?? "[]";
    const messages = JSON.parse(rawMessages) as Message[];
    const ulElement = document.createElement("ul");
    this.appendChild(ulElement);

    from(messages)
      .pipe(
        concatMap((message) =>
          of(message).pipe(
            map((msg) => {
              const element = document.createElement("li");
              const normalClass = styles.TerminalMessage;
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
                writeMessage(ulElement, element, msg),
                renderMessage(ulElement, element, msg),
              ),
            ),
            delay((message.duration ?? 0) + (message.delayAfter ?? 0)),
          ),
        ),
      )
      .subscribe();
  }
}

customElements.define("message-ui", MessageUI);
