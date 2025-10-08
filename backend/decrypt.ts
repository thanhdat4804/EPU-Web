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
  const encrypted = '659475dda539580e48c289f7746d0b9a:49bd87457d0375468a465ec3d7b378d547a146f3cd4345b7e8296243bdd9e24d4e8713df597c393b9aee1afe72fe5af87705691f3058226a50fd35ff43257fa1fea2782ce05291b5c0946e13d036b0b5';

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
