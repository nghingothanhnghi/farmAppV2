# ⚡ Quick Fix - 2 Minute Solution

## Problem
✅ Image saved: `uploads/products/products/9bc2c9fc-9749-4416-a212-daeb54308011.jpg`
✅ API returns: `/static/products/products/9bc2c9fc-9749-4416-a212-daeb54308011.jpg`
❌ Browser gets 404 → default image shows

## Why
FastAPI is not configured to serve `/static/products/*` files

---

## Fix (Copy-Paste Ready)

### File: `c:\Nghi\Python\automation\fastApi\main.py`

Find this section (around line 92):
```python
# -----------------------------------------
# Static File Mounts (profile images, etc.)
# -----------------------------------------
# Ensure upload folder exists
os.makedirs(config.UPLOAD_DIR, exist_ok=True)

# Serve /uploads/profile_images/* → uploads/profile_images/
app.mount(
    config.STATIC_URL_BASE,
    StaticFiles(directory=config.UPLOAD_DIR),
    name="profile_images"
)
```

Replace with:
```python
# -----------------------------------------
# Static File Mounts (profile images, products, etc.)
# -----------------------------------------
# Ensure upload folders exist
os.makedirs(config.UPLOAD_DIR, exist_ok=True)
os.makedirs(config.MEDIA_DIR, exist_ok=True)

# Serve /static/profile_images/* → uploads/profile_images/
app.mount(
    config.STATIC_URL_BASE,
    StaticFiles(directory=config.UPLOAD_DIR),
    name="profile_images"
)

# ✅ Serve /static/products/* → uploads/products/
app.mount(
    config.MEDIA_URL,
    StaticFiles(directory=config.MEDIA_DIR),
    name="products"
)
```

---

## Changes Made
1. ✏️ Line 96: Add `os.makedirs(config.MEDIA_DIR, exist_ok=True)`
2. ✏️ Line 93: Update comment from "profile images, etc." to "profile images, products, etc."
3. ✏️ Lines 104-109: **Add new mount block** for products

---

## Restart Backend

**PowerShell:**
```powershell
Set-Location "c:\Nghi\Python\automation\fastApi"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## Test It

**Browser:**
```
http://localhost:8000/static/products/products/9bc2c9fc-9749-4416-a212-daeb54308011.jpg
```

Should see the actual image ✅

---

## Done!

Refresh frontend → ProductCard shows images instead of default avatar ✅

No other changes needed!
