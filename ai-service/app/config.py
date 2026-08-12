"""
CINESTATE — Application Config
Environment-based configuration using pydantic-settings.
"""

from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Google Cloud ─────────────────────────────────────────
    google_cloud_project: str = ""
    google_cloud_location: str = "us-central1"
    google_application_credentials: Optional[str] = None

    # ── Gemini ───────────────────────────────────────────────
    gemini_model: str = "gemini-3.5-flash"
    gemini_api_key: Optional[str] = None

    # ── ClickHouse ───────────────────────────────────────────
    clickhouse_host: str = "localhost"
    clickhouse_port: int = 8123
    clickhouse_database: str = "cinestate"
    clickhouse_user: str = "default"
    clickhouse_password: str = ""
    clickhouse_secure: bool = False

    # ── Storage ──────────────────────────────────────────────
    gcs_bucket: str = "cinestate-media"
    use_local_storage: bool = True
    local_storage_path: str = "./uploads"

    # ── Service ──────────────────────────────────────────────
    ai_service_port: int = 8000
    log_level: str = "info"
    enable_agent_tracing: bool = True

    # ── Demo ─────────────────────────────────────────────────
    demo_mode: bool = True
    demo_project_id: str = "project-aurora"

    # ── Thresholds ───────────────────────────────────────────
    # Below this confidence → LOW confidence warning, no auto-conflict
    confidence_threshold: float = 0.7

    class Config:
        env_file = [".env", "../.env"]
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
