# 🚨 SANITY SETUP REQUIRED

## Error: "Insufficient permissions; permission 'create' required"

You need to create a Sanity API token with **write permissions**.

### Steps to Fix:

1. **Go to Sanity Dashboard**: https://www.sanity.io/manage/project/stkv66mz

2. **Create API Token**:
   - Click on "API" in the left sidebar
   - Click "Add API token"
   - Name it: `SPARK Development Token`
   - Set permissions: **Editor** (or **Admin** for full access)
   - Copy the generated token

3. **Add to .env.local**:
   ```bash
   SANITY_API_TOKEN=your_token_here
   ```

4. **Update Sanity Client** (I'll do this for you):
   The client needs to use the token for write operations.

5. **Restart Dev Server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

---

Once you add the token, you'll be able to create posts, users, and other content in SPARK! 🎉
