import React, { useEffect, useState, useRef } from "react";
import { BiText, BiPencil } from "react-icons/bi";
import { LuEraser } from "react-icons/lu";
import { BsArrowUpRight } from "react-icons/bs";
import { FaRegCircle } from "react-icons/fa";
import { PiRectangleBold } from "react-icons/pi";
import { AiOutlineSelect } from "react-icons/ai";
import { fabric } from "fabric";
import "./style.css";

const toolButtons = [
  { title: "Select", value: "select", icon: <AiOutlineSelect /> },
  { title: "Pen", value: "pen", icon: <BiPencil /> },
  { title: "Text", value: "text", icon: <BiText /> },
  { title: "Rectangle", value: "rectangle", icon: <PiRectangleBold /> },
  { title: "Circle", value: "circle", icon: <FaRegCircle /> },
  { title: "Arrow", value: "arrow", icon: <BsArrowUpRight /> },
  { title: "Eraser", value: "eraser", icon: <LuEraser /> },
];

const CanvasFreeDraw = ({ socketRef }) => {
  const [open, setOpen] = useState(false);
  const [tool, setTool] = useState("select");
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const isDrawing = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const shape = useRef(null);

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      selection: true,
    });

    fabricCanvasRef.current = fabricCanvas;

    const resizeCanvas = () => {
      const container = document.querySelector(".canvasFreeDrawContainer");
      if (container) {
        fabricCanvas.setWidth(container.clientWidth - 20);
        fabricCanvas.setHeight(container.clientHeight || Math.round(window.innerHeight * 0.9));
        fabricCanvas.renderAll();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    socketRef.current?.on("canvas-update", (data) => {
      fabricCanvas.loadFromJSON(data);
    });

    return () => {
      socketRef.current?.off("canvas-update");
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
        stroke: "black",
        strokeWidth: 2,
      });
      canvas.add(shape.current);
    } 
    else if (tool === "circle") {
      isDrawing.current = true;
      startX.current = offsetX;
      startY.current = offsetY;
      shape.current = new fabric.Ellipse({
        left: offsetX,
        top: offsetY,
        rx: 0,
        ry: 0,
        fill: "transparent",
        stroke: "black",
        strokeWidth: 2,
      });
      canvas.add(shape.current);
    }
    else if (tool === "arrow") {
      isDrawing.current = true;
      startX.current = offsetX;
      startY.current = offsetY;
      shape.current = new fabric.Line([offsetX, offsetY, offsetX, offsetY], {
        stroke: "black",
        strokeWidth: 3,
        selectable: true,
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
        fill: "black",
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      setTool("select");
    }
  };

  const handleMouseMove = (event) => {
    if (!isDrawing.current || !fabricCanvasRef.current || !shape.current) return;
    const { offsetX, offsetY } = event.e;
    const canvas = fabricCanvasRef.current;

    if (tool === "rectangle") {
      shape.current.set({
        width: Math.abs(offsetX - startX.current),
        height: Math.abs(offsetY - startY.current),
        left: Math.min(startX.current, offsetX),
        top: Math.min(startY.current, offsetY),
      });
    } 
    else if (tool === "circle") {
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
    }
    else if (tool === "arrow") {
      shape.current.set({ x2: offsetX, y2: offsetY });
    }

    if(tool === "eraser") {
      canvas.defaultCursor = "not-allowed";
    }
    else if(tool === "select") {
      canvas.defaultCursor = "default";
    }
    else {
      canvas.defaultCursor = "crosshair";
    }
    canvas.renderAll();
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    shape.current = null;

    if(['rectangle', 'circle', 'arrow'].includes(tool)) {
      setTimeout(() => {
        setTool('select');
      }, 0);
    }
  };

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    if(tool === "eraser") {
      canvas.defaultCursor = "not-allowed";
    }
    else if(tool === "select") {
      canvas.defaultCursor = "default";
    }
    else {
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

  

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const handleCanvasChange = () => {
      if (!canvas) return;
      const canvasJSON = canvas.toJSON();
      console.log("canvasJSON", canvasJSON);
      socketRef.current?.emit("canvas-update", canvasJSON);
    };
    if (!canvas) return;
    canvas.on("object:added", handleCanvasChange);
    canvas.on("object:modified", handleCanvasChange);
    canvas.on("object:removed", handleCanvasChange); 
    return () => {
      canvas.off("object:added", handleCanvasChange);
      canvas.off("object:modified", handleCanvasChange);
       canvas.off("object:removed", handleCanvasChange);
    };
  }, [fabricCanvasRef.current]);

  return (
    <>
      <div className={`canvasFreeDrawOverLay ${open ? "open" : ""}`}>
        <div className={`canvasFreeDrawContainer ${open ? "open" : ""}`}>
          <div style={{ display: open ? "block" : "none" }}>
            <div className="toolBar">
              {toolButtons.map(({ title, value, icon }) => (
                <button
                  key={value}
                  title={title}
                  className={`toolBtn ${tool === value ? "activeTool" : ""}`}
                  onClick={() => handleToolChange(value)}
                >
                  {icon}
                </button>
              ))}
            </div>
            <canvas ref={canvasRef} className="canvasFreeDraw" style={{ border: "1px solid black" }}></canvas>
          </div>
        </div>
        <button className={`scrollTool ${open ? "open" : ""}`} onClick={() => setOpen((prev) => !prev)}>
          ✒️
        </button>
      </div>
    </>
  );
};

export default CanvasFreeDraw;
