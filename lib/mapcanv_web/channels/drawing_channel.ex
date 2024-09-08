defmodule MapCanvWeb.DrawingChannel do
  use MapCanvWeb, :channel
  alias MapCanv.FeaturesAgent
  alias MapCanvWeb.Presence

  @impl true
  def join("drawing:" <> guid, %{"userName" => user_name, "userColor" => user_color}, socket) do
    user_id = socket.assigns[:user_id]
    IO.inspect("Joining drawing channel with guid: #{guid} and user_id: #{user_id}")

    #FeaturesAgent.apply_update(guid, state_binary)
    current_state = FeaturesAgent.get_state(guid)

    # Store the GUID in the socket assigns
    socket = assign(socket, :guid, guid)

    # Track the user's presence for the specific GUID
    send(self(), {:after_join, user_name, user_color})

    {:ok, {:binary, current_state}, socket}
  end

  # Track presence after joining the channel
  @impl true
  def handle_info({:after_join, user_name, user_color}, socket) do
    guid = socket.assigns.guid
    user_id = socket.assigns[:user_id]
    IO.inspect("Tracking presence for drawing channel with guid: #{guid} and user_id: #{user_id}")

    # Track presence
    {:ok, _} = Presence.track(socket, socket.assigns.user_id, %{
      online_at: inspect(System.system_time(:second)),
      name: user_name,
      color: user_color,
      cursor: %{lat: 0, lng: 0} # Initial cursor position
    })
    push(socket, "presence_state", Presence.list(socket))

    {:noreply, socket}
  end

  def handle_in("cursor_moved", %{"lat" => lat, "lng" => lng, "userName" => user_name, "userColor" => user_color}, socket) do
    user_id = socket.assigns[:user_id]
    guid = socket.assigns[:guid]

    IO.inspect("Cursor moved to lat: #{lat}, lng: #{lng} for user_id: #{user_id} in drawing channel with guid: #{guid}")
    # Update the user's presence with the new cursor position
    {:ok, _} = Presence.update(socket, user_id, %{
      cursor: %{lat: lat, lng: lng},
      name: user_name,
      color: user_color
    })

    {:noreply, socket}
  end

  # Handle incoming Yjs updates
  @impl true
  def handle_in("yjs-update", {:binary, update_binary}, socket) do
    guid = socket.assigns[:guid]

    # Apply the incoming update and store the new state
    FeaturesAgent.apply_update(guid, update_binary)

    # Broadcast the Yjs update to all other clients in the channel
    broadcast_from!(socket, "yjs-update", {:binary, update_binary})

    {:noreply, socket}
  end


  @impl true
  def terminate(_reason, socket) do
    guid = socket.assigns.guid
    user_id = socket.assigns[:user_id]
    IO.inspect("Terminating drawing channel with guid: #{guid} and user_id: #{user_id}")

    # Fetch the current presence information for the GUID
    current_presence = Presence.list("drawing:#{guid}")

    # If no more users are present for this GUID, clean up resources
    if map_size(current_presence) == 1 do
      # This was the last user, perform the cleanup
      #cleanup_ydoc(guid)
      IO.inspect("Cleaning up resources for drawing channel with guid: #{guid}")
    end

    :ok
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
