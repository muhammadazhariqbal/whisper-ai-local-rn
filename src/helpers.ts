import RNFS from "react-native-fs";

const getDirectory = async () => {
  const DocumentDir = RNFS.DocumentDirectoryPath;
  const path = `${DocumentDir}/whisper-models`;

  try {
    const exists = await RNFS.exists(path);
    if (!exists) {
      await RNFS.mkdir(path);
    }
  } catch (error) {
    console.warn("Failed to ensure Whisper model directory exists:", error);
    throw error;
  }

  return path;
};

const isFileExist = async (path: string) => {
  const isExist = await RNFS.exists(path);
  return isExist;
};

const getFileInfo = async (path: string) => {
  const stats = await RNFS.stat(path);
  let fileInfo = { path: stats.path, size: stats.size };
  return fileInfo;
};

export { getDirectory, isFileExist, getFileInfo };
