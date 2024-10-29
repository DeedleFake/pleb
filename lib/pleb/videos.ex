defmodule Pleb.Videos do
  import FFmpex
  use FFmpex.Options

  @type frame_options() :: [frame_option()]
  @type frame_option() :: {:scale, binary()}

  @spec duration(Path.t()) :: seconds when seconds: float()
  defdelegate duration(path), to: FFprobe

  @spec frame(Path.t(), float(), frame_options()) ::
          {:ok, png_image} | {:error, {Collectable.t(), non_neg_integer()}}
        when png_image: binary()
  def frame(path, seconds, opts \\ []) do
    opts = Keyword.validate!(opts, [:scale])

    new_command()
    |> add_input_file(path)
    |> add_file_option(option_ss("#{seconds}s"))
    |> add_output_file("-")
    |> add_stream_specifier(stream_type: :video)
    |> add_stream_option(option_c("png"))
    |> add_file_option(option_vframes("1"))
    |> add_file_option(option_f("image2pipe"))
    |> add_scale_option(opts[:scale])
    |> execute()
  end

  defp add_scale_option(command, nil), do: command

  defp add_scale_option(command, scale) do
    command
    |> add_file_option(option_vf("scale=#{scale}"))
  end
end
