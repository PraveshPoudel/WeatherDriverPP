#!/bin/sh
# This script gets the first API Gateway REST API ID and Lambda function name from LocalStack,
# then constructs the invoke URL for a given route (default: /hello).

STAGE="${1:-dev}"
ROUTE="${2:-hello}"

REST_API_ID=$(awslocal apigateway get-rest-apis --query 'items[0].id' --output text)
LAMBDA_NAME=$(awslocal lambda list-functions --query 'Functions[0].FunctionName' --output text)

if [ "$REST_API_ID" = "None" ] || [ -z "$REST_API_ID" ]; then
  echo "No API Gateway REST API found."
  exit 1
fi

if [ "$LAMBDA_NAME" = "None" ] || [ -z "$LAMBDA_NAME" ]; then
  echo "No Lambda function found."
  exit 1
fi

INSIDE_CONTAINER_URL="http://host.docker.internal:4566/restapis/${REST_API_ID}/${STAGE}/_user_request_/${ROUTE}"
LOCAL_MACHINE_URL="http://localhost:4566/restapis/${REST_API_ID}/${STAGE}/_user_request_/${ROUTE}"
echo "Inside container API Gateway URL: $INSIDE_CONTAINER_URL"
echo "Local machine API Gateway URL: $LOCAL_MACHINE_URL"
echo "Lambda Function Name: $LAMBDA_NAME"
