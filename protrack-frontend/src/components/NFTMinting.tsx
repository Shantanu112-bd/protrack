import React, { useState, useEffect } from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { LoadingSpinner } from "./ui/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { supabase } from "../services/supabase";
import { integratedSupplyChainService } from "../services/integratedSupplyChainService";
import {
  Package,
  Layers,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Hash,
  ExternalLink,
  RefreshCw,
  Plus,
  Eye,
} from "lucide-react";

interface Product {
  id: string;
  product_name: string;
  rfid_tag: string;
  batch_no: string;
  mfg_date: string;
  exp_date: string;
  token_id?: string;
  owner_wallet: string;
  current_location: string;
  created_at: string;
}

const NFTMinting = () => {
  const { account, isActive } = useWeb3();
  const [products, setProducts] = useState<Product[]>([]);
  const [mintedTokens, setMintedTokens] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [success, setSuccess] = useState<{
    tokenId: string;
    txHash: string;
    productName: string;
  } | null>(null);

  // Load unminted products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .is("token_id", null)
        .eq("owner_wallet", account)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load minted tokens
  const loadMintedTokens = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .not("token_id", "is", null)
        .eq("owner_wallet", account)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setMintedTokens(data || []);
    } catch (error) {
      console.error("Error loading minted tokens:", error);
    }
  };

  useEffect(() => {
    if (account) {
      loadProducts();
      loadMintedTokens();
    }
  }, [account]);

  const handleMintNFT = async () => {
    if (!isActive || !account || !selectedProduct) {
      alert("Please connect your wallet and select a product");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) {
      alert("Product not found");
      return;
    }

    try {
      setMinting(selectedProduct);

      // Mint NFT using integrated service
      const result = await integratedSupplyChainService.mintProductNFT({
        rfidHash: product.rfid_tag,
        productName: product.product_name,
        batchNumber: product.batch_no,
        manufacturingDate: product.mfg_date,
        expiryDate: product.exp_date,
        manufacturer: account,
      });

      // Update product with token ID
      const { error } = await supabase
        .from("products")
        .update({
          token_id: result.tokenId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedProduct);

      if (error) throw error;

      // Set success state
      setSuccess({
        tokenId: result.tokenId,
        txHash: result.transactionHash || `0x${Date.now().toString(16)}`,
        productName: product.product_name,
      });

      // Refresh data
      await loadProducts();
      await loadMintedTokens();

      // Clear selection
      setSelectedProduct("");
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Failed to mint NFT. Please try again.");
    } finally {
      setMinting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              NFT Minted Successfully!
            </h3>
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Product
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {success.productName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Token ID
                  </p>
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Hash className="h-3 w-3 mr-1" />#{success.tokenId}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Transaction
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() =>
                      window.open(
                        `https://etherscan.io/tx/${success.txHash}`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View on Explorer
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 justify-center">
              <Button
                onClick={() => setSuccess(null)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Mint Another NFT
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NFT Minting
          </h1>
          <p className="text-gray-600 mt-2">
            Convert your products into blockchain NFTs for enhanced traceability
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button
            onClick={() => {
              loadProducts();
              loadMintedTokens();
            }}
            className="flex items-center bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Wallet connection warning */}
      {!isActive && (
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Wallet Not Connected
            </h3>
            <p className="text-yellow-700">
              Please connect your wallet to mint NFTs for your products
            </p>
          </CardContent>
        </Card>
      )}

      {/* Mint New NFT Section */}
      {isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Layers className="h-5 w-5 mr-2 text-blue-500" />
              Mint Product NFT
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product-select">Select Product to Mint</Label>
                  <select
                    id="product-select"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose a product...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.product_name} - {product.rfid_tag} (Batch:{" "}
                        {product.batch_no})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    {(() => {
                      const product = products.find(
                        (p) => p.id === selectedProduct
                      );
                      return product ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Product Name
                            </p>
                            <p className="text-gray-900">
                              {product.product_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              RFID Tag
                            </p>
                            <p className="text-gray-900 font-mono">
                              {product.rfid_tag}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Batch Number
                            </p>
                            <p className="text-gray-900">{product.batch_no}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              Manufacturing Date
                            </p>
                            <p className="text-gray-900">{product.mfg_date}</p>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleMintNFT}
                    disabled={!selectedProduct || minting === selectedProduct}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    {minting === selectedProduct ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Minting NFT...
                      </>
                    ) : (
                      <>
                        <Layers className="h-4 w-4 mr-2" />
                        Mint NFT
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No unminted products available</p>
                <p className="text-sm">
                  Create products first to mint them as NFTs
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Minted NFTs Section */}
      {mintedTokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Hash className="h-5 w-5 mr-2 text-green-500" />
              Your Minted NFTs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Token ID</TableHead>
                    <TableHead>RFID Tag</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Minted Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mintedTokens.map((token) => (
                    <TableRow key={token.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium">{token.product_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">
                          <Hash className="h-3 w-3 mr-1" />#{token.token_id}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {token.rfid_tag}
                        </span>
                      </TableCell>
                      <TableCell>{token.batch_no}</TableCell>
                      <TableCell>
                        {new Date(token.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(
                              `https://opensea.io/assets/ethereum/${token.token_id}`,
                              "_blank"
                            )
                          }
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View NFT
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NFTMinting;
