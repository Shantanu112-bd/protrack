# Product Creation Troubleshooting Guide

## 🚨 "Failed to create product" Error - Solutions

If you're getting a "Failed to create product" error, here are the most common causes and solutions:

## ✅ Quick Fixes

### 1. **Check Wallet Connection**

- Ensure MetaMask is connected
- Verify you're on the correct network
- Check that your wallet address appears in the top-right corner

### 2. **Use Unique RFID Tag**

- **SOLUTION**: Click the "Generate" button next to the RFID Tag field
- This creates a unique RFID tag automatically
- **Why**: Each product needs a unique RFID identifier

### 3. **Fill All Required Fields**

Make sure these fields are filled:

- ✅ RFID Tag (use Generate button)
- ✅ Product Name
- ✅ Batch Number
- ✅ Manufacturing Date
- ✅ Expiry Date
- ✅ Current Location

### 4. **Check Date Format**

- Manufacturing Date must be before Expiry Date
- Use the date picker (don't type dates manually)
- Ensure dates are realistic (not in the far future/past)

## 🔧 Advanced Troubleshooting

### Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try creating a product again
4. Look for detailed error messages

### Common Error Messages & Solutions

#### "This RFID tag already exists"

- **Solution**: Click "Generate" button for a new unique RFID
- **Cause**: RFID tags must be unique across all products

#### "User account setup required"

- **Solution**: Refresh the page and reconnect wallet
- **Cause**: User record needs to be created in database

#### "Please fill in all required fields"

- **Solution**: Check that all required fields have values
- **Cause**: Missing required information

#### "Database connection error"

- **Solution**: Check internet connection and try again
- **Cause**: Network connectivity issue

## 🛠️ Step-by-Step Product Creation

### Method 1: Quick Creation

1. **Connect Wallet** (top-right corner)
2. **Go to Products** page
3. **Click "Create Product"**
4. **Click "Generate"** next to RFID Tag field
5. **Fill in Product Name** (e.g., "Organic Apples")
6. **Fill in Batch Number** (e.g., "BATCH001")
7. **Select Manufacturing Date** (today or recent date)
8. **Select Expiry Date** (future date)
9. **Fill in Current Location** (e.g., "Warehouse A")
10. **Click "Create Product"**

### Method 2: Detailed Creation

1. Follow steps 1-10 above
2. **Set Temperature Limits**:
   - Max Temperature: 25°C (default)
   - Min Temperature: 2°C (default)
3. **Set Humidity Limits**:
   - Max Humidity: 80% (default)
   - Min Humidity: 20% (default)
4. **Click "Create Product"**

## 🔍 Debugging Tools

### Test Database Connection

Run this command in the project root:

```bash
node debug-product-creation.js
```

This will test:

- Database connectivity
- Table structure
- Product creation process
- Common error scenarios

### Check Environment Variables

Ensure your `.env` file has:

```env
VITE_SUPABASE_URL=https://ouryqfovixxanihagodt.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

## 📱 Browser Compatibility

### Supported Browsers

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Browser Settings

- Enable JavaScript
- Allow pop-ups for MetaMask
- Clear cache if having issues

## 🔒 Security Considerations

### MetaMask Setup

1. Install MetaMask extension
2. Create or import wallet
3. Add local network (for development):
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency: `ETH`

### Wallet Connection

- Only connect to trusted applications
- Verify the URL is correct
- Don't share private keys or seed phrases

## 🆘 Still Having Issues?

### Check These Common Problems

1. **Internet Connection**: Ensure stable internet
2. **Browser Extensions**: Disable ad blockers temporarily
3. **MetaMask**: Try disconnecting and reconnecting
4. **Cache**: Clear browser cache and cookies
5. **Network**: Ensure correct blockchain network

### Get Detailed Error Information

1. Open browser console (F12)
2. Go to Network tab
3. Try creating product again
4. Look for failed requests (red entries)
5. Check the error details

### Contact Information

If you're still having issues:

1. Check the browser console for error messages
2. Note the exact error message
3. Try the debugging script: `node debug-product-creation.js`
4. Check the USER_GUIDE.md for additional help

## ✅ Success Indicators

You'll know product creation worked when:

- ✅ "Product created successfully!" message appears
- ✅ Modal closes automatically
- ✅ New product appears in the products list
- ✅ No error messages in console

## 🎯 Best Practices

### For Reliable Product Creation

1. **Always use "Generate" for RFID tags**
2. **Fill all required fields before submitting**
3. **Use realistic dates**
4. **Keep product names descriptive**
5. **Use consistent batch numbering**

### For Better Organization

- Use meaningful product names
- Follow consistent batch numbering (e.g., BATCH001, BATCH002)
- Set appropriate temperature/humidity limits
- Use descriptive locations

## 🚀 Quick Test

Try creating a test product with these values:

- **RFID Tag**: Click "Generate"
- **Product Name**: "Test Product"
- **Batch Number**: "TEST001"
- **Manufacturing Date**: Today
- **Expiry Date**: One year from today
- **Current Location**: "Test Facility"

If this works, your system is properly configured!

---

_This guide covers the most common product creation issues. For additional help, see USER_GUIDE.md or check the browser console for detailed error messages._
