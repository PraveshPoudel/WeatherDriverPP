from interfaces import S3Boto3Client
import simplejson as json
import botocore
import logging

class S3Client:
    def __init__(self, boto_s3_client: S3Boto3Client, logger: logging.Logger):
        self._client = boto_s3_client
        self._logger = logger

    def get_object(self, bucket_name: str, key: str):
        try:
            response = self._client.get_object(Bucket=bucket_name, Key=key)
        except botocore.exceptions.ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "")
            if error_code == "NoSuchKey":
                self._logger.warning(f"Object {key} does not exist in bucket {bucket_name}")
                return None
            else:
                raise
        body = response['Body'].read()
        content = body.decode('utf-8')
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return content

    def put_object(self, bucket_name: str, key: str, content: str):
        return self._client.put_object(Bucket=bucket_name, Key=key, Body=content)

    def get_presigned_url(self, bucket, key, expires_in=3600):
        url = self._client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket, 'Key': key},
            ExpiresIn=expires_in  
        )
        return url
    
    def store_and_return_presigned_url(self, bucket_name: str, key: str, content: str, expires_in=3600):
        self.put_object(bucket_name, key, content)
        return self.get_presigned_url(bucket_name, key, expires_in)

    def delete_object(self, bucket_name: str, key: str):
        try:
            self._client.delete_object(Bucket=bucket_name, Key=key)
        except botocore.exceptions.ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "")
            if error_code == "NoSuchKey":
                self._logger.warning(f"Object {key} does not exist in bucket {bucket_name}")
            else:
                raise