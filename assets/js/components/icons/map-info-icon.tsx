import React, {FC} from "react";
type Props = {
  size?: number;
};
const MapInfoIcon: FC<Props> = (props) => {
  const {size = 24} = props;
  return (
    <svg width={size} height={size} fill-rule="evenodd" viewBox="0 0 20 20">
      <path d="M4 10a6 6 0 1 0 12 0 6 6 0 1 0-12 0m5-3a1 1 0 1 0 2 0 1 1 0 1 0-2 0m0 3a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0" />
    </svg>
  );
};

export default MapInfoIcon;
