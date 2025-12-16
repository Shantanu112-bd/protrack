# 🌐 ProTrack - Complete Guide to Go Online & Sync

## 🎯 **Quick Start: Force Online in 30 Seconds**

### **Method 1: One-Click UI Button** ⭐ **EASIEST**

1. Look at the top of your ProTrack page
2. See the blue notification: "Using offline mode - Data will sync when connection restored"
3. Click the **"Go Online"** button on the right
4. ✅ Done! Page will refresh automatically

---

### **Method 2: Browser Console Command** ⭐ **FASTEST**

1. Press **F12** (or Cmd+Option+I on Mac)
2. Click **Console** tab
3. Type: `forceOnline()`
4. Press **Enter**
5. ✅ Done! Page will refresh automatically

---

### **Method 3: Auto-Sync Script** ⭐ **MOST COMPREHENSIVE**

1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Copy and paste this complete script:

```javascript
(async function () {
  console.log("🔄 Starting auto-sync...");
  await window.fallbackService.forceOnlineMode();
  await window.fallbackService.syncPendingOperations();
  console.log("✅ Sync complete! Reloading...");
  setTimeout(() => window.location.reload(), 1000);
})();
```

4. Press **Enter**
5. ✅ Done! System will sync and reload

---

## 📋 **Detailed Methods**

### **Method 4: Complete Reset Script**

For maximum reliability, use this comprehensive reset:

```javascript
// Complete reset and force online
(async () => {
  console.log("🔄 Starting complete reset...");

  // Step 1: Force online mode
  await window.fallbackService.forceOnlineMode();
  console.log("✅ Forced online mode");

  // Step 2: Sync pending operations
  await window.fallbackService.syncPendingOperations();
  console.log("✅ Synced pending operations");

  // Step 3: Verify connection
  const status = window.fallbackService.getConnectionStatus();
  console.log("📊 Connection Status:", status);

  // Step 4: Reload page
  console.log("🔄 Reloading page...");
  setTimeout(() => window.location.reload(), 1000);
})();
```

---

### **Method 5: Manual Local Storage Reset**

If other methods don't work:

1. Press **F12** → **Application** tab (Chrome) or **Storage** tab (Firefox)
2. Find **Local Storage** → `http://localhost:5174`
3. Delete the key: `protrack_connection_status`
4. Refresh page (**F5**)

---

### **Method 6: Nuclear Option - Clear Everything**

Last resort if nothing else works:

```javascript
// Clear all local storage
localStorage.clear();

// Force online
window.fallbackService.forceOnlineMode();

// Reload
window.location.reload();
```

---

## 🔍 **Verification Steps**

After forcing online, verify it worked:

### **1. Visual Verification**

- ✅ Blue "offline mode" notification should **disappear**
- ✅ Pending operations counter should show **0**
- ✅ No warning messages at top of page

### **2. Console Verification**

Run this in console:

```javascript
window.fallbackService.getConnectionStatus();
```

**Expected output:**

```javascript
{
  isOnline: true,
  supabaseConnected: true,
  lastChecked: "2025-12-16T...",
  errorCount: 0
}
```

### **3. Functional Verification**

- ✅ Create a new product → Should save to database
- ✅ Create a new shipment → Should save to database
- ✅ No "offline mode" warnings appear
- ✅ Data appears immediately in lists

---

## 🧪 **Testing the Connection**

### **Check Connection Status**

```javascript
window.fallbackService.getConnectionStatus();
```

### **Check Pending Operations**

```javascript
window.fallbackService.getPendingOperationsCount();
```

### **Manually Sync Pending Operations**

```javascript
window.fallbackService.syncPendingOperations();
```

### **Force Online Mode**

```javascript
window.fallbackService.forceOnlineMode();
```

### **Reset to Online Mode**

```javascript
window.fallbackService.resetToOnlineMode();
```

---

## ⚠️ **Troubleshooting**

### **Problem: Still Shows Offline After Forcing Online**

**Solution 1: Check Internet Connection**

```bash
# Test internet connectivity
ping google.com
```

**Solution 2: Verify Supabase Credentials**

```bash
# Check .env file
cat protrack-frontend/.env

# Should contain:
VITE_SUPABASE_URL=https://ouryqfovixxanihagodt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

**Solution 3: Restart Development Server**

```bash
# Stop server (Ctrl+C)
# Then restart:
cd protrack-frontend
npm run dev
```

**Solution 4: Check Browser Console**

- Press **F12**
- Look for **red error messages**
- Common errors:
  - "Failed to fetch" → Network issue
  - "Invalid API key" → Supabase credentials issue
  - "CORS error" → Server configuration issue

---

### **Problem: Pending Operations Not Syncing**

**Solution:**

```javascript
// Check what's pending
const pending = window.fallbackService.getPendingOperationsCount();
console.log(`Pending operations: ${pending}`);

// Force sync
await window.fallbackService.syncPendingOperations();

// Verify
const stillPending = window.fallbackService.getPendingOperationsCount();
console.log(`Still pending: ${stillPending}`);
```

---

### **Problem: "Go Online" Button Not Visible**

**Possible Causes:**

1. System is already online (check console)
2. UI component not loaded yet (refresh page)
3. CSS issue (check browser console for errors)

**Solution:**
Use console method instead:

```javascript
forceOnline();
```

---

## 📊 **Understanding Connection States**

### **Online State**

```javascript
{
  isOnline: true,              // Browser has internet
  supabaseConnected: true,     // Database connected
  lastChecked: "...",          // Last check timestamp
  errorCount: 0                // No errors
}
```

✅ **All features working**

### **Offline State**

```javascript
{
  isOnline: false,             // No internet
  supabaseConnected: false,    // Database disconnected
  lastChecked: "...",
  errorCount: 5                // Multiple errors
}
```

⚠️ **Using local storage fallback**

### **Partial State**

```javascript
{
  isOnline: true,              // Browser has internet
  supabaseConnected: false,    // Database issue
  lastChecked: "...",
  errorCount: 2
}
```

⚠️ **Internet OK, but database connection failed**

---

## 🎯 **Best Practices**

### **1. Regular Sync**

If working offline for extended periods:

```javascript
// Sync every 5 minutes
setInterval(() => {
  window.fallbackService.syncPendingOperations();
}, 5 * 60 * 1000);
```

### **2. Monitor Connection**

```javascript
// Check connection status
setInterval(() => {
  const status = window.fallbackService.getConnectionStatus();
  console.log(
    "Connection:",
    status.supabaseConnected ? "🟢 Online" : "🔴 Offline"
  );
}, 30000); // Every 30 seconds
```

### **3. Handle Errors Gracefully**

```javascript
try {
  await window.fallbackService.forceOnlineMode();
  console.log("✅ Online");
} catch (error) {
  console.error("❌ Failed to go online:", error);
  // Continue working offline
}
```

---

## 🚀 **Quick Reference Commands**

| Command                                              | Description          |
| ---------------------------------------------------- | -------------------- |
| `forceOnline()`                                      | Quick force online   |
| `resetOnline()`                                      | Reset to online mode |
| `window.fallbackService.getConnectionStatus()`       | Check status         |
| `window.fallbackService.syncPendingOperations()`     | Sync data            |
| `window.fallbackService.getPendingOperationsCount()` | Count pending        |
| `localStorage.clear()`                               | Clear all local data |
| `window.location.reload()`                           | Refresh page         |

---

## ✨ **Expected Results After Going Online**

### **Immediate Effects:**

- ✅ Blue "offline mode" notification disappears
- ✅ Pending operations counter resets to 0
- ✅ All pending data syncs to database
- ✅ Real-time updates become active

### **Functional Changes:**

- ✅ New products save to database immediately
- ✅ New shipments save to database immediately
- ✅ IoT data records to database immediately
- ✅ Quality tests save to database immediately
- ✅ Compliance records save to database immediately

### **UI Changes:**

- ✅ No warning messages
- ✅ "Go Online" button disappears
- ✅ All features fully enabled
- ✅ NFT minting available (with wallet connected)

---

## 🎉 **Success Indicators**

You'll know the system is online when:

1. **No Warnings** - No blue notification bar at top
2. **Zero Pending** - Pending operations count is 0
3. **Data Persists** - Created items appear after page refresh
4. **Real-time Works** - Changes appear immediately
5. **Console Clean** - No error messages in console

---

## 📞 **Need Help?**

If you're still having issues:

1. **Check Console** - Press F12, look for errors
2. **Verify Credentials** - Check `.env` file
3. **Test Internet** - Try opening google.com
4. **Restart Server** - Stop and restart `npm run dev`
5. **Clear Cache** - Use `localStorage.clear()`

---

**🎯 Remember: The easiest method is clicking the "Go Online" button in the UI!**
