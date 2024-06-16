defmodule CollaborativeDrawing.LinesAgent do
  use Agent

  def start_link(_opts) do
    Agent.start_link(fn -> [] end, name: :lines_agent)
  end

  def get_polygons do
    Agent.get(:lines_agent, & &1)
  end

  def add_polygon(polygon) do
    Agent.update(:lines_agent, fn polygons -> [polygon | polygons] end)
  end
end
