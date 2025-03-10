import React from "react";
import { TOOL_BUTTONS } from "../../constants/editor-constants";
import { MdOutlineSettings } from "react-icons/md";

const CanvasToolbar = ({ tool, handleToolChange, strokeRef }) => {
  const [open, setOpen] = React.useState(false);
  const onPenSettingsToggle = () => {
    setOpen((prev) => !prev);
  }
  return (
    <div className="toolBar">
      {TOOL_BUTTONS.map(({ title, value, icon }) => (
        <button
          key={value}
          title={title}
          className={`toolBtn ${tool === value ? "activeTool" : ""}`}
          onClick={() => {
            setOpen(false);
            handleToolChange(value)
          }}
        >
          {icon}
        </button>
      ))}
      <input 
        title="Stroke Color"
        className="colorPicker" 
        type="color" 
        defaultValue={ strokeRef.current.strokeColor || "#000000"}
        onChange={(e) => strokeRef.current.strokeColor = e.target.value}
      />
      <div className="toolSettingWrapper">
        <button className="toolBtn" onClick={onPenSettingsToggle}><MdOutlineSettings /></button>
        <div className={`toolSettings ${open ? "open" : ""}`}>
          <div className="toolSettingRow">
            <label>Stroke Type</label>
            <select 
              className="strokeType" 
              onChange={(e) => strokeRef.current.strokeType = e.target.value}
              defaultValue={strokeRef.current.strokeType || 'solid'}
            >
              <option value="solid">—</option>
              <option value="dashed">- -</option>
            </select>
          </div>
          <div className="toolSettingRow">
            <label>Stroke Width</label>
            <select 
              className="strokeWidth" 
              onChange={(e) => strokeRef.current.strokeWidth = Number(e.target.value)}
              defaultChecked={strokeRef.current.strokeWidth || 2}
            >
              <option value="2" className="strokeWidth-2">2</option>
              <option value="3" className="strokeWidth-3">3</option>
              <option value="5" className="strokeWidth-5">5</option>
              <option value="1" className="strokeWidth-1">1</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasToolbar;
