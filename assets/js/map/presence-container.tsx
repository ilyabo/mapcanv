import React, {FC, Fragment, useMemo} from "react";
import {useAppStore} from "../store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {Separator} from "../components/ui/separator";

const PresenceContainer: FC = () => {
  const currentUserId = useAppStore((state) => state.userId);
  const presence = useAppStore((state) => state.presence);
  const users = useMemo(
    () =>
      Object.entries(presence).map(([userId, {metas}]) => ({
        userId,
        name: metas[0].name,
        color: metas[0].color,
      })),
    [presence]
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex">
          {users.map(({userId, color}) => (
            <svg
              key={userId}
              className="ml-[-18px] cursor-pointer"
              width="30"
              height="30"
              viewBox="0 0 20 20"
            >
              <circle
                cx="10"
                cy="10"
                r="8"
                fill={color}
                stroke="#fff"
                strokeWidth={0.7}
              />
            </svg>
          ))}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {users.map(({userId, color, name}, i) => (
          <Fragment key={userId}>
            <DropdownMenuItem
              className="text-xs"
              disabled={userId === currentUserId}
            >
              <div
                className="rounded-full h-3 w-3 mr-2"
                style={{backgroundColor: color}}
              />
              {name ?? userId === currentUserId ? "You" : "New user"}
            </DropdownMenuItem>
            {i < users.length - 1 ? (
              <div className="px-1 pb-1">
                <Separator />
              </div>
            ) : null}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PresenceContainer;
