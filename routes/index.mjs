import '../config.mjs';
import express from 'express';

const router = express.Router();
import {getUploadUrl} from "../r2_manager.mjs";

//Health Check
router.get('/', (req, res) => {
    res.json({status: 1});
});

//Get Upload URL
router.get('/getUploadUrl', (req, res, next) => {
    let data = {
        fileName: req.query.fileName,
        mimeType: req.query.mimeType
    }

    if (!data.fileName) return next("Invalid File");

    getUploadUrl(data, (err, data) => {
        if (err) return next(err);
        res.json(data);
    });
});

export default router;
