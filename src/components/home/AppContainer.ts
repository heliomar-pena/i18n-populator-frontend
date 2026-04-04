import { filter, fromEvent, map, tap } from "rxjs";
import styles from "./AppsContainer.module.css";

class AppContainer extends HTMLElement {
  connectedCallback() {
    this.classList.add(styles["AppsContainer"]);

    const [defaultFirstApp, defaultSecondApp] = this.children;

    fromEvent(this, "click")
      .pipe(
        map((event) => {
          return { event, target: event.target as HTMLElement };
        }),
        map(({ event, target }) => {
          if (defaultFirstApp.contains(target)) {
            return { event, target: defaultFirstApp, otherApp: defaultSecondApp };
          }

          if (defaultSecondApp.contains(target)) {
            return { event, target: defaultSecondApp, otherApp: defaultFirstApp };
          }

          return { event, target: null, otherApp: null };
        }),
        filter(({ target }) => target !== null),
        tap(({ target: appClicked, otherApp }) => {
          const isAlreadyFirst = appClicked!.classList.contains(
            styles["AppsContainer__app--first"],
          );

          if (isAlreadyFirst) return;

          otherApp!.classList.remove(styles["AppsContainer__app--first"]);
          otherApp!.classList.add(styles["AppsContainer__app--second"]);
          appClicked!.classList.remove(styles["AppsContainer__app--second"]);
          appClicked!.classList.add(styles["AppsContainer__app--first"]);
        }),
      )
      .subscribe();
  }
}

customElements.define("app-container", AppContainer);
