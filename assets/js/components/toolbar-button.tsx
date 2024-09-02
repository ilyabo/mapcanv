import {LucideIcon} from "lucide-react";
import React, {FC} from "react";
import {Button} from "./ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "./ui/tooltip";
import {cn} from "./ui/utils";

export const ToolbarButton: FC<{
  icon: LucideIcon;
  isSelected?: boolean;
  tooltipText: string;
  onClick: () => void;
}> = ({icon: Icon, isSelected, tooltipText, onClick}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "border bg-gray-400 hover:bg-gray-600 transition-colors",
            {
              "bg-gray-700": isSelected,
              shadow: isSelected,
            }
          )}
          size="icon"
          onClick={onClick}
        >
          {Icon ? <Icon size="16px" /> : null}
        </Button>
      </TooltipTrigger>
      <TooltipContent align="center" side="right" className="text-xs">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};
