import React from "react";
import { TOOL_BUTTONS } from "../../constants/editor-constants";

const CanvasToolbar = ({ tool, handleToolChange}) => {
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
    </div>
  );
};

export default CanvasToolbar;
