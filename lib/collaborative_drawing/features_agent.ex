defmodule CollaborativeDrawing.FeaturesAgent do
  use Agent

  def start_link(_opts) do
    Agent.start_link(fn -> [] end, name: :features_agent)
  end

  def get_features do
    Agent.get(:features_agent, & &1)
  end

  def add_feature(feature) do
    Agent.update(:features_agent, fn features -> [feature | features] end)
  end
end
