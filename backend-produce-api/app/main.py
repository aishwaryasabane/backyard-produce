from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import auth, listings, upload, pickups, reviews, conversations
from app.config import settings

app = FastAPI(
    title="Backyard Produce API",
    description="API for the backyard produce app: auth, listings, nearby.",
    version="0.1.0",
)

# Create uploads dir and serve static files
UPLOAD_DIR = Path(__file__).resolve().parent.parent / settings.UPLOAD_DIR
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(listings.router, prefix="/api")
app.include_router(upload.router, prefix="/api")
app.include_router(pickups.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")


@app.get("/", response_class=HTMLResponse)
def root():
    """Landing page: links to API docs and instructions to run the app."""
    return """
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Backyard Produce API</title></head>
    <body style="font-family: system-ui, sans-serif; max-width: 560px; margin: 48px auto; padding: 24px;">
      <h1 style="color: #2D3A2C;">Backyard Produce API</h1>
      <p>Auth, listings, and nearby endpoints for the Backyard Produce app.</p>
      <p><a href="/docs" style="color: #5B8C5A;">→ Interactive API docs (Swagger)</a></p>
      <p><strong>To see the app landing page (Login screen):</strong> run the frontend in another terminal:</p>
      <pre style="background: #F8FAF5; padding: 16px; border-radius: 8px;">cd backyard-produce-app
npx expo start --web</pre>
      <p>Then open the URL shown (e.g. <code>http://localhost:8081</code>). The app uses this API at <code>http://localhost:8000</code>.</p>
      <p><a href="/health">Health check</a></p>
    </body>
    </html>
    """


@app.get("/health")
def health():
    """Simple JSON response to confirm the server is up."""
    return {"message": "Backyard Produce API", "docs": "/docs"}
