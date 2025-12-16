# 📥 External Data Import Guide

## 🎯 **Ready to Import Your External Data**

ProTrack is configured to store all data in Supabase. If you have external data sources, we can import them easily.

---

## 📋 **What We Need From You**

### **1. Data Source Information**

Please specify:

- [ ] **Source Type**: CSV, JSON, Excel, API, Database, Other
- [ ] **File Location**: URL, file path, or API endpoint
- [ ] **Data Format**: Structure and field names
- [ ] **Data Volume**: Approximate number of records
- [ ] **Update Frequency**: One-time import or recurring sync

### **2. Target Tables**

Which Supabase tables should receive the data:

- [ ] `products` - Product information
- [ ] `shipments` - Shipment records
- [ ] `iot_data` - IoT sensor readings
- [ ] `quality_tests` - Quality test results
- [ ] `compliance_records` - Compliance documentation
- [ ] Other (specify)

### **3. Field Mapping**

Map your data fields to Supabase columns:

**Example for Products:**

```
Your Data Field → Supabase Column
---------------------------------
Product Name    → product_name
RFID Code       → rfid_tag
Batch #         → batch_no
Mfg Date        → mfg_date
Exp Date        → exp_date
Location        → current_location
```

---

## 🔧 **Supported Import Methods**

### **Method 1: CSV Import** ⭐ **EASIEST**

**Your CSV Format:**

```csv
product_name,rfid_tag,batch_no,mfg_date,exp_date,current_location
Product A,RFID001,BATCH001,2024-01-01,2025-01-01,Warehouse A
Product B,RFID002,BATCH002,2024-01-02,2025-01-02,Warehouse B
```

**We'll Create:**

```javascript
// import-products-csv.js
const csv = require("csv-parser");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

fs.createReadStream("products.csv")
  .pipe(csv())
  .on("data", async (row) => {
    await supabase.from("products").insert({
      product_name: row.product_name,
      rfid_tag: row.rfid_tag,
      batch_no: row.batch_no,
      mfg_date: row.mfg_date,
      exp_date: row.exp_date,
      current_location: row.current_location,
      owner_wallet: DEFAULT_WALLET,
      status: "manufactured",
    });
  });
```

---

### **Method 2: JSON Import**

**Your JSON Format:**

```json
[
  {
    "productName": "Product A",
    "rfidTag": "RFID001",
    "batchNo": "BATCH001",
    "mfgDate": "2024-01-01",
    "expDate": "2025-01-01",
    "location": "Warehouse A"
  }
]
```

**We'll Create:**

```javascript
// import-products-json.js
const products = require("./products.json");

for (const product of products) {
  await supabase.from("products").insert({
    product_name: product.productName,
    rfid_tag: product.rfidTag,
    batch_no: product.batchNo,
    mfg_date: product.mfgDate,
    exp_date: product.expDate,
    current_location: product.location,
    owner_wallet: DEFAULT_WALLET,
    status: "manufactured",
  });
}
```

---

### **Method 3: Excel Import**

**Your Excel File:**

- Sheet: Products
- Columns: Product Name, RFID Tag, Batch No, etc.

**We'll Create:**

```javascript
// import-products-excel.js
const XLSX = require("xlsx");

const workbook = XLSX.readFile("products.xlsx");
const sheet = workbook.Sheets["Products"];
const data = XLSX.utils.sheet_to_json(sheet);

for (const row of data) {
  await supabase.from("products").insert({
    product_name: row["Product Name"],
    rfid_tag: row["RFID Tag"],
    batch_no: row["Batch No"],
    // ... map all fields
  });
}
```

---

### **Method 4: API Import**

**Your API Endpoint:**

```
GET https://your-api.com/products
```

**We'll Create:**

```javascript
// import-products-api.js
const response = await fetch("https://your-api.com/products");
const products = await response.json();

for (const product of products) {
  await supabase.from("products").insert({
    product_name: product.name,
    rfid_tag: product.rfid,
    // ... map API fields to Supabase
  });
}
```

---

### **Method 5: Database Migration**

**Your Database:**

- Type: MySQL, PostgreSQL, MongoDB, etc.
- Connection details

**We'll Create:**

```javascript
// migrate-from-database.js
const sourceDB = connectToYourDatabase();
const products = await sourceDB.query("SELECT * FROM products");

for (const product of products) {
  await supabase.from("products").insert({
    // Map your database fields to Supabase
  });
}
```

---

## 📊 **Import Templates**

### **Products Import Template**

**Required Fields:**

- `product_name` (string)
- `rfid_tag` (string, unique)
- `batch_no` (string)
- `mfg_date` (date: YYYY-MM-DD)
- `exp_date` (date: YYYY-MM-DD)
- `current_location` (string)

**Optional Fields:**

- `category` (string)
- `price` (number)
- `weight` (number)
- `dimensions` (string)
- `max_temperature` (number)
- `min_temperature` (number)
- `max_humidity` (number)
- `min_humidity` (number)

### **Shipments Import Template**

**Required Fields:**

- `product_id` (UUID from products table)
- `from_party` (wallet address)
- `to_party` (wallet address)
- `origin_location` (string)
- `destination_location` (string)

**Optional Fields:**

- `expected_delivery_date` (date)
- `notes` (string)

### **IoT Data Import Template**

**Required Fields:**

- `product_id` (UUID from products table)
- `temperature` (number)
- `humidity` (number)

**Optional Fields:**

- `gps_latitude` (number)
- `gps_longitude` (number)
- `battery_level` (number)
- `signal_strength` (number)

---

## 🚀 **Quick Start**

### **Step 1: Prepare Your Data**

Choose one format:

- [ ] CSV file
- [ ] JSON file
- [ ] Excel spreadsheet
- [ ] API endpoint
- [ ] Database connection

### **Step 2: Share With Us**

Provide:

1. Data file or access details
2. Field mapping (your fields → Supabase columns)
3. Target table(s)
4. Any special requirements

### **Step 3: We Create Import Script**

We'll create a custom script that:

- ✅ Reads your data
- ✅ Maps fields correctly
- ✅ Validates data
- ✅ Imports to Supabase
- ✅ Handles errors
- ✅ Provides progress updates

### **Step 4: Run Import**

```bash
# We'll provide the command
node import-your-data.js
```

### **Step 5: Verify**

Check the data in ProTrack:

- ✅ Open ProTrack application
- ✅ Navigate to relevant page
- ✅ Verify data appears correctly
- ✅ Test functionality

---

## 📝 **Example Request**

**Sample Request Format:**

```
Data Source: CSV file
File: products_export.csv
Target Table: products
Records: ~500 products

Field Mapping:
- Name → product_name
- RFID → rfid_tag
- Batch → batch_no
- ManufactureDate → mfg_date
- ExpiryDate → exp_date
- Location → current_location

Special Requirements:
- Set all products to status "manufactured"
- Use wallet address: 0x1234...5678
- Skip records with missing RFID
```

---

## 🎯 **What Happens Next**

1. **You provide** data source details
2. **We create** custom import script
3. **We test** with sample data
4. **You review** and approve
5. **We run** full import
6. **You verify** in ProTrack
7. **Done!** Data is in Supabase

---

## ✨ **Benefits**

- ✅ **Fast Import**: Bulk import thousands of records
- ✅ **Data Validation**: Automatic validation and error handling
- ✅ **Field Mapping**: Flexible mapping from any format
- ✅ **Progress Tracking**: See import progress in real-time
- ✅ **Error Recovery**: Handle and retry failed imports
- ✅ **Backup**: Original data preserved

---

## 📞 **Ready to Import?**

**Just provide:**

1. Your data source (file, API, database)
2. Field mapping
3. Target Supabase table(s)

**We'll handle:**

- ✅ Script creation
- ✅ Data validation
- ✅ Import execution
- ✅ Verification
- ✅ Documentation

---

**🎊 Your external data will be seamlessly imported into Supabase and displayed in ProTrack!**
