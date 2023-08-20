import { Request, Response, Router } from "express";
import { unlink } from "fs/promises";

import upload from "../utils/multer";
import cloudInstance from "../utils/cloudinary";

const router = Router();

router.post(
  "/upload-file",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const { folderName } = req.body;

      const result = await cloudInstance.uploader.upload(
        req.file?.originalname!,
        {
          folder: folderName,
        }
      );

      // file is getting saved at base directly, deleting file after getting cloudinary response.
      await unlink(req.file?.originalname!);
      res.json(result);
    } catch (error) {
      res.status(400).json(null);
    }
  }
);

export default router;
