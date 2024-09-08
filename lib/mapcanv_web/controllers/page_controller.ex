defmodule MapCanvWeb.PageController do
  use MapCanvWeb, :controller


  def home(conn, %{"guid" => guid}) do
    # The home page is often custom made,
    # so skip the default app layout.
    render(conn, :home, layout: false, guid: guid)
  end

  # This will handle the case where there is no guid (i.e., root URL "/")
  def home(conn, _params) do
    render(conn, :home, layout: false, guid: nil)
  end
end
