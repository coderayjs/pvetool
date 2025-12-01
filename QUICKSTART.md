# Quick Start Guide

Your PVE Tool is ready to use! 🚀

## Your Contract Address

```
0x35078DB252d16DB8aCca206498b4193a25DE4774
```

This has been configured in your `.env.local` file.

## Get BSCScan API Key (Recommended)

To fetch transaction history, you need a free BSCScan API key:

1. **Register**: Go to https://bscscan.com/register
2. **Create API Key**: Visit https://bscscan.com/myapikey
3. **Copy the key** and add it to your `.env.local` file:

```bash
BSCSCAN_API_KEY=YourAPIKeyHere
```

## Start the App

```bash
npm run dev
```

Then open http://localhost:3000 in your browser!

## Test It Out

1. Enter a BNB wallet address that has traded your token
2. Click "Search"
3. See the results!

## Features

✅ **Homepage** - Beautiful dark UI with search  
✅ **Wallet Analysis** - See trading history, profit/loss, and jeet score  
✅ **Leaderboard** - Top holders and traders  
✅ **Responsive Design** - Works on mobile and desktop  

## What's Next?

### Optional Improvements:

1. **Get BSCScan API Key** - For full transaction history
2. **Use Better RPC** - For faster performance:
   - NodeReal: https://nodereal.io/
   - Ankr: https://www.ankr.com/rpc/bsc
   - QuickNode: https://www.quicknode.com/

3. **Customize Design** - Edit the Tailwind classes in any page
4. **Add Real Leaderboard** - Set up a database to store and rank wallets

## Deploy to Production

When you're ready to deploy:

1. Push to GitHub
2. Connect to Vercel (https://vercel.com)
3. Add your environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `BSC_RPC_URL`
   - `BSCSCAN_API_KEY`
4. Deploy!

## Need Help?

Check out the full README.md for detailed documentation.

---

Happy analyzing! 💎🙌

