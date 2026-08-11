#!/bin/bash

# ==============================================================================
# CINESTATE — Google Cloud Run Automated Deployment Script
# Deploys Python FastAPI AI Service and Express Gateway to Google Cloud Run
# ==============================================================================

set -e

PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"cinestate-hackathon-2026"}
REGION=${GOOGLE_CLOUD_LOCATION:-"asia-northeast1"}
SERVICE_NAME="cinestate-ai-service"
BACKEND_NAME="cinestate-backend"

echo "============================================================"
echo "🚀 Deploying CINESTATE to Google Cloud Run..."
echo "Project ID: ${PROJECT_ID}"
echo "Region:     ${REGION}"
echo "============================================================"

# Step 1: Set GCP project
gcloud config set project "${PROJECT_ID}"

# Step 2: Build & Deploy Python AI Service to Cloud Run
echo "📦 Building & Deploying Python AI Service (${SERVICE_NAME})..."
cd ai-service
gcloud run deploy "${SERVICE_NAME}" \
  --source . \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 1 \
  --set-env-vars "CLICKHOUSE_HOST=${CLICKHOUSE_HOST},CLICKHOUSE_PORT=8443,CLICKHOUSE_USER=${CLICKHOUSE_USER},CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD},CLICKHOUSE_SECURE=true,GEMINI_API_KEY=${GEMINI_API_KEY}"

AI_SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --platform managed --region "${REGION}" --format 'value(status.url)')
echo "✅ AI Service Deployed at: ${AI_SERVICE_URL}"

# Step 3: Build & Deploy Express Backend Gateway
echo "📦 Building & Deploying Express Gateway (${BACKEND_NAME})..."
cd ../backend
gcloud run deploy "${BACKEND_NAME}" \
  --source . \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated \
  --memory 1Gi \
  --set-env-vars "CLICKHOUSE_HOST=${CLICKHOUSE_HOST},CLICKHOUSE_PORT=8443,CLICKHOUSE_USER=${CLICKHOUSE_USER},CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD},AI_SERVICE_URL=${AI_SERVICE_URL}"

BACKEND_URL=$(gcloud run services describe "${BACKEND_NAME}" --platform managed --region "${REGION}" --format 'value(status.url)')
echo "✅ Express Gateway Deployed at: ${BACKEND_URL}"

echo "============================================================"
echo "🎉 CINESTATE DEPLOYMENT COMPLETE!"
echo "Production Backend: ${BACKEND_URL}"
echo "============================================================"
