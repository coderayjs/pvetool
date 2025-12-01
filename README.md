# PVE Tool - BNB Chain Trading Analyzer

A beautiful web3 tool to analyze wallet trading behavior on BNB Chain, inspired by paperhands.gm.ai.

## Features

- 🔍 **Wallet Analysis** - Analyze any BNB wallet's trading history with your token
- 💎 **Jeet Score** - Calculate if users are diamond hands or paper hands
- 📊 **Trading Stats** - See buys, sells, profit/loss, and more
- 🏆 **Leaderboard** - See who the top holders are
- 🎨 **Beautiful Dark UI** - Modern, sleek design with animations

## Tech Stack

- **Frontend**: Next.js 16 + React 19
- **Styling**: Tailwind CSS 4
- **Web3**: ethers.js v6
- **Blockchain**: BNB Chain (BSC)
- **API**: BSCScan API for transaction history

## Setup

### 1. Clone and Install

\`\`\`bash
cd pvetool
npm install
\`\`\`

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Your token contract address on BNB Chain
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressHere

# BSC RPC URL (default public node)
BSC_RPC_URL=https://bsc-dataseed1.binance.org

# BSCScan API Key (get from https://bscscan.com/myapikey)
BSCSCAN_API_KEY=your_api_key_here
\`\`\`

### 3. Update Contract Address

**Important:** Replace the contract address in `.env.local`:

\`\`\`env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourActualContractAddress
\`\`\`

### 4. Get BSCScan API Key (Optional but Recommended)

1. Go to [https://bscscan.com/register](https://bscscan.com/register)
2. Create an account
3. Go to [https://bscscan.com/myapikey](https://bscscan.com/myapikey)
4. Create a new API key
5. Add it to your `.env.local` file

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see your app!

## Configuration

### Using a Custom RPC (Recommended for Production)

The default public BSC RPC can be slow. For better performance:

1. Sign up for a free RPC at [NodeReal](https://nodereal.io/) or [Ankr](https://www.ankr.com/)
2. Update your `.env.local`:

\`\`\`env
BSC_RPC_URL=https://bsc-mainnet.nodereal.io/v1/YOUR_API_KEY
\`\`\`

## How It Works

1. **User Input**: User enters their BNB wallet address
2. **Token Balance**: Fetches current token balance from your contract
3. **Transaction History**: Queries BSCScan API for all token transfers
4. **Analysis**: Calculates:
   - Total buys vs sells
   - Profit/loss
   - Holding patterns
   - Jeet score (0-100)
5. **Results**: Beautiful display of trading behavior

## Jeet Score Calculation

The Jeet Score (0-100) is calculated based on:

- **+20 points**: Currently holding tokens
- **+20 points**: More buys than sells
- **+15 points**: Sold less than 20% of purchases (diamond hands!)
- **-20 points**: Sold more than 80% of purchases (paper hands!)
- **-30 points**: More sells than buys

## Project Structure

\`\`\`
pvetool/
├── app/
│   ├── page.tsx              # Homepage with search
│   ├── analyze/[address]/    # Wallet analysis results
│   ├── leaderboard/          # Leaderboard page
│   └── api/
│       └── analyze/          # API route for blockchain queries
├── public/                   # Static assets
└── .env.local               # Environment variables
\`\`\`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Environment Variables on Vercel

Add these in your Vercel project settings:

- \`NEXT_PUBLIC_CONTRACT_ADDRESS\`
- \`BSC_RPC_URL\`
- \`BSCSCAN_API_KEY\`

## Customization

### Change Token

Update \`NEXT_PUBLIC_CONTRACT_ADDRESS\` in your environment variables.

### Modify Jeet Score Logic

Edit the score calculation in \`app/api/analyze/route.ts\`:

\`\`\`typescript
// Around line 95
let jeetScore = 50; // Base score
// Add your custom logic here
\`\`\`

### Customize Design

The UI uses Tailwind CSS. Edit any component to change colors, spacing, etc.

### Add Real Leaderboard

Currently, the leaderboard uses mock data. To add a real leaderboard:

1. Set up a database (PostgreSQL, MongoDB, etc.)
2. Store analyzed wallets
3. Query top wallets by score
4. Replace mock data in \`app/leaderboard/page.tsx\`

## Troubleshooting

### "Invalid wallet address" error
- Make sure you're entering a valid BNB Chain address (starts with 0x)

### "Failed to analyze wallet" error
- Check if your contract address is correct
- Verify BSC RPC URL is working
- Check BSCScan API key (if using)

### Slow loading
- Use a paid RPC provider instead of public nodes
- Add rate limiting to prevent API throttling

## License

MIT License - feel free to use this for your project!

## Support

Built with ❤️ for the BNB Chain community

---

**Note**: This is a tool for educational and entertainment purposes. Always DYOR (Do Your Own Research)!
