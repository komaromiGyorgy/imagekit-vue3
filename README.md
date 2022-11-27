# ImageKit.io Vue.js 3 SDK

Unofficial ImageKit Vue.js 3 SDK allows you to use real-time [image resizing](https://docs.imagekit.io/features/image-transformations), [optimization](https://docs.imagekit.io/features/image-optimization), and [file uploading](https://docs.imagekit.io/api-reference/upload-file-api/client-side-file-upload) in the client-side. Entire library written based on [the official vue 2 SDK](https://github.com/imagekit-developer/imagekit-vuejs)

## Installation

```shell
npm install --save imagekit-vue3
```

or

```shell
yarn add imagekit-vue3
```

## Usage

### Initialization
Register it as a plugin to globally install all components.

```js
import { createApp } from 'vue'
import { createImageKitVue } from "imagekit-vue3"

const app = createApp(App);

app.use(createImageKitVue({
  urlEndpoint: "your_url_endpoint", // Required. Default URL-endpoint is https://ik.imagekit.io/your_imagekit_id
  publicKey: "your_public_api_key", // optional
  authenticationEndpoint: "https://www.your-server.com/auth" // optional
  registerGlobalComponents: true, // optional. Default is false, this will register all ImageKitVue components globally
}))

```
`urlEndpoint` is required to use the SDK. You can get URL-endpoint from your ImageKit dashboard - https://imagekit.io/dashboard#url-endpoints.

`publicKey` and `authenticationEndpoint` parameters are required if you want to use the SDK for client-side file upload. You can get these parameters from the developer section in your ImageKit dashboard - https://imagekit.io/dashboard#developers.

_Note: Do not include your Private Key in any client-side code, including this SDK or its initialization. If you pass the `privateKey` parameter while initializing this SDK, it throws an error_

Or, import components individually.
```
import { IKImage, IKContext, IKUpload, IKVideo } from "imagekit-vue3"
```

### Quick examples
```js
// Rendering image using a relative file path
<IKImage
  path="/default-image.jpg"
/>

// Image resizing
<IKImage
  path="/default-image.jpg"
  :transformation="[{height:300,width:400}]"
/>

// Using chained transformation
<IKImage
  path="/default-image.jpg"
  :transformation="[{height:300,width:400}, {rotation:90}]"
/>

// Imgae from absolute file path
<IKImage
  src="https://custom-domain.com/default-image.jpg"
  :transformation="[{height:300,width:400}, {rotation:90}]"
/>

// Lazy loading
<IKImage
  path="/default-image.jpg"
  :transformation="[{height:300,width:400},{rotation:90}]"
  loading="lazy"
  height="300"
  width="400"
/>

// Low-quality blurred image placeholder of original image
<IKImage
  path="/default-image.jpg"
  :lqip="{active:true}"
  :transformation="[{height:300,width:400},{rotation:90}]"
  loading="lazy"
  height="300"
  width="400"
/>

// Controlling quality and blur value of placeholder image
<IKImage
  path="/default-image.jpg"
  :lqip="{active:true, quality:30, blur: 5}" // default values are quality=20 and blur=6
  :transformation="[{height:300,width:400},{rotation:90}]"
  loading="lazy"
  height="300"
  width="400"
/>

<IKVideo
  path="/default-video.mp4"
  :transformation="[{height:300,width:400},{rotation:90}]"
  loading="lazy"
  height="300"
  width="400"
/>

// File upload
<IKUpload
  :tags="['tag1','tag2']"
  :responseFields="['tags']"
  :onError="onError"
  :onSuccess="onSuccess"
  :useUniqueFileName=true
  :isPrivateFile=false
  customCoordinates="10,10,100,100"
/>
```

### !!!!The order of how the library takes your params are:
1. ***If you pass these to the components directly they will use that as the highest priority instead.***
1. ***2. If you pass these params in the `IKContext` component, it will use that instead.***
1. ***3. If you pass the `publicKey` and `authenticationEndpoint` in the `createImageKitVue` method, it will use that, this is the lowest priority, so we suggest that you use your general configs here, and specify on the lowest levels if needed***

### Components

This SDK provides 4 components:
* `IKImage` for [image resizing](#image-resizing). The output is a `<img>` tag.
* `IKUpload` for [file uploading](#file-upload). The output is a `<input type="file">` tag.
* [`IKContext`](#IKContext) for defining `urlEndpoint`, `publicKey` and `authenticationEndpoint` to all children elements.

If you want to do anything custom, access the [ImageKit core JS SDK](https://github.com/imagekit-developer/imagekit-javascript) using `IKCore` module. For example:

```js
import { IKCore } from "imagekit-vue3"

// Generate image URL
var imagekit = new ImageKit({
    publicKey: "your_public_api_key",
    urlEndpoint: "https://ik.imagekit.io/your_imagekit_id",
    authenticationEndpoint: "http://www.yourserver.com/auth",
});

//https://ik.imagekit.io/your_imagekit_id/endpoint/tr:h-300,w-400/default-image.jpg
var imageURL = imagekit.url({
    path: "/default-image.jpg",
    urlEndpoint: "https://ik.imagekit.io/your_imagekit_id/endpoint/",
    transformation: [{
        "height": "300",
        "width": "400"
    }]
});
```

## Image resizing

`IKImage` components accept the following props:

| Prop             | Type | Description                    |
| :----------------| :----|:----------------------------- |
| urlEndpoint      | String | Optional. The base URL to be appended before the path of the image. If not specified, the URL-endpoint specified at the time of [SDK initialization](#initialization) is used. For example, https://ik.imagekit.io/your_imagekit_id/endpoint/ |
| path             | String |Conditional. This is the path at which the image exists. For example, `/path/to/image.jpg`. Either the `path` or `src` parameter needs to be specified for URL generation. |
| src              | String |Conditional. This is the complete URL of an image already mapped to ImageKit. For example, `https://ik.imagekit.io/your_imagekit_id/endpoint/path/to/image.jpg`. Either the `path` or `src` parameter needs to be specified for URL generation. |
| transformation   | Array of objects |Optional. An array of objects specifying the transformation to be applied in the URL. The transformation name and the value should be specified as a key-value pair in the object. See list of [different tranformations](#list-of-supported-transformations). Different steps of a [chained transformation](https://docs.imagekit.io/features/image-transformations/chained-transformations) can be specified as the array's different objects. The complete list of supported transformations in the SDK and some examples of using them are given later. If you use a transformation name that is not specified in the SDK, it is applied in the URL as it is. |
| transformationPosition | String |Optional. The default value is `path` that places the transformation string as a URL path parameter. It can also be specified as `query`, which adds the transformation string as the URL's query parameter i.e.`tr`. If you use `src` parameter to create the URL, then the transformation string is always added as a query parameter. |
| queryParameters  | Object |Optional. These are the other query parameters that you want to add to the final URL. These can be any query parameters and not necessarily related to ImageKit. Especially useful if you want to add some versioning parameter to your URLs. |
| loading  | String |Optional. Pass `lazy` to lazy load images |
| lqip  | Object |Optional. You can use this to show a low-quality blurred placeholder while the original image is being loaded e.g. `{active:true, quality: 20, blur: 6`}. The default value of `quality` is `20` and `blur` is `6`.|

### Basic resizing examples

```js
// Image from related file path with no transformations - https://ik.imagekit.io/your_imagekit_id/default-image.jpg
<IKImage
  path="/default-image.jpg"
/>

// Image resizing - https://ik.imagekit.io/your_imagekit_id/tr:w-h-300,w-400/default-image.jpg
<IKImage
  path="/default-image.jpg"
  :transformation="[{height:300,width:400}]"
/>

// Loading imgae from an absolute file path with no transformations - https://www.custom-domain.com/default-image.jpg
<IKImage
  src="https://www.custom-domain.com/default-image.jpg"
/>

// Using a new tranformation parameter which is not there in this SDK yet - https://ik.imagekit.io/your_imagekit_id/tr:custom-value/default-image.jpg
<IKImage
  path="/default-image.jpg"
  :transformation="[{custom: 'value'}]"
/>
```

The `transformation` prop is an array of objects. Each object can have the following properties. When you specify more than one object, each object is added as a chained transformation. For example:

```js
// It means first resize the image to 400x400 and then rotate 90 degree
transformation = [
  {
    height: 400,
    width: 400
  },
  {
    rotation: 90
  }
]
```

See the complete list of transformations supported in ImageKit [here](https://docs.imagekit.io/features/image-transformations). The SDK gives a name to each transformation parameter e.g. `height` for `h` and `width` for `w` parameter. It makes your code more readable. If the property does not match any of the following supported options, it is added as it is.

### List of supported transformations
<details>
<summary>Expand</summary>

| Supported Transformation Name | Translates to parameter |
|-------------------------------|-------------------------|
| height | h |
| width | w |
| aspectRatio | ar |
| quality | q |
| crop | c |
| cropMode | cm |
| x | x |
| y | y |
| focus | fo |
| format | f |
| radius | r |
| background | bg |
| border | b |
| rotation | rt |
| blur | bl |
| named | n |
| overlayX | ox |
| overlayY | oy |
| overlayFocus | ofo |
| overlayHeight | oh |
| overlayWidth | ow |
| overlayImage | oi |
| overlayImageTrim | oit |
| overlayImageAspectRatio | oiar |
| overlayImageBackground | oibg |
| overlayImageBorder | oib |
| overlayImageDPR | oidpr |
| overlayImageQuality | oiq |
| overlayImageCropping | oic |
| overlayImageTrim | oit |
| overlayText | ot |
| overlayTextFontSize | ots |
| overlayTextFontFamily | otf |
| overlayTextColor | otc |
| overlayTextTransparency | oa |
| overlayAlpha | oa |
| overlayTextTypography | ott |
| overlayBackground | obg |
| overlayTextEncoded | ote |
| overlayTextWidth | otw |
| overlayTextBackground | otbg |
| overlayTextPadding | otp |
| overlayTextInnerAlignment | otia |
| overlayRadius | or |
| progressive | pr |
| lossless | lo |
| trim | t |
| metadata | md |
| colorProfile | cp |
| defaultImage | di |
| dpr | dpr |
| effectSharpen | e-sharpen |
| effectUSM | e-usm |
| effectContrast | e-contrast |
| effectGray | e-grayscale |
| original | orig |

</details>

### Chained Transforms

Chained transforms make it easy to specify the order the transform is applied. For example:

```js
// Using chained transformation. First, resize and then rotate the image to 90 degrees.
<IKImage
  path="/default-image.jpg"
  :transformation="[{height:300,width:400}, {rotation:90}]"
/>
```

### Lazy loading images

You can lazy load images using the `loading` prop. When you use `loading="lazy"`, all images that are immediately viewable without scrolling load normally. Those that are far below the device viewport are only fetched when the user scrolls near them.

The SDK uses a fixed threshold based on the effective connection type to ensure that images are loaded early enough so that they have finished loading once the user scrolls near to them.

On fast connections (e.g 4G), the value of threshold is `1250px` and on slower connections (e.g 3G), it is `2500px`.

> You should always set the `height` and `width` of image element to avoid [layout shift](https://www.youtube.com/watch?v=4-d_SoCHeWE) when lazy-loading images.

Example usage:

```js
// Lazy loading images
<IKImage
  path="/default-image.jpg"
  :transformation="[{height:300,width:400},{rotation:90}]"
  loading="lazy"
  height="300"
  width="400"
/>
```

### Low-quality image placeholders (LQIP)
To improve user experience, you can use a low-quality blurred variant of the original image as a placeholder while the original image is being loaded in the background. Once the loading of the original image is finished, the placeholder is replaced with the original image.

```js
// Loading a blurred low quality image placeholder while the original image is being loaded
<IKImage
  path="/default-image.jpg"
  :lqip="{active:true}"
/>
```

By default, the SDK uses the `quality:20` and `blur:6`. You can change this. For example:

```js
<IKImage
  path="/default-image.jpg"
  :lqip="{active:true, quality: 40, blur: 5}"
/>
```

### Combining lazy loading with low-quality placeholders
You have the option to lazy-load the original image only when the user scrolls near them. Until then, only a low-quality placeholder is loaded. This saves a lot of network bandwidth if the user never scrolls further down.

```js
// Loading a blurred low quality image placeholder and lazy-loading original when user scrolls near them
<IKImage
  path="/default-image.jpg"
  :transformation="[{height:300,width:400},{rotation:90}]"
  :lqip="{active:true}"
  loading="lazy"
  height="300"
  width="400"
/>
```

### Overriding urlEndpoint for a particular image
You can use `urlEndpoint` prop in an individual `IKImage` to change url for that image. For example:
```js
import { IKImage } from "imagekit-vue3"

// Changing urlEndpoint
// https://www.custom-domain.com/tr:w-400,h-300/default-image.jpg
<IKImage
  path="/default-image.jpg"
  :transformation="[{height:300,width:400}]"
  urlEndpoint="https://www.custom-domain.com"
/>

// Without urlEndpoint
// https://ik.imagekit.io/your_imagekit_id/tr:w-400,h-300/default-image.jpg
<IKImage
  path="/default-image.jpg"
  :transformation="[{height:300,width:400}]"
/>
```

## IKVideo

`IKVideo` components accept the following props:

| Prop             | Type | Description                    |
| :----------------| :----|:----------------------------- |
| urlEndpoint      | String | Optional. The base URL to be appended before the path of the image. If not specified, the URL-endpoint specified at the time of [SDK initialization](#initialization) is used. For example, https://ik.imagekit.io/your_imagekit_id/endpoint/ |
| path             | String |Conditional. This is the path at which the image exists. For example, `/path/to/image.jpg`. Either the `path` or `src` parameter needs to be specified for URL generation. |
| src              | String |Conditional. This is the complete URL of an image already mapped to ImageKit. For example, `https://ik.imagekit.io/your_imagekit_id/endpoint/path/to/image.jpg`. Either the `path` or `src` parameter needs to be specified for URL generation. |
| transformation   | Array of objects |Optional. An array of objects specifying the transformation to be applied in the URL. The transformation name and the value should be specified as a key-value pair in the object. See list of [different tranformations](#list-of-supported-transformations). Different steps of a [chained transformation](https://docs.imagekit.io/features/image-transformations/chained-transformations) can be specified as the array's different objects. The complete list of supported transformations in the SDK and some examples of using them are given later. If you use a transformation name that is not specified in the SDK, it is applied in the URL as it is. |
| transformationPosition | String |Optional. The default value is `path` that places the transformation string as a URL path parameter. It can also be specified as `query`, which adds the transformation string as the URL's query parameter i.e.`tr`. If you use `src` parameter to create the URL, then the transformation string is always added as a query parameter. |
| queryParameters  | Object |Optional. These are the other query parameters that you want to add to the final URL. These can be any query parameters and not necessarily related to ImageKit. Especially useful if you want to add some versioning parameter to your URLs. |
| loading  | String |Optional. Pass `lazy` to lazy load images |

### Basic examples

```js
// Video from related file path with no transformations - https://ik.imagekit.io/your_imagekit_id/default-video.mp4
<IKVideo
  path="/default-video.mp4"
/>

// video resizing - https://ik.imagekit.io/your_imagekit_id/tr:w-h-300,w-400/default-video.mp4
<IKVideo
  path="/default-video.mp4"
  :transformation="[{height:300,width:400}]"
/>

// Loading imgae from an absolute file path with no transformations - https://www.custom-domain.com/default-video.mp4
<IKVideo
  src="https://www.custom-domain.com/default-video.mp4"
/>

// Using a new tranformation parameter which is not there in this SDK yet - https://ik.imagekit.io/your_imagekit_id/tr:custom-value/default-video.mp4
<IKVideo
  path="/default-video.mp4"
  :transformation="[{custom: 'value'}]"
/>
```

The `transformation` prop is an array of objects. Each object can have the following properties. When you specify more than one object, each object is added as a chained transformation. For example:

```js
// It means first resize the video to 400x400 and then rotate 90 degree
transformation = [
  {
    height: 400,
    width: 400
  },
  {
    rotation: 90
  }
]
```

## File Upload
The SDK provides the `ik-upload` component to upload files to the [ImageKit Media Library](https://docs.imagekit.io/media-library/overview). 

`ik-upload` component accepts the [ImageKit Upload API](https://docs.imagekit.io/api-reference/upload-file-api/client-side-file-upload#request-structure-multipart-form-data) options as props.

| Prop             | Type | Description                    |
| :----------------| :----|:----------------------------- |
| fileName | String | Optional. If not specified, the file system name is picked. 
| useUniqueFileName  | Boolean | Optional. Accepts `true` of `false`. The default value is `true`. Specify whether to use a unique filename for this file or not. |
| tags     | Array of string | Optional. Set the tags while uploading the file e.g. ["tag1","tag2"] |
| folder        | String | Optional. The folder path (e.g. `/images/folder/`) in which the file has to be uploaded. If the folder doesn't exist before, a new folder is created.|
| isPrivateFile | Boolean | Optional. Accepts `true` of `false`. The default value is `false`. Specify whether to mark the file as private or not. This is only relevant for image type files|
| customCoordinates   | String | Optional. Define an important area in the image. This is only relevant for image type files. To be passed as a string with the `x` and `y` coordinates of the top-left corner, and `width` and `height` of the area of interest in format `x,y,width,height`. For example - `10,10,100,100` |
| responseFields   | Array of string | Optional. Values of the fields that you want upload API to return in the response. For example, set the value of this field to `["tags", "customCoordinates", "isPrivateFile"]` to get value of `tags`, `customCoordinates`, and `isPrivateFile` in the response. |
| urlEndpoint      | String | Optional. If not specified, the URL-endpoint specified at the time of [SDK initialization](#initialization) is used. For example, https://ik.imagekit.io/your_imagekit_id/endpoint/ |
| publicKey      | String | Optional. If not specified, the `publicKey` specified at the time of [SDK initialization](#initialization) is used.|
| authenticationEndpoint      | String | Optional. If not specified, the `authenticationEndpoint` specified at the time of [SDK initialization](#initialization) is used. |


-----------------------------


| Events             | Type | Description                    |
| :----------------| :----|:----------------------------- |
| success   | Function callback | Optional. Called if the upload is successful. The first and only argument is the response JOSN from the upload API |
| error   | Function callback | Optional. Called if upload results in an error. The first and only argument is the error received from the upload API |
| progress   | Function callback | Optional. Called during uploading process. The argument is a number representing the upload progress |

> Make sure that you have specified `authenticationEndpoint` and `publicKey` during SDK initialization or in `ik-upload` as a prop. The SDK makes an HTTP GET request to this endpoint and expects a JSON response with three fields i.e. `signature`, `token`, and `expire`. [Learn how to implement authenticationEndpoint](https://docs.imagekit.io/api-reference/upload-file-api/client-side-file-upload#how-to-implement-authenticationendpoint-endpoint) on your server. Refer to sample application in this repository for an example implementation.

Sample file upload:

```js
<template>
  <IKUpload
    :tags="['tag1','tag2']"
    :responseFields="['tags']"
    @error="onError"
    @success="onSuccess"
    @progress="onProgress"
    customCoordinates="10,10,100,100"
  />
</template>

<script setup lang="ts">
import { IKUpload } from "imagekit-vue3"

function onError(err) {
  console.log("Error");
  console.log(err);
}

function onSuccess(res) {
  console.log("Success");
  console.log(res);
}

function onProgress(progress) {
  console.log("Progress");
  console.log(progress);
}

</script>
```

## IKContext
`IKContext` component allows you to define configuration parameters that are applied to all children elements.

```js
// Register as plugin
import { createApp } from 'vue'
import { createImageKitVue } from "imagekit-vue3"

const app = createApp(App);

app.use(createImageKitVue({
  urlEndpoint: "your_url_endpoint", // Required. Default URL-endpoint is https://ik.imagekit.io/your_imagekit_id
  publicKey: "your_public_api_key", // optional
  authenticationEndpoint: "https://www.your-server.com/auth" // optional
  registerGlobalComponents: true, // optional. Default is false, this will register all ImageKitVue components globally
}))

// Using global configuration
// https://ik.imagekit.io/your_imagekit_id/default-image.jpg
<IKImage path="/default-image.jpg"/>

// Defining urlEndpoint in IKContext
<IKContext 
  urlEndpoint="https://www.custom-domain.com/">
    // https://www.custom-domain.com/default-image.jpg
    // urlEndpoint is taken from the parent IKContext
    <IKImage path="/default-image.jpg"/>
</IKContext>

// Using exported component
<IKContext
  :publicKey="your_url_endpoint"
  :urlEndpoint="your_public_api_key"
  :authenticationEndpoint="https://www.your-server.com/auth"
>
  <IKUpload
    :tags="['tag3','tag4']"
    :responseFields="['tags']"
    :onSuccess="onSuccess"
  />
</IKContext>
```
## Support

For any feedback or to report any issues or general implementation support, please reach out to [komaromigy40@gmail.com](mailto:komaromigy40@gmail.com)

## Links
* [Documentation](https://docs.imagekit.io)
## License
Released under the MIT license.