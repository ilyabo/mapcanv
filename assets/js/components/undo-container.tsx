import React, {FC} from "react";
import {useAppStore} from "../store/store";
import {ToolbarButton} from "./toolbar-button";
import {Redo2Icon, Undo2Icon} from "lucide-react";
type Props = {};
const UndoContainer: FC<Props> = (props) => {
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  return (
    <div className="flex flex-row gap-1 items-center">
      <ToolbarButton icon={Undo2Icon} tooltipText={"Undo"} onClick={undo} />
      <ToolbarButton icon={Redo2Icon} tooltipText={"Redo"} onClick={redo} />
    </div>
  );
};

export default UndoContainer;
