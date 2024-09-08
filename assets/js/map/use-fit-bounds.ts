import bbox from "@turf/bbox";
import {useCallback, useEffect, useRef} from "react";
import {MapRef} from "react-map-gl/maplibre";
import {PolygonFeature, useAppStore} from "../store/store";

export function useFitBounds(mapRef: React.RefObject<MapRef>) {
  const features = useAppStore((state) => state.features);
  const shouldFitViewport = useAppStore((state) => state.shouldFitViewport);
  const fitBounds = useCallback(
    (duration: number) => {
      const [minLng, minLat, maxLng, maxLat] = getFeaturesBounds(features);
      mapRef.current?.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {padding: 40, duration}
      );
    },
    [features, mapRef]
  );

  const initialFitDone = useRef(false);
  useEffect(() => {
    if (!initialFitDone.current && shouldFitViewport) {
      fitBounds(0);
      initialFitDone.current = true;
    }
  }, [fitBounds, shouldFitViewport]);

  return {
    handleFitBounds: useCallback(() => {
      fitBounds(500);
    }, [fitBounds]),
  };
}

/**
 * Calculate the bounding box of the feature
 */
export function getFeaturesBounds(
  features: PolygonFeature[]
): [number, number, number, number] {
  return bbox({
    type: "FeatureCollection",
    // @ts-ignore
    features,
  }) as [number, number, number, number];
}
