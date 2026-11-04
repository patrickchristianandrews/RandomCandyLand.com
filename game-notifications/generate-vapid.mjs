/* Generate a fresh VAPID P-256 keypair locally on YOUR computer.
 * Never put the PRIVATE value in GitHub, public web assets, issues, or chats.
 * Paste both values separately into Cloudflare Worker secrets.
 */
import {webcrypto} from 'node:crypto';
const pair=await webcrypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
const publicKey=Buffer.from(await webcrypto.subtle.exportKey('raw',pair.publicKey)).toString('base64url');
const privateKey=(await webcrypto.subtle.exportKey('jwk',pair.privateKey)).d;
console.log('VAPID_PUBLIC_KEY = '+publicKey);
console.log('VAPID_PRIVATE_KEY = '+privateKey);
console.log('\nKeep PRIVATE hidden. Both are required when deploying the Worker.');
