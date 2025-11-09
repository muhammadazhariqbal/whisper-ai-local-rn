export type WhisperModel = {
  id: string;
  label: string;
  url: string;
  filename: string;
  capabilities: {
    multilingual: boolean;
  };
};

export type ModelFileInfo = {
  path: string;
  size: number;
};
