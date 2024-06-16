defmodule CollaborativeDrawingWeb.DrawingChannel do
  use CollaborativeDrawingWeb, :channel

  @impl true
  def join("drawing:lobby", payload, socket) do
    if authorized?(payload) do
      polygons = CollaborativeDrawing.LinesAgent.get_polygons()
      {:ok, %{polygons: polygons}, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_in("draw", %{"polygon" => polygon} = payload, socket) do
    CollaborativeDrawing.LinesAgent.add_polygon(polygon)
    broadcast(socket, "draw", payload)
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
  defp authorized?(_payload) do
    true
  end
end
