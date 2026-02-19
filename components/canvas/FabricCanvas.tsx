"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  Canvas,
  Rect,
  Circle,
  Path,
  IText,
  Group,
  Shadow,
  PencilBrush,
  Point,
} from "fabric";
import { LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";
import { throttle } from "lodash";
import { useToolStore } from "@/store/useToolStore";
import {
  useStorage,
  useMutation,
  useUpdateMyPresence,
} from "@/liveblocks.config";
import {
  serializeFabricObject,
  buildArrowPath,
  getDeserializedFabricArgs,
} from "@/lib/fabricUtils";
import { STICKY_NOTE_COLORS } from "@/lib/colors";
import type { CanvasObject } from "@/types/canvas";
import type { CanvasObjectLson } from "@/liveblocks.config";
import LiveCursors from "./LiveCursors";

interface FabricWithData {
  data?: { id: string; type: string };
  left?: number;
  top?: number;
  angle?: number;
  fill?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: (props: Record<string, any>) => void;
  setCoords: () => void;
}

export default function FabricCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const isSyncingFromRemote = useRef(false);
  const isDrawingArrow = useRef(false);
  const arrowStartPoint = useRef<{ x: number; y: number } | null>(null);
  const tempArrowRef = useRef<Path | null>(null);

  const { activeTool, strokeColor, fillColor, strokeWidth } = useToolStore();
  const activeToolRef = useRef(activeTool);
  const strokeColorRef = useRef(strokeColor);
  const fillColorRef = useRef(fillColor);
  const strokeWidthRef = useRef(strokeWidth);

  const updatePresence = useUpdateMyPresence();
  const objects = useStorage((root) => root.objects);

  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { strokeColorRef.current = strokeColor; }, [strokeColor]);
  useEffect(() => { fillColorRef.current = fillColor; }, [fillColor]);
  useEffect(() => { strokeWidthRef.current = strokeWidth; }, [strokeWidth]);

  const addObject = useMutation(({ storage }, obj: CanvasObjectLson) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (storage.get("objects") as any).set(obj.id, new LiveObject(obj));
  }, []);

  const updateObject = useMutation(
    ({ storage }, id: string, updates: Partial<CanvasObjectLson>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = storage.get("objects") as any;
      const liveObj = map.get(id);
      if (liveObj) liveObj.update(updates);
    },
    []
  );

  const removeObject = useMutation(({ storage }, id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (storage.get("objects") as any).delete(id);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledUpdate = useCallback(
    throttle((id: string, updates: Partial<CanvasObjectLson>) => {
      updateObject(id, updates);
    }, 50),
    [updateObject]
  );

  const stampAndSync = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (obj: any, type: string, extra: Partial<CanvasObject> = {}) => {
      const id = nanoid();
      obj.data = { id, type };
      fabricRef.current?.add(obj);
      fabricRef.current?.setActiveObject(obj);

      const serialized = serializeFabricObject(obj, type);
      const full: CanvasObjectLson = {
        id,
        type,
        x: obj.left ?? 0,
        y: obj.top ?? 0,
        width: (obj.width ?? 0) * (obj.scaleX ?? 1),
        height: (obj.height ?? 0) * (obj.scaleY ?? 1),
        angle: obj.angle ?? 0,
        createdBy: "local",
        createdAt: Date.now(),
        ...serialized,
        ...extra,
      };

      addObject(full);
      return id;
    },
    [addObject]
  );

  const createStickyNote = useCallback(
    (x: number, y: number) => {
      const color = STICKY_NOTE_COLORS[Math.floor(Math.random() * STICKY_NOTE_COLORS.length)];
      const w = 200;
      const h = 200;

      const rect = new Rect({
        width: w,
        height: h,
        fill: color,
        rx: 4,
        ry: 4,
        shadow: new Shadow({ color: "rgba(0,0,0,0.15)", blur: 8, offsetX: 2, offsetY: 2 }),
      });

      const text = new IText("", {
        left: 10,
        top: 10,
        width: w - 20,
        fontSize: 16,
        fill: "#1e1e1e",
        fontFamily: "sans-serif",
      });

      const group = new Group([rect, text], { left: x, top: y });

      stampAndSync(group, "sticky-note", {
        text: "Note...",
        backgroundColor: color,
        textColor: "#1e1e1e",
        fontSize: 16,
        width: w,
        height: h,
      });
    },
    [stampAndSync]
  );

  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "#f5f5f5",
      selection: true,
      preserveObjectStacking: true,
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = strokeColorRef.current;
    canvas.freeDrawingBrush.width = strokeWidthRef.current;

    fabricRef.current = canvas;

    let isPanning = false;
    let spaceDown = false;
    let lastPanPoint = { x: 0, y: 0 };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !spaceDown) {
        spaceDown = true;
        canvas.defaultCursor = "grab";
        canvas.selection = false;
      }

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        document.activeElement === document.body
      ) {
        const active = canvas.getActiveObjects();
        active.forEach((obj) => {
          const o = obj as unknown as FabricWithData;
          if (o.data?.id) removeObject(o.data.id);
          canvas.remove(obj);
        });
        canvas.discardActiveObject();
        canvas.renderAll();
      }

      const shortcuts: Record<string, string> = {
        v: "select", s: "sticky-note", r: "rectangle",
        c: "circle", a: "arrow", p: "pen", t: "text",
      };
      if (!e.ctrlKey && !e.metaKey && shortcuts[e.key]) {
        useToolStore.getState().setActiveTool(
          shortcuts[e.key] as import("@/types/canvas").ToolType
        );
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceDown = false;
        canvas.defaultCursor = "default";
        canvas.selection = true;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    canvas.on("mouse:down", (e) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pointer = canvas.getScenePoint(e.e as any);
      const native = e.e as MouseEvent;

      if (spaceDown || native.button === 1) {
        isPanning = true;
        lastPanPoint = { x: native.clientX, y: native.clientY };
        canvas.defaultCursor = "grabbing";
        return;
      }

      const tool = activeToolRef.current;
      if (tool === "select") return;

      if (tool === "sticky-note") {
        createStickyNote(pointer.x, pointer.y);
        useToolStore.getState().setActiveTool("select");
        return;
      }

      if (tool === "text") {
        const text = new IText("Text", {
          left: pointer.x, top: pointer.y,
          fontSize: 20, fontFamily: "sans-serif",
          fill: strokeColorRef.current,
        });
        stampAndSync(text, "text", {
          text: "Text", fontSize: 20,
          fontFamily: "sans-serif",
          fill: strokeColorRef.current,
          fontWeight: "normal",
        });
        canvas.setActiveObject(text);
        text.enterEditing();
        useToolStore.getState().setActiveTool("select");
        return;
      }

      if (tool === "arrow") {
        isDrawingArrow.current = true;
        arrowStartPoint.current = { x: pointer.x, y: pointer.y };
        return;
      }

      if (tool === "pen") {
        canvas.isDrawingMode = true;
        return;
      }

      if (tool === "rectangle" || tool === "circle") {
        canvas.selection = false;
        const startX = pointer.x;
        const startY = pointer.y;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let shape: any = null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onMove = (ev: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const p = canvas.getScenePoint(ev.e as any);
          const w = p.x - startX;
          const h = p.y - startY;
          if (shape) canvas.remove(shape);

          if (tool === "rectangle") {
            shape = new Rect({
              left: w < 0 ? p.x : startX, top: h < 0 ? p.y : startY,
              width: Math.abs(w), height: Math.abs(h),
              fill: fillColorRef.current,
              stroke: strokeColorRef.current,
              strokeWidth: strokeWidthRef.current,
              rx: 4, ry: 4, selectable: false,
            });
          } else {
            const radius = Math.sqrt(w * w + h * h) / 2;
            shape = new Circle({
              left: startX + w / 2 - radius,
              top: startY + h / 2 - radius,
              radius,
              fill: fillColorRef.current,
              stroke: strokeColorRef.current,
              strokeWidth: strokeWidthRef.current,
              selectable: false,
            });
          }
          canvas.add(shape);
          canvas.renderAll();
        };

        const onUp = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          canvas.off("mouse:move", onMove as any);
          canvas.off("mouse:up", onUp);
          canvas.selection = true;
          if (!shape) return;
          canvas.remove(shape);

          if (tool === "rectangle") {
            const r = new Rect({
              left: shape.left, top: shape.top,
              width: shape.width, height: shape.height,
              fill: fillColorRef.current, stroke: strokeColorRef.current,
              strokeWidth: strokeWidthRef.current, rx: 4, ry: 4,
            });
            stampAndSync(r, "rectangle", {
              fill: fillColorRef.current, stroke: strokeColorRef.current,
              strokeWidth: strokeWidthRef.current, rx: 4,
            });
          } else {
            const c = new Circle({
              left: shape.left, top: shape.top, radius: shape.radius,
              fill: fillColorRef.current, stroke: strokeColorRef.current,
              strokeWidth: strokeWidthRef.current,
            });
            stampAndSync(c, "circle", {
              fill: fillColorRef.current, stroke: strokeColorRef.current,
              strokeWidth: strokeWidthRef.current, radius: shape.radius ?? 50,
            });
          }
          useToolStore.getState().setActiveTool("select");
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvas.on("mouse:move", onMove as any);
        canvas.on("mouse:up", onUp);
      }
    });

    canvas.on("mouse:move", (e) => {
      const native = e.e as MouseEvent;
      if (isPanning) {
        const dx = native.clientX - lastPanPoint.x;
        const dy = native.clientY - lastPanPoint.y;
        lastPanPoint = { x: native.clientX, y: native.clientY };
        const vpt = canvas.viewportTransform;
        if (vpt) { vpt[4] += dx; vpt[5] += dy; canvas.requestRenderAll(); }
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pointer = canvas.getScenePoint(e.e as any);

      if (isDrawingArrow.current && arrowStartPoint.current) {
        if (tempArrowRef.current) canvas.remove(tempArrowRef.current);
        const pd = buildArrowPath(
          arrowStartPoint.current.x, arrowStartPoint.current.y,
          pointer.x, pointer.y
        );
        const preview = new Path(pd, {
          stroke: strokeColorRef.current,
          strokeWidth: strokeWidthRef.current,
          fill: "transparent", selectable: false, evented: false,
        });
        tempArrowRef.current = preview;
        canvas.add(preview);
        canvas.renderAll();
      }

      updatePresence({ cursor: { x: pointer.x, y: pointer.y } });
    });

    canvas.on("mouse:up", (e) => {
      const native = e.e as MouseEvent;
      if (isPanning) {
        isPanning = false;
        canvas.defaultCursor = spaceDown ? "grab" : "default";
        return;
      }

      if (isDrawingArrow.current && arrowStartPoint.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pointer = canvas.getScenePoint(native as any);
        if (tempArrowRef.current) { canvas.remove(tempArrowRef.current); tempArrowRef.current = null; }

        const { x: x1, y: y1 } = arrowStartPoint.current;
        const { x: x2, y: y2 } = pointer;
        isDrawingArrow.current = false;
        arrowStartPoint.current = null;

        if (Math.hypot(x2 - x1, y2 - y1) < 5) return;

        const pd = buildArrowPath(x1, y1, x2, y2);
        const arrow = new Path(pd, {
          stroke: strokeColorRef.current,
          strokeWidth: strokeWidthRef.current,
          fill: "transparent",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (arrow as any)._arrowData = { x1, y1, x2, y2 };
        stampAndSync(arrow, "arrow", {
          stroke: strokeColorRef.current,
          strokeWidth: strokeWidthRef.current,
          x1, y1, x2, y2,
        });
        useToolStore.getState().setActiveTool("select");
      }
    });

    canvas.on("mouse:wheel", (e) => {
      const we = e.e as WheelEvent;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** we.deltaY;
      zoom = Math.min(Math.max(zoom, 0.1), 10);
      canvas.zoomToPoint(new Point(we.offsetX, we.offsetY), zoom);
      we.preventDefault();
      we.stopPropagation();
    });

    canvas.on("mouse:out", () => updatePresence({ cursor: null }));

    // Double-click to edit sticky note text
    canvas.on("mouse:dblclick", (e) => {
      if (!e.target) return;
      const obj = e.target as unknown as FabricWithData;
      if (obj.data?.type !== "sticky-note") return;

      const group = e.target as Group;
      const items = group.getObjects?.() ?? [];
      const textObj = items.find((o) => o.type === "i-text") as IText | undefined;
      if (!textObj) return;

      // Remove the group, add individual items to canvas
      const groupLeft = group.left ?? 0;
      const groupTop = group.top ?? 0;
      const groupAngle = group.angle ?? 0;

      canvas.remove(group);

      const rectObj = items.find((o) => o.type === "rect") as Rect | undefined;
      if (rectObj) {
        rectObj.set({ left: groupLeft, top: groupTop, angle: groupAngle, selectable: false, evented: false });
        (rectObj as unknown as FabricWithData).data = { id: obj.data!.id, type: "__sticky-bg" };
        canvas.add(rectObj);
      }

      textObj.set({
        left: groupLeft + 10,
        top: groupTop + 10,
        angle: groupAngle,
      });
      (textObj as unknown as FabricWithData).data = { id: obj.data!.id, type: "__sticky-text" };
      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      textObj.enterEditing();
      textObj.selectAll();
      canvas.renderAll();

      // When editing is done, re-group them
      const onDeselect = () => {
        textObj.exitEditing();
        const newText = textObj.text ?? "";

        canvas.remove(rectObj as unknown as Parameters<typeof canvas.remove>[0]);
        canvas.remove(textObj as unknown as Parameters<typeof canvas.remove>[0]);

        // Recreate the group
        const newRect = new Rect({
          width: rectObj?.width ?? 200,
          height: rectObj?.height ?? 200,
          fill: rectObj?.fill as string ?? "#fef08a",
          rx: 4, ry: 4,
          shadow: new Shadow({ color: "rgba(0,0,0,0.15)", blur: 8, offsetX: 2, offsetY: 2 }),
        });
        const newIText = new IText(newText, {
          left: 10, top: 10,
          width: (rectObj?.width ?? 200) - 20,
          fontSize: textObj.fontSize ?? 16,
          fill: textObj.fill as string ?? "#1e1e1e",
          fontFamily: "sans-serif",
        });
        const newGroup = new Group([newRect, newIText], {
          left: groupLeft, top: groupTop, angle: groupAngle,
        });
        (newGroup as unknown as FabricWithData).data = { id: obj.data!.id, type: "sticky-note" };
        canvas.add(newGroup);
        canvas.setActiveObject(newGroup);
        canvas.renderAll();

        // Sync the updated text to Liveblocks
        throttledUpdate(obj.data!.id, {
          text: newText,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvas.off("selection:cleared", onDeselect as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        canvas.off("selection:updated", onDeselect as any);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvas.on("selection:cleared", onDeselect as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canvas.on("selection:updated", onDeselect as any);
    });

    canvas.on(
      "object:modified",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throttle((e: any) => {
        if (isSyncingFromRemote.current || !e.target) return;
        const obj = e.target as FabricWithData;
        if (!obj.data?.id) return;
        throttledUpdate(
          obj.data.id,
          serializeFabricObject(obj, obj.data.type) as Partial<CanvasObjectLson>
        );
      }, 50)
    );

    // Sync standalone text edits to storage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on("text:changed", (e: any) => {
      if (isSyncingFromRemote.current || !e.target) return;
      const obj = e.target as unknown as FabricWithData;
      if (!obj.data?.id || obj.data.type?.startsWith("__sticky")) return;
      if (obj.data.type === "text") {
        throttledUpdate(obj.data.id, { text: (e.target as IText).text ?? "" });
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    canvas.on("path:created", (e: any) => {
      if (isSyncingFromRemote.current || !e.path) return;
      const path = e.path as Path;
      canvas.isDrawingMode = false;
      canvas.remove(path);
      stampAndSync(path, "path", {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        path: JSON.stringify((path as any).path),
        stroke: strokeColorRef.current,
        strokeWidth: strokeWidthRef.current,
        fill: "transparent",
      });
      useToolStore.getState().setActiveTool("select");
    });

    const handleResize = () => {
      canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
      canvas.renderAll();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    if (activeTool === "pen") {
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = strokeColor;
        canvas.freeDrawingBrush.width = strokeWidth;
      }
      canvas.selection = false;
    } else {
      canvas.isDrawingMode = false;
      canvas.selection = activeTool === "select";
    }
    canvas.defaultCursor = activeTool === "select" ? "default" : "crosshair";
  }, [activeTool, strokeColor, strokeWidth]);

  // Inbound sync
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !objects) return;

    isSyncingFromRemote.current = true;
    try {
      const allFabricObjs = canvas.getObjects() as unknown as FabricWithData[];
      const currentIds = new Map<string, FabricWithData>(
        allFabricObjs.filter((o) => o.data?.id).map((o) => [o.data!.id, o])
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (objects as any).forEach((liveObj: any, id: string) => {
        const plain = (typeof liveObj?.toObject === "function" ? liveObj.toObject() : liveObj) as CanvasObject;
        const existing = currentIds.get(id);

        if (existing) {
          existing.set({ left: plain.x, top: plain.y, angle: plain.angle });
          existing.setCoords();
          currentIds.delete(id);
        } else {
          const args = getDeserializedFabricArgs(plain);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let newObj: any = null;

          if (args.type === "rect") {
            newObj = new Rect(args.options as Record<string, unknown>);
          } else if (args.type === "circle") {
            newObj = new Circle(args.options as Record<string, unknown>);
          } else if (args.type === "path" || args.type === "arrow") {
            const { pathData, arrowData, ...rest } = args.options;
            newObj = new Path(String(pathData), rest as Record<string, unknown>);
            if (arrowData) newObj._arrowData = arrowData;
          } else if (args.type === "i-text") {
            const { text, ...rest } = args.options;
            newObj = new IText(String(text ?? ""), rest as Record<string, unknown>);
          } else if (args.type === "sticky-note") {
            const o = args.options;
            const bg = String(o.backgroundColor ?? "#fef08a");
            const rect = new Rect({
              width: Number(o.width), height: Number(o.height),
              fill: bg, rx: 4, ry: 4,
            });
            const itext = new IText(String(o.text ?? ""), {
              left: 10, top: 10,
              width: Number(o.width) - 20,
              fontSize: Number(o.fontSize ?? 16),
              fill: String(o.textColor ?? "#1e1e1e"),
              fontFamily: "sans-serif",
            });
            newObj = new Group([rect, itext], {
              left: Number(o.left), top: Number(o.top),
              angle: Number(o.angle ?? 0),
            });
          }

          if (newObj) {
            newObj.data = { id, type: plain.type };
            canvas.add(newObj);
          }
        }
      });

      currentIds.forEach((obj) =>
        canvas.remove(obj as unknown as Parameters<typeof canvas.remove>[0])
      );
      canvas.renderAll();
    } finally {
      isSyncingFromRemote.current = false;
    }
  }, [objects]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <canvas ref={canvasElRef} />
      <LiveCursors />
    </div>
  );
}
