defmodule MapCanvWeb.DrawingChannel do
  use MapCanvWeb, :channel
  alias MapCanv.FeaturesAgent
  alias MapCanvWeb.Presence
  alias ExAws.S3

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

    # TODO Now that you’ve broadcast the message across the PubSub system,
    # you need to subscribe to that topic in your channel when the client joins,
    #  so other instances will handle the update and broadcast it to their own local clients.
    # Subscribe to the topic for this drawing session
    #Phoenix.PubSub.subscribe(MyApp.PubSub, "yjs-update:#{guid}")

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

    # TODO: broadcast_from only sends the message to the current node, so we need to
    # Publish the message to the PubSub system so all instances will receive it
    #Phoenix.PubSub.broadcast(MyApp.PubSub, "yjs-update:#{guid}", {:binary, update_binary})

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
      # This was the last user, perform save and cleanup

      IO.inspect("Saving drawing channel with guid: #{guid}")
      ydoc = FeaturesAgent.get_state(guid)

      # Save the Yjs document to S3 (Cloudflare R2)
      save_document_to_s3(guid, ydoc)

      #IO.inspect("Cleaning up resources for drawing channel with guid: #{guid}")
      #FeaturesAgent.remove_document(guid)
    end

    :ok
  end

  defp save_document_to_s3(guid, ydoc) do
    bucket_name = System.get_env("S3_BUCKET_NAME")
    key = "#{guid}/features.yjs"
    # serialized_data = Y.encodeStateAsUpdate(ydoc)
    serialized_data = ydoc

    # Upload the Yjs document to the S3 bucket
    {:ok, _} = serialized_data
               |> S3.put_object(bucket_name, key)
               |> ExAws.request()

    IO.inspect("Document saved to S3 with key: #{key}")
  end

  # defp load_document_from_s3(guid) do
  #   bucket_name = System.get_env("S3_BUCKET_NAME")
  #   key = "#{guid}/features.yjs"

  #   # Fetch the document from S3
  #   case S3.get_object(bucket_name, key) |> ExAws.request() do
  #     {:ok, %{body: body}} ->
  #       # Deserialize the Yjs document
  #       IO.inspect("Loaded document from S3 with key: #{key}")
  #       Y.applyUpdate(Y.new_doc(), body)

  #     {:error, _reason} ->
  #       IO.inspect("Document not found in S3 for key: #{key}")
  #       Y.new_doc()  # If not found, create a new document
  #   end
  # end

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
