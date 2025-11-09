import { useState, useCallback } from "react";
import RNFS from "react-native-fs";
import { initWhisper } from "whisper.rn/index.js";
import type { WhisperContext } from "whisper.rn/index.js";
import { whisperModels } from "./models";
import { getDirectory, getFileInfo, isFileExist } from "./helpers";
import { ModelFileInfo, WhisperModel } from "./types";

export const useWhisperModel = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [whisperContext, setWhisperContext] = useState<WhisperContext | null>(
    null
  );
  const [currentModelId, setCurrentModelId] = useState<string | null>(null);
  const [downloadedModels, setDownloadedModels] = useState<
    Record<string, ModelFileInfo>
  >({});
  const [error, setError] = useState<string | null>(null);

  const downloadModel = useCallback(
    async (model: WhisperModel): Promise<string> => {
      const directoryPath = await getDirectory();
      const filePath = `${directoryPath}/${model.filename}`;
      const isExist = await isFileExist(filePath);

      try {
        let headers: Record<string, string> = {};
        let bytesDownloaded = 0;

        // Check if model is already fully downloaded
        if (isExist) {
          const fileInfo = await getFileInfo(filePath);

          // If file exists and has content, assume it's complete and skip download
          if (fileInfo && fileInfo.size > 0) {
            console.log(
              `Model ${model.id} already downloaded (${fileInfo.size} bytes), skipping...`
            );
            setDownloadedModels((prev) => ({ ...prev, [model.id]: fileInfo }));
            return filePath;
          }
        }

        setIsDownloading(true);
        setError(null);

        const job = RNFS.downloadFile({
          fromUrl: model.url,
          toFile: filePath,
          headers,
          background: true,
          discretionary: true,
          begin: (res) => {
            console.log(`Download started for ${model.id}:`, res);
          },
          progress: (res) => {
            const totalBytes = res.contentLength + bytesDownloaded;
            const downloaded = res.bytesWritten + bytesDownloaded;
            const percent = (downloaded / totalBytes) * 100;
            setProgressPercentage(Math.min(percent, 100));
          },
        });

        const result = await job.promise;
        console.log(`Download completed for ${model.id}:`, result);

        setIsDownloading(false);
        setProgressPercentage(0);

        const fileInfo = await getFileInfo(filePath);
        if (fileInfo) {
          setDownloadedModels((prev) => ({ ...prev, [model.id]: fileInfo }));
        }

        return filePath;
      } catch (e) {
        console.error(`Error downloading model ${model.id}:`, e);
        setIsDownloading(false);
        setProgressPercentage(0);
        setError(`Failed to download model: ${e}`);
        throw new Error(`Failed to download model: ${e}`);
      }
    },
    []
  );

  // Initialize whisper model
  const initializeWhisper = useCallback(
    async (modelId: string): Promise<WhisperContext> => {
      try {
        // Check if trying to reinitialize with same model
        if (whisperContext && currentModelId === modelId) {
          console.log(
            `Model ${modelId} already initialized, returning existing context`
          );
          return whisperContext;
        }

        // Find the model
        const model = whisperModels.find((m) => m.id === modelId);

        if (!model) {
          const errorMsg = `Model '${modelId}' doesn't exist. Available models: ${whisperModels
            .map((m) => m.id)
            .join(", ")}`;
          setError(errorMsg);
          throw new Error(errorMsg);
        }

        // Release previous context if switching models
        if (whisperContext && currentModelId !== modelId) {
          console.log(`Releasing previous model context: ${currentModelId}`);
          try {
            await whisperContext.release();
          } catch (releaseError) {
            console.warn("Error releasing previous context:", releaseError);
            // Continue anyway, as we're switching models
          }
          setWhisperContext(null);
        }

        // Download the model (or use cached if already downloaded)
        const downloadedModelPath = await downloadModel(model);

        // Initialize new context
        console.log(`Initializing Whisper with model: ${modelId}`);
        const context = await initWhisper({
          filePath: downloadedModelPath,
        });

        setWhisperContext(context);
        setCurrentModelId(modelId);
        console.log(`Successfully initialized model: ${modelId}`);

        return context;
      } catch (e) {
        const errorMsg = `Failed to initialize Whisper: ${e}`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    },
    [whisperContext, currentModelId, downloadModel]
  );

  // Cleanup function to release context when component unmounts
  const releaseContext = useCallback(async () => {
    if (whisperContext) {
      try {
        await whisperContext.release();
        setWhisperContext(null);
        setCurrentModelId(null);
        console.log("Whisper context released");
      } catch (e) {
        console.error("Error releasing context:", e);
      }
    }
  }, [whisperContext]);

  // Delete a downloaded model to free up space
  const deleteModel = useCallback(
    async (modelId: string): Promise<void> => {
      try {
        const model = whisperModels.find((m) => m.id === modelId);
        if (!model) {
          throw new Error(`Model ${modelId} not found`);
        }

        // Don't delete if currently in use
        if (currentModelId === modelId && whisperContext) {
          throw new Error(
            `Cannot delete model ${modelId} - currently in use. Release context first.`
          );
        }

        const directoryPath = await getDirectory();
        const filePath = `${directoryPath}/${model.filename}`;
        const exists = await isFileExist(filePath);

        if (exists) {
          await RNFS.unlink(filePath);
          setDownloadedModels((prev) => {
            const updated = { ...prev };
            delete updated[modelId];
            return updated;
          });
          console.log(`Deleted model: ${modelId}`);
        }
      } catch (e) {
        console.error(`Error deleting model ${modelId}:`, e);
        throw e;
      }
    },
    [currentModelId, whisperContext]
  );

  return {
    isDownloading,
    downloadedModels,
    progressPercentage,
    whisperContext,
    currentModelId,
    error,
    initializeWhisper,
    downloadModel,
    releaseContext,
    deleteModel,
  };
};
