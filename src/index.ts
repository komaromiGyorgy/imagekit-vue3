import * as components from "./components";
import { App, InjectionKey } from "vue";
import ImageKit from "imagekit-javascript";

export interface ImageKitVueOptions {
  publicKey: string;
  urlEndpoint: string;
  authenticationEndpoint?: string;
  registerGlobalComponents?: boolean;
}

export interface ImageKitVue {
  options?: ImageKitVueOptions;
  install(app: App): void;
}

export const ImageKitVueSymbol: InjectionKey<ImageKitVueOptions> = Symbol();

export function createImageKitVue(options?: ImageKitVueOptions): ImageKitVue {
  const plugin: ImageKitVue = {
    options,
    install(app: App) {
      app.config.globalProperties.$imagekit = options;
      app.provide(ImageKitVueSymbol, options);
      if (options?.registerGlobalComponents) {
        Object.keys(components).forEach((key) => {
          app.component(key, components[key as keyof typeof components]);
        });
      }
    },
  };
  return plugin;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $imagekit?: ImageKitVueOptions;
  }
}

export * from "./components";
export { ImageKit as IKCore };
