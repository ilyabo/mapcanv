defmodule MapCanv.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    unless Mix.env == :prod do
      Dotenv.load
      Mix.Task.run("loadconfig")
    end

    children = [
      MapCanvWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:mapcanv, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: MapCanv.PubSub},

      # Presence must be after the PubSub child and before the endpoint
      # See https://hexdocs.pm/phoenix/Phoenix.Presence.html#module-example-usage
      MapCanvWeb.Presence,

      # Start the Finch HTTP client for sending emails
      {Finch, name: MapCanv.Finch},
      # Start a worker by calling: MapCanv.Worker.start_link(arg)
      # {MapCanv.Worker, arg},
      # Start to serve requests, typically the last entry
      MapCanvWeb.Endpoint,
      # Start the FeaturesAgent
      MapCanv.FeaturesAgent,
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: MapCanv.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    MapCanvWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
