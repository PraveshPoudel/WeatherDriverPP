import json

from interfaces import SqsBoto3Client

class SqsClient:
    def __init__(self, boto_sqs_client: SqsBoto3Client):
        self._client = boto_sqs_client

    def send_message(self, queue_name, message_body):
        queue_url = self._client.get_queue_url(QueueName=queue_name)["QueueUrl"]

        if isinstance(message_body, dict):
            message_body = json.dumps(message_body)
        response = self._client.send_message(QueueUrl=queue_url, MessageBody=message_body)
        print(f"Message sent to queue '{queue_name}'. Message ID: {response['MessageId']}")
        return response