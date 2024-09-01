defmodule CollaborativeDrawing.FeaturesAgent do
  use Agent

  alias YsCrdt

  # Starts the Agent with an initial state of `nil`
  def start_link(_) do
    Agent.start_link(fn -> nil end, name: __MODULE__)
  end

  # Gets the current state
  def get_state() do
    Agent.get(__MODULE__, & &1)
  end

  # Applies an update to the current state
  def apply_update(update) do
    Agent.get_and_update(__MODULE__, fn state ->
      new_state = if state do
        YsCrdt.merge_crdt(state, update)
      else
        update
      end
      {new_state, new_state}
    end)
  end

end
