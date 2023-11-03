import {fileTypeFromBuffer} from 'file-type';
import path from "path";
import {writeFile} from "fs"

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
