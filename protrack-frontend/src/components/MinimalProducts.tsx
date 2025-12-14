import React from "react";
import { useWeb3 } from "../contexts/web3ContextTypes";

const MinimalProducts = () => {
  console.log("MinimalProducts component rendering");

  const { isActive } = useWeb3();
  console.log("MinimalProducts: Web3 context - isActive:", isActive);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600">
        Minimal Products Component
      </h1>
      <p className="text-gray-600 mt-4">
        Web3 Active: {isActive ? "Yes" : "No"}
      </p>
      <p className="text-gray-600 mt-2">
        If you can see this, the component is rendering correctly.
      </p>
    </div>
  );
};

export default MinimalProducts;
