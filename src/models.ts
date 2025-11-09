import { WhisperModel } from "./types";

export const whisperModels: WhisperModel[] = [
  {
    id: "tiny",
    label: "Tiny",
    url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin",
    filename: "tiny",
    capabilities: {
      multilingual: true,
    },
  },
  {
    id: "small",
    label: "Small",
    url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin",
    filename: "small",
    capabilities: {
      multilingual: true,
    },
  },
  {
    id: "medium",
    label: "Medium",
    url: "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin",
    filename: "medium",
    capabilities: {
      multilingual: true,
    },
  },
];
