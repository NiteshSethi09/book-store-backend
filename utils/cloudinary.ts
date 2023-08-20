import cloud from "cloudinary";
import {
  cloudinaryApiKey,
  cloudinaryApiSecret,
  cloudinaryCloudName,
} from "./config";

cloud.v2.config({
  cloud_name: cloudinaryCloudName!,
  api_key: cloudinaryApiKey!,
  api_secret: cloudinaryApiSecret!,
});

const cloudInstance = cloud.v2;

export default cloudInstance;
