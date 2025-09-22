import punq
import httpx
import boto3
import os
import logging
from logger import create_logger
from http_client import HttpClient
from noaa_client import NoaaClient
from s3_client import S3Client
from dynamo_client import DynamoDbClient
from sqs_client import SqsClient
from alert_service import AlertService
from zone_service import ZoneService
from interfaces import S3Boto3Client, DynamoBoto3Client, SqsBoto3Client

_aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID", "anything")
_aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY", "anything")
_region_name=os.environ.get("AWS_REGION", "us-east-1")
_endpoint_url=os.environ.get("AWS_ENDPOINT_URL")

def create_s3_client():
    if _endpoint_url:
        return boto3.client(
            "s3",
            aws_access_key_id=_aws_access_key_id,
            aws_secret_access_key=_aws_secret_access_key,
            region_name=_region_name,
            endpoint_url=_endpoint_url
        )
    else:
        return boto3.client("s3")

def create_dynamodb_client():
    if _endpoint_url:
        return boto3.resource(
            'dynamodb',
            aws_access_key_id=_aws_access_key_id,
            aws_secret_access_key=_aws_secret_access_key,
            region_name=_region_name,
            endpoint_url=_endpoint_url
        )
    else:
        return boto3.resource('dynamodb')

def create_sqs_client():
    if _endpoint_url:
        return boto3.client(
            "sqs",
            aws_access_key_id=_aws_access_key_id,
            aws_secret_access_key=_aws_secret_access_key,
            region_name=_region_name,
            endpoint_url=_endpoint_url
        )
    else:
        return boto3.client("sqs")

def create_container() -> punq.Container:   
    container = punq.Container()

    shared_http_client = httpx.AsyncClient()
    container.register(httpx.AsyncClient, instance=shared_http_client)
    logger = create_logger()
    container.register(logging.Logger, instance=logger)
    container.register(HttpClient, HttpClient)
    container.register(NoaaClient, NoaaClient)

    container.register(S3Boto3Client, factory=create_s3_client)
    container.register(DynamoBoto3Client, factory=create_dynamodb_client)
    container.register(SqsBoto3Client, factory=create_sqs_client)

    container.register(S3Client, S3Client)
    container.register(DynamoDbClient, DynamoDbClient)
    container.register(SqsClient, SqsClient)

    container.register(AlertService, AlertService)
    container.register(ZoneService, ZoneService)

    return container