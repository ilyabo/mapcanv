defmodule CollaborativeDrawing.LinesAgent do
  use Agent

  def start_link(_opts) do
    Agent.start_link(fn -> [] end, name: :lines_agent)
  end

  def get_lines do
    Agent.get(:lines_agent, & &1)
  end

  def add_line(line) do
    Agent.update(:lines_agent, fn lines -> [line | lines] end)
  end
end
