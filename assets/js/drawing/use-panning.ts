import {useEffect} from "react";
import {useAppStore} from "../store";

/**
 * Add space keyboard event listener
 **/
export function usePanning() {
  const isPanning = useAppStore((state) => state.isPanning);
  const setPanning = useAppStore((state) => state.setPanning);

  useEffect(() => {
    const onKeyDown = (evt) => {
      if (evt.key === " ") {
        setPanning(true);
      }
    };
    const onKeyUp = (evt) => {
      if (evt.key === " ") {
        setPanning(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);
  return {isPanning};
}
