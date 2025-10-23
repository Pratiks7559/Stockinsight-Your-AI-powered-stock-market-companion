# Real-Time Price Updates Test Guide

## 🧪 Manual Testing Steps

### 1. **Basic Real-Time Updates Test**
1. Open the application and navigate to Portfolio
2. Click "Buy Stock" or "Sell Stock" button
3. Type a symbol (e.g., AAPL)
4. Watch for:
   - ✅ Current price fetched and displayed
   - ✅ "LIVE" indicator with pulsing green dot
   - ✅ Last updated timestamp

### 2. **Price Change Animation Test**
1. Keep the modal open for 10+ seconds
2. Watch for price updates every 5 seconds
3. Look for:
   - ✅ Price changes with up/down arrows (↗️ ↘️)
   - ✅ Color animations (green for up, red for down)
   - ✅ "Previous" price comparison
   - ✅ Pulse animation on price change

### 3. **Total Calculation Updates**
1. Enter a quantity (e.g., 10 shares)
2. Watch the total calculation section
3. Verify:
   - ✅ Total updates automatically with price changes
   - ✅ Live price indicator in total section
   - ✅ Different colors for Buy (green) vs Sell (orange)

### 4. **Transaction Execution Test**
1. Fill in symbol and quantity
2. Wait for real-time price updates
3. Click "Buy" or "Sell" button
4. Check console logs for:
   - ✅ "Fetching latest price before transaction..."
   - ✅ "Latest price for transaction: X.XX"
   - ✅ Transaction executed with current market price

### 5. **Sell-Specific Features Test**
1. Open "Sell Stock" modal specifically
2. Verify:
   - ✅ Orange theme for sell transactions
   - ✅ "Market Price" badge in header
   - ✅ "Market Value" instead of "Total Cost"
   - ✅ "You will receive this amount..." message

## 🔍 Expected Behaviors

### **Visual Indicators:**
- 🟢 Live price indicator: Green pulsing dot + "LIVE" text
- ⬆️ Price increase: Green color + up arrow (↗️) + pulse animation
- ⬇️ Price decrease: Red color + down arrow (↘️) + pulse animation
- 🕒 Last updated timestamp shows current time
- 📊 Previous price comparison when available

### **Real-Time Updates:**
- Price updates every 5 seconds automatically
- Updates stop when modal is closed
- Updates pause when typing in symbol field
- Fresh price fetched before transaction execution

### **Color Coding:**
- **Buy Modal**: Green theme, "Total Cost"
- **Sell Modal**: Orange theme, "Market Value"
- **Price Changes**: Green (up) / Red (down)

## 🐛 Common Issues to Check

1. **Updates not starting**: Verify symbol is selected and quote is loaded
2. **Updates too frequent**: Should be every 5 seconds, not more
3. **Price not changing**: Mock data should have some variation
4. **Animation stuck**: Price change indicators should clear after 2 seconds
5. **Memory leaks**: Intervals should cleanup on modal close

## 📱 Testing Scenarios

### **Happy Path:**
1. Select symbol → Price loads → Updates every 5s → Execute transaction

### **Edge Cases:**
1. Change symbol while updates are running
2. Close modal while updates are active
3. Network error during price fetch
4. Very fast symbol switching

### **Mobile Testing:**
1. Touch interactions work properly
2. Animations perform well on mobile
3. Text is readable on small screens
4. Real-time updates don't drain battery

## 📊 Performance Checks

- ✅ No memory leaks from intervals
- ✅ Smooth animations without lag
- ✅ API calls throttled properly
- ✅ Console logs for debugging
- ✅ Error handling for failed requests

---

**Note**: This implementation provides a smooth, real-time trading experience where users see live market prices and can execute trades at current market rates, just like real trading platforms!
