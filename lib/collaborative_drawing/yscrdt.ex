defmodule YsCrdt do
  use Rustler, otp_app: :collaborative_drawing, crate: "yscrdt"

  # Define the NIF functions
  def merge_crdt(_existing_state, _update), do: :erlang.nif_error(:nif_not_loaded)
  def new_doc(), do: :erlang.nif_error(:nif_not_loaded)

end
