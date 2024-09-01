defmodule YsCrdt do
  use Rustler, otp_app: :collaborative_drawing, crate: "yscrdt"

  # When the NIF is loaded, it will override this function.
  def merge_crdt(_existing_state, _update), do: :erlang.nif_error(:nif_not_loaded)
end
