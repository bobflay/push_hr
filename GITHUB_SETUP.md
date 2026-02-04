# Quick GitHub Setup Guide

## What's Ready for GitHub

Your attendance dashboard is now encrypted and ready to be pushed to a public GitHub repository!

### ✅ What's Been Done

1. **Data Encrypted** - All employee data is now encrypted with AES-256
2. **Password Protected** - Uses password `hr@push2026` (embedded in code)
3. **index.html Created** - Renamed from attendance_dashboard.html for GitHub Pages
4. **CryptoJS Added** - Decryption happens automatically in the browser
5. **.gitignore Created** - Protects sensitive files from being committed

### 📁 Files Ready for GitHub

```
✅ index.html                          (Main page)
✅ attendance_dashboard.css            (Styles)
✅ attendance_dashboard.js             (JavaScript with decryption)
✅ data/attendance_data_encrypted.txt  (Encrypted data - SAFE for public repo)
✅ README.md                           (Documentation)
✅ DEPLOYMENT.md                       (Deployment guide)
✅ .gitignore                          (Protects sensitive files)
✅ encrypt_data.js                     (Script to re-encrypt data)
```

### 🚫 Files Excluded (in .gitignore)

```
❌ data/attendance_data.json          (Unencrypted - stays local)
❌ data/*.xlsx                         (Excel files - stays local)
❌ data/*.pdf                          (PDF files - stays local)
❌ attendance_dashboard.html           (Old filename - not needed)
```

## Quick Start: Push to GitHub

### Step 1: Initialize Git

```bash
cd /Users/ibrahimfleifel/code/push_hr
git init
```

### Step 2: Add Files

```bash
# Add all safe files
git add index.html attendance_dashboard.css attendance_dashboard.js
git add data/attendance_data_encrypted.txt
git add README.md DEPLOYMENT.md GITHUB_SETUP.md .gitignore encrypt_data.js

# Create first commit
git commit -m "Initial commit: Encrypted HR Attendance Dashboard

- Employee attendance tracking system
- Weekend and holiday detection
- Leave request cross-referencing
- Justified vs unjustified absences
- Encrypted data for security
- Full calendar view with filters"
```

### Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `hr-attendance-dashboard` (or your choice)
3. Description: "Employee Attendance Analysis Dashboard - Encrypted"
4. **Public** or **Private** - Your choice (encrypted data is safe either way)
5. **DON'T** initialize with README (we already have one)
6. Click "Create repository"

### Step 4: Push to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/hr-attendance-dashboard.git
git branch -M main
git push -u origin main
```

### Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under "Source":
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**

### Step 6: Access Your Dashboard! 🎉

After 2-3 minutes, your dashboard will be live at:

```
https://YOUR_USERNAME.github.io/hr-attendance-dashboard/
```

## Testing Locally First

Before pushing, test the encrypted version locally:

```bash
# Open in browser
open index.html
```

The dashboard should load normally - decryption happens automatically!

## Updating Data Later

When you have new attendance data:

### 1. Process New Excel Files

Run the Python script to generate updated `attendance_data.json`:

```bash
python3 << 'EOF'
# Your data processing script
EOF
```

### 2. Re-encrypt the Data

```bash
node encrypt_data.js
```

This will:
- Read `data/attendance_data.json`
- Encrypt it with the same password
- Save to `data/attendance_data_encrypted.txt`

### 3. Push Updates

```bash
git add data/attendance_data_encrypted.txt
git commit -m "Update attendance data - $(date +%Y-%m-%d)"
git push
```

GitHub Pages will automatically update within 2-3 minutes!

## Security Notes

### ✅ Safe for Public GitHub

- **Encrypted data**: Can't be read without the password
- **Password embedded**: In JavaScript, but obscured
- **No sensitive files**: Original Excel/JSON excluded via .gitignore

### 🔒 What's Protected

- Employee personal information
- Attendance times and patterns
- Leave request details
- All raw data files

### ⚠️ Important

- Keep original Excel files secure (not in Git)
- Keep unencrypted JSON file secure (not in Git)
- The password `hr@push2026` is in the JavaScript code
- For higher security, consider a private repository

## Sharing the Dashboard

Once deployed, share the GitHub Pages URL with your team:

```
https://YOUR_USERNAME.github.io/hr-attendance-dashboard/
```

**No password needed!** The dashboard:
- Loads automatically
- Decrypts data in the browser
- Works on any device (desktop, tablet, mobile)
- No installation required
- Always shows the latest data (after you push updates)

## Troubleshooting

### Dashboard shows error
- Check browser console (F12)
- Verify encrypted file exists and isn't corrupted
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

### GitHub Pages not working
- Wait 3-5 minutes after enabling
- Check Settings → Pages for deployment status
- Ensure index.html is in root folder (not in a subfolder)

### Can't see updates
- Clear browser cache
- Hard refresh
- Check that you pushed to the correct branch (main)

## Next Steps

1. ✅ Test locally: `open index.html`
2. ✅ Initialize git: `git init`
3. ✅ Commit files: `git add ...` → `git commit ...`
4. ✅ Create GitHub repo
5. ✅ Push to GitHub: `git push`
6. ✅ Enable GitHub Pages
7. ✅ Share the URL with your team!

---

**Questions or issues?** Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed information.
