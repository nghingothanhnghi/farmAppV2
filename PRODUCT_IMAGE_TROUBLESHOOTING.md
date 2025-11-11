# 🔍 Product Image Loading - Troubleshooting Guide

## Diagnosis Flowchart

```
Are product images loading?
│
├─ YES → ✅ No problem! Skip to "Alternative Solutions"
│
└─ NO → Continue...
    │
    ├─ Do you see console logs with image_url?
    │   │
    │   ├─ YES (🖼️ Product: johi, → image_url: /static/products/...) → Step 1️⃣
    │   │
    │   └─ NO → Check:
    │       • Is product fetching working? (Are product names/prices shown?)
    │       • Check network tab → Are product API calls successful?
    │       • Check for API errors in console
    │
    └─ Step 1️⃣: Image URL is received but not loading?
        │
        ├─ Check Network tab → image request URL
        │   │
        │   ├─ URL is: GET /static/products/... → 404 ❌
        │   │   └─ This is YOUR issue! → See "Main Fix"
        │   │
        │   ├─ URL is: GET /static/products/... → 200 ✅
        │   │   └─ Check browser cache (Ctrl+F5, clear cache)
        │   │
        │   └─ URL is different than expected
        │       └─ Check getImageUrl() function
        │
        └─ Check for onError fallback triggering
            └─ Check ProductImage.tsx error handler
```

---

## Solution Matrix

| Issue | Symptom | Solution |
|-------|---------|----------|
| **Missing static mount** | Network tab shows 404 for `/static/products/...` | Add mount in main.py (Main Fix) |
| **Wrong file path** | Images in wrong folder | Check `config.MEDIA_DIR` = `"uploads/products"` |
| **CORS issue** | Network tab shows CORS error | Check CORSMiddleware in main.py |
| **Browser cache** | Old behavior persists | Clear cache (Ctrl+F5) |
| **API returns wrong URL** | image_url is empty or wrong path | Check image_service.py line 33 |
| **File not saved** | File doesn't exist in uploads/ | Check upload endpoint & permissions |

---

## Step-by-Step Troubleshooting

### 1. Verify Files Exist

**PowerShell:**
```powershell
dir "c:\Nghi\Python\automation\fastApi\uploads\products\products\"
```

**Expected output:**
```
9bc2c9fc-9749-4416-a212-daeb54308011.jpg
e415d2c0-3c01-46fa-b111-ff0323ad2590.jpg
```

If files don't exist:
- ❌ Upload failed
- Check `image_service.py` for errors
- Check file permissions

---

### 2. Check API Response

**Browser Console:**
```javascript
// Open DevTools → Console → paste:
fetch('http://localhost:8000/products')
  .then(r => r.json())
  .then(data => console.log(data[0].image_url))
```

**Expected:**
```
/static/products/products/9bc2c9fc-...jpg
```

If returns null or empty:
- ❌ API not saving URL to database
- Check `product_service.py`

---

### 3. Check Static Mount Configuration

**File:** `fastApi/main.py` lines 92-109

**Run this check:**
```python
# Run in Python shell in the fastApi directory:
import os
from app.core import config

print(f"UPLOAD_DIR: {config.UPLOAD_DIR}")
print(f"MEDIA_DIR: {config.MEDIA_DIR}")
print(f"STATIC_URL_BASE: {config.STATIC_URL_BASE}")
print(f"MEDIA_URL: {config.MEDIA_URL}")

print(f"\nDoes {config.MEDIA_DIR} exist? {os.path.exists(config.MEDIA_DIR)}")
print(f"Does {config.UPLOAD_DIR} exist? {os.path.exists(config.UPLOAD_DIR)}")
```

**Expected:**
```
UPLOAD_DIR: uploads/profile_images
MEDIA_DIR: uploads/products
STATIC_URL_BASE: /static/profile_images
MEDIA_URL: /static/products

Does uploads/products exist? True
Does uploads/profile_images exist? True
```

---

### 4. Test Direct Image URL

**Browser:**
```
http://localhost:8000/static/products/products/9bc2c9fc-9749-4416-a212-daeb54308011.jpg
```

**Expected:**
- ✅ Image displays
- Status: 200 OK

**If 404:**
- ❌ Static mount not configured → Apply Main Fix

**If CORS error:**
- ❌ CORSMiddleware issue
- Check main.py lines 48-52

---

### 5. Frontend Network Debugging

**Chrome DevTools → Network Tab:**

1. Load products page
2. Wait for images to attempt loading
3. Look for requests starting with `/static/products/`

**Check for each:**
- ✅ **Status 200** → Image loaded successfully
- ❌ **Status 404** → Backend not serving (need Main Fix)
- ❌ **Status 0** → CORS blocked or connection failed
- ❌ **Pending** → Taking too long, server issue

---

### 6. Check Console Logs

**Frontend Console (F12):**

```
🖼️ Product: johi
→ image_url from API: /static/products/products/9bc2c9fc-...jpg
```

✅ If you see this → URL is correct, backend issue

---

## Verification Checklist

Use this after applying Main Fix:

- [ ] **File exists** 
  ```powershell
  dir "c:\Nghi\Python\automation\fastApi\uploads\products\products\"
  ```

- [ ] **API returns URL**
  ```javascript
  fetch('http://localhost:8000/products')
    .then(r => r.json())
    .then(d => console.log(d[0].image_url))
  ```

- [ ] **Backend serves image**
  ```
  Browser: http://localhost:8000/static/products/products/{UUID}.jpg
  Expected: Image loads (Status 200)
  ```

- [ ] **Frontend receives URL**
  ```
  Console: 🖼️ Product: johi, → image_url from API: /static/products/...
  ```

- [ ] **Frontend tries to load**
  ```
  DevTools Network: GET /static/products/products/{UUID}.jpg
  Expected: Status 200, image loads
  ```

- [ ] **Images display**
  ```
  ProductCard should show actual product images
  Not default avatar
  ```

---

## Common Issues & Fixes

### Issue: "Always load default image"

**Root Cause:** 
```
img.onError → img.src = ERROR_AVATAR
```
This means image failed to load.

**Fix:**
1. Check Network tab → see if image request returns 404
2. If 404 → Apply Main Fix (add static mount)
3. Restart backend
4. Refresh browser (Ctrl+F5)

### Issue: "/static/products is not configured"

**Error Message:**
```
404 Not Found
```

**Fix:**
Edit `main.py` lines 92-109 (see Main Fix)

### Issue: "Images saved but not visible"

**Possible Causes:**
- [ ] Backend not restarted after config change
- [ ] Browser cache (Ctrl+F5)
- [ ] Wrong file path in DB
- [ ] File permissions issue

**Steps:**
1. Restart backend
2. Clear browser cache (Ctrl+F5)
3. Check DB: `SELECT image_url FROM products;`
4. Check file system: `dir uploads/products/products/`

### Issue: "Some images load, some don't"

**Likely Cause:** 
Some files missing or partially uploaded

**Check:**
```powershell
Get-ChildItem "c:\Nghi\Python\automation\fastApi\uploads\products\products\" | Measure-Object
```

Compare count with products in DB.

---

## Advanced Debugging

### Enable Debug Logging

**File:** `fastApi/main.py` (add after imports)

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Restart server and check logs for static mount info.

### Check CORS Headers

**Browser DevTools → Network → Any failed image request → Headers:**

Look for:
```
Access-Control-Allow-Origin: *
```

If missing → CORS issue, not static mount issue.

### Verify app.mount() calls

**Python shell in fastApi directory:**
```python
from main import app

for route in app.routes:
    print(f"Route: {route}")
    if hasattr(route, 'app'):
        print(f"  Mounted: {route.path}")
```

Should show:
```
/static/profile_images
/static/products  ← Should be here after fix!
```

---

## Reset & Retry

If everything fails:

### 1. Clear Everything
```powershell
Remove-Item -Recurse -Force "c:\Nghi\Python\automation\fastApi\uploads\products"
Remove-Item -Recurse -Force "c:\Nghi\Python\automation\fastApi\uploads\__pycache__"
```

### 2. Recreate Structure
```powershell
New-Item -ItemType Directory -Path "c:\Nghi\Python\automation\fastApi\uploads\products" -Force
```

### 3. Apply Main Fix
Edit `main.py` with the static mount code

### 4. Restart Backend
```powershell
Set-Location "c:\Nghi\Python\automation\fastApi"
python -m uvicorn main:app --reload
```

### 5. Test Upload & Load
- Upload a new product with image
- Check if it appears in frontend

---

## When to Escalate

If after applying Main Fix and these steps the issue persists:

1. Check FastAPI logs for errors
2. Run `python main.py` directly to see startup errors
3. Verify Python version: `python --version` (need 3.8+)
4. Check for port conflicts: `netstat -ano | findstr :8000`

---

## Contact & Help

**Need help?**
- Include: Network tab screenshot of 404 request
- Include: FastAPI server logs
- Include: Frontend console logs
- Include: `dir uploads/products/products/` output

---
