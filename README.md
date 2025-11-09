# whisper-ai-local-rn

A **React Native hook** for managing local Whisper AI models. Download, initialize, and manage Whisper models directly on the device.

See [whisper.rn documentation](https://github.com/mybigday/whisper.rn) for full transcription API details.

---

## Installation

```bash
npm install whisper-ai-local-rn
# or
yarn add whisper-ai-local-rn
```

> Peer dependencies: `react >=18`, `react-native >=0.71`, `react-native-fs`, `whisper.rn`.

---

## Basic Usage

```ts
import React, { useEffect } from "react";
import { View, Text, Button } from "react-native";
import { useWhisperModel } from "whisper-ai-local-rn";

const MyComponent = () => {
  const {
    isDownloading,
    progressPercentage,
    whisperContext,
    currentModelId,
    error,
    initializeWhisper,
    releaseContext,
    deleteModel,
  } = useWhisperModel();

  useEffect(() => {
    const setup = async () => {
      try {
        await initializeWhisper("small"); // Model ID: 'tiny', 'small', 'medium'
      } catch (e) {
        console.error(e);
      }
    };

    setup();

    return () => {
      releaseContext();
    };
  }, []);

  return (
    <View>
      <Text>Downloading: {isDownloading ? "Yes" : "No"}</Text>
      <Text>Progress: {progressPercentage.toFixed(1)}%</Text>
      {error && <Text style={{ color: "red" }}>{error}</Text>}

      <Button title="Delete Small Model" onPress={() => deleteModel("small")} />
    </View>
  );
};
```

---

## API

### States

| Name                 | Type                            | Description                              |
| -------------------- | ------------------------------- | ---------------------------------------- |
| `isDownloading`      | `boolean`                       | True if a model is currently downloading |
| `progressPercentage` | `number`                        | Download progress (0–100%)               |
| `whisperContext`     | `WhisperContext \| null`        | Current initialized Whisper context      |
| `currentModelId`     | `string \| null`                | ID of the currently initialized model    |
| `downloadedModels`   | `Record<string, ModelFileInfo>` | Info about downloaded models             |
| `error`              | `string \| null`                | Last error message                       |

### Functions

| Function            | Arguments             | Returns                   | Description                                          |
| ------------------- | --------------------- | ------------------------- | ---------------------------------------------------- |
| `initializeWhisper` | `modelId: string`     | `Promise<WhisperContext>` | Downloads (if needed) and initializes a model        |
| `downloadModel`     | `model: WhisperModel` | `Promise<string>`         | Downloads a model to local storage                   |
| `releaseContext`    | -                     | `Promise<void>`           | Releases the current Whisper context                 |
| `deleteModel`       | `modelId: string`     | `Promise<void>`           | Deletes a downloaded model (cannot delete if in use) |

---

## Supported Models

| ID       | Label  | Capabilities | File Name | URL                                                                                   |
| -------- | ------ | ------------ | --------- | ------------------------------------------------------------------------------------- |
| `tiny`   | Tiny   | Multilingual | tiny      | [Download](https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin)   |
| `small`  | Small  | Multilingual | small     | [Download](https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin)  |
| `medium` | Medium | Multilingual | medium    | [Download](https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin) |

**Usage Example:**

```ts
await initializeWhisper("tiny"); // Initialize the Tiny model
await initializeWhisper("small"); // Initialize the Small model
await initializeWhisper("medium"); // Initialize the Medium model
```

> ✅ Only these IDs (`tiny`, `small`, `medium`) are supported.

---

## iOS Setup

1. Install pods:

```bash
cd ios && pod install && cd ..
```

2. Add microphone permission to `ios/YourApp/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for speech recognition</string>
```

---

## Android Setup

1. Add microphone permission to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

2. Add proguard rule (if ProGuard is enabled) in `android/app/proguard-rules.pro`:

```
# whisper.rn
-keep class com.rnwhisper.** { *; }
```

---

## Advanced Notes

- Model files are **cached locally** after download.
- First download may take time; larger models require more device storage and memory.
- Resumes interrupted downloads automatically.
- Always call `releaseContext()` before switching models or when a component unmounts.
- Test on **physical devices** for best performance.

---

## Troubleshooting

- **Download fails**: Check storage, permissions, and network.
- **Module not found**: Verify model ID (`tiny`, `small`, `medium`).
- **iOS build issues**: Run `pod install`, clean build.
- **Android build issues**: Ensure NDK ≥24.0.8215888, check ProGuard rules.
- **Permission errors**: Ensure microphone permissions in Info.plist (iOS) and AndroidManifest.xml (Android), request runtime permissions in app.

---

## References

- [whisper.rn documentation](https://github.com/mybigday/whisper.rn) – Full transcription API
- [react-native-fs](https://github.com/itinance/react-native-fs) – File system access

---

## License

MIT
