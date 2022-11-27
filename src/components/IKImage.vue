<template>
  <img ref="rootEl" class="ik-image" :src="srcImage" />
</template>
<script lang="ts" setup>
import ImageKit from "imagekit-javascript";
import { getCurrentInstance, inject, onBeforeUnmount, onMounted } from "vue";
import { ImageKitVueSymbol } from "../index";

export interface Props extends Partial<HTMLImageElement> {
  urlEndpoint?: string;
  publicKey?: string;
  authenticationEndpoint?: string;
  transformation?: Array<
    Partial<{
      [key: string]: string | number;
    }>
  >;
  transformationPosition?: "path" | "query";
  queryParameters?: {
    [key: string]: string | number;
  };
  lqip?: {
    active: boolean;
    quality?: number;
    blur?: number;
    threshold?: number;
  };
  loading?: 'lazy' | 'eager';
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
  lqip,
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

  if (lqip && lqip.active) {
    const lqipOptions = { ...urlOptions };
    const quality = parseInt(String(lqip.quality || lqip.threshold), 10) || 20;
    const blur = parseInt(String(lqip.blur), 10) || 6;
    const transformation = (lqipOptions.transformation || []) as Partial<{ [key: string]: string; }>[];
    transformation.push({
      quality: String(quality),
      blur: String(blur),
    });
    // @ts-ignore
    result.lqipSrc = IkClient.url({
      ...lqipOptions,
      transformation ,
    });
  }

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
  if (!isLazy && lqip === null) {
    return imageAttrs.src;
  } else if (!isLazy && lqip?.active) {
    if (originalSrcLoaded) {
      return imageAttrs.src;
    } else {
      return imageAttrs.lqipSrc;
    }
  } else if (isLazy && lqip === null) {
    if (intersected) {
      return imageAttrs.src;
    } else {
      return "";
    }
  } else if (isLazy && lqip && lqip.active) {
    if (intersected && originalSrcLoaded) {
      return imageAttrs.src;
    } else {
      return imageAttrs.lqipSrc;
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
    lqip: {
      active: false,
      quality: 20,
      blur: 6,
      ...lqip,
    },
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
      if (lqip) triggerOriginalImageLoad();
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
  if (lqip) triggerOriginalImageLoad();
});

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>
