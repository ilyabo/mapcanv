defmodule CollaborativeDrawing.FeaturesAgent do
  use Agent

  alias YsCrdt

  # Starts the Agent with an initial state of `nil`
  def start_link(_) do
    Agent.start_link(fn -> nil end, name: __MODULE__)
  end

  # Gets the current state
  # Gets the current state, initializing a new document if the state is nil
  def get_state() do
    Agent.get_and_update(__MODULE__, fn
      nil ->
        new_doc = YsCrdt.new_doc()
        IO.inspect(new_doc, label: "Initialized new document")
        {new_doc, new_doc}
      state ->
        IO.inspect(state, label: "Returning existing document")
        {state, state}
    end)
  end

  # Applies an update to the current state
  def apply_update(update) when is_binary(update) do
    Agent.get_and_update(__MODULE__, fn state ->
      new_state =
        if state do
          YsCrdt.merge_crdt(state, update)
        else
          empty_doc = YsCrdt.new_doc()
          IO.inspect(empty_doc, label: "New document in apply_update")
          YsCrdt.merge_crdt(empty_doc, update)
        end

      {new_state, new_state}
    end)
  end


  # Fallback clause to handle lists and convert them to binaries
  def apply_update(update) when is_list(update) do
    apply_update(:erlang.list_to_binary(update))
  end
end
