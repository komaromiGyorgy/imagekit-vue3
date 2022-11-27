<template>
  <slot></slot>
</template>
<script lang="ts" setup>
import { provide } from "vue";
import { ImageKitVueSymbol } from "../index";

type Props = {
  urlEndpoint?: string;
  publicKey?: string;
  authenticationEndpoint?: string;
};
const props = defineProps<Props>();

provide(ImageKitVueSymbol, props);
</script>
