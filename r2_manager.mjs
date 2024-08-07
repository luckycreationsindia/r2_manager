import './config.mjs';
import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import {nanoid} from "nanoid";
import mime from "mime";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let s3Options = {
    region: process.env.R2_REGION,
    endpoint: process.env.R2_URL,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY
    }
}

const s3 = new S3Client(s3Options);

let getUploadUrl = function(data, next) {
    let fileName = nanoid() + "." + data.fileName.split('.').pop();
    let key = "user/" + fileName;
    let mimeType = mime.getType(key) || data.mimeType;
    const params = {
        Bucket: process.env.R2_BUCKET,
        Key: key,
        ACL: "public-read"
    };
    if (mimeType) params.Metadata = {ContentType: mimeType};
    getSignedUrl(s3, new PutObjectCommand(params), { expiresIn: 120 }).then((url) => {
        next(null, {status: 1, data: url})
    }).catch(next)
}

export {getUploadUrl};