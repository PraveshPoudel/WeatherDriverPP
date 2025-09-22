#!/bin/sh
REST_API_ID="$1"
STAGE="${2:-dev}"
ROUTE="${3:-hello}"

if [ -z "$REST_API_ID" ]; then
  echo "Usage: $0 <rest_api_id> [stage] [route]"
  exit 1
fi

echo "http://host.docker.internal:4566/restapis/${REST_API_ID}/${STAGE}/_user_request_/${ROUTE}"
