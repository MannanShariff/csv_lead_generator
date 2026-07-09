import { Router } from 'express';
import multer from 'multer';
import { CSVController } from '../controllers/csv.controller';
import fs from 'fs';
import path from 'path';

const router = Router();
const controller = new CSVController();

// Ensure uploads directory exists inside backend workspace
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ dest: uploadDir });

router.post('/import', upload.single('file'), controller.importCSV);
router.get('/download-sample/:filename', controller.downloadSample);
router.post('/prepare-export', controller.prepareExport);
router.get('/download-export/:id/:filename', controller.downloadExport);

export default router;
