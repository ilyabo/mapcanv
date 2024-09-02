defmodule CollaborativeDrawingWeb.DrawingChannel do
  use CollaborativeDrawingWeb, :channel
  alias CollaborativeDrawing.FeaturesAgent

  # TODO: send binary
  # https://github.com/paulanthonywilson/binary-websockets-example?tab=readme-ov-file
  # https://furlough.merecomplexities.com/elixir/phoenix/tutorial/2021/02/19/binary-websockets-with-elixir-phoenix.html

  @impl true
  def join("drawing:lobby", _payload, socket) do
    current_state = FeaturesAgent.get_state()
    #update_list = if is_binary(current_state), do: :erlang.binary_to_list(current_state), else: current_state
    #current_state = nil
    #{:ok, %{"state" => current_state}, socket}
    {:ok, {:binary, current_state}, socket}
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
    # Ensure update is treated as binary
    # IO.inspect(update, label: "Incoming update")
    # cond do
    #   is_binary(update) -> IO.puts("Type of update: binary")
    #   is_list(update) -> IO.puts("Type of update: list")
    #   is_map(update) -> IO.puts("Type of update: map")
    #   is_integer(update) -> IO.puts("Type of update: integer")
    #   is_float(update) -> IO.puts("Type of update: float")
    #   is_tuple(update) -> IO.puts("Type of update: tuple")
    #   true -> IO.puts("Type of update: unknown")
    # end

    update_binary = if is_list(update), do: :erlang.list_to_binary(update), else: update
    #IO.inspect(update_binary, label: "Incoming Update (Binary)")

    # Apply the incoming update and store the new state
    FeaturesAgent.apply_update(update_binary)

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
