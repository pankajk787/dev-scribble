import React, { useState } from "react";
import "./style.css";

const CanvasFreeDraw = (props) => {
  const [open, setOpen] = useState(false);

  const handleToggleFreeCanvas = () => {
    setOpen((prev) => !prev);
  };

  return (
    <>
      <div className={`canvasFreeDrawOverLay ${open ? "open" : ""}`}>
        <div className={`canvasFreeDrawContainer ${open ? "open" : ""}`}>
          <div className="canvasFreeDraw">CanvasFreeDraw</div>
        </div>
      </div>
      <button
        className={`scrollTool ${open ? "open" : ""}`}
        onClick={handleToggleFreeCanvas}
      >
        ✒️
      </button>
    </>
  );
};

export default CanvasFreeDraw;
