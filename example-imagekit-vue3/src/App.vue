<template>
  <IKContext
    :publicKey="publicKey"
    :urlEndpoint="urlEndpoint"
    authenticationEndpoint="http://localhost:3001/auth"
  >
    <IKImage
      path="/Space-Fantasy_Wallpaper_Set_100/19201200.jpg"
      :lqip="{ active: true }"
      loading="lazy"
      :width="300"
      :height="300"
      :transformation="[
        {
          quality: 100,
          format: 'jpg',
          progressive: 'true',
          effectSharpen: '-',
          effectContrast: '1',
          width: 300,
          height: 300,
        },
      ]"
      alt="test"
    />
    <IKVideo
      autoplay
      controls
      path="/file_example_MP4_480_1_5MG.mp4"
      loading="lazy"
      :transformation="[
        {
          height: '300',
          width: '300',
        },
      ]"
    />
    <IKUpload fileName="video" folder="folder_name"></IKUpload>
  </IKContext>
</template>

<script setup lang="ts">
import { IKImage, IKContext, IKVideo, IKUpload } from "imagekit-vue3";

const publicKey = import.meta.env.VITE_IK_PUBLIC_KEY;
const urlEndpoint = import.meta.env.VITE_IK_URL_ENDPOINT;
</script>

<style scoped></style>
