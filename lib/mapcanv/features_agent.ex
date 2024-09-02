defmodule MapCanv.FeaturesAgent do
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
        {new_doc, new_doc}
      state ->
        {state, state}
    end)
  end

  # Applies an update to the current state
  def apply_update(update) when is_binary(update) do
    Agent.get_and_update(__MODULE__, fn state ->
      new_state = YsCrdt.merge_crdt(state, update)
      # The first element of the tuple is what get_and_update/2 will return as the result of the operation.
	    # The second element of the tuple is the new state of the agent.
      {new_state, new_state}
    end)
  end

end
