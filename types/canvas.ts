export type ToolType =
  | "select"
  | "sticky-note"
  | "rectangle"
  | "circle"
  | "arrow"
  | "pen"
  | "text";

interface BaseObject {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  createdBy: string;
  createdAt: number;
}

export interface StickyNoteObject extends BaseObject {
  type: "sticky-note";
  text: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
}

export interface RectObject extends BaseObject {
  type: "rectangle";
  fill: string;
  stroke: string;
  strokeWidth: number;
  rx: number;
}

export interface CircleObject extends BaseObject {
  type: "circle";
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
}

export interface ArrowObject extends BaseObject {
  type: "arrow";
  stroke: string;
  strokeWidth: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PathObject extends BaseObject {
  type: "path";
  path: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
}

export interface TextObject extends BaseObject {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: string;
}

export type CanvasObject =
  | StickyNoteObject
  | RectObject
  | CircleObject
  | ArrowObject
  | PathObject
  | TextObject;

export type CanvasObjectType = CanvasObject["type"];
