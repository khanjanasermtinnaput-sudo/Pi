from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.routes import calculate, graph

app = FastAPI(
    title="Universal Scientific Calculator API",
    description="SymPy-powered computation engine for mathematics, science, and engineering",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calculate.router, prefix="/api", tags=["Computation"])
app.include_router(graph.router, prefix="/api", tags=["Graphing"])


@app.get("/")
async def root():
    return {"status": "online", "service": "Universal Scientific Calculator API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(status_code=500, content={"success": False, "error": str(exc)})
