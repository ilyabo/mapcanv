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
      } else {
        setPanning(false);
      }
    };
    const onKeyUp = (evt) => {
      if (evt.key === " ") {
        setPanning(false);
      }
    };
    const onWindowBlur = () => setPanning(false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, []);
  return {isPanning};
}
