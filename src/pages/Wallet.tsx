import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clipboard, ArrowRight, ExternalLink, LogOut, AlertCircle, Key, Shield, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { EncryptedData } from '../utils/encryptionUtils';

const Wallet = () => {
  const { address, isConnected, isConnecting, error, signature, encryptedAddress, connectWallet, disconnectWallet, signMessage, encryptAddress, decryptAddress, getAddressAsJson } = useWallet();
  const { toast } = useToast();
  const [messageToSign, setMessageToSign] = useState("I authorize this application to use my wallet address for encryption/decryption purposes.");
  const [isSigning, setIsSigning] = useState(false);
  const [password, setPassword] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [jsonAddress, setJsonAddress] = useState<string | null>(null);
  
  // Function to format the wallet address for display
  const formatAddress = (address: string | null) => {
    if (!address) return "";
    return address;
  };

  const formatShortAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Copy address to clipboard
  const copyToClipboard = (text: string | null, label: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      toast({
        title: `${label} Copied`,
        description: `Your ${label.toLowerCase()} has been copied to clipboard.`,
      });
    }
  };

  // Handle signing message
  const handleSignMessage = async () => {
    if (!messageToSign.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to sign.",
        variant: "destructive"
      });
      return;
    }

    setIsSigning(true);
    try {
      const sig = await signMessage(messageToSign);
      if (sig) {
        toast({
          title: "Message Signed Successfully",
          description: "Your message has been signed with your wallet.",
        });
      }
    } catch (err) {
      console.error("Failed to sign message:", err);
    } finally {
      setIsSigning(false);
    }
  };

  // Handle address encryption
  const handleEncryptAddress = async () => {
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter a password for encryption.",
        variant: "destructive"
      });
      return;
    }

    setIsEncrypting(true);
    try {
      // First get the address as JSON
      const json = getAddressAsJson();
      setJsonAddress(json);
      
      // Then encrypt it
      const encrypted = await encryptAddress(password);
      if (encrypted) {
        toast({
          title: "Address Encrypted Successfully",
          description: "Your wallet address has been encrypted.",
        });
      }
    } catch (err) {
      console.error("Failed to encrypt address:", err);
    } finally {
      setIsEncrypting(false);
    }
  };

  // Handle address decryption
  const handleDecryptAddress = async () => {
    if (!encryptedAddress || !password.trim()) {
      toast({
        title: "Error",
        description: "Encrypted address or password is missing.",
        variant: "destructive"
      });
      return;
    }

    setIsDecrypting(true);
    try {
      const decrypted = await decryptAddress(encryptedAddress, password);
      if (decrypted) {
        setDecryptedData(decrypted);
        toast({
          title: "Address Decrypted Successfully",
          description: "Your wallet address has been decrypted.",
        });
      }
    } catch (err) {
      console.error("Failed to decrypt address:", err);
    } finally {
      setIsDecrypting(false);
    }
  };

  // Render loading state
  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Connecting to MetaMask</CardTitle>
            <CardDescription>Please confirm the connection in your MetaMask extension</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="w-full max-w-md border-red-400">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-500">Connection Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <AlertCircle className="text-red-500 h-12 w-12" />
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      {!isConnected ? (
        <Card className="w-full max-w-md shadow-xl bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Connect Your Wallet</CardTitle>
            <CardDescription className="text-slate-300">
              Connect your MetaMask wallet to view your address and sign messages
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Button 
              onClick={connectWallet} 
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 text-lg flex items-center gap-2 rounded-lg shadow-lg transition-all duration-300 hover:shadow-purple-500/20"
            >
              Connect MetaMask <ArrowRight className="ml-2" />
            </Button>
          </CardContent>
          <CardFooter className="text-center text-sm text-slate-400">
            You'll need to have MetaMask installed to continue
          </CardFooter>
        </Card>
      ) : (
        <div className="w-full max-w-4xl space-y-6">
          <Card className="shadow-xl bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                Wallet Connected
              </CardTitle>
              <CardDescription className="text-slate-300">
                Your wallet is now connected to this application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-400 mb-1">Your wallet address:</p>
                <div className="flex items-center gap-2">
                  <div className="bg-slate-800 p-3 rounded-lg text-slate-200 font-mono text-sm w-full overflow-x-auto">
                    {formatAddress(address)}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => copyToClipboard(address, "Address")} 
                    className="flex-shrink-0 text-slate-400 hover:text-white border-slate-700"
                  >
                    <Clipboard className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-2 flex-1"
                  variant="outline"
                  onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Etherscan
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-red-400 text-red-400 hover:bg-red-500 hover:text-white flex items-center gap-2 flex-1"
                  onClick={disconnectWallet}
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect Wallet
                </Button>
              </div>
            </CardContent>
            <CardFooter className="text-center text-sm text-slate-400">
              Connected as {formatShortAddress(address)}
            </CardFooter>
          </Card>
          
          <Card className="shadow-xl bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Sign Message</CardTitle>
              <CardDescription className="text-slate-300">
                Sign a message with your wallet to create a cryptographic signature
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm text-slate-400">Message to sign:</label>
                <Input 
                  id="message"
                  value={messageToSign} 
                  onChange={(e) => setMessageToSign(e.target.value)}
                  placeholder="Enter message to sign" 
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              
              <Button 
                onClick={handleSignMessage} 
                className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
                disabled={isSigning || !messageToSign.trim()}
              >
                {isSigning ? (
                  <>Signing... <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div></>
                ) : (
                  <>Sign Message <Key className="h-4 w-4" /></>
                )}
              </Button>

              {signature && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-1">Your signature:</p>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2">
                      <p className="text-slate-200 font-mono text-xs break-all">{signature}</p>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => copyToClipboard(signature, "Signature")}
                        className="flex-shrink-0 text-slate-400 hover:text-white border-slate-700"
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* New card for encrypting/decrypting wallet address */}
          <Card className="shadow-xl bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Encrypt & Decrypt Address on Sapphire Network</CardTitle>
              <CardDescription className="text-slate-300">
                Encrypt your wallet address as JSON for secure storage and decrypt it when needed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-slate-400">Encryption Password:</label>
                <Input 
                  id="password"
                  type="password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter encryption password" 
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={handleEncryptAddress} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                  disabled={isEncrypting || !password.trim() || !isConnected}
                >
                  {isEncrypting ? (
                    <>Encrypting... <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div></>
                  ) : (
                    <>Encrypt Address <Shield className="h-4 w-4" /></>
                  )}
                </Button>
                
                <Button 
                  onClick={handleDecryptAddress} 
                  className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                  disabled={isDecrypting || !password.trim() || !encryptedAddress}
                >
                  {isDecrypting ? (
                    <>Decrypting... <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div></>
                  ) : (
                    <>Decrypt Address <Database className="h-4 w-4" /></>
                  )}
                </Button>
              </div>

              {jsonAddress && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-1">Address as JSON:</p>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2">
                      <p className="text-slate-200 font-mono text-xs break-all">{jsonAddress}</p>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => copyToClipboard(jsonAddress, "JSON Address")}
                        className="flex-shrink-0 text-slate-400 hover:text-white border-slate-700"
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {encryptedAddress && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-1">Encrypted Address (Sapphire Network):</p>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="text-slate-200 font-mono text-xs break-all overflow-auto">
                        <p className="mb-1">Data: {encryptedAddress.data}</p>
                        <p>IV: {encryptedAddress.iv}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => copyToClipboard(JSON.stringify(encryptedAddress), "Encrypted Address")}
                        className="flex-shrink-0 text-slate-400 hover:text-white border-slate-700"
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {decryptedData && (
                <div className="mt-4">
                  <p className="text-sm text-slate-400 mb-1">Decrypted Address Data:</p>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2">
                      <p className="text-slate-200 font-mono text-xs break-all">{decryptedData}</p>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => copyToClipboard(decryptedData, "Decrypted Data")}
                        className="flex-shrink-0 text-slate-400 hover:text-white border-slate-700"
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Wallet;
