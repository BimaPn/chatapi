import {fileTypeFromBuffer} from 'file-type';
import path from "path";
import {writeFile} from "fs"
import multer from "multer";

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

export const saveFile = async (file,filePath) => {
  const fileExt = await fileTypeFromBuffer(file).catch(err => {
    throw new Error("Something is wrong.");
  });
  
  if(fileExt.mime.includes("image") && file.length > 1e7){
    throw new Error("Image file to big.");
  }

  const destination = path.join(__basedir, `/public/${filePath}/`);
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9) + `.${fileExt.ext}`;
  const finalPath = destination + uniqueSuffix;

  writeFile(finalPath, file, (err) => {
    if(err) throw new Error(err);
  });

  return `${process.env.APP_URL}/${filePath}/${uniqueSuffix}`
}
