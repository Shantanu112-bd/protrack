import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { trackingService } from '../../services/supabase';
import { iotService } from '../../services/IoTService';
import { useWeb3 } from '../../contexts/Web3Context';
import { ethers } from 'ethers';
import { useToast } from '../ui/use-toast';

const ManufacturerDashboard: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    rfid_tag: '',
    batch_id: '',
    product_name: '',
    expiry_date: '',
  });
  const { contract, address } = useWeb3();
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, [address]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Get products manufactured by this user
      const data = await trackingService.getProductsByStatus('manufactured');
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const mintNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract || !address) {
      toast({
        title: 'Error',
        description: 'Wallet not connected',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create metadata hash
      const metadata = {
        name: newProduct.product_name,
        rfid: newProduct.rfid_tag,
        batchId: newProduct.batch_id,
        expiryDate: newProduct.expiry_date,
        manufacturer: address,
        createdAt: new Date().toISOString()
      };
      
      const metadataHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(JSON.stringify(metadata))
      );
      
      // Mint token on blockchain
      const tx = await contract.mintProductToken(
        newProduct.rfid_tag,
        newProduct.batch_id,
        new Date(newProduct.expiry_date).getTime() / 1000,
        metadataHash
      );
      
      toast({
        title: 'Transaction Submitted',
        description: 'Minting product token...',
      });
      
      const receipt = await tx.wait();
      
      // Get token ID from event
      const event = receipt.events?.find(
        (event: any) => event.event === 'ProductTokenMinted'
      );
      
      const tokenId = event?.args?.tokenId.toString();
      
      // Create product in Supabase
      await trackingService.createProduct({
        rfid_tag: newProduct.rfid_tag,
        batch_id: newProduct.batch_id,
        token_id: tokenId,
        manufacturer_id: address,
        expiry_date: newProduct.expiry_date,
        status: 'manufactured'
      });
      
      toast({
        title: 'Success',
        description: 'Product created and token minted',
      });
      
      // Reset form and reload products
      setNewProduct({
        rfid_tag: '',
        batch_id: '',
        product_name: '',
        expiry_date: '',
      });
      
      loadProducts();
    } catch (error) {
      console.error('Error minting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to mint product token',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const initiateTransfer = async (productId: string, tokenId: string) => {
    try {
      // This would open a modal to select recipient and initiate transfer
      // For now, we'll just show a toast
      toast({
        title: 'Transfer Initiated',
        description: 'Transfer functionality will be implemented in the next phase',
      });
    } catch (error) {
      console.error('Error initiating transfer:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate transfer',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Manufacturer Dashboard</h1>
      
      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">My Products</TabsTrigger>
          <TabsTrigger value="create">Create Product</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>My Products</CardTitle>
              <CardDescription>
                Manage and track products you've manufactured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading products...</p>
              ) : products.length === 0 ? (
                <p>No products found. Create your first product in the "Create Product" tab.</p>
              ) : (
                <div className="grid gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{product.product_name || 'Unnamed Product'}</h3>
                          <p className="text-sm text-gray-500">RFID: {product.rfid_tag}</p>
                          <p className="text-sm text-gray-500">Batch: {product.batch_id}</p>
                          <p className="text-sm text-gray-500">
                            Expiry: {new Date(product.expiry_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">Status: {product.status}</p>
                        </div>
                        <div className="space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => initiateTransfer(product.id, product.token_id)}
                          >
                            Transfer
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // View product details
                            }}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Product</CardTitle>
              <CardDescription>
                Mint a new product token and register it in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={mintNewProduct} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="rfid_tag">RFID Tag</Label>
                  <Input
                    id="rfid_tag"
                    name="rfid_tag"
                    value={newProduct.rfid_tag}
                    onChange={handleInputChange}
                    placeholder="Enter RFID tag"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="batch_id">Batch ID</Label>
                  <Input
                    id="batch_id"
                    name="batch_id"
                    value={newProduct.batch_id}
                    onChange={handleInputChange}
                    placeholder="Enter batch ID"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="product_name">Product Name</Label>
                  <Input
                    id="product_name"
                    name="product_name"
                    value={newProduct.product_name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    name="expiry_date"
                    type="date"
                    value={newProduct.expiry_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <Button type="submit" disabled={loading}>
                  {loading ? 'Processing...' : 'Mint Product Token'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View analytics for your manufactured products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analytics dashboard will be implemented in the next phase.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManufacturerDashboard;