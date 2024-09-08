defmodule MapCanv.FeaturesAgent do
  use Agent

  alias YsCrdt

  # Starts the Agent with an initial state of an empty map
  def start_link(_) do
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  # Gets the document state for a specific GUID
  # Initializes a new document if no document exists for the GUID
  def get_state(guid) do
    Agent.get_and_update(__MODULE__, fn state ->
      case Map.get(state, guid) do
        nil ->
          # No document exists for this GUID, so create a new one
          new_doc = YsCrdt.new_doc()
          {new_doc, Map.put(state, guid, new_doc)}

        doc ->
          # Return the existing document
          {doc, state}
      end
    end)
  end

  # Applies an update to the document associated with a specific GUID
  def apply_update(guid, update) when is_binary(update) do
    Agent.get_and_update(__MODULE__, fn state ->
      case Map.get(state, guid) do
        nil ->
          # If no document exists, create a new one and apply the update
          new_doc = YsCrdt.new_doc()
          updated_doc = YsCrdt.merge_crdt(new_doc, update)
          {updated_doc, Map.put(state, guid, updated_doc)}

        doc ->
          # Apply the update to the existing document
          updated_doc = YsCrdt.merge_crdt(doc, update)
          {updated_doc, Map.put(state, guid, updated_doc)}
      end
    end)
  end
end
