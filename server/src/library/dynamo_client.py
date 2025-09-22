from interfaces import DynamoBoto3Client
import logging
import json
import sys
import botocore

class DynamoDbClient:
    def __init__(self, dynamo_boto3_client: DynamoBoto3Client, logger: logging.Logger):
        self._client = dynamo_boto3_client
        self._logger = logger

    def upsert_item(self, table_name: str, item: dict):
        table = self._client.Table(table_name)
        try:
            table.put_item(Item=item)
        except botocore.exceptions.ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "")
            if error_code == "ValidationException" and "Item size" in str(e):
                item_size = len(json.dumps(item).encode("utf-8"))
                item_id = item.get("id", "<no id>")
                self._logger.error(f"Item too big for DynamoDB: id={item_id}, size={item_size} bytes")
                self._logger.error(f"Error details: {e}")
            else:
                raise

    def get_all_items(self, table_name: str):
        table = self._client.Table(table_name)
        response = table.scan()
        items = response.get('Items', [])
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))
        return items

    def get_item_by_id(self, table_name: str, id_value, id_key="id"):
        table = self._client.Table(table_name)
        response = table.get_item(Key={id_key: id_value})
        return response.get("Item")

    def get_items_by_id_list(self, table_name: str, id_list, id_key="id"):
        table = self._client.Table(table_name)
        keys = [{id_key: id_val} for id_val in id_list]
        items = []
        for i in range(0, len(keys), 100):
            batch_keys = keys[i:i+100]
            response = table.meta.client.batch_get_item(
                RequestItems={table_name: {"Keys": batch_keys}}
            )
            items.extend(response["Responses"].get(table_name, []))
        return items
    
    def delete_item(self, table_name: str, id_value, id_key="id"):
        table = self._client.Table(table_name)
        try:
            table.delete_item(Key={id_key: id_value})
        except botocore.exceptions.ClientError as e:
            self._logger.error(f"Failed to delete item with {id_key}={id_value}: {e}")
            raise
