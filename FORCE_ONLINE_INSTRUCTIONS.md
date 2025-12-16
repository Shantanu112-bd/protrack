# 🚀 Force ProTrack Online - Quick Instructions

## 🎯 Problem: System showing "Using offline mode - Data will sync when connection restored"

### ✅ **SOLUTION: Multiple Ways to Force Online Mode**

---

## 🔧 Method 1: Use the "Go Online" Button (Easiest)

1. **Look for the blue notification bar** that says "Using offline mode"
2. **Click the "Go Online" button** on the right side of the notification
3. **Wait for page refresh** - System will automatically reload
4. **✅ System is now online** - You can now mint NFTs and use all features

---

## 🔧 Method 2: Browser Console Command (Advanced)

1. **Open Browser Developer Tools** (F12 or right-click → Inspect)
2. **Go to Console tab**
3. **Run this command:**

```javascript
// Force system online
window.fallbackService
  ?.forceOnlineMode()
  .then(() => {
    console.log("✅ System forced online!");
    window.location.reload();
  })
  .catch((err) => {
    console.error("❌ Failed to force online:", err);
  });
```

---

## 🔧 Method 3: Clear Offline Data (Nuclear Option)

If the above methods don't work, clear all offline data:

1. **Open Browser Developer Tools** (F12)
2. **Go to Console tab**
3. **Run this command:**

```javascript
// Clear all offline data and force online
localStorage.removeItem("protrack_connection_status");
localStorage.removeItem("protrack_pending_operations");
localStorage.removeItem("protrack_products");
localStorage.removeItem("protrack_shipments");
console.log("✅ Offline data cleared!");
window.location.reload();
```

---

## 🔧 Method 4: Manual Reset (If all else fails)

1. **Clear browser cache and cookies** for localhost:5174
2. **Refresh the page** (Ctrl+F5 or Cmd+Shift+R)
3. **Reconnect your wallet**
4. **System should start in online mode**

---

## 🎮 How to Verify System is Online

### ✅ **Online Mode Indicators:**

- No blue "Using offline mode" notification
- Products load from real database
- Wallet connection works properly
- NFT minting buttons are functional
- Real-time data synchronization

### ❌ **Offline Mode Indicators:**

- Blue notification: "Using offline mode - Data will sync when connection restored"
- Mock/sample data displayed
- Limited functionality
- Pending operations counter

---

## 🚀 Enable NFT Minting (After Going Online)

Once the system is online:

1. **Connect Your Wallet** (MetaMask)
2. **Go to Products page**
3. **Find a product** that shows "Not Minted" status
4. **Click the "Mint" button** next to the product
5. **Confirm the transaction** in MetaMask
6. **✅ NFT Minted Successfully!**

### 🔍 **Minting Requirements:**

- ✅ Wallet connected (MetaMask)
- ✅ System online (no offline mode warning)
- ✅ Product exists in database
- ✅ Product not already minted
- ✅ Sufficient ETH for gas fees

---

## 🛠️ Troubleshooting

### **"Go Online" Button Not Working?**

- Check internet connection
- Try Method 2 (Console command)
- Try Method 3 (Clear offline data)

### **Still Showing Offline After Going Online?**

- Hard refresh the page (Ctrl+F5)
- Clear browser cache
- Check browser console for errors

### **NFT Minting Not Working?**

- Ensure wallet is connected
- Check that system is online (no blue warning)
- Verify you have ETH for gas fees
- Check browser console for error messages

### **Pending Operations Not Syncing?**

- Click "Go Online" button
- Wait a few seconds for sync to complete
- Check browser console for sync status
- If stuck, use Method 3 to clear data

---

## 🎯 **Quick Test to Verify Everything Works:**

1. **Force system online** (using any method above)
2. **Connect wallet** (MetaMask)
3. **Create a test product** (Products → New Product)
4. **Mint the product as NFT** (Click "Mint" button)
5. **✅ Success!** Product should show "Minted" status

---

## 📞 **Still Having Issues?**

If none of these methods work:

1. **Check browser console** for error messages
2. **Verify internet connection** is stable
3. **Try a different browser** (Chrome, Firefox, Safari)
4. **Clear all browser data** for localhost:5174
5. **Restart the development server**

---

**🎯 GOAL: Get system online so NFT minting works properly**
**🚀 RESULT: Full functionality with real-time data and blockchain integration**
