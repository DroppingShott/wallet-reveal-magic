
import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clipboard, ArrowRight, ExternalLink, LogOut, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Wallet = () => {
  const { address, isConnected, isConnecting, error, connectWallet, disconnectWallet } = useWallet();
  const { toast } = useToast();
  
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
  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Your wallet address has been copied to clipboard.",
      });
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
              Connect your MetaMask wallet to view your address
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
        <Card className="w-full max-w-lg shadow-xl bg-slate-800 border-slate-700">
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
                  onClick={copyToClipboard} 
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
      )}
    </div>
  );
};

export default Wallet;
