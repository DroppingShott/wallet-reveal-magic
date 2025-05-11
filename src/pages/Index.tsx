
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">Welcome to Web3 Wallet</h1>
        <p className="text-xl text-purple-200 mb-8">Connect your MetaMask wallet and view your address</p>
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 text-lg flex items-center gap-2 rounded-lg shadow-lg transition-all duration-300 hover:shadow-purple-500/20">
          <Link to="/wallet">
            <Wallet className="mr-2 h-6 w-6" />
            Connect Wallet
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
