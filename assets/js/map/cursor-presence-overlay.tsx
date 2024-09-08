import React, {FC} from "react";
import {MapboxMap} from "react-map-gl";
import {useAppStore} from "../store/store";

// See https://github.com/visgl/react-map-gl/tree/7.0-release/examples/custom-overlay/src
export const CursorPresenceOverlay: FC<{map?: MapboxMap}> = ({map}) => {
  const presence = useAppStore((state) => state.presence);
  const userId = useAppStore((state) => state.userId);

  const width = map?.getContainer().clientWidth;
  const height = map?.getContainer().clientHeight;

  if (!map || !presence) return null;

  return (
    <svg width={width} height={height}>
      {presence.map((user) => {
        if (user.userId === userId) return null;
        const {lng, lat} = user.cursor;
        const {x, y} = map.project([lng, lat]);
        return (
          <g key={user.userId} transform={`translate(${x},${y})`}>
            <g
              fill={user.color}
              stroke={"#666"}
              strokeWidth={0.5}
              transform="translate(-5,-5)"
              fillOpacity={0.75}
            >
              <path d="M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z" />
            </g>

            {user.name && (
              <text fontSize={9} textAnchor="start" x={12} y={17} fill="black">
                {user.name}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
