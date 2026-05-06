# Multi-Agent Stock Market Analysis System

## Project Overview

A production-grade, multi-agent AI system for stock market analysis. Built to demonstrate advanced AI engineering skills: real multi-agent orchestration, streaming output, live UI feedback, and real financial data. Portfolio/resume project targeting senior engineering roles.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.13 + FastAPI + `openai-agents` SDK |
| Package Manager | `uv` |
| Financial Data | Finnhub API (free tier — 60 req/min) |
| Technical Analysis | `pandas` + `pandas-ta` |
| Frontend | Next.js 15 App Router + TypeScript |
| UI Components | shadcn/ui + Tailwind CSS |
| Charts | Recharts |
| Streaming | Server-Sent Events (SSE) — FastAPI → React |
| Containerization | Docker + docker-compose |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                         │
│                                                              │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  ChatInterface   │  │  AgentStatus │  │   StockChart   │  │
│  │  (user input +  │  │  (live panel │  │ (Recharts area │  │
│  │  streaming text) │  │  per agent)  │  │  + SMA lines)  │  │
│  └─────────────────┘  └──────────────┘  └────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         AnalysisReport (markdown + badges)            │   │
│  │  BUY ✅ | Confidence: 87% ████████░░ | Risk: Medium  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬─────────────────────────────────┘
                             │ SSE stream (text/event-stream)
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                     FastAPI Backend                           │
│                                                              │
│  POST /api/analyze   →  SSE streaming response               │
│  GET  /api/stock/{symbol}  →  quick quote JSON               │
│  GET  /health         →  200 OK                              │
└────────────────────────────┬─────────────────────────────────┘
                             │ openai-agents Runner.run_streamed()
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                    Orchestrator Agent                         │
│  - Interprets user query                                     │
│  - Manages handoff sequence                                  │
│  - Synthesizes final answer                                  │
│  - Emits progress events throughout                          │
└──────────┬──────────────────┬──────────────────┬─────────────┘
           │ handoff          │ handoff          │ handoff
  ┌────────▼───────┐  ┌───────▼────────┐  ┌─────▼──────────┐
  │ DataFetcher    │  │ TechnicalAnalyst│  │  ReportWriter  │
  │    Agent       │  │     Agent       │  │     Agent      │
  │                │  │                 │  │                │
  │ Tools:         │  │ Tools:          │  │ (pure LLM,     │
  │ • get_quote    │  │ • calc_rsi      │  │  no tools)     │
  │ • get_history  │  │ • calc_macd     │  │                │
  │ • get_profile  │  │ • calc_sma_ema  │  │ Writes final   │
  │ • get_earnings │  │ • identify_trend│  │ markdown report│
  │ • get_news     │  │                 │  │ with rec +     │
  │ • get_sentiment│  │ Produces        │  │ confidence     │
  └────────┬───────┘  │ structured JSON │  └────────────────┘
           │          │ analysis output │
      [Finnhub API]   └────────┬────────┘
                               │
                         [pandas-ta]
```

---

## File Structure

```
multi-agent-stock-market/
│
├── main.py                        # FastAPI app — endpoints + SSE streaming
├── pyproject.toml                 # Python deps (uv)
├── .env.example                   # API key template
├── .env                           # Local secrets (gitignored)
├── plan.md                        # This file
│
├── agents/
│   ├── __init__.py
│   ├── orchestrator.py            # Main coordinator with handoffs to all agents
│   ├── data_fetcher.py            # Market data agent (Finnhub tools)
│   ├── analyst.py                 # Technical + fundamental analysis agent
│   └── writer.py                  # Report generation agent (pure LLM)
│
├── tools/
│   ├── __init__.py
│   ├── market_data.py             # Finnhub API calls wrapped as @function_tool
│   ├── technical_analysis.py      # RSI, MACD, SMA/EMA, trend detection
│   └── news.py                    # News + sentiment tool functions
│
├── models/
│   ├── __init__.py
│   └── schemas.py                 # Pydantic request/response models
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── app/
│   │   ├── layout.tsx             # Root layout + font
│   │   ├── page.tsx               # Main dashboard page
│   │   └── globals.css
│   ├── components/
│   │   ├── ChatInterface.tsx      # Input + streaming report output
│   │   ├── AgentStatus.tsx        # Live agent activity panel
│   │   ├── StockChart.tsx         # Recharts area chart + overlays
│   │   ├── AnalysisReport.tsx     # Markdown renderer + badges
│   │   └── ToolCallTrace.tsx      # Inline tool call activity feed
│   └── lib/
│       ├── stream.ts              # SSE client hook (useAgentStream)
│       └── types.ts               # Shared TypeScript types
│
├── Dockerfile                     # Backend container (Python 3.13-slim)
└── docker-compose.yml             # backend + frontend services
```

---

## Backend Implementation

### 1. New Python Dependencies

```toml
# pyproject.toml additions
"httpx>=0.28"
"pandas>=2.2"
"pandas-ta>=0.3.14b"
"python-dotenv>=1.0"
"pydantic>=2.0"
```

Install with: `uv add httpx pandas pandas-ta python-dotenv pydantic`

---

### 2. Pydantic Schemas (`models/schemas.py`)

```python
class AnalyzeRequest(BaseModel):
    query: str                    # e.g. "Should I buy AAPL?"
    symbols: list[str] = []       # optional pre-extracted symbols

class AgentEvent(BaseModel):
    type: str                     # "agent_change" | "tool_call" | "tool_result" | "text_delta" | "done"
    agent: str | None = None      # agent name
    tool: str | None = None       # tool name
    input: dict | None = None     # tool input
    delta: str | None = None      # text chunk
    report: str | None = None     # final complete report
```

---

### 3. Tools Layer

#### `tools/market_data.py` — Finnhub API

```python
@function_tool
async def get_stock_quote(symbol: str) -> dict:
    """Get real-time price, change %, volume for a stock symbol."""
    # GET https://finnhub.io/api/v1/quote?symbol={symbol}&token={key}
    # Returns: { price, change, change_pct, high, low, open, prev_close, volume }

@function_tool
async def get_historical_ohlcv(symbol: str, days: int = 30) -> list[dict]:
    """Get daily OHLCV candles for the past N days."""
    # GET https://finnhub.io/api/v1/stock/candle — resolution=D
    # Returns: list of { date, open, high, low, close, volume }

@function_tool
async def get_company_profile(symbol: str) -> dict:
    """Get company name, sector, market cap, P/E ratio, 52-week range."""
    # GET https://finnhub.io/api/v1/stock/profile2
    # + GET /stock/metric for financials

@function_tool
async def get_earnings(symbol: str) -> list[dict]:
    """Get last 4 quarters EPS — actual vs estimate and surprise %."""
    # GET https://finnhub.io/api/v1/stock/earnings
```

#### `tools/news.py`

```python
@function_tool
async def get_stock_news(symbol: str, limit: int = 5) -> list[dict]:
    """Get latest news headlines and summaries for a stock."""
    # GET https://finnhub.io/api/v1/company-news

@function_tool
async def get_market_sentiment(symbol: str) -> dict:
    """Get social media buzz score and sentiment (bullish/bearish %)."""
    # GET https://finnhub.io/api/v1/news-sentiment
    # Returns: { buzz_score, bullish_pct, bearish_pct, articles_in_last_week }
```

#### `tools/technical_analysis.py` — Pure Python (no API calls)

```python
@function_tool
def calculate_rsi(prices: list[float], period: int = 14) -> dict:
    """Calculate Relative Strength Index. Returns value + signal (overbought/oversold/neutral)."""

@function_tool
def calculate_macd(prices: list[float]) -> dict:
    """Calculate MACD line, signal line, histogram. Returns trend signal."""

@function_tool
def calculate_moving_averages(prices: list[float]) -> dict:
    """Calculate SMA20, SMA50, EMA20. Returns price vs MA relationship."""

@function_tool
def identify_trend(prices: list[float]) -> str:
    """Identify overall trend: 'strong_uptrend' | 'uptrend' | 'sideways' | 'downtrend' | 'strong_downtrend'."""
```

---

### 4. Agents

#### `agents/data_fetcher.py`

```python
data_fetcher_agent = Agent(
    name="DataFetcherAgent",
    instructions="""You are a financial data specialist. When given stock symbols:
    1. Fetch real-time quote (price, change %, volume)
    2. Fetch 30-day historical OHLCV data
    3. Fetch company profile (sector, market cap, P/E)
    4. Fetch last 4 earnings quarters
    5. Fetch latest 5 news headlines
    6. Fetch social sentiment scores
    Return ALL data as structured JSON for the analyst.""",
    tools=[get_stock_quote, get_historical_ohlcv, get_company_profile,
           get_earnings, get_stock_news, get_market_sentiment],
)
```

#### `agents/analyst.py`

```python
analyst_agent = Agent(
    name="TechnicalAnalystAgent",
    instructions="""You are a professional stock analyst. Given market data:
    1. Calculate RSI(14) — assess overbought/oversold
    2. Calculate MACD — identify momentum direction
    3. Calculate SMA20, SMA50, EMA20 — assess trend via MA crossovers
    4. Identify overall price trend
    5. Evaluate fundamentals: P/E vs sector average, EPS growth, earnings surprises
    6. Assess news + sentiment impact
    7. Produce a structured analysis with:
       - Technical score (0-100)
       - Fundamental score (0-100)  
       - Sentiment score (0-100)
       - Overall confidence score (weighted average)
       - Recommendation: BUY | SELL | HOLD
       - Key risks (list 3)
       - Key catalysts (list 3)""",
    tools=[calculate_rsi, calculate_macd, calculate_moving_averages, identify_trend],
)
```

#### `agents/writer.py`

```python
writer_agent = Agent(
    name="ReportWriterAgent",
    instructions="""You are a financial report writer. Given analysis data, write a professional
    stock report in markdown with these sections:
    
    ## Executive Summary
    One paragraph: what the stock is, current price, and the recommendation.
    
    ## Technical Analysis
    RSI, MACD, moving averages, trend — with plain-English interpretation.
    
    ## Fundamental Overview
    P/E, earnings growth, financial health — compared to sector.
    
    ## Market Sentiment
    News tone, social buzz, upcoming catalysts.
    
    ## Risk Assessment
    3 key risks with severity rating (Low/Medium/High).
    
    ## Recommendation
    BUY / SELL / HOLD with confidence score (0-100%) and price target range.
    
    Keep it concise (under 600 words). No jargon. Write for an intelligent non-expert.""",
    tools=[],
)
```

#### `agents/orchestrator.py`

```python
orchestrator_agent = Agent(
    name="OrchestratorAgent",
    instructions="""You are the main coordinator for stock market analysis.
    
    When the user asks about a stock:
    1. Extract the stock symbol(s) from the query
    2. Hand off to DataFetcherAgent to gather all market data
    3. Hand off to TechnicalAnalystAgent with the fetched data
    4. Hand off to ReportWriterAgent with the full analysis
    5. Return the final report to the user
    
    Before each handoff, emit a brief status like:
    "Handing off to DataFetcherAgent to fetch real-time data for {symbol}..."
    This keeps the user informed of progress.""",
    handoffs=[data_fetcher_agent, analyst_agent, writer_agent],
)
```

---

### 5. FastAPI Streaming Endpoint (`main.py`)

```python
@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    """Main analysis endpoint — streams SSE events as agents work."""
    async def event_stream():
        result = Runner.run_streamed(
            orchestrator_agent,
            input=request.query,
            max_turns=20,
        )
        async for event in result.stream_events():
            # Map openai-agents events to our AgentEvent schema
            if isinstance(event, AgentUpdatedStreamEvent):
                payload = AgentEvent(type="agent_change", agent=event.new_agent.name)
            elif isinstance(event, RunItemStreamEvent):
                if event.item.type == "tool_call_item":
                    payload = AgentEvent(type="tool_call", tool=event.item.raw_item.name)
                elif event.item.type == "tool_call_output_item":
                    payload = AgentEvent(type="tool_result", tool="done")
            elif hasattr(event, "delta"):
                payload = AgentEvent(type="text_delta", delta=event.delta)
            else:
                continue
            yield f"data: {payload.model_dump_json()}\n\n"
        yield "data: {\"type\": \"done\"}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

@app.get("/api/stock/{symbol}")
async def quick_quote(symbol: str):
    """Quick price check — used by frontend chart on symbol change."""
    return await get_stock_quote(symbol.upper())
```

---

## Frontend Implementation

### SSE Client Hook (`lib/stream.ts`)

```typescript
export function useAgentStream() {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [report, setReport] = useState("");
  const [activeAgent, setActiveAgent] = useState<string | null>(null);

  const analyze = async (query: string) => {
    setIsStreaming(true);
    setEvents([]);
    setReport("");

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: JSON.stringify({ query }),
      headers: { "Content-Type": "application/json" },
    });

    const reader = res.body!.getReader();
    // parse SSE lines, update state per event type
    // agent_change → setActiveAgent
    // text_delta   → setReport(prev => prev + delta)
    // done         → setIsStreaming(false)
  };

  return { events, isStreaming, report, activeAgent, analyze };
}
```

### Component Breakdown

#### `AgentStatus.tsx` — Live Agent Panel

Four rows, one per agent. Each shows:
- Agent icon + name
- Status: `idle` (gray dot) → `working` (pulsing blue spinner) → `done` (green checkmark)
- Brief description of what the agent does
- Timestamp when it completed

Activates based on `agent_change` SSE events.

#### `ToolCallTrace.tsx` — Inline Activity Feed

Scrolling feed of tool calls appearing as the agents work:
```
🔍 Fetching AAPL real-time quote...        ✓ done
📈 Loading 30-day price history...          ✓ done
🏢 Getting Apple Inc. company profile...   ✓ done
📰 Fetching latest news (5 articles)...    ✓ done
📊 Calculating RSI(14)...                  ⟳ working
```

Each line fades in as the `tool_call` SSE event arrives. This is the single most impressive visual in the whole app.

#### `StockChart.tsx` — Recharts Price Chart

- Area chart with gradient fill (blue/purple)
- X-axis: dates, Y-axis: price in USD
- Tooltip showing OHLCV on hover
- After Analyst completes: overlays SMA20 (orange line) + SMA50 (purple line)
- Small badge in top-right: current price + % change (green/red)

#### `AnalysisReport.tsx` — Report + Badges

- Renders markdown report using `react-markdown`
- Header bar with:
  - Recommendation badge: `BUY` (green) / `SELL` (red) / `HOLD` (amber)
  - Confidence meter: colored progress bar 0–100%
  - Risk level: `Low` / `Medium` / `High` chip
- Streams in word-by-word as `text_delta` events arrive
- Skeleton loader while streaming hasn't produced content yet

#### `ChatInterface.tsx` — Main Input

- Clean centered input: "Ask about any stock — e.g. Should I buy AAPL?"
- On submit: input locks, streaming begins
- Below input: `ToolCallTrace` during execution, then `AnalysisReport` on completion
- "New Analysis" button to reset

### Page Layout (`app/page.tsx`)

```
┌─────────────────────────────────────────────────────┐
│  📈 Stock Analysis AI          [New Analysis]        │
├────────────────────────┬────────────────────────────┤
│                        │                            │
│   ChatInterface        │   AgentStatus Panel        │
│   + ToolCallTrace      │   ┌──────────────────┐    │
│   + AnalysisReport     │   │ ○ Orchestrator   │    │
│                        │   │ ⟳ DataFetcher    │    │
│                        │   │ ○ Analyst        │    │
│                        │   │ ○ Writer         │    │
│                        │   └──────────────────┘    │
│                        │                            │
│                        │   StockChart               │
│                        │   (30-day + SMA lines)     │
│                        │                            │
└────────────────────────┴────────────────────────────┘
```

---

## Wow Factor Features — Implementation Detail

### 1. Live Agent Status Panel
Real-time visual showing which of the 4 agents is currently executing. SSE `agent_change` events update a pulsing spinner. Demonstrates that the system is truly multi-agent, not a single LLM call.

### 2. Tool Call Trace Feed
Every tool call appears inline as it happens — "Fetching AAPL quote...", "Calculating RSI(14)...", etc. Shows the AI's reasoning process transparently. Hiring managers and clients find this deeply engaging.

### 3. Streaming Report Generation
The final report appears word-by-word as the Writer agent generates it, just like ChatGPT. Implemented via SSE `text_delta` events. No waiting for a big JSON blob — the experience feels alive.

### 4. Confidence Scoring with Color Coding
Every recommendation includes a 0–100% confidence score, calculated as a weighted average of technical (40%), fundamental (40%), and sentiment (20%) scores. Displayed as a colored progress bar:
- 0–40%: red (low confidence)
- 40–70%: amber (moderate)
- 70–100%: green (high confidence)

### 5. Technical Indicator Overlays on Chart
After the Analyst agent completes, the price chart dynamically adds SMA20 and SMA50 lines. The chart updates in real-time as analysis finishes — visual proof that agents are producing real outputs, not static content.

### 6. True Multi-Agent Handoffs
Uses `openai-agents` native `handoffs=[]` — not fake "call multiple functions". The model actually transfers control between agents. This is visible in the status panel and traces, and demonstrates knowledge of the latest agent frameworks.

### 7. Risk Assessment Section
Every report includes 3 specific risks with Low/Medium/High severity badges. Adds professional credibility and shows the system thinks beyond just "buy or sell."

---

## Docker Setup

### `Dockerfile`
```dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev
COPY . .
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `docker-compose.yml`
```yaml
services:
  backend:
    build: .
    ports: ["8000:8000"]
    env_file: .env

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on: [backend]
```

---

## Environment Variables

```env
# .env (never commit this)
OPENAI_API_KEY=sk-...
FINNHUB_API_KEY=...        # free at finnhub.io — no credit card needed
```

```env
# .env.example (commit this)
OPENAI_API_KEY=your_openai_api_key_here
FINNHUB_API_KEY=your_finnhub_api_key_here
```

---

## Build Order

1. **Python deps** — `uv add httpx pandas pandas-ta python-dotenv pydantic`
2. **`models/schemas.py`** — Pydantic models
3. **`tools/market_data.py`** — Finnhub API tools
4. **`tools/technical_analysis.py`** — TA calculations
5. **`tools/news.py`** — news + sentiment tools
6. **`agents/data_fetcher.py`** — DataFetcher agent
7. **`agents/analyst.py`** — Analyst agent
8. **`agents/writer.py`** — Writer agent
9. **`agents/orchestrator.py`** — Orchestrator with handoffs
10. **`main.py`** — FastAPI endpoints + SSE streaming
11. **Frontend scaffold** — `create-next-app frontend`
12. **shadcn/ui init** — install components
13. **`lib/stream.ts`** — SSE hook
14. **`components/AgentStatus.tsx`**
15. **`components/ToolCallTrace.tsx`**
16. **`components/StockChart.tsx`**
17. **`components/AnalysisReport.tsx`**
18. **`components/ChatInterface.tsx`**
19. **`app/page.tsx`** — wire everything together
20. **`Dockerfile` + `docker-compose.yml`**
21. **`README.md`** — portfolio-quality docs with screenshots section

---

## Verification Checklist

- [ ] `uv run uvicorn main:app --reload` → GET `/health` returns `{"status": "ok"}`
- [ ] GET `/api/stock/AAPL` → returns real price JSON from Finnhub
- [ ] POST `/api/analyze` with `{"query": "Should I buy AAPL?"}` → SSE stream starts
- [ ] SSE stream contains `agent_change` events for all 4 agents in sequence
- [ ] SSE stream contains `tool_call` events (get_stock_quote, calculate_rsi, etc.)
- [ ] SSE stream ends with `text_delta` events forming a complete markdown report
- [ ] Frontend at `localhost:3000` → submit "AAPL" → agent status panel animates
- [ ] Tool call trace feed populates in real-time during analysis
- [ ] Price chart renders with 30-day data, SMA lines appear after analyst finishes
- [ ] Final report renders with BUY/SELL/HOLD badge + confidence score
- [ ] `docker-compose up` → both services start, frontend hits backend at internal URL
