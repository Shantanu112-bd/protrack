import React, { useState } from "react";
import { api } from "../services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";

interface ProductFormProps {
  onSuccess?: (productId: string) => void;
  onClose?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manufacturer: "",
    batch_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim() || !formData.manufacturer.trim()) {
        throw new Error("Name and manufacturer are required");
      }

      const response = await api.createProduct({
        name: formData.name,
        description: formData.description,
        manufacturer: formData.manufacturer,
        batch_number: formData.batch_number || `BATCH-${Date.now()}`,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create product");
      }

      setSuccess(true);
      setFormData({ name: "", description: "", manufacturer: "", batch_number: "" });

      if (onSuccess) {
        onSuccess(response.data.id);
      }

      setTimeout(() => {
        setSuccess(false);
        if (onClose) {
          onClose();
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error creating product:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">Product created successfully!</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Organic Coffee Beans"
              disabled={loading || success}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturer">Manufacturer *</Label>
            <Input
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              placeholder="e.g., Coffee Corp Inc"
              disabled={loading || success}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch_number">Batch Number</Label>
            <Input
              id="batch_number"
              name="batch_number"
              value={formData.batch_number}
              onChange={handleChange}
              placeholder="e.g., BATCH-2025-001"
              disabled={loading || success}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product details..."
              disabled={loading || success}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={loading || success}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Creating..." : "Create Product"}
            </Button>
            {onClose && (
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
