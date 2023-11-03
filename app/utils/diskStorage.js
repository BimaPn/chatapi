import multer from "multer";
import path from 'path';

export const initMulter = ({destination,fileSizeLimit = 6*(1024*1024),length}) => {
  const storage = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, path.join(__basedir, `/public/${destination}`)); 
      },
      filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); 
      }
  });
  return multer({
    storage,
    limits:{fileSize:fileSizeLimit},
  }).array("images",length);
}
