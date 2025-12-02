import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x35078DB252d16DB8aCca206498b4193a25DE4774';
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || '';
const ETHERSCAN_API_BASE = 'https://api.etherscan.io/v2/api?chainid=56';

// Helper function to get base URL
function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

interface HolderData {
  address: string;
  score: number;
  totalTransactions: number;
  profitLoss: string;
  balance: string;
}

export async function GET(request: NextRequest) {
  try {
    // Fetch token info using Etherscan API
    let tokenSymbol = 'TOKEN';
    let tokenName = 'Token';
    
    try {
      const tokenInfoUrl = `${ETHERSCAN_API_BASE}&module=token&action=tokeninfo&contractaddress=${CONTRACT_ADDRESS}&apikey=${BSCSCAN_API_KEY}`;
      const tokenInfoResponse = await fetch(tokenInfoUrl);
      const tokenInfoData = await tokenInfoResponse.json();
      
      if (tokenInfoData.status === '1' && tokenInfoData.result) {
        // Etherscan v2 API might return result as array or object
        const tokenInfo = Array.isArray(tokenInfoData.result) 
          ? tokenInfoData.result[0] 
          : tokenInfoData.result;
        
        if (tokenInfo) {
          tokenSymbol = tokenInfo.symbol || tokenSymbol;
          tokenName = tokenInfo.name || tokenName;
        }
      } else {
        console.warn('Token info API returned error:', tokenInfoData.message || 'Unknown error');
        // Fallback: Extract token info from transaction data if available
        // This will be done after we fetch transactions
      }
    } catch (error) {
      console.error('Error fetching token info from Etherscan API:', error);
    }
    
    // Get recent transactions to find active traders - fetch fewer pages for speed
    let allTransactions: any[] = [];
    
    // Fetch 2 pages to get enough addresses (faster)
    for (let page = 1; page <= 2; page++) {
      try {
        const txUrl = `${ETHERSCAN_API_BASE}&module=account&action=tokentx&contractaddress=${CONTRACT_ADDRESS}&page=${page}&offset=1000&sort=desc&apikey=${BSCSCAN_API_KEY}`;
        
        const txResponse = await fetch(txUrl);
        const txData = await txResponse.json();
        
        if (txData.status === '1' && txData.result && Array.isArray(txData.result)) {
          allTransactions.push(...txData.result);
          // If we got less than 1000 results, we've reached the end
          if (txData.result.length < 1000) break;
        } else {
          // If Etherscan API fails, break instead of using deprecated BSCScan
          break;
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        break;
      }
    }

    // Fallback: Extract token info from first transaction if API didn't return it
    if ((tokenSymbol === 'TOKEN' || tokenName === 'Token') && allTransactions.length > 0) {
      const firstTx = allTransactions[0];
      if (firstTx.tokenSymbol && firstTx.tokenSymbol !== '') {
        tokenSymbol = firstTx.tokenSymbol;
      }
      if (firstTx.tokenName && firstTx.tokenName !== '') {
        tokenName = firstTx.tokenName;
      }
      console.log(`Extracted token info from transaction: ${tokenSymbol} (${tokenName})`);
    }

    if (allTransactions.length === 0) {
      console.log('No transactions found');
      return NextResponse.json({ leaderboard: [] });
    }

    // Aggregate addresses by transaction count
    const addressMap = new Map<string, { count: number; addresses: Set<string> }>();
    
    for (const tx of allTransactions) {
      const from = tx.from?.toLowerCase();
      const to = tx.to?.toLowerCase();
      
      if (from && from !== CONTRACT_ADDRESS.toLowerCase()) {
        if (!addressMap.has(from)) {
          addressMap.set(from, { count: 0, addresses: new Set() });
        }
        addressMap.get(from)!.count++;
        addressMap.get(from)!.addresses.add(from);
      }
      
      if (to && to !== CONTRACT_ADDRESS.toLowerCase()) {
        if (!addressMap.has(to)) {
          addressMap.set(to, { count: 0, addresses: new Set() });
        }
        addressMap.get(to)!.count++;
        addressMap.get(to)!.addresses.add(to);
      }
    }

    // Get top addresses by transaction count - fetch 50 wallets
    const topAddresses = Array.from(addressMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 50)
      .map(([address]) => address);

    if (topAddresses.length === 0) {
      console.log('No addresses found');
      return NextResponse.json({ leaderboard: [] });
    }

    // Analyze each address using already-fetched transactions (much faster - no API calls!)
    const leaderboardData: HolderData[] = [];
    
    for (const address of topAddresses) {
      if (!address) continue;

      try {
        // Use transactions we already fetched instead of making new API calls
        const addressTransactions = allTransactions.filter(
          tx => (tx.from?.toLowerCase() === address.toLowerCase() || 
                 tx.to?.toLowerCase() === address.toLowerCase()) &&
                tx.contractAddress?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
        );

        if (addressTransactions.length === 0) continue;

        // Parse transactions into buys and sells (same logic as analyze route)
        const buys: any[] = [];
        const sells: any[] = [];
        
        for (const tx of addressTransactions) {
          const value = parseFloat(ethers.formatUnits(tx.value || '0', parseInt(tx.tokenDecimal || '18')));
          const timestamp = parseInt(tx.timeStamp || '0') * 1000;
          
          if (tx.to?.toLowerCase() === address.toLowerCase() && tx.from?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
            // Receiving tokens = buy
            buys.push({ amount: value, timestamp, tx: tx.hash });
          } else if (tx.from?.toLowerCase() === address.toLowerCase() && tx.to?.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
            // Sending tokens = sell
            sells.push({ amount: value, timestamp, tx: tx.hash });
          }
        }

        if (buys.length === 0 && sells.length === 0) continue;

        // Calculate score using same logic as analyze route
        let score = 0;
        const totalTransactions = buys.length + sells.length;
        
        if (buys.length > 0 && sells.length > 0) {
          const firstBuy = buys[0];
          const firstSell = sells[0];
          const holdTimeHours = (firstSell.timestamp - firstBuy.timestamp) / (1000 * 60 * 60);
          
          const totalBought = buys.reduce((sum, b) => sum + b.amount, 0);
          const totalSold = sells.reduce((sum, s) => sum + s.amount, 0);
          const sellRatio = totalBought > 0 ? totalSold / totalBought : 0;
          
          if (holdTimeHours < 1) score += 40;
          else if (holdTimeHours < 24) score += 30;
          else if (holdTimeHours < 168) score += 20;
          else score += 10;
          
          if (sellRatio > 0.9) score += 30;
          else if (sellRatio > 0.5) score += 20;
          else if (sellRatio > 0.1) score += 10;
          
          score += Math.min(totalTransactions * 2, 30);
        } else if (sells.length > 0) {
          score = 50;
        } else {
          score = 10;
        }

        const totalBought = buys.reduce((sum, b) => sum + b.amount, 0);
        const totalSold = sells.reduce((sum, s) => sum + s.amount, 0);
        const balance = totalBought - totalSold;
        const profitLoss = totalBought > 0 ? 
          `${((totalSold - totalBought) / totalBought * 100).toFixed(1)}%` :
          '0%';

        leaderboardData.push({
          address,
          score: Math.min(score, 100),
          totalTransactions,
          profitLoss,
          balance: balance > 0 ? balance.toFixed(2) : '0',
        });
      } catch (error) {
        console.error(`Error analyzing holder ${address}:`, error);
        continue;
      }
    }

    // Sort by balance (descending) and add rank
    leaderboardData.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
    
    const leaderboard = leaderboardData.map((entry, index) => ({
      rank: index + 1,
      address: entry.address, // Keep full address for navigation
      score: entry.score,
      totalTransactions: entry.totalTransactions,
      profitLoss: entry.profitLoss,
      balance: entry.balance,
    }));

    return NextResponse.json({ 
      leaderboard,
      tokenInfo: {
        symbol: tokenSymbol,
        name: tokenName,
        address: CONTRACT_ADDRESS,
      }
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}

