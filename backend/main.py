from fastapi import FastAPI

app = FastAPI(
    title="Multi-Agent Stock Market",
    description="A multi-agent system for stock market trading",
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "backend/multi-agent-stock-market"}
