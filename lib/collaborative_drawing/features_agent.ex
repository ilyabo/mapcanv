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

  def add_or_update_feature(new_feature) do
    Agent.update(:features_agent, fn features ->
      # Get the ID of the new feature using string keys
      new_feature_id = new_feature["id"]

      # Update the features list, replacing the feature with the same ID or adding a new one
      updated_features =
        features
        |> Enum.map(fn feature ->
          if feature["id"] == new_feature_id do
            # Replace the existing feature if IDs match
            new_feature
          else
            # Keep the existing feature otherwise
            feature
          end
        end)

      # Check if the new_feature was added or updated
      if Enum.any?(updated_features, fn feature -> feature == new_feature end) do
        updated_features
      else
        [new_feature | features]
      end
    end)
  end

end
