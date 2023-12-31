import cron from 'node-cron';
import client from '../redis/redisConnect.js';
import { deleteFile } from '../../utils/storage.js';

export default cron.schedule('0 0 */24 * *', async () => {
  const media = await client.zRange("storyMedia",0,-1);
  if(media.length > 0) {
    for(const data of media) {
     deleteFile(data); 
    }
    await client.zRem("storyMedia",media);
    return;
  }
});
