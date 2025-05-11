import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { encryptData, decryptData, EncryptedData } from '../utils/encryptionUtils';

// Define the shape of our wallet context
interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  signature: string | null;
  encryptedAddress: EncryptedData | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string | null>;
  encryptAddress: () => Promise<EncryptedData | null>;
  decryptAddress: (encryptedData: EncryptedData) => Promise<string | null>;
  getAddressAsJson: () => string | null;
}

// Create context with default values
const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  signature: null,
  encryptedAddress: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  signMessage: async () => null,
  encryptAddress: async () => null,
  decryptAddress: async () => null,
  getAddressAsJson: () => null,
});

// Custom hook to use the wallet context
export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [encryptedAddress, setEncryptedAddress] = useState<EncryptedData | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    const { ethereum } = window as any;
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  // Effect to restore connection on page refresh if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (isMetaMaskInstalled()) {
          const provider = new ethers.providers.Web3Provider((window as any).ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
        }
      } catch (err) {
        console.error("Failed to check existing connection", err);
      }
    };

    checkConnection();
  }, []);

  // Handle account changes
  useEffect(() => {
    const { ethereum } = window as any;
    
    if (ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setAddress(null);
          setIsConnected(false);
          setSignature(null); // Clear signature when wallet is disconnected
        } else {
          // User switched accounts
          setAddress(accounts[0]);
          setIsConnected(true);
          setSignature(null); // Clear signature when account changes
        }
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // Get address as JSON object
  const getAddressAsJson = (): string | null => {
    if (!address) return null;
    
    const addressJson = {
      address: address,
      network: 'sapphire',
      timestamp: new Date().toISOString()
    };
    
    return JSON.stringify(addressJson);
  };

  // Encrypt address function using MetaMask signing
  const encryptAddress = async (): Promise<EncryptedData | null> => {
    try {
      setError(null);
      
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }
      
      const addressJson = getAddressAsJson();
      if (!addressJson) {
        throw new Error("Failed to create address JSON");
      }
      
      const { ethereum } = window as any;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      
      const encrypted = await encryptData(addressJson, signer);
      setEncryptedAddress(encrypted);
      return encrypted;
    } catch (err: any) {
      console.error("Error encrypting address:", err);
      setError(err.message || "Failed to encrypt address");
      return null;
    }
  };

  // Decrypt address function using MetaMask signing
  const decryptAddress = async (encryptedData: EncryptedData): Promise<string | null> => {
    try {
      setError(null);
      
      const { ethereum } = window as any;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      
      const decrypted = await decryptData(encryptedData, signer);
      return decrypted;
    } catch (err: any) {
      console.error("Error decrypting address:", err);
      setError(err.message || "Failed to decrypt address");
      return null;
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      if (!isMetaMaskInstalled()) {
        throw new Error("MetaMask is not installed");
      }

      const { ethereum } = window as any;
      const provider = new ethers.providers.Web3Provider(ethereum);
      
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      setAddress(accounts[0]);
      setIsConnected(true);
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setSignature(null); // Clear signature when wallet is disconnected
  };

  // Sign message function
  const signMessage = async (message: string): Promise<string | null> => {
    try {
      setError(null);
      
      if (!isConnected || !address) {
        throw new Error("Wallet not connected");
      }

      const { ethereum } = window as any;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      
      // The message to sign
      const signature = await signer.signMessage(message);
      setSignature(signature);
      return signature;
    } catch (err: any) {
      console.error("Error signing message:", err);
      setError(err.message || "Failed to sign message");
      return null;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        error,
        signature,
        encryptedAddress,
        connectWallet,
        disconnectWallet,
        signMessage,
        encryptAddress,
        decryptAddress,
        getAddressAsJson
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
