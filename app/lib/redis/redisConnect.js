import { createClient } from "redis";

const client = createClient({
  legacyMode:false
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

export default client;
