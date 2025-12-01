import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// CONFIGURATION - Update these with your contract details
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x35078DB252d16DB8aCca206498b4193a25DE4774';
const BSC_RPC_URL = process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org';
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || '';

// DexScreener API URL
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

// ERC20 ABI for token balance
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

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

    // Initialize provider
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
    
    // Get token contract
    const tokenContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ERC20_ABI,
      provider
    );

    // Fetch token info
    const [balance, decimals, symbol, name] = await Promise.all([
      tokenContract.balanceOf(address),
      tokenContract.decimals(),
      tokenContract.symbol(),
      tokenContract.name(),
    ]);

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

    // Fetch transactions from BSCScan
    let transactions = [];
    let buys: any[] = [];
    let sells: any[] = [];
    let totalBought = 0;
    let totalSold = 0;
    let totalBoughtBNB = 0; // Total BNB spent on buys
    let totalSoldBNB = 0; // Total BNB received from sells

    try {
      if (BSCSCAN_API_KEY) {
        // Use Etherscan v2 API format for BSC (chainid 56)
        const apiUrl = `https://api.etherscan.io/v2/api?chainid=56&module=account&action=tokentx&contractaddress=${CONTRACT_ADDRESS}&address=${address}&page=1&offset=100&sort=asc&apikey=${BSCSCAN_API_KEY}`;
        
        console.log('Fetching transactions from:', apiUrl);
        
        const txResponse = await fetch(apiUrl);
        const txData = await txResponse.json();

        console.log('BscScan API Response:', JSON.stringify(txData, null, 2));

        if (txData.status === '1' && Array.isArray(txData.result)) {
          transactions = txData.result;
          console.log(`Found ${transactions.length} transactions`);

          // Separate buys and sells with timestamps
          transactions.forEach((tx: any) => {
            const value = parseFloat(ethers.formatUnits(tx.value, decimals));
            const timestamp = parseInt(tx.timeStamp) * 1000; // Convert to ms
            
            if (tx.to.toLowerCase() === address.toLowerCase()) {
              // This is a buy (receiving tokens)
              buys.push({ amount: value, timestamp, tx: tx.hash });
              totalBought += value;
            } else if (tx.from.toLowerCase() === address.toLowerCase()) {
              // This is a sell (sending tokens)
              sells.push({ amount: value, timestamp, tx: tx.hash });
              totalSold += value;
            }
          });
          
          console.log(`Processed: ${buys.length} buys, ${sells.length} sells`);
          
          // Fetch BNB values for buy and sell transactions
          if (buys.length > 0 || sells.length > 0) {
            try {
              // Fetch transaction details for buy transactions to get BNB value spent
              // For DEX swaps, BNB spent might be in internal transactions or the main transaction value
              for (const buy of buys) {
                try {
                  let bnbSpent = 0;
                  
                  // First, try to get the main transaction value
                  const txDetailUrl = `https://api.etherscan.io/v2/api?chainid=56&module=proxy&action=eth_getTransactionByHash&txhash=${buy.tx}&apikey=${BSCSCAN_API_KEY}`;
                  const txDetailResponse = await fetch(txDetailUrl);
                  const txDetailData = await txDetailResponse.json();
                  
                  if (txDetailData.result && txDetailData.result.value) {
                    bnbSpent = parseFloat(ethers.formatEther(txDetailData.result.value));
                  }
                  
                  // Also check internal transactions for BNB sent from the wallet
                  if (bnbSpent === 0) {
                    const internalTxUrl = `https://api.etherscan.io/v2/api?chainid=56&module=account&action=txlistinternal&txhash=${buy.tx}&apikey=${BSCSCAN_API_KEY}`;
                    const internalTxResponse = await fetch(internalTxUrl);
                    const internalTxData = await internalTxResponse.json();
                    
                    if (internalTxData.status === '1' && Array.isArray(internalTxData.result)) {
                      // Sum up all BNB sent FROM the wallet address in internal transactions
                      internalTxData.result.forEach((internalTx: any) => {
                        if (internalTx.from && internalTx.from.toLowerCase() === address.toLowerCase()) {
                          const value = parseFloat(ethers.formatEther(internalTx.value || '0'));
                          bnbSpent += value;
                        }
                      });
                    }
                  }
                  
                  if (bnbSpent > 0) {
                    totalBoughtBNB += bnbSpent;
                    buy.bnbValue = bnbSpent;
                  }
                } catch (err) {
                  console.error(`Error fetching BNB value for buy tx ${buy.tx}:`, err);
                }
              }
              
              // Fetch internal transactions for sell transactions to get BNB value received
              // For DEX swaps, BNB received is in internal transactions, not the main transaction
              for (const sell of sells) {
                try {
                  let bnbReceived = 0;
                  
                  // Method 1: Try internal transactions API
                  try {
                    const internalTxUrl = `https://api.etherscan.io/v2/api?chainid=56&module=account&action=txlistinternal&txhash=${sell.tx}&apikey=${BSCSCAN_API_KEY}`;
                    const internalTxResponse = await fetch(internalTxUrl);
                    const internalTxData = await internalTxResponse.json();
                    
                    console.log(`Internal TX for sell ${sell.tx}:`, JSON.stringify(internalTxData, null, 2));
                    
                    if (internalTxData.status === '1' && Array.isArray(internalTxData.result) && internalTxData.result.length > 0) {
                      // Sum up all BNB received by the wallet address in internal transactions
                      internalTxData.result.forEach((internalTx: any) => {
                        if (internalTx.to && internalTx.to.toLowerCase() === address.toLowerCase()) {
                          const value = parseFloat(ethers.formatEther(internalTx.value || '0'));
                          bnbReceived += value;
                          console.log(`Found BNB received: ${value} from internal tx`);
                        }
                      });
                    }
                  } catch (internalErr) {
                    console.error(`Error fetching internal transactions for ${sell.tx}:`, internalErr);
                  }
                  
                  // Method 2: If no internal transactions, try getting transaction receipt and check balance changes
                  if (bnbReceived === 0) {
                    try {
                      const txReceiptUrl = `https://api.etherscan.io/v2/api?chainid=56&module=proxy&action=eth_getTransactionReceipt&txhash=${sell.tx}&apikey=${BSCSCAN_API_KEY}`;
                      const txReceiptResponse = await fetch(txReceiptUrl);
                      const txReceiptData = await txReceiptResponse.json();
                      
                      if (txReceiptData.result) {
                        // Check if there's a balance change in the receipt
                        // For DEX swaps, the BNB might be in the receipt's balance changes
                        console.log(`Transaction receipt for ${sell.tx}:`, JSON.stringify(txReceiptData.result, null, 2));
                      }
                    } catch (receiptErr) {
                      console.error(`Error fetching receipt for ${sell.tx}:`, receiptErr);
                    }
                  }
                  
                  // Method 3: Calculate from token amount and price (fallback estimation)
                  if (bnbReceived === 0 && sell.amount > 0 && tokenPrice > 0) {
                    // Estimate BNB received based on current token price
                    // This is an approximation - actual value would need historical price data
                    const estimatedUSD = sell.amount * tokenPrice;
                    if (bnbPrice > 0) {
                      bnbReceived = estimatedUSD / bnbPrice;
                      console.log(`Estimated BNB from price calculation: ${bnbReceived} for ${sell.amount} tokens`);
                    }
                  }
                  
                  if (bnbReceived > 0) {
                    totalSoldBNB += bnbReceived;
                    sell.bnbValue = bnbReceived;
                    console.log(`Total BNB received so far: ${totalSoldBNB}`);
                  } else {
                    console.warn(`Could not determine BNB received for sell tx ${sell.tx}`);
                  }
                } catch (err) {
                  console.error(`Error fetching BNB value for sell tx ${sell.tx}:`, err);
                }
              }
            } catch (error) {
              console.error('Error fetching BNB values:', error);
            }
          }
        } else {
          console.log('API Response Status:', txData.status);
          console.log('API Message:', txData.message || 'No message');
          console.log('Full Response:', JSON.stringify(txData, null, 2));
          
          // Try fallback to old BSCScan API if v2 fails
          if (txData.message && txData.message.includes('Invalid')) {
            console.log('Trying fallback to old BSCScan API...');
            try {
              const fallbackUrl = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${CONTRACT_ADDRESS}&address=${address}&page=1&offset=100&sort=asc&apikey=${BSCSCAN_API_KEY}`;
              const fallbackResponse = await fetch(fallbackUrl);
              const fallbackData = await fallbackResponse.json();
              
              if (fallbackData.status === '1' && Array.isArray(fallbackData.result)) {
                transactions = fallbackData.result;
                console.log(`Fallback API found ${transactions.length} transactions`);
                
                transactions.forEach((tx: any) => {
                  const value = parseFloat(ethers.formatUnits(tx.value, decimals));
                  const timestamp = parseInt(tx.timeStamp) * 1000;
                  
                  if (tx.to.toLowerCase() === address.toLowerCase()) {
                    buys.push({ amount: value, timestamp, tx: tx.hash });
                    totalBought += value;
                  } else if (tx.from.toLowerCase() === address.toLowerCase()) {
                    sells.push({ amount: value, timestamp, tx: tx.hash });
                    totalSold += value;
                  }
                });
              }
            } catch (fallbackError) {
              console.error('Fallback API also failed:', fallbackError);
            }
          }
        }
      } else {
        console.log('No BscScan API key provided');
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
      const matchedTrades: any[] = [];
      let buyQueue = [...buys];
      let sellQueue = [...sells];
      
      for (const sell of sellQueue) {
        let remainingSell = sell.amount;
        
        while (remainingSell > 0 && buyQueue.length > 0) {
          const buy = buyQueue[0];
          const matchAmount = Math.min(remainingSell, buy.amount);
          
          matchedTrades.push({
            buyTime: buy.timestamp,
            sellTime: sell.timestamp,
            amount: matchAmount,
            buyAmount: buy.amount
          });
          
          remainingSell -= matchAmount;
          buy.amount -= matchAmount;
          
          if (buy.amount <= 0) {
            buyQueue.shift();
          }
        }
      }

      // Calculate metrics
      const holdTimes: number[] = [];
      let lossSells = 0;
      let fullDumps = 0;
      let soldWithin24h = 0;
      
      matchedTrades.forEach((match) => {
        const holdTimeHours = (match.sellTime - match.buyTime) / (1000 * 60 * 60);
        holdTimes.push(holdTimeHours);
        
        // Check if full dump (sold 98%+ of buy amount)
        if (match.amount >= match.buyAmount * 0.98) {
          fullDumps++;
        }
        
        // Check if sold within 24h
        if (holdTimeHours <= 24) {
          soldWithin24h += match.amount;
        }
        
        // Note: We can't determine loss without price data, so we skip this for now
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

      // Store metrics
      metrics = {
        aht_hours: AHT,
        ttfs_hours: TTFS,
        sell_ratio_24h: sellRatio24h,
        loss_fraction: 0, // Can't calculate without price history
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
      const scoreLoss = 0; // Can't calculate without price data
      const scoreFullDumps = fullDumpFraction * 100;

      // Weighted combination
      const weights = [0.30, 0.25, 0.30, 0.0, 0.15]; // Adjusted weights (no loss data)
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

    // Calculate profit/loss (simplified)
    const profitLoss = totalSold - totalBought;

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

    // Calculate estimated market cap at first buy time
    // Estimate based on actual purchase cost vs current value
    let marketCapAtBuy = marketCap;
    if (buys.length > 0 && tokenPrice > 0 && totalBoughtUSD > 0) {
      // totalBoughtUSD = current value of tokens bought (at current price)
      // profitLossUSD = profit/loss from trading
      // Actual amount spent = totalBoughtUSD - profitLossUSD (if profit) or totalBoughtUSD + |profitLossUSD| (if loss)
      // Price change ratio = current_value / actual_cost
      // Market cap at buy = current market cap / price_change_ratio
      
      const actualCostUSD = totalBoughtUSD - profitLossUSD; // This is what they actually spent
      if (actualCostUSD > 0) {
        const priceChangeRatio = totalBoughtUSD / actualCostUSD;
        marketCapAtBuy = marketCap / priceChangeRatio;
      }
    }
    
    // Calculate market cap at sell time
    // Estimate based on actual sell proceeds vs current value
    let marketCapAtSell = marketCap;
    if (sells.length > 0 && tokenPrice > 0 && totalSoldUSD > 0) {
      // totalSoldUSD = current value of tokens sold (at current price)
      // But we have actual BNB received, so we can calculate the price at sell time
      // Market cap at sell = current market cap * (sell_price / current_price)
      // sell_price = totalSoldUSD / totalSold (tokens)
      // current_price = tokenPrice
      
      const sellPrice = totalSold > 0 ? totalSoldUSD / totalSold : tokenPrice;
      if (sellPrice > 0 && tokenPrice > 0) {
        const priceRatio = sellPrice / tokenPrice;
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

