import { getAllTokensWithPairs } from './getdb.js';
import axios from 'axios';
import cron from 'node-cron';
import ipfsHttpClient from 'ipfs-http-client';

const ipfs = ipfsHttpClient('http://localhost:5001') // replace with your IPFS API address

async function postAllTokensWithPairs() {
  const data = await getAllTokensWithPairs();

  try {
    const ipfsHash = await ipfs.add(JSON.stringify(data));
    console.log(`IPFS Hash: ${ipfsHash.path}`);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

// Schedule cron job to run every 5 minutes
cron.schedule('*/5 * * * *', postAllTokensWithPairs);

