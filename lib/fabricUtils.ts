import type { CanvasObject } from "@/types/canvas";

export function buildArrowPath(x1: number, y1: number, x2: number, y2: number): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 15;
  const a1 = angle - Math.PI / 6;
  const a2 = angle + Math.PI / 6;
  return [
    `M ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `M ${x2} ${y2}`,
    `L ${x2 - headLen * Math.cos(a1)} ${y2 - headLen * Math.sin(a1)}`,
    `M ${x2} ${y2}`,
    `L ${x2 - headLen * Math.cos(a2)} ${y2 - headLen * Math.sin(a2)}`,
  ].join(" ");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeFabricObject(obj: any, type: string): Partial<CanvasObject> {
  const base = {
    x: obj.left ?? 0,
    y: obj.top ?? 0,
    width: (obj.width ?? 0) * (obj.scaleX ?? 1),
    height: (obj.height ?? 0) * (obj.scaleY ?? 1),
    angle: obj.angle ?? 0,
  };

  switch (type) {
    case "rectangle":
      return {
        ...base,
        fill: String(obj.fill ?? "transparent"),
        stroke: String(obj.stroke ?? "#1e1e1e"),
        strokeWidth: obj.strokeWidth ?? 2,
        rx: obj.rx ?? 0,
      };
    case "circle":
      return {
        ...base,
        fill: String(obj.fill ?? "transparent"),
        stroke: String(obj.stroke ?? "#1e1e1e"),
        strokeWidth: obj.strokeWidth ?? 2,
        radius: (obj.radius ?? 50) * (obj.scaleX ?? 1),
      };
    case "sticky-note": {
      const items: any[] = obj.getObjects?.() ?? [];
      const textObj = items.find((o) => o.type === "i-text");
      const rectObj = items[0];
      return {
        ...base,
        text: textObj?.text ?? "",
        backgroundColor: String(rectObj?.fill ?? "#fef08a"),
        textColor: String(textObj?.fill ?? "#1e1e1e"),
        fontSize: textObj?.fontSize ?? 16,
      };
    }
    case "arrow":
      return {
        ...base,
        stroke: String(obj.stroke ?? "#1e1e1e"),
        strokeWidth: obj.strokeWidth ?? 2,
        x1: obj._arrowData?.x1 ?? base.x,
        y1: obj._arrowData?.y1 ?? base.y,
        x2: obj._arrowData?.x2 ?? base.x + 100,
        y2: obj._arrowData?.y2 ?? base.y,
      };
    case "path":
      return {
        ...base,
        path: obj.path ? JSON.stringify(obj.path) : "",
        stroke: String(obj.stroke ?? "#1e1e1e"),
        strokeWidth: obj.strokeWidth ?? 2,
        fill: String(obj.fill ?? "transparent"),
      };
    case "text":
      return {
        ...base,
        text: obj.text ?? "",
        fontSize: obj.fontSize ?? 20,
        fontFamily: obj.fontFamily ?? "sans-serif",
        fill: String(obj.fill ?? "#1e1e1e"),
        fontWeight: String(obj.fontWeight ?? "normal"),
      };
    default:
      return base;
  }
}

export function getDeserializedFabricArgs(obj: CanvasObject): {
  type: string;
  options: Record<string, unknown>;
} {
  switch (obj.type) {
    case "rectangle":
      return {
        type: "rect",
        options: {
          left: obj.x, top: obj.y,
          width: obj.width, height: obj.height,
          angle: obj.angle, fill: obj.fill,
          stroke: obj.stroke, strokeWidth: obj.strokeWidth,
          rx: obj.rx, ry: obj.rx,
        },
      };
    case "circle":
      return {
        type: "circle",
        options: {
          left: obj.x, top: obj.y,
          radius: obj.radius, angle: obj.angle,
          fill: obj.fill, stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
        },
      };
    case "arrow":
      return {
        type: "path",
        options: {
          stroke: obj.stroke, strokeWidth: obj.strokeWidth,
          fill: "transparent", angle: obj.angle,
          pathData: buildArrowPath(obj.x1, obj.y1, obj.x2, obj.y2),
          arrowData: { x1: obj.x1, y1: obj.y1, x2: obj.x2, y2: obj.y2 },
        },
      };
    case "path":
      return {
        type: "path",
        options: {
          left: obj.x, top: obj.y, angle: obj.angle,
          stroke: obj.stroke, strokeWidth: obj.strokeWidth,
          fill: obj.fill, pathData: obj.path,
        },
      };
    case "text":
      return {
        type: "i-text",
        options: {
          left: obj.x, top: obj.y, angle: obj.angle,
          text: obj.text, fontSize: obj.fontSize,
          fontFamily: obj.fontFamily, fill: obj.fill,
          fontWeight: obj.fontWeight,
        },
      };
    case "sticky-note":
      return {
        type: "sticky-note",
        options: {
          left: obj.x, top: obj.y, angle: obj.angle,
          width: obj.width, height: obj.height,
          text: obj.text, backgroundColor: obj.backgroundColor,
          textColor: obj.textColor, fontSize: obj.fontSize,
        },
      };
  }
}
