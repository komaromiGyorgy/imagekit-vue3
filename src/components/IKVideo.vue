<template>
  <video autoplay ref="rootEl" class="ik-video" :src="srcImage" />
</template>
<script lang="ts" setup>
import ImageKit from "imagekit-javascript";
import { getCurrentInstance, inject, onBeforeUnmount, onMounted } from "vue";
import { ImageKitVueSymbol } from "../index";

export interface Props extends Partial<HTMLVideoElement> {
  urlEndpoint?: string;
  publicKey?: string;
  authenticationEndpoint?: string;
  transformation?: Array<
    Partial<{
      [key: string]: string;
    }>
  >;
  transformationPosition?: "path" | "query";
  queryParameters?: {
    [key: string]: string | number;
  };
  loading?: "lazy" | "eager";
  path?: string;
  src?: string;
}
const _instance = getCurrentInstance();
const imagekitOptions =
  _instance?.appContext?.app?.config?.globalProperties?.$imagekit;
const imageKitVue = inject(ImageKitVueSymbol);

const {
  urlEndpoint,
  publicKey,
  authenticationEndpoint,
  transformation,
  transformationPosition = "path",
  queryParameters,
  loading,
  path,
  src,
} = defineProps<Props>();

const isLazy = $computed(() => loading === "lazy");
let intersected = $ref(false);
let observer: IntersectionObserver;
let originalSrcLoaded = $ref(false);
let rootEl = $ref<HTMLImageElement>();

const imageAttrs = $computed(() => {
  const mergedOptions = getMergedOptions();
  const IkClient = getClient();

  const urlOptions = {
    urlEndpoint: mergedOptions.urlEndpoint,
    src: src,
    path: path,
    transformation: transformation,
    transformationPosition: transformationPosition,
    queryParameters: queryParameters,
  };

  const result = {
    src: "",
    lqipSrc: "",
  };

  // @ts-ignore
  result.src = IkClient.url(urlOptions);
  return result;
});
const srcImage = $computed(() => {
  /*
          No lazy loading no lqip
            src=originalImage
  
          No lazy loading lqip
            src=lqip
            src=originalImage (when loaded)
  
          lazy loading and no lqip
            src=''
            onIntersect:
              src=originalImage
  
          lazy loading and lqip
            src=lqip
            onInterserct:
              src=originalImage (when loaded)
        */
  if (!isLazy) {
    return imageAttrs.src;
  } else if (isLazy) {
    if (intersected) {
      return imageAttrs.src;
    } else {
      return "";
    }
  }
  return imageAttrs.src;
});

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
    transformation: transformation || [],
    transformationPosition: transformationPosition || "path",
    queryParameters: queryParameters || {},
    loading: loading || "lazy",
  };
  if (!defaultOptions.urlEndpoint) {
    throw new Error("urlEndpoint is required");
  }
  if (!defaultOptions.publicKey) {
    throw new Error("publicKey is required");
  }
  return defaultOptions;
}

function triggerOriginalImageLoad() {
  const img = new Image();
  img.src = imageAttrs.src;
  img.onload = () => {
    originalSrcLoaded = true;
  };
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

function onIntersect(
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver
) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      intersected = true;
      observer.disconnect();
    }
  });
}
function is4gConnection() {
  return (
    (navigator as unknown as { connection: { effectiveType: string } })
      ?.connection?.effectiveType === "4g"
  );
}

function initIntersectionObserver() {
  const rootMargin = is4gConnection() ? "1250px" : "2500px";
  observer = new IntersectionObserver(onIntersect, {
    rootMargin,
  });
  if (rootEl) observer.observe(rootEl);
}

onMounted(() => {
  if (window && "IntersectionObserver" in window && isLazy) {
    return initIntersectionObserver();
  }
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>
