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
  const encrypted = '62f84998aaa651eb0942f3182109ddea:8356f51071d2e5a768f21633701ab811167804f4a888b0909a845d9d9bc16c5f61a5afc2c00e0f4df3e47b784ac76a4af72c19bb361fd2a12939a1f8c9618a5ec3e083239fecd23c7e54d5b40a169ad7';

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
