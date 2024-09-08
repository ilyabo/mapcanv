defmodule MapCanvWeb.Presence do
  use Phoenix.Presence,
    otp_app: :mapcanv,
    pubsub_server: MapCanv.PubSub
end
