import { BehaviorSubject } from "rxjs";
import type { MessageCollection } from "./TerminalMessage.type";

const fileStore = new BehaviorSubject<MessageCollection>({});

export default fileStore;
