export type MessageAnimation = "write" | "fade";

export interface Message {
  icon?: string;
  text: string;
  depth?: number;
  animation?: MessageAnimation;
  duration: number;
  delayAfter?: number;
}
