import './config.mjs';
import {S3Client, GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
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

console.log(s3Options);

const s3 = new S3Client(s3Options);

const getFile = function (req, res, next) {
    try {
        res.removeHeader('Access-Control-Allow-Credentials');
        let key = req.params.file;
        if (!key || key === 'undefined' || key === 'null') return next("Invalid File");
        // if(process.env.NODE_ENV === 'development' && key.includes('&')) {
        //     key = key.split('&')[0]
        // }
        let params = {Bucket: process.env.R2_BUCKET, Key: key};
        s3.send(new GetObjectCommand(params)).then((data) => {
            const contentLength = data.ContentLength;
            const contentType = mime.getType(key) || data.ContentType;
            res.set('Content-Length', contentLength);
            res.set('Content-Type', contentType);
            res.set('Access-Control-Allow-Credentials', 'omit');
            data.Body.pipe(res)
        }).catch(next);
    } catch (e) {
        next(e);
    }
}

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

export {getFile, getUploadUrl};