
import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clipboard, ArrowRight, ExternalLink, LogOut, AlertCircle, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const Wallet = () => {
  const { address, isConnected, isConnecting, error, signature, connectWallet, disconnectWallet, signMessage } = useWallet();
  const { toast } = useToast();
  const [messageToSign, setMessageToSign] = useState("I authorize this application to use my wallet address for encryption/decryption purposes.");
  const [isSigning, setIsSigning] = useState(false);
  
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
        </div>
      )}
    </div>
  );
};

export default Wallet;
