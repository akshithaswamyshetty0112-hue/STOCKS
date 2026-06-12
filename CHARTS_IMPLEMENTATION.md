# Stock Charts Implementation

## Features Added

### Backend
- **Stock Model Enhanced**
  - Added `priceHistory[]` - tracks historical prices with timestamps
  - Added `trend` field - tracks UP/DOWN/STABLE
  - Added `volatility` field - stock-specific volatility coefficient

- **Realistic Price Patterns**
  - `getRealisticPriceChange()` - generates realistic price movements based on:
    - Base volatility per stock
    - Market trend multiplier (BULL 1.3x, BEAR 0.7x, STABLE 1x)
    - Random market shocks
  - Price history keeps 288 entries (24 hours at 5-sec intervals)
  - Trend updates based on recent 12-interval performance

- **New API Endpoints**
  - `GET /api/stocks` - list all stocks with current data
  - `GET /api/stocks/:symbol/history` - get price history (96 recent entries ~8 min)

### Frontend
- **New Components**
  - `StockDetailChart.jsx` - area chart showing price trends over time with stats
  - Updated `StockChart.jsx` - bar chart with trend colors (green=UP, red=DOWN)

- **New Pages**
  - `StockDetail.jsx` - detailed view of individual stock with:
    - Area chart (price over time)
    - Trend indicator
    - High/Low stats (24h)
    - Quick buy/sell actions
  - `Stocks.jsx` - grid of all stocks with:
    - Current price and trend badge
    - Volatility display
    - Quick action buttons
    - Click to view detailed chart

- **Updates**
  - `Navbar.jsx` - added "Stocks" link for users
  - `Dashboard.jsx` - added trend column, clickable stock symbols, updated prices to ₹

- **New Routes**
  - `/stock/:symbol` - detailed stock chart page
  - `/stocks` - all stocks grid view

## How It Works

1. **Price Simulation** - Runs every 5 seconds, generates realistic movements
2. **History Tracking** - Prices stored with timestamps for charting
3. **Trend Detection** - Automatic UP/DOWN/STABLE based on recent performance
4. **Frontend Charts** - Real-time updates, area chart visualization with trend

## Usage

1. **View All Stocks** - Click "Stocks" in navbar
2. **View Stock Details** - Click any stock symbol to see detailed chart
3. **Trade** - Use Buy/Sell buttons on Dashboard or Stock Detail pages

## Technical Stack

- Backend: Node.js/Express with Mongoose (MongoDB)
- Frontend: React with Recharts for charting
- Charts: Area chart (detailed) + Bar chart (overview)

## Test the API

```bash
# Get all stocks with trends
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/stocks

# Get price history for a stock
curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/stocks/AAPL/history
```

## Files Changed

Backend:
- `models/Stock.js` - added fields
- `services/marketSimulation.js` - realistic patterns
- `controllers/stockController.js` - added history action
- `routes/stockRoutes.js` - added history route

Frontend:
- `components/StockChart.jsx` - enhanced with trends
- `components/StockDetailChart.jsx` - new detailed chart
- `pages/Dashboard.jsx` - trend column, clickable symbols
- `pages/StockDetail.jsx` - new detail page
- `pages/Stocks.jsx` - new grid view
- `App.jsx` - new routes
- `components/Navbar.jsx` - added Stocks link
