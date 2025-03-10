import React from "react";
import { TOOL_BUTTONS } from "../../constants/editor-constants";

const CanvasToolbar = ({ tool, handleToolChange, strokeColorRef}) => {
  return (
    <div className="toolBar">
      {TOOL_BUTTONS.map(({ title, value, icon }) => (
        <button
          key={value}
          title={title}
          className={`toolBtn ${tool === value ? "activeTool" : ""}`}
          onClick={() => handleToolChange(value)}
        >
          {icon}
        </button>
      ))}
      <input 
        title="Stroke Color"
        className="colorPicker" 
        type="color" 
        defaultValue={"#000000"}
        onChange={(e) => strokeColorRef.current = e.target.value}
      />
    </div>
  );
};

export default CanvasToolbar;
