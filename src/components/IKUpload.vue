<template>
  <input type="file" ref="imageFile" @change="upload" />
</template>

<script setup lang="ts">
import ImageKit from "imagekit-javascript";
import { UploadResponse } from "imagekit";
import { getCurrentInstance, inject } from "vue";
import { ImageKitVueSymbol } from "../index";

export interface Props extends Partial<HTMLInputElement> {
  urlEndpoint?: string;
  publicKey?: string;
  authenticationEndpoint?: string;
  fileName?: string;
  useUniqueFileName?: boolean;
  tags?: Array<string>;
  folder?: string;
  isPrivateFile?: boolean;
  customCoordinates?: string;
  responseFields?: Array<string>;
}
const _instance = getCurrentInstance();
const imagekitOptions =
  _instance?.appContext?.app?.config?.globalProperties?.$imagekit;
const imageKitVue = inject(ImageKitVueSymbol);

const {
  urlEndpoint,
  publicKey,
  authenticationEndpoint,
  fileName,
  useUniqueFileName = true,
  tags,
  folder = "/",
  isPrivateFile = false,
  customCoordinates = "",
  responseFields,
} = defineProps<Props>();

type Emits = {
  (event: "error", error: Error): void;
  (event: "success", result: UploadResponse): void;
  (event: "progress", progress: number): void;
};
const emit = defineEmits<Emits>();

const imageFile = $ref<HTMLInputElement>();

function getMergedOptions() {
  const defaultOptions = {
    urlEndpoint:
      urlEndpoint ||
      imageKitVue?.urlEndpoint ||
      imagekitOptions?.urlEndpoint ||
      "",
    publicKey:
      publicKey || imageKitVue?.publicKey || imagekitOptions?.publicKey || "",
    authenticationEndpoint:
      authenticationEndpoint ||
      imageKitVue?.authenticationEndpoint ||
      imagekitOptions?.authenticationEndpoint ||
      "",
    fileName,
    useUniqueFileName,
    tags,
    folder,
    isPrivateFile,
    customCoordinates,
    responseFields,
  };
  if (!defaultOptions.urlEndpoint) {
    throw new Error("urlEndpoint is required");
  }
  if (!defaultOptions.publicKey) {
    throw new Error("publicKey is required");
  }
  return defaultOptions;
}

let IkClient = null as unknown as ImageKit;
function getClient() {
  const mergedOptions = getMergedOptions();
  if (IkClient) return IkClient;
  IkClient = new ImageKit({
    urlEndpoint: mergedOptions.urlEndpoint,
    publicKey: mergedOptions.publicKey,
    authenticationEndpoint: mergedOptions.authenticationEndpoint,
  });
  return IkClient;
}

function upload() {
  const file = imageFile?.files?.[0];
  if (!file) {
    return;
  }

  const fileSize = file.size;
  const customXHR = new XMLHttpRequest();
  customXHR.upload.addEventListener("progress", function (e) {
    if (e.loaded <= fileSize) {
      let percent = Math.round((e.loaded / fileSize) * 100);
      emit("progress", percent);
    }

    if (e.loaded == e.total) {
      emit("progress", 100);
    }
  });

  const fileSystemFileName = file.name;

  const mergedOptions = getMergedOptions();
  const IkClient = getClient();

  const publicKey = mergedOptions.publicKey;
  const authenticationEndpoint = mergedOptions.authenticationEndpoint;

  if (!publicKey || publicKey.trim() === "") {
    emit("error", new Error("publicKey is required"));
  }

  if (!authenticationEndpoint || authenticationEndpoint.trim() === "") {
    emit("error", new Error("authenticationEndpoint is required"));
  }

  IkClient.upload(
    {
      xhr: customXHR,
      file: file,
      fileName: fileName || fileSystemFileName,
      useUniqueFileName: useUniqueFileName,
      tags: tags,
      folder: folder,
      isPrivateFile: isPrivateFile,
      customCoordinates: customCoordinates,
      responseFields: responseFields,
    },
    (err, result) => {
      if (err) {
        return emit("error", err);
      }
      // @ts-expect-error
      return emit("success", result);
    },
    {
      publicKey,
      authenticationEndpoint,
    }
  );

  return;
}
</script>
