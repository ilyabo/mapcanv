defmodule CollaborativeDrawing.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      CollaborativeDrawingWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:collaborative_drawing, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: CollaborativeDrawing.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: CollaborativeDrawing.Finch},
      # Start a worker by calling: CollaborativeDrawing.Worker.start_link(arg)
      # {CollaborativeDrawing.Worker, arg},
      # Start to serve requests, typically the last entry
      CollaborativeDrawingWeb.Endpoint,
      # Start the LinesAgent
      CollaborativeDrawing.LinesAgent
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: CollaborativeDrawing.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    CollaborativeDrawingWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
