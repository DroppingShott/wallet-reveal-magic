
// Simple encryption/decryption utility with MetaMask signing
// Note: In a production environment, you should use a more robust encryption library

import { ethers } from 'ethers';

export interface EncryptedData {
  data: string;
  iv: string;
}

// Encrypt data using the wallet's signing capabilities
export const encryptData = async (data: string, signer: ethers.Signer): Promise<EncryptedData> => {
  try {
    // Convert data to proper format for encryption
    const dataBuffer = new TextEncoder().encode(data);
    
    // Get the address to use in the signing message
    const address = await signer.getAddress();
    
    // Create a signing message that includes a unique identifier
    const signMessage = `Encrypt data for Sapphire Network: ${Date.now()}`;
    
    // Sign message with MetaMask
    const signature = await signer.signMessage(signMessage);
    
    // Use signature as encryption key
    const keyData = ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)));
    const keyBuffer = keyData.slice(0, 32); // Use first 32 bytes for AES-256
    
    // Generate a random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Import the key for encryption
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    // Encrypt the data
    const encryptedContent = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      dataBuffer
    );
    
    // Convert encrypted data and IV to strings for storage/transmission
    const encryptedData = {
      data: arrayBufferToBase64(encryptedContent),
      iv: arrayBufferToBase64(iv)
    };
    
    return encryptedData;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

export const decryptData = async (encryptedData: EncryptedData, signer: ethers.Signer, signMessage: string): Promise<string> => {
  try {
    // Convert data from storage format to proper format for decryption
    const encryptedBuffer = base64ToArrayBuffer(encryptedData.data);
    const iv = base64ToArrayBuffer(encryptedData.iv);
    
    // Sign message with MetaMask to get the same key used for encryption
    const signature = await signer.signMessage(signMessage);
    
    // Use signature as encryption key
    const keyData = ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)));
    const keyBuffer = keyData.slice(0, 32); // Use first 32 bytes for AES-256
    
    // Import the key for decryption
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Decrypt the data
    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encryptedBuffer
    );
    
    // Convert decrypted data to string
    return new TextDecoder().decode(decryptedContent);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Helper functions to convert between ArrayBuffer and Base64 string
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const byteArray = new Uint8Array(buffer);
  let byteString = '';
  for (let i = 0; i < byteArray.byteLength; i++) {
    byteString += String.fromCharCode(byteArray[i]);
  }
  return window.btoa(byteString);
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};
