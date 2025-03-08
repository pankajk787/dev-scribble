import { BiText, BiPencil } from "react-icons/bi";
import { LuEraser } from "react-icons/lu";
import { BsArrowUpRight } from "react-icons/bs";
import { FaRegCircle } from "react-icons/fa";
import { PiRectangleBold } from "react-icons/pi";
import { AiOutlineSelect } from "react-icons/ai";

export const TOOL_BUTTONS = [
  { title: "Select", value: "select", icon: <AiOutlineSelect /> },
  { title: "Pen", value: "pen", icon: <BiPencil /> },
  { title: "Text", value: "text", icon: <BiText /> },
  { title: "Rectangle", value: "rectangle", icon: <PiRectangleBold /> },
  { title: "Circle", value: "circle", icon: <FaRegCircle /> },
  { title: "Arrow", value: "arrow", icon: <BsArrowUpRight /> },
  { title: "Eraser", value: "eraser", icon: <LuEraser /> },
];