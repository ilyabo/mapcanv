defmodule CollaborativeDrawingWeb.DrawingChannel do
  use CollaborativeDrawingWeb, :channel
  alias CollaborativeDrawing.FeaturesAgent

  @impl true
  def join("drawing:lobby", _payload, socket) do
    current_state = FeaturesAgent.get_state()
    {:ok, %{"state" => current_state}, socket}
  end

  # @impl true
  # @spec handle_in(<<_::32, _::_*48>>, map(), Phoenix.Socket.t()) :: {:noreply, Phoenix.Socket.t()}
  # def handle_in("draw", %{"feature" => feature} = payload, socket) do
  #   CollaborativeDrawing.FeaturesAgent.add_or_update_feature(feature)
  #   IO.inspect(payload, label: "Broadcasting payload")
  #   broadcast(socket, "draw", payload)
  #   {:noreply, socket}
  # end

  @impl true
  def handle_in("yjs-update", %{"update" => update}, socket) do
    # Apply the incoming update and store the new state
    FeaturesAgent.apply_update(update)

    # Broadcast the Yjs update to all other clients in the channel
    broadcast_from!(socket, "yjs-update", %{"update" => update})
    {:noreply, socket}
  end

  # # Channels can be used in a request/response fashion
  # # by sending replies to requests from the client
  # @impl true
  # @spec handle_in(<<_::32, _::_*8>>, any(), any()) ::
  #         {:noreply, Phoenix.Socket.t()} | {:reply, {:ok, any()}, any()}
  # def handle_in("ping", payload, socket) do
  #   {:reply, {:ok, payload}, socket}
  # end

  # # It is also common to receive messages from the client and
  # # broadcast to everyone in the current topic (drawing:lobby).
  # @impl true
  # def handle_in("shout", payload, socket) do
  #   broadcast(socket, "shout", payload)
  #   {:noreply, socket}
  # end

  # Add authorization logic here as required.
  # defp authorized?(_payload) do
  #   true
  # end


end
