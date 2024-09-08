import {FeatureOf, Polygon} from "@deck.gl-community/editable-layers";

import {Channel, Socket} from "phoenix";

export type PhoenixSocket = typeof Socket.prototype;
export type PhoenixChannel = typeof Channel.prototype;
export type PolygonFeature = FeatureOf<Polygon>;
export type PresenseState = Record<
  string, // user_id
  {
    metas: [
      {
        color?: string;
        name?: string;
        phx_ref: string;
        online_at: number;
        cursor?: LngLat;
      }
    ];
  }
>;

export type LngLat = {
  lng: number;
  lat: number;
};

export type UserPresence = {
  userId: string;
  name: string | undefined;
  color: string;
  cursor: LngLat;
  onlineAt: number;
};
