# Environment Setup Guide

## Quick Setup

1. Create a file called `.env.local` in the root of your project
2. Copy and paste this template:

\`\`\`
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
BSC_RPC_URL=https://bsc-dataseed1.binance.org
BSCSCAN_API_KEY=
\`\`\`

3. **Replace the contract address** with your actual BNB Chain token contract address

## What You Need

### 1. Contract Address (Required)
- Your BEP-20 token contract address on BNB Chain
- Example: `0x1234567890abcdef1234567890abcdef12345678`
- Get it from: Your token deployment or BSCScan

### 2. BSCScan API Key (Highly Recommended)
- Free API key from BSCScan
- Used to fetch transaction history
- Get it here: https://bscscan.com/myapikey

**Steps to get BSCScan API Key:**
1. Go to https://bscscan.com/register
2. Create an account
3. Login and go to https://bscscan.com/myapikey
4. Click "Add" to create a new API key
5. Copy the API key and paste it in your `.env.local`

### 3. RPC URL (Optional - for better performance)
- Default: `https://bsc-dataseed1.binance.org` (free but can be slow)
- For production, use a paid RPC:
  - **NodeReal**: https://nodereal.io/
  - **Ankr**: https://www.ankr.com/rpc/bsc
  - **QuickNode**: https://www.quicknode.com/

## Example Configuration

Here's what a complete `.env.local` should look like:

\`\`\`
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
BSC_RPC_URL=https://bsc-dataseed1.binance.org
BSCSCAN_API_KEY=YourBSCScanAPIKeyHere123456789
\`\`\`

## Testing

After setting up, test with a known wallet that has traded your token:

1. Run: `npm run dev`
2. Open: http://localhost:3000
3. Enter a wallet address that has traded your token
4. Click "Search"

If everything is set up correctly, you should see the analysis results!

## Troubleshooting

- **"Invalid contract address"**: Make sure your contract address is correct
- **No transactions showing**: Verify your BSCScan API key is valid
- **Slow loading**: Consider using a paid RPC provider

