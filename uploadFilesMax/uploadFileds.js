/*
 * @Description: 实现大文件上传的解决方案
 */

/**
 * 使用使用 XMLHttpRequest 和 FormData 进行分片上传，可以将大文件切割成多个小文件，
 * 然后使用 XMLHttpRequest 发送 POST 请求，将文件分片上传到服务器
 * @param {string} file
 * @returns
 */
function sliceFile(file) {
  const chunkSize = 1024 * 1024; // 1MB
  const chunks = [];

  let start = 0;
  let end = Math.min(chunkSize, file.size);

  while (start < file.size) {
    chunks.push(file.slice(start, end));

    start = end;
    end = Math.min(start + chunkSize, file.size);
  }

  return chunks;
}
// 函数将会返回一个包含多个数据快的数组，每个数据块的大小为1MB或小于1MB
/**
 * 使用 XMLHttpRequest 发送 POST 请求，将数据块上传到服务器。可以使用 FormData 对象来构造请求体
 * @param {string} file
 */
function uploadFile(file) {
  const chunks = sliceFile(file);
  const formData = new FormData();
  formData.append("file", file?.name);
  for (let i = 0; i < chunks.length; i++) {
    // 我们循环遍历数据块数组，并将每个数据块添加到 FormData 对象中，
    // 每个数据块的名字为 ${i}-${file.name}，其中 i 表示数据块的索引。
    formData.append("chunk", chunks[i], `${i}-${file.name}`);
  }
}
const xhr = new XMLHttpRequest();
xhr.open("POST", "./upload", true);
xhr.send(formData);

// ----------------------------------使用 Uppy 实现大文件上传-----------------------------------------

// Uppy 和 Dropzone 都是一些比较流行的第三方库，提供了一套完整的大文件上传解决方案，包括分片上传、
// 上传进度监控、断点续传等功能，并同时提供了可定制化的 UI 组件和事件处理机制
// npm install @uppy/core @uppy/progress-bar @uppy/xhr-upload @uppy/aws-s3 --save
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";
import ProgressBar from "@uppy/progress-bar";
import AwsS3 from "@uppy/aws-s3";

const uppy = Uppy({
  id: "uploader",
  autoProceed: true,
  restrictions: {
    maxFileSize: 1000000000, // 1GB
    allowedFileTypes: ["video/*", "image/*", "audio/*"],
  },
  debug: true,
})
  .use(ProgressBar, {
    target: "#progress-bar",
  })
  .use(AwsS3, {
    companionUrl: "https://companion.uppy.io",
    serverUrl: "https://s3.amazonaws.com",
    serverHeaders: {},
    getUploadParameters(file) {
      return fetch("/api/getUploadParameters", {
        method: "post",
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          return {
            method: "PUT",
            url: data.url,
            fields: data.fields,
            headers: {},
          };
        });
    },
  })
  .use(XHRUpload, {
    endpoint: "https://companion.uppy.io/upload",
    fieldName: "file",
    limit: 0,
    headers: {},
  });
/**
 * 我们首先创建一个 Uppy 实例，并设置了自动上传、文件大小限制、文件类型限制等属性。
 * 然后，我们使用 ProgressBar 插件和 AwsS3 插件来实现上传进度监控和 Amazon S3 的分片上传。
 * 其中，AwsS3 插件需要提供一个获取上传参数的方法，
 * 用于生成上传 URL 和字段参数。最后，我们使用 XHRUpload 插件来实现文件上传和断点续传。
 */

// ----------------------------------------------使用 Dropzone 实现大文件上传-------------------------
// 使用 Dropzone 实现大文件上传，首先需要安装 dropzone 和 dropzone-chunks 插件
// npm install dropzone dropzone-chunks --save

import Dropzone from "dropzone";
import "dropzone/dist/dropzone.css";
import "dropzone-chunks/dist/dropzone-chunks.min.css";
import "dropzone-chunks";

const dropzone = new Dropzone("#my-dropzone", {
  url: "/upload",
  chunkSize: 1000000, // 1MB
  parallelUploads: 3,
  retryChunks: true,
  retryChunksLimit: 3,
  retryChunksInterval: 5000,
  timeout: 180000, // 3 minutes
  createImageThumbnails: false,
  autoQueue: true,
  previewsContainer: "#previews",
  previewTemplate:
    '<div class="dz-preview dz-file-preview"><div class="dz-details"><div class="dz-filename"><span data-dz-name></span></div></div><div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div></div>',
});

dropzone.on("success", (file, response) => {
  console.log("File uploaded successfully:", response);
});
// 并设置了上传 URL、分片大小、并发上传数、重试次数、超时时间等属性。
// 然后，我们设置了预览容器和预览模板，使用 on 方法监听上传成功事件，并输出上传结果。

// ----------------------------------------流式上传--------------------------------------
// 可以将大文件分成多个数据块，逐个上传，从而减少内存使用并提高上传速度
// 使用 FileReader API 和 Fetch API 实现流式上传的简单示例
function uploadFile(file) {
  const chunkSize = 1024 * 1024; // 1MB
  const chunks = Math.ceil(file.size / chunkSize); // 计算出文件需要分为多少数据快
  let currentChunk = 0;
  // 使用递归 逐个上传数据块，在函数中，我们使用FilReader 读取数据块内容，
  const uploadChunk = (start) => {
    const end = Math.min(start + chunkSize, file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      const chunkData = event.target.result;

      // 在上传成功后，我们使用一个计数器 currentChunk 来记录已经上传的数据块数，
      // 并递归调用 uploadChunk 函数，上传下一个数据块。在上传完成后，我们输出上传成功的信息。
      // 同时，为了实现断点续传，需要记录已经上传的数据块信息，并在上传失败后，重新上传未完成的数据块
      fetch("/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream", // 表示上传二进制文件
          "Content-Range": `bytes ${start}-${end - 1}/${file.size}`, // 上传文件的数据块在整个文件的范围内，
        },
        body: chunkData,
      })
        .then((response) => {
          if (response.ok) {
            currentChunk++;
            if (currentChunk < chunks) {
              uploadChunk(end);
            } else {
              console.log("File uploaded successfully.");
            }
          } else {
            console.log("Upload failed:", response.statusText);
          }
        })
        .catch((error) => {
          console.log("Upload failed:", error);
        });
    };

    reader.readAsArrayBuffer(file.slice(start, end));
  };

  uploadChunk(0);
}

//-------------------------------------------- WebRTC 数据通道传输 -------------------

// 在浏览器之间建立点对点的数据通道，可以将大文件分成多个数据块，并通过数据通道进行传输。
// 这种方式可以实现高速、安全的文件传输，但需要一些额外的配置和技术支持。
const fileInput = document.getElementById("file-input");
// 创建 RTCPeerConnection 连接对象
const peerConnection = new RTCPeerConnection();
// 并监听 ondatachannel 事件
peerConnection.ondatachannel = (event) => {
  const dataChannel = event.channel;
  // 创建数据通道 文件分割，逐个发送到对端，在发送数据块，使用FileReader API 将数据块读取出来

  dataChannel.onopen = () => {
    console.log("Data channel opened.");

    const file = fileInput.files[0];
    const chunkSize = 1024 * 1024; // 1MB
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    //通过数据通道将数据块发送到对端，在接收数据时、
    //使用 onmessage 事件处理函数来处理接收到的数据。在数据通道关闭时
    const sendChunk = (start) => {
      const end = Math.min(start + chunkSize, file.size);

      const reader = new FileReader();
      reader.onload = (event) => {
        const chunkData = event.target.result;

        dataChannel.send(chunkData);

        currentChunk++;
        if (currentChunk < chunks) {
          sendChunk(end);
        } else {
          console.log("File sent successfully.");
          dataChannel.close();
        }
      };

      reader.readAsArrayBuffer(file.slice(start, end));
    };

    sendChunk(0);
  };

  dataChannel.onmessage = (event) => {
    console.log("Received message:", event.data);
  };

  dataChannel.onclose = () => {
    console.log("Data channel closed.");
  };
};
// 创建了一个数据通道，并设置了数据类型为 arraybuffer，并创建了一个 offer，将其发送给对端。
const dataChannel = peerConnection.createDataChannel("file-transfer");
dataChannel.binaryType = "arraybuffer";

const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

// Send the offer to the other peer and wait for the answer
// Once the answer is received, set it as the remote description
// 发送报价给另一个对等体并等待应答
// 接收到应答后，将其设置为远程描述

// 注意使用 WebRTC 数据通道需要在服务端实现对应的接口，来接收和处理数据通道发送的数据。
// 同时，为了实现安全的数据传输，需要使用 SSL/TLS 协议来加密数据通道。
// 另外，使用 WebRTC 数据通道还需要实现一些额外的配置和技术支持，例如 NAT 穿透、STUN/TURN 服务器等。
