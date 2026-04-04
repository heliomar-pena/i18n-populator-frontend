export type MessageAnimation = "write" | "fade";

export interface MessageCollection {
  [key: string]: MessagePayload
} 

export interface MessagePayload {
  language: string;
  translation: string;
  name: string;
}

export interface Message {
  icon?: string;
  text: string;
  depth?: number;
  animation?: MessageAnimation;
  duration: number;
  delayAfter?: number;
  payload?: MessagePayload;
}
