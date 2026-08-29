"""
CINESTATE — ClickHouse Client
Official clickhouse-connect library (HTTP interface)
No MongoDB. ClickHouse is the primary database.
"""

import logging
import os
from typing import Optional

import clickhouse_connect
from clickhouse_connect.driver.client import Client

from app.config import settings

logger = logging.getLogger(__name__)


class ClickHouseClientError(Exception):
    pass


_client: Optional[Client] = None


def get_client() -> Client:
    """
    Returns a singleton ClickHouse client.
    Uses clickhouse-connect (official HTTP client).
    """
    global _client
    if _client is None:
        _client = _create_client()
    return _client


def _create_client() -> Client:
    """Create and verify a ClickHouse connection."""
    try:
        logger.info(
            "Connecting to ClickHouse",
            extra={
                "host": settings.clickhouse_host,
                "port": settings.clickhouse_port,
                "database": settings.clickhouse_database,
                "secure": settings.clickhouse_secure,
            },
        )
        client = clickhouse_connect.get_client(
            host=settings.clickhouse_host,
            port=settings.clickhouse_port,
            database=settings.clickhouse_database,
            username=settings.clickhouse_user,
            password=settings.clickhouse_password,
            secure=settings.clickhouse_secure,
            connect_timeout=25,
            send_receive_timeout=35,
            # Verify SSL for ClickHouse Cloud
            verify=settings.clickhouse_secure,
        )
        # Verify connection is alive
        result = client.command("SELECT 1")
        logger.info("ClickHouse connection established", extra={"ping": result})
        return client
    except Exception as e:
        logger.error("Failed to connect to ClickHouse", extra={"error": str(e)})
        raise ClickHouseClientError(f"ClickHouse connection failed: {e}") from e


def close_client() -> None:
    """Close the ClickHouse connection."""
    global _client
    if _client is not None:
        try:
            _client.close()
        except Exception:
            pass
        finally:
            _client = None
        logger.info("ClickHouse connection closed")


def ping() -> bool:
    """Health check — returns True if ClickHouse is reachable."""
    try:
        client = get_client()
        result = client.command("SELECT 1")
        return result == 1
    except Exception as e:
        logger.warning("ClickHouse ping failed", extra={"error": str(e)})
        return False
