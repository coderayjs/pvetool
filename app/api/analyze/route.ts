import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// CONFIGURATION - Update these with your contract details
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x35078DB252d16DB8aCca206498b4193a25DE4774';
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || '';
const ETHERSCAN_API_BASE = 'https://api.etherscan.io/v2/api?chainid=56';

// DexScreener API URL
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Validate address
    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Fetch token info using Etherscan API
    let balance = BigInt(0);
    let decimals = 18;
    let symbol = 'TOKEN';
    let name = 'Token';

    try {
      // Fetch token balance
      const balanceUrl = `${ETHERSCAN_API_BASE}&module=account&action=tokenbalance&contractaddress=${CONTRACT_ADDRESS}&address=${address}&apikey=${BSCSCAN_API_KEY}`;
      const balanceResponse = await fetch(balanceUrl);
      const balanceData = await balanceResponse.json();
      
      if (balanceData.status === '1' && balanceData.result) {
        balance = BigInt(balanceData.result);
      }

      // Fetch token info (symbol, name, decimals)
      const tokenInfoUrl = `${ETHERSCAN_API_BASE}&module=token&action=tokeninfo&contractaddress=${CONTRACT_ADDRESS}&apikey=${BSCSCAN_API_KEY}`;
      const tokenInfoResponse = await fetch(tokenInfoUrl);
      const tokenInfoData = await tokenInfoResponse.json();
      
      console.log('Token info API response:', JSON.stringify(tokenInfoData, null, 2));
      
      if (tokenInfoData.status === '1' && tokenInfoData.result) {
        // Etherscan v2 API might return result as array or object
        const tokenInfo = Array.isArray(tokenInfoData.result) 
          ? tokenInfoData.result[0] 
          : tokenInfoData.result;
        
        if (tokenInfo) {
          symbol = tokenInfo.symbol || symbol;
          name = tokenInfo.name || name;
          decimals = parseInt(tokenInfo.decimals || '18');
          console.log(`Fetched token info: ${symbol} (${name}), decimals: ${decimals}`);
        }
      } else {
        console.warn('Token info API returned error:', tokenInfoData.message || 'Unknown error');
        // Fallback: Extract token info from transaction data if available
        // This will be done after we fetch transactions
      }
    } catch (error) {
      console.error('Error fetching token info from Etherscan API:', error);
      // Fallback: try to get decimals from a transaction if available
    }

    // Format balance
    const formattedBalance = ethers.formatUnits(balance, decimals);

    // Fetch token data from DexScreener
    let tokenPrice = 0;
    let priceChange24h = 0;
    let volume24h = 0;
    let liquidity = 0;
    let marketCap = 0;
    let marketCapATH = 0; // All-Time High market cap
    let bnbPrice = 0; // BNB price in USD
    const marketCapsAtTransactions: number[] = []; // Track market caps at transaction times

    try {
      const dexResponse = await fetch(
        `${DEXSCREENER_API}/tokens/${CONTRACT_ADDRESS}`,
        { next: { revalidate: 60 } } // Cache for 60 seconds
      );
      
      if (dexResponse.ok) {
        const dexData = await dexResponse.json();
        
        if (dexData.pairs && dexData.pairs.length > 0) {
          // Get the pair with highest liquidity on BSC
          const bscPairs = dexData.pairs.filter((p: any) => p.chainId === 'bsc');
          const mainPair = bscPairs.sort((a: any, b: any) => 
            (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
          )[0];

          if (mainPair) {
            tokenPrice = parseFloat(mainPair.priceUsd || '0');
            priceChange24h = parseFloat(mainPair.priceChange?.h24 || '0');
            volume24h = mainPair.volume?.h24 || 0;
            liquidity = mainPair.liquidity?.usd || 0;
            marketCap = mainPair.fdv || 0;
            
            // For ATH, check if DexScreener provides priceHigh24h or use current market cap
            // Since we don't have historical data, we'll use current market cap as ATH
            // In production, you'd want to track this over time in a database
            marketCapATH = marketCap; // Current market cap as ATH (would need historical tracking for true ATH)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching DexScreener data:', error);
    }

    // Fetch BNB price from CoinGecko
    try {
      const bnbPriceResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
        { next: { revalidate: 60 } } // Cache for 60 seconds
      );
      
      if (bnbPriceResponse.ok) {
        const bnbPriceData = await bnbPriceResponse.json();
        bnbPrice = parseFloat(bnbPriceData.binancecoin?.usd || '0');
      }
    } catch (error) {
      console.error('Error fetching BNB price:', error);
      // Fallback: try to get BNB price from DexScreener WBNB pair
      try {
        const wbnbResponse = await fetch(
          `${DEXSCREENER_API}/tokens/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c`, // WBNB contract
          { next: { revalidate: 60 } }
        );
        if (wbnbResponse.ok) {
          const wbnbData = await wbnbResponse.json();
          if (wbnbData.pairs && wbnbData.pairs.length > 0) {
            const bscWbnbPairs = wbnbData.pairs.filter((p: any) => p.chainId === 'bsc');
            if (bscWbnbPairs.length > 0) {
              bnbPrice = parseFloat(bscWbnbPairs[0].priceUsd || '0');
            }
          }
        }
      } catch (fallbackError) {
        console.error('Error fetching BNB price from DexScreener:', fallbackError);
      }
    }

    // Fetch transactions from Etherscan API
    let transactions = [];
    let buys: any[] = [];
    let sells: any[] = [];
    let totalBought = 0;
    let totalSold = 0;
    let totalBoughtBNB = 0; // Total BNB spent on buys
    let totalSoldBNB = 0; // Total BNB received from sells

    try {
      if (BSCSCAN_API_KEY) {
        // Fetch token transactions (limit to 100)
        const apiUrl = `${ETHERSCAN_API_BASE}&module=account&action=tokentx&contractaddress=${CONTRACT_ADDRESS}&address=${address}&page=1&offset=100&sort=asc&apikey=${BSCSCAN_API_KEY}`;
        
        const txResponse = await fetch(apiUrl);
        const txData = await txResponse.json();

        if (txData.status === '1' && Array.isArray(txData.result)) {
          transactions = txData.result;
        } else {
          transactions = [];
        }

        console.log(`Found ${transactions.length} token transactions`);

        // Fetch normal BNB transactions to get actual BNB values for swaps (limit to 100)
        const bnbTxUrl = `${ETHERSCAN_API_BASE}&module=account&action=txlist&address=${address}&page=1&offset=100&sort=asc&apikey=${BSCSCAN_API_KEY}`;
        const bnbTxResponse = await fetch(bnbTxUrl);
        const bnbTxData = await bnbTxResponse.json();
        
        let allBnbTxs: any[] = [];
        if (bnbTxData.status === '1' && Array.isArray(bnbTxData.result)) {
          allBnbTxs = bnbTxData.result;
        }

        // Create a map of transaction hash to BNB value for quick lookup
        const txHashToBnbValue = new Map<string, number>();
        allBnbTxs.forEach((tx: any) => {
          if (tx.hash && tx.value && tx.value !== '0') {
            const bnbValue = parseFloat(ethers.formatEther(tx.value));
            // For swaps, the BNB value is what was sent FROM the wallet
            if (tx.from && tx.from.toLowerCase() === address.toLowerCase()) {
              txHashToBnbValue.set(tx.hash.toLowerCase(), bnbValue);
            }
          }
        });

        // Fallback: Extract token info from first transaction if API didn't return it
        if ((symbol === 'TOKEN' || name === 'Token') && transactions.length > 0) {
          const firstTx = transactions[0];
          if (firstTx.tokenSymbol && firstTx.tokenSymbol !== '') {
            symbol = firstTx.tokenSymbol;
          }
          if (firstTx.tokenName && firstTx.tokenName !== '') {
            name = firstTx.tokenName;
          }
          if (firstTx.tokenDecimal && firstTx.tokenDecimal !== '') {
            decimals = parseInt(firstTx.tokenDecimal || '18');
          }
          console.log(`Extracted token info from transaction: ${symbol} (${name}), decimals: ${decimals}`);
        }

        // Separate buys and sells with timestamps and match with BNB values
          transactions.forEach((tx: any) => {
          const value = parseFloat(ethers.formatUnits(tx.value || '0', decimals));
          const timestamp = parseInt(tx.timeStamp) * 1000;
          const txHash = tx.hash.toLowerCase();
            
          if (tx.to && tx.to.toLowerCase() === address.toLowerCase() && 
              tx.from && tx.from.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
              // This is a buy (receiving tokens)
            const bnbValue = txHashToBnbValue.get(txHash) || 0;
            buys.push({ amount: value, timestamp, tx: tx.hash, bnbValue });
              totalBought += value;
            if (bnbValue > 0) {
              totalBoughtBNB += bnbValue;
            }
          } else if (tx.from && tx.from.toLowerCase() === address.toLowerCase() &&
                     tx.to && tx.to.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
              // This is a sell (sending tokens)
              sells.push({ amount: value, timestamp, tx: tx.hash });
              totalSold += value;
            }
          });
          
        // For sells, fetch internal transactions to get BNB received
        // Also check if there's a corresponding BNB transaction
        for (const sell of sells) {
          try {
            let bnbReceived = 0;
            const txHash = sell.tx.toLowerCase();
            
            // Method 1: Check if there's a BNB transaction TO the wallet around the same time
            // (for DEX swaps, BNB is received in a separate transaction or internal tx)
            const sellTimestamp = sell.timestamp;
            const relatedBnbTx = allBnbTxs.find((tx: any) => {
              const txTime = parseInt(tx.timeStamp) * 1000;
              return tx.to && tx.to.toLowerCase() === address.toLowerCase() &&
                     Math.abs(txTime - sellTimestamp) < 5000 && // Within 5 seconds
                     tx.value && tx.value !== '0';
            });
            
            if (relatedBnbTx) {
              bnbReceived = parseFloat(ethers.formatEther(relatedBnbTx.value));
            }
            
            // Method 2: Try internal transactions API
            if (bnbReceived === 0) {
              try {
                const internalTxUrl = `${ETHERSCAN_API_BASE}&module=account&action=txlistinternal&address=${address}&txhash=${sell.tx}&apikey=${BSCSCAN_API_KEY}`;
                    const internalTxResponse = await fetch(internalTxUrl);
                    const internalTxData = await internalTxResponse.json();
                    
                    if (internalTxData.status === '1' && Array.isArray(internalTxData.result)) {
                      internalTxData.result.forEach((internalTx: any) => {
                    if (internalTx.to && internalTx.to.toLowerCase() === address.toLowerCase() &&
                        internalTx.hash && internalTx.hash.toLowerCase() === txHash) {
                          const value = parseFloat(ethers.formatEther(internalTx.value || '0'));
                      bnbReceived += value;
                    }
                  });
                }
              } catch (internalErr) {
                // Continue to next method
              }
            }
            
            // Method 3: Try getting internal transactions for the address and match by timestamp (limit to 100)
                  if (bnbReceived === 0) {
                    try {
                const allInternalUrl = `${ETHERSCAN_API_BASE}&module=account&action=txlistinternal&address=${address}&page=1&offset=100&sort=asc&apikey=${BSCSCAN_API_KEY}`;
                const allInternalResponse = await fetch(allInternalUrl);
                const allInternalData = await allInternalResponse.json();
                
                if (allInternalData.status === '1' && Array.isArray(allInternalData.result)) {
                  allInternalData.result.forEach((internalTx: any) => {
                    const internalTime = parseInt(internalTx.timeStamp || '0') * 1000;
                    if (internalTx.to && internalTx.to.toLowerCase() === address.toLowerCase() &&
                        Math.abs(internalTime - sellTimestamp) < 5000) {
                      const value = parseFloat(ethers.formatEther(internalTx.value || '0'));
                      bnbReceived += value;
                    }
                  });
                }
              } catch (err) {
                // Continue
                    }
                  }
                  
                  if (bnbReceived > 0) {
                    totalSoldBNB += bnbReceived;
                    sell.bnbValue = bnbReceived;
                  }
                } catch (err) {
                  console.error(`Error fetching BNB value for sell tx ${sell.tx}:`, err);
                }
              }
        
        console.log(`Processed: ${buys.length} buys, ${sells.length} sells`);
        console.log(`Total BNB spent: ${totalBoughtBNB}, Total BNB received: ${totalSoldBNB}`);
      } else {
        console.log('No Etherscan API key provided');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }

    // Advanced Paperhand Score Calculation
    const holdingBalance = parseFloat(formattedBalance);
    let jeetScore = 0;
    const reasons: string[] = [];
    let metrics = {
      aht_hours: 0,
      ttfs_hours: 0,
      sell_ratio_24h: 0,
      loss_fraction: 0,
      full_dump_fraction: 0
    };

    if (buys.length > 0 && sells.length > 0) {
      // FIFO matching: Match buys to sells
      // Sort buys and sells by timestamp to ensure proper FIFO matching
      const sortedBuys = [...buys].sort((a, b) => a.timestamp - b.timestamp);
      const sortedSells = [...sells].sort((a, b) => a.timestamp - b.timestamp);
      
      const matchedTrades: any[] = [];
      let buyQueue = sortedBuys.map(b => ({ ...b, remainingAmount: b.amount }));
      
      for (const sell of sortedSells) {
        let remainingSell = sell.amount;
        
        while (remainingSell > 0 && buyQueue.length > 0) {
          const buy = buyQueue[0];
          const matchAmount = Math.min(remainingSell, buy.remainingAmount);
          
          matchedTrades.push({
            buyTime: buy.timestamp,
            sellTime: sell.timestamp,
            amount: matchAmount,
            buyAmount: buy.amount, // Original buy amount
            buyTx: buy.tx,
            sellTx: sell.tx,
            buyBnbValue: buy.bnbValue,
            sellBnbValue: sell.bnbValue
          });
          
          remainingSell -= matchAmount;
          buy.remainingAmount -= matchAmount;
          
          if (buy.remainingAmount <= 0) {
            buyQueue.shift();
          }
        }
      }

      // Calculate metrics with actual BNB values
      const holdTimes: number[] = [];
      let lossSells = 0;
      let totalLossAmount = 0;
      let fullDumps = 0;
      let soldWithin24h = 0;
      
      matchedTrades.forEach((match) => {
        const holdTimeHours = (match.sellTime - match.buyTime) / (1000 * 60 * 60);
        holdTimes.push(holdTimeHours);
        
        // Calculate if this was a loss using BNB values from the match
        if (match.buyBnbValue && match.buyBnbValue > 0 && match.sellBnbValue && match.sellBnbValue > 0) {
          // We have both BNB values, calculate per-token prices
          const buyBnbPerToken = match.buyBnbValue / match.buyAmount;
          const sellBnbPerToken = match.sellBnbValue / match.amount;
          const matchBnbSpent = match.amount * buyBnbPerToken;
          const matchBnbReceived = match.amount * sellBnbPerToken;
          
          if (matchBnbReceived < matchBnbSpent) {
            lossSells++;
            totalLossAmount += match.amount;
          }
        } else if (match.buyBnbValue && match.buyBnbValue > 0 && (!match.sellBnbValue || match.sellBnbValue === 0)) {
          // If we have buy BNB but not sell BNB, estimate based on current price
          // This is less accurate but better than nothing
          const buyBnbPerToken = match.buyBnbValue / match.buyAmount;
          const currentBnbPerToken = tokenPrice > 0 && bnbPrice > 0 ? tokenPrice / bnbPrice : 0;
          if (currentBnbPerToken > 0 && currentBnbPerToken < buyBnbPerToken) {
            lossSells++;
            totalLossAmount += match.amount;
          }
        }
        
        // Check if full dump (sold 98%+ of buy amount)
        if (match.amount >= match.buyAmount * 0.98) {
          fullDumps++;
        }
        
        // Check if sold within 24h
        if (holdTimeHours <= 24) {
          soldWithin24h += match.amount;
        }
      });

      // Average Hold Time (AHT)
      const AHT = holdTimes.length > 0 
        ? holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length 
        : 0;
      
      // Time to First Sell (TTFS)
      const firstBuy = buys[0];
      const firstSell = sells[0];
      const TTFS = firstSell && firstBuy 
        ? (firstSell.timestamp - firstBuy.timestamp) / (1000 * 60 * 60)
        : 0;
      
      // Sell ratio within 24h
      const sellRatio24h = totalBought > 0 ? soldWithin24h / totalBought : 0;
      
      // Full dump fraction
      const fullDumpFraction = matchedTrades.length > 0 
        ? fullDumps / matchedTrades.length 
        : 0;
      
      // Loss fraction - percentage of sells that were at a loss
      const lossFraction = matchedTrades.length > 0 
        ? lossSells / matchedTrades.length 
        : 0;

      // Store metrics
      metrics = {
        aht_hours: AHT,
        ttfs_hours: TTFS,
        sell_ratio_24h: sellRatio24h,
        loss_fraction: lossFraction,
        full_dump_fraction: fullDumpFraction
      };

      // Calculate sub-scores (0-100 scale)
      const scoreByThreshold = (value: number, threshold: number) => {
        if (value >= threshold * 4) return 0;
        if (value <= threshold * 0.1) return 100;
        const ratio = threshold / Math.max(value, 0.0001);
        const score = ((Math.min(ratio, 4) - 0.1) / (4 - 0.1)) * 100;
        return Math.max(0, Math.min(100, score));
      };

      const AHT_THRESHOLD = 24; // hours
      const TTFS_THRESHOLD = 6; // hours
      
      const scoreHoldTime = scoreByThreshold(AHT, AHT_THRESHOLD);
      const scoreTTFS = scoreByThreshold(TTFS, TTFS_THRESHOLD);
      const scoreSellRatio = Math.min(sellRatio24h * 100, 100);
      const scoreLoss = lossFraction * 100; // Now we can calculate this!
      const scoreFullDumps = fullDumpFraction * 100;

      // Weighted combination
      const weights = [0.25, 0.20, 0.25, 0.15, 0.15]; // Include loss data now
      jeetScore = Math.round(
        (scoreHoldTime * weights[0] +
         scoreTTFS * weights[1] +
         scoreSellRatio * weights[2] +
         scoreLoss * weights[3] +
         scoreFullDumps * weights[4]) /
        weights.reduce((a, b) => a + b, 0)
      );

      // Generate reasons
      if (AHT < 24) {
        reasons.push(`Average hold time ${AHT.toFixed(1)}h (< 24h threshold)`);
      }
      if (TTFS < 6) {
        reasons.push(`First sell after ${TTFS.toFixed(1)}h (< 6h threshold)`);
      }
      if (sellRatio24h > 0.5) {
        reasons.push(`Sold ${(sellRatio24h * 100).toFixed(0)}% within 24h`);
      }
      if (lossFraction > 0.5) {
        reasons.push(`${(lossFraction * 100).toFixed(0)}% of sells were at a loss`);
      }
      if (fullDumpFraction > 0.3) {
        reasons.push(`${(fullDumpFraction * 100).toFixed(0)}% of sells were full position dumps`);
      }

    } else if (buys.length === 0 && sells.length === 0) {
      // No trades - holder only
      if (holdingBalance > 0) {
        jeetScore = 5; // Diamond hands - just holding (LOW score = good)
        reasons.push('Pure holder - never sold');
      } else {
        jeetScore = 50; // No tokens, no trades (neutral)
      }
    } else if (sells.length === 0 && buys.length > 0) {
      // Only bought, never sold
      jeetScore = 0; // Diamond hands (LOWEST score = best)
      reasons.push('Bought but never sold - diamond hands');
    }

    // Clamp score between 0-100
    jeetScore = Math.max(0, Math.min(100, jeetScore));

    // Calculate profit/loss using actual BNB values (more accurate)
    // If we have BNB values, use those; otherwise fall back to token amounts
    let profitLoss = 0;
    if (totalBoughtBNB > 0 && totalSoldBNB > 0) {
      // Convert BNB profit/loss to token equivalent for display
      const avgBuyPrice = totalBought / totalBoughtBNB; // tokens per BNB
      const bnbProfitLoss = totalSoldBNB - totalBoughtBNB;
      profitLoss = bnbProfitLoss * avgBuyPrice;
    } else {
      // Fallback to token amount difference
      profitLoss = totalSold - totalBought;
    }

    // Get first and last transaction dates
    const firstTx = transactions.length > 0 
      ? new Date(parseInt(transactions[0].timeStamp) * 1000).toLocaleDateString()
      : 'N/A';
    const lastTx = transactions.length > 0
      ? new Date(parseInt(transactions[transactions.length - 1].timeStamp) * 1000).toLocaleDateString()
      : 'N/A';

    // Calculate USD value of holdings
    const holdingValue = holdingBalance * tokenPrice;

    // Calculate USD values based on actual BNB spent/received
    // Use BNB price to convert BNB amounts to USD
    const totalBoughtUSD = totalBoughtBNB > 0 && bnbPrice > 0 
      ? totalBoughtBNB * bnbPrice 
      : totalBought * tokenPrice; // Fallback to token price if BNB price not available
    const totalSoldUSD = totalSoldBNB > 0 && bnbPrice > 0 
      ? totalSoldBNB * bnbPrice 
      : totalSold * tokenPrice; // Fallback to token price if BNB price not available
    const profitLossUSD = totalSoldUSD - totalBoughtUSD;

    // Calculate market cap at buy time using actual BNB spent
    let marketCapAtBuy = marketCap;
    if (buys.length > 0 && tokenPrice > 0 && totalBoughtBNB > 0 && bnbPrice > 0 && totalBought > 0) {
      // Calculate the price per token at buy time
      // totalBoughtBNB = BNB spent
      // totalBought = tokens received
      // buyPricePerToken = totalBoughtBNB / totalBought (BNB per token)
      // buyPriceUSD = buyPricePerToken * bnbPrice
      // currentPriceUSD = tokenPrice
      // priceRatio = buyPriceUSD / currentPriceUSD
      // marketCapAtBuy = currentMarketCap / priceRatio
      
      const buyPricePerTokenBNB = totalBoughtBNB / totalBought;
      const buyPriceUSD = buyPricePerTokenBNB * bnbPrice;
      
      if (buyPriceUSD > 0 && tokenPrice > 0) {
        const priceRatio = buyPriceUSD / tokenPrice;
        if (priceRatio > 0) {
          marketCapAtBuy = marketCap / priceRatio;
        }
      }
    }
    
    // Calculate market cap at sell time using actual BNB received
    let marketCapAtSell = marketCap;
    if (sells.length > 0 && tokenPrice > 0 && totalSoldBNB > 0 && bnbPrice > 0 && totalSold > 0) {
      // Calculate the price per token at sell time
      // totalSoldBNB = BNB received
      // totalSold = tokens sold
      // sellPricePerToken = totalSoldBNB / totalSold (BNB per token)
      // sellPriceUSD = sellPricePerToken * bnbPrice
      // currentPriceUSD = tokenPrice
      // priceRatio = sellPriceUSD / currentPriceUSD
      // marketCapAtSell = currentMarketCap * priceRatio
      
      const sellPricePerTokenBNB = totalSoldBNB / totalSold;
      const sellPriceUSD = sellPricePerTokenBNB * bnbPrice;
      
      if (sellPriceUSD > 0 && tokenPrice > 0) {
        const priceRatio = sellPriceUSD / tokenPrice;
        marketCapAtSell = marketCap * priceRatio;
      }
    }
    
    // For ATH, use the maximum of current and historical points (for reference)
    marketCapsAtTransactions.push(marketCap); // Current market cap
    if (marketCapAtBuy > 0) {
      marketCapsAtTransactions.push(marketCapAtBuy);
    }
    if (marketCapAtSell > 0 && marketCapAtSell !== marketCap) {
      marketCapsAtTransactions.push(marketCapAtSell);
    }
    
    if (marketCapsAtTransactions.length > 0) {
      marketCapATH = Math.max(...marketCapsAtTransactions);
    } else {
      marketCapATH = marketCap;
    }

    const result = {
      address,
      tokenBalance: `${parseFloat(formattedBalance).toLocaleString()} ${symbol}`,
      tokenBalanceRaw: parseFloat(formattedBalance),
      totalTransactions: transactions.length,
      buys: buys.length,
      sells: sells.length,
      totalBought: totalBought.toFixed(4),
      totalSold: totalSold.toFixed(4),
      totalBoughtBNB: totalBoughtBNB.toFixed(6),
      totalSoldBNB: totalSoldBNB.toFixed(6),
      totalBoughtUSD: totalBoughtUSD.toFixed(2),
      totalSoldUSD: totalSoldUSD.toFixed(2),
      profitLoss: profitLoss.toFixed(4),
      profitLossUSD: profitLossUSD.toFixed(2),
      isProfitable: profitLoss > 0,
      hasEverSold: sells.length > 0,
      jeetScore,
      reasons,
      metrics,
      firstTx,
      lastTx,
      // DexScreener data
      tokenPrice: tokenPrice.toFixed(8),
      priceChange24h: priceChange24h.toFixed(2),
      volume24h: volume24h.toLocaleString(),
      liquidity: liquidity.toLocaleString(),
      marketCap: marketCap.toLocaleString(),
      marketCapATH: marketCapATH > 0 ? marketCapATH.toLocaleString(undefined, {maximumFractionDigits: 0}) : marketCap.toLocaleString(),
      marketCapAtBuy: marketCapAtBuy > 0 ? marketCapAtBuy.toLocaleString(undefined, {maximumFractionDigits: 0}) : marketCap.toLocaleString(),
      marketCapAtSell: marketCapAtSell > 0 ? marketCapAtSell.toLocaleString(undefined, {maximumFractionDigits: 0}) : marketCap.toLocaleString(),
      holdingValue: holdingValue.toFixed(2),
      tokenSymbol: symbol,
      tokenName: name,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze wallet. Please try again.' },
      { status: 500 }
    );
  }
}

