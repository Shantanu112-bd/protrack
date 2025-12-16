# 🚀 ProTrack Quick Start Guide - Get Online & Mint NFTs

## 🎯 **GOAL: Get your system online and mint your first NFT**

Your ProTrack system is ready! Follow these simple steps to get online and start minting NFTs.

---

## 🔥 **STEP 1: Open the Application**

1. **Open your browser** (Chrome, Firefox, Safari)
2. **Go to**: `http://localhost:5174`
3. **Wait for the app to load** (should take 2-3 seconds)

---

## 🔧 **STEP 2: Force System Online (If Needed)**

### **If you see a blue notification saying "Using offline mode":**

#### **Option A: Click the Button (Easiest)**

1. **Look for the blue notification bar** at the top
2. **Click the "Go Online" button** on the right side
3. **Wait for page refresh** (automatic)
4. ✅ **Done!** System is now online

#### **Option B: Use Browser Console (Advanced)**

1. **Press F12** to open Developer Tools
2. **Click "Console" tab**
3. **Type**: `forceOnline()`
4. **Press Enter**
5. ✅ **Done!** Page will refresh automatically

---

## 🔗 **STEP 3: Connect Your Wallet**

1. **Look for "Connect Wallet" button** in the top-right corner
2. **Click it** to open MetaMask
3. **Select your account** and click "Connect"
4. **Confirm the connection** in MetaMask
5. ✅ **Success!** You should see your wallet address displayed

---

## 🎮 **STEP 4: Create Your First Product**

1. **Go to "Products" page** (navigation menu)
2. **Click "New Product" button** (purple button, top-right)
3. **Fill in the form**:
   - **Product Name**: "My Test Product"
   - **Category**: Select any category
   - **RFID Tag**: Click "Generate" button for automatic ID
   - **Batch Number**: "BATCH001"
   - **Manufacturing Date**: Today's date
   - **Expiry Date**: Future date
   - **Current Location**: "Warehouse A"
4. **Click "Create Product"**
5. ✅ **Success!** Your product is created

---

## 🎯 **STEP 5: Mint Your First NFT**

1. **Find your product** in the products table
2. **Look for "Not Minted" badge** in the Token column
3. **Click the "Mint" button** in the Actions column
4. **Confirm the transaction** in MetaMask popup
5. **Wait for confirmation** (usually 10-30 seconds)
6. ✅ **Success!** Product now shows "Minted" with token ID

---

## 🎉 **CONGRATULATIONS!**

You've successfully:

- ✅ Forced your system online
- ✅ Connected your MetaMask wallet
- ✅ Created a product in the supply chain
- ✅ Minted your first NFT on the blockchain

---

## 🛠️ **Troubleshooting**

### **Problem: Still showing "offline mode"**

**Solution**: Try these in order:

1. Click "Go Online" button again
2. Hard refresh page (Ctrl+F5 or Cmd+Shift+R)
3. Open console (F12) and type: `localStorage.clear()` then refresh

### **Problem: "Connect Wallet" not working**

**Solution**:

1. Make sure MetaMask extension is installed
2. Make sure MetaMask is unlocked
3. Try refreshing the page
4. Check if MetaMask is connected to the right network

### **Problem: "Mint" button disabled**

**Solution**: Check these requirements:

1. ✅ System is online (no blue warning)
2. ✅ Wallet is connected (address shown in top-right)
3. ✅ Product exists and is "Not Minted"
4. ✅ You have ETH for gas fees

### **Problem: Transaction fails**

**Solution**:

1. Check you have enough ETH for gas fees
2. Try increasing gas limit in MetaMask
3. Make sure you're on the correct network
4. Wait a moment and try again

---

## 🎮 **What You Can Do Now**

### **Products Management**

- ✅ Create new products
- ✅ View product details
- ✅ Track product lifecycle
- ✅ Mint products as NFTs
- ✅ View ownership history

### **Shipments Tracking**

- ✅ Create shipments
- ✅ Track delivery status
- ✅ Monitor real-time location
- ✅ Manage recipients

### **IoT Monitoring**

- ✅ Record sensor data
- ✅ Monitor temperature/humidity
- ✅ Track GPS location
- ✅ Set up alerts

### **Quality Assurance**

- ✅ Run quality tests
- ✅ Record test results
- ✅ Track quality scores
- ✅ Generate reports

### **Compliance Management**

- ✅ Track regulatory compliance
- ✅ Generate compliance reports
- ✅ Monitor certifications
- ✅ Audit trails

---

## 🚀 **Advanced Features**

### **Console Commands** (Press F12 → Console)

```javascript
// Force system online
forceOnline();

// Reset to online mode (clears offline data)
resetOnline();

// Check connection status
fallbackService.getConnectionStatus();

// View pending operations
fallbackService.getPendingOperationsCount();
```

### **Keyboard Shortcuts**

- **F12**: Open Developer Tools
- **Ctrl+F5** (Cmd+Shift+R): Hard refresh
- **Ctrl+Shift+I** (Cmd+Option+I): Open Inspector

---

## 📞 **Need Help?**

### **Check These Files**:

- `FORCE_ONLINE_INSTRUCTIONS.md` - Detailed instructions
- `SYSTEM_ONLINE_NFT_MINTING_READY.md` - Technical details
- `CURRENT_SYSTEM_STATUS.md` - System status

### **Browser Console Logs**:

- Open F12 → Console to see detailed logs
- Look for ✅ success messages or ❌ error messages
- Copy any error messages for troubleshooting

---

**🎯 GOAL ACHIEVED: System Online & NFT Minting Ready!**
**🚀 ENJOY YOUR FULLY FUNCTIONAL SUPPLY CHAIN SYSTEM!**
