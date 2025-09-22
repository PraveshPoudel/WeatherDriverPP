resource "aws_sqs_queue" "zones_queue" {
  name     = "zones-queue"
  depends_on = [aws_sqs_queue.zones_dlq]
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.zones_dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue" "zones_dlq" {
  name = "zones-queue-dlq"
}

resource "aws_lambda_event_source_mapping" "zones_queue_to_lambda" {
  event_source_arn = aws_sqs_queue.zones_queue.arn
  function_name    = aws_lambda_function.zone_listener_function.arn
  batch_size       = 5
  enabled          = true
}

resource "aws_sqs_queue" "alerts_queue" {
  name     = "alerts-queue"
  depends_on = [aws_sqs_queue.alerts_dlq]
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.alerts_dlq.arn
    maxReceiveCount     = 3
  })
}

resource "aws_sqs_queue" "alerts_dlq" {
  name = "alerts-queue-dlq"
}

resource "aws_lambda_event_source_mapping" "alerts_queue_to_lambda" {
  event_source_arn = aws_sqs_queue.alerts_queue.arn
  function_name    = aws_lambda_function.alert_listener_function.function_name
  batch_size       = 10
  enabled          = true
}
