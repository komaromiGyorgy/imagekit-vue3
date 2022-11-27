import { createApp } from "vue";
import App from "./App.vue";
import { createImageKitVue } from "../../src/index";

const app = createApp(App);
app.use(
  createImageKitVue({
    publicKey: "your_public_key",
    urlEndpoint: "your_url_endpoint",
    authenticationEndpoint: "your_authentication_endpoint",
  })
);

app.mount("#app");
