# Investment Plan Documentation

## 1. Architecture Overview
The application is a Next.js-based dashboard that acts as a client for portfolio management and an interface for AI-driven financial insights. It follows a "local-first" philosophy, keeping data processing on the server-side with local LLM connectivity.

## 2. Feature Deep-Dive

### 2.1 Portfolio Management
- **Components:** `PortfolioSummary.tsx`, `InvestmentTable.tsx`.
- **Functionality:** Aggregates user investment entries (buy/sell). Calculates ROI, average buy price, and total unrealized profit/loss.

### 2.2 AI-Powered Analysis (`/api/analyze-portfolio`)
- **Flow:**
  1. Frontend sends current portfolio state to the endpoint.
  2. Backend fetches latest news context from CryptoCompare.
  3. Backend constructs a structured prompt for 9router.
  4. 9router (local LLM) returns a JSON response containing a summary, a sentiment score (-10 to +10), and actionable recommendations.
  5. Frontend parses the JSON and renders the results, including the sentiment visualization.

### 2.3 News & Intel (`/api/news`)
- **Functionality:** Uses `CryptoCompare` API to fetch relevant news based on coin symbols.
- **Usage:** This data is injected into the AI prompt to ensure analysis is grounded in current market events.

## 3. Configuration

### 3.1 9router Integration
The application expects a local 9router instance to process requests.
- **Endpoint:** `http://localhost:20128/v1/chat/completions`
- **Model:** `coding`
- **API Key:** Configured via `Authorization` header.

## 4. Maintenance & Extensibility

### Adding New AI Features
To add new AI analysis capabilities:
1. **Update API Route:** Modify `app/api/analyze-portfolio/route.ts` to add new fields to the prompt or change the logic.
2. **Update Schema:** Ensure the prompt enforces JSON output to maintain compatibility with the frontend parser.
3. **Frontend UI:** Update `components/PortfolioSummary.tsx` to handle the new JSON fields and add necessary visualizations.
