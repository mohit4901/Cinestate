#!/usr/bin/env python3
"""
CINESTATE — ClickHouse Connection Test
Run: python3 test_clickhouse.py
"""

import sys

def test_connection():
    try:
        import clickhouse_connect
    except ImportError:
        print("❌ clickhouse-connect not installed")
        print("   Run: pip3 install clickhouse-connect")
        sys.exit(1)

    print("Testing ClickHouse Cloud connection...")
    try:
        client = clickhouse_connect.get_client(
            host="zov6c09ywm.asia-northeast1.gcp.clickhouse.cloud",
            port=8443,
            username="default",
            password="YK0TzcQpix_xt",
            secure=True,
            verify=True,
            connect_timeout=15,
        )
        version = client.command("SELECT version()")
        print(f"✅ Connected! ClickHouse version: {version}")

        # Test database creation
        client.command("CREATE DATABASE IF NOT EXISTS cinestate")
        print("✅ Database 'cinestate' ready")

        # Test a simple query
        result = client.command("SELECT 1")
        print(f"✅ Query test: SELECT 1 = {result}")

        client.close()
        print("\n🎉 ClickHouse Cloud connection SUCCESSFUL!")
        return True

    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False


if __name__ == "__main__":
    test_connection()
