import { BehaviorSubject } from "rxjs";
import type { MessagePayload } from "./TerminalMessage.type";

const fileStore = new BehaviorSubject<MessagePayload[]>([]);

export default fileStore;
