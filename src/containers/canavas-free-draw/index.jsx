import React, { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import CanvasToolbar from "./canvas-toolbar";
import { FaPenNib } from "react-icons/fa";
import { fabric } from "fabric";
import ACTIONS from "../../constants/actions";
import "./style.css";
const INITIAL_STROKE_SETTINGS = {
  strokeColor: "#000000",
  strokeType: "solid",
  strokeWidth: 2,
}
const CanvasFreeDraw = ({ socketRef, roomId }) => {
  const { canvasContentRef } = useOutletContext();
  const [open, setOpen] = useState(false);
  const [tool, setTool] = useState("select");
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const isDrawing = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const shape = useRef(null);
  const strokeRef = useRef(INITIAL_STROKE_SETTINGS);

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      selection: true,
    });

    fabricCanvasRef.current = fabricCanvas;

    const resizeCanvas = () => {
      const container = document.querySelector(".canvasFreeDrawContainer");
      if (container) {
        fabricCanvas.setWidth(container.clientWidth - 20);
        fabricCanvas.setHeight(
          container.clientHeight || Math.round(window.innerHeight * 0.9)
        );
        fabricCanvas.renderAll();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const handleToolChange = (selectedTool) => {
    setTool(selectedTool);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = selectedTool === "pen";
    canvas.selection = selectedTool === "select";
    canvas.forEachObject((obj) => (obj.selectable = selectedTool === "select"));
  };

  const handleMouseDown = (event) => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const { offsetX, offsetY } = event.e;
    canvas.freeDrawingBrush.color = strokeRef.current.strokeColor;
    canvas.freeDrawingBrush.width = strokeRef.current.strokeWidth;
    canvas.freeDrawingBrush.dashed = strokeRef.current.strokeType === "dashed";

    if (tool === "rectangle") {
      isDrawing.current = true;
      startX.current = offsetX;
      startY.current = offsetY;
      shape.current = new fabric.Rect({
        left: offsetX,
        top: offsetY,
        width: 0,
        height: 0,
        fill: "transparent",
        stroke: strokeRef.current.strokeColor,
        strokeWidth: strokeRef.current.strokeWidth,
        strokeDashArray: strokeRef.current.strokeType === "dashed" ? [5, 5] : undefined,
      });
      canvas.add(shape.current);
    } else if (tool === "circle") {
      isDrawing.current = true;
      startX.current = offsetX;
      startY.current = offsetY;
      shape.current = new fabric.Ellipse({
        left: offsetX,
        top: offsetY,
        rx: 0,
        ry: 0,
        fill: "transparent",
        stroke: strokeRef.current.strokeColor,
        strokeWidth: strokeRef.current.strokeWidth,
        strokeDashArray: strokeRef.current.strokeType === "dashed" ? [5, 5] : undefined,
      });
      canvas.add(shape.current);
    }
    if (tool === "arrow") {
      isDrawing.current = true;
      startX.current = offsetX;
      startY.current = offsetY;

      shape.current = new fabric.Line([offsetX, offsetY, offsetX, offsetY], {
        stroke: strokeRef.current.strokeColor,
        strokeWidth: strokeRef.current.strokeWidth,
        strokeDashArray: strokeRef.current.strokeType === "dashed" ? [5, 5] : undefined,
        selectable: false,
      });
      canvas.add(shape.current);
    } else if (tool === "eraser") {
      const clickedObject = canvas.findTarget(event.e);
      if (clickedObject) {
        canvas.remove(clickedObject);
      }
    } else if (tool === "text") {
      const text = new fabric.IText("Text here", {
        left: offsetX,
        top: offsetY,
        fontSize: 18,
        fill: strokeRef.current.strokeColor,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      setTool("select");
    }
  };

  const handleMouseMove = (event) => {
    if (!isDrawing.current || !fabricCanvasRef.current || !shape.current)
      return;
    const { offsetX, offsetY } = event.e;
    const canvas = fabricCanvasRef.current;

    if (tool === "rectangle") {
      shape.current.set({
        width: Math.abs(offsetX - startX.current),
        height: Math.abs(offsetY - startY.current),
        left: Math.min(startX.current, offsetX),
        top: Math.min(startY.current, offsetY),
      });
    } else if (tool === "circle") {
      const width = Math.abs(offsetX - startX.current);
      const height = Math.abs(offsetY - startY.current);

      shape.current.set({
        rx: width / 2,
        ry: height / 2,
        left: Math.min(startX.current, offsetX),
        top: Math.min(startY.current, offsetY),
        originX: "left",
        originY: "top",
      });
    } else if (tool === "arrow") {
      shape.current.set({ x2: offsetX, y2: offsetY });
    }

    if (tool === "eraser") {
      canvas.defaultCursor = "not-allowed";
    } else if (tool === "select") {
      canvas.defaultCursor = "default";
    } else {
      canvas.defaultCursor = "crosshair";
    }
    canvas.renderAll();
  };

  const handleMouseUp = () => {
    const canvas = fabricCanvasRef.current;
    if (tool === "arrow" && shape.current) {
      const { x1, y1, x2, y2 } = shape.current;
      canvas.remove(shape.current); // Remove the temporary line

      // Compute angle of the arrow
      const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
      const arrowSize = 10; // Arrowhead size
      const offset = 5; // Move forward by 5px

      // Compute direction unit vector
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / length;
      const uy = dy / length;

      // Move arrowhead slightly forward along the line direction
      const arrowHead = new fabric.Triangle({
        left: x2 + ux * offset,
        top: y2 + uy * offset,
        originX: "center",
        originY: "center",
        angle: angle + 90,
        width: arrowSize * 2,
        height: arrowSize * 2,
        fill: strokeRef.current.strokeColor
      });

      // Create final arrow as a group
      const arrow = new fabric.Group(
        [
          new fabric.Line([x1, y1, x2, y2], {
            stroke: strokeRef.current.strokeColor,
            fill: strokeRef.current.strokeColor,
            strokeWidth: strokeRef.current.strokeWidth,
            strokeDashArray: strokeRef.current.strokeType === "dashed" ? [5, 5] : undefined,
            selectable: true,
          }),
          arrowHead,
        ],
        {
          selectable: true,
        }
      );

      canvas.add(arrow);
      canvas.renderAll();
    }

    shape.current = null;

    isDrawing.current = false;
    const canvasContent = fabricCanvasRef.current.toJSON();
    canvasContentRef.current = canvasContent;
    socketRef.current?.emit(ACTIONS.CANVAS_CHANGE, { roomId, senderId: socketRef.current.id, canvasContent });

    if (["rectangle", "circle", "arrow"].includes(tool)) {
      setTimeout(() => {
        setTool("select");
      }, 0);
    }
  };

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if (tool === "eraser") {
      canvas.defaultCursor = "not-allowed";
    } else if (tool === "select") {
      canvas.defaultCursor = "default";
    } else {
      canvas.defaultCursor = "crosshair";
    }
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [tool]);

  const handleCanvasSync = async (canvasContent) => {
    await new Promise((resolve) => { // Waiting for the canvas to be ready
      setTimeout(() => {
        resolve();
      }, 10);
    });
    fabricCanvasRef.current.loadFromJSON(canvasContent);
  }

  useEffect(() => {
    const handleCanvasChange = ({ canvasContent, senderId, isCanvasSync }) => {
      if(senderId === socketRef.current.id) return; // Ignore the sync from self

      if(isCanvasSync) {
        handleCanvasSync(canvasContent);
      }
      else {
        if(fabricCanvasRef.current) {
          fabricCanvasRef.current.loadFromJSON(canvasContent);
        }
      }
    }

    if(socketRef.current) {
      // Listen to ACTIONS.CANVAS_CHANGE
      socketRef.current.on(ACTIONS.CANVAS_CHANGE, handleCanvasChange);
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if(socketRef.current) {
        socketRef.current.off(ACTIONS.CANVAS_CHANGE, handleCanvasChange);
      }
    }
  }, [socketRef.current, fabricCanvasRef.current]);

  return (
    <>
      <div className={`canvasFreeDrawOverLay ${open ? "open" : ""}`}>
        <div className={`canvasFreeDrawContainer ${open ? "open" : ""}`}>
          <div style={{ display: open ? "block" : "none" }}>
            <CanvasToolbar
              tool={tool} 
              handleToolChange={handleToolChange} 
              strokeRef={strokeRef}
            />
            <canvas
              ref={canvasRef}
              className="canvasFreeDraw"
              style={{ border: "1px solid black" }}
            ></canvas>
          </div>
        </div>
        <button
          className={`scrollTool ${open ? "open" : ""}`}
          onClick={() => setOpen((prev) => !prev)}
        >
          <FaPenNib />
        </button>
      </div>
    </>
  );
};

export default CanvasFreeDraw;
