// decrypt.ts
import * as crypto from 'crypto';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();
const IV_LENGTH = 16;

function decryptPrivateKey(encrypted: string, encryptionKeyHex: string): string {
  if (!encryptionKeyHex) throw new Error('ENCRYPTION KEY missing');
  const [ivHex, encryptedText] = encrypted.split(':');
  if (!ivHex || !encryptedText) throw new Error('Invalid encrypted format (expect iv:encrypted)');
  const iv = Buffer.from(ivHex, 'hex');
  const key = Buffer.from(encryptionKeyHex, 'hex'); // must be 32 bytes
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted; // should be the private key string like "0x..."
}

// --- Usage example ---
async function main() {
  const ENCRYPTION_KEY = process.env.PRIVATE_KEY_ENCRYPTION_KEY!;
  const encrypted = '0dc274688559236520070828f4b0c97d:3c5391c13479408ab585bb0c390fc70e6a3a391df0ed7d69d48e7e4cac28eb3a2d01a9aa28ff2e572bc7d103c8c47e93e19529e62cba4757381100c4ffec506fb7322c486051290aad0b7d8f18d34499';

  if (!ENCRYPTION_KEY) {
    console.error('Set PRIVATE_KEY_ENCRYPTION_KEY in env before running.');
    process.exit(1);
  }

  const privateKey = decryptPrivateKey(encrypted, ENCRYPTION_KEY);
  console.log('Decrypted private key:', privateKey);

  // Verify address matches expected (optional)
  const wallet = new ethers.Wallet(privateKey, new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545'));
  console.log('Derived address:', wallet.address);

  // Optional: send 0.1 ETH to test address (uncomment to actually send)
  // const tx = await wallet.sendTransaction({
  //   to: '0x...RECEIVER_ADDRESS_HERE...',
  //   value: ethers.utils.parseEther('0.1'),
  // });
  // await tx.wait();
  // console.log('Sent tx:', tx.hash);
}

main().catch((err) => { console.error(err); process.exit(1); });
