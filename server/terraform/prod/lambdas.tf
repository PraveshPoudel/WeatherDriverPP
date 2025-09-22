resource "aws_lambda_function" "zone_listener_function" {
  function_name = "zone-listener"
  filename      = data.archive_file.zone_listener_zip.output_path
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  role          = "arn:aws:iam::302933091929:role/service-role/weather-driver-lambda-role"
  timeout       = 90
  memory_size   = 512
  source_code_hash = data.archive_file.zone_listener_zip.output_base64sha256
}

resource "aws_lambda_function" "alert_listener_function" {
  function_name = "alert-listener"
  filename      = data.archive_file.alert_listener_zip.output_path
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  role          = "arn:aws:iam::302933091929:role/service-role/weather-driver-lambda-role"
  timeout       = 90
  memory_size   = 512
  source_code_hash = data.archive_file.alert_listener_zip.output_base64sha256
}

resource "aws_lambda_function" "poll_alerts_function" {
  function_name = "poll-alerts"
  filename      = data.archive_file.poll_alerts_zip.output_path
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  role          = "arn:aws:iam::302933091929:role/service-role/weather-driver-lambda-role"
  timeout       = 90
  memory_size   = 512
  source_code_hash = data.archive_file.poll_alerts_zip.output_base64sha256
}

resource "aws_lambda_function" "zone_backfill_function" {
  function_name = "zone-backfill"
  filename      = data.archive_file.zone_backfill_zip.output_path
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  role          = "arn:aws:iam::302933091929:role/service-role/weather-driver-lambda-role"
  timeout       = 900
  memory_size   = 512
  source_code_hash = data.archive_file.zone_backfill_zip.output_base64sha256
}

resource "aws_lambda_function" "search_function" {
  function_name = "search"
  filename      = data.archive_file.search_zip.output_path
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  role          = "arn:aws:iam::302933091929:role/service-role/weather-driver-lambda-role"
  timeout       = 300
  memory_size   = 1024
  source_code_hash = data.archive_file.search_zip.output_base64sha256
}

resource "aws_lambda_function" "cleanup_function" {
  function_name = "cleanup"
  filename      = data.archive_file.cleanup_zip.output_path
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  role          = "arn:aws:iam::302933091929:role/service-role/weather-driver-lambda-role"
  timeout       = 300
  memory_size   = 1024
  source_code_hash = data.archive_file.cleanup_zip.output_base64sha256
}

resource "aws_cloudwatch_event_rule" "every_5_minutes" {
  name                = "every-5-minutes"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "poll_alerts_lambda_target" {
  rule      = aws_cloudwatch_event_rule.every_5_minutes.name
  target_id = "poll-alerts-lambda"
  arn       = aws_cloudwatch_event_rule.every_60_minutes.arn
}

resource "aws_lambda_permission" "allow_events_bridge_to_invoke_poll_alerts" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.poll_alerts_function.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_60_minutes.arn
}

resource "aws_cloudwatch_event_rule" "every_60_minutes" {
  name                = "every-60-minutes"
  schedule_expression = "rate(60 minutes)"
}

resource "aws_cloudwatch_event_target" "cleanup_lambda_target" {
  rule      = aws_cloudwatch_event_rule.every_60_minutes.name
  target_id = "cleanup-lambda"
  arn       = aws_lambda_function.cleanup_function.arn
}

resource "aws_lambda_permission" "allow_events_bridge_to_invoke_cleanup" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cleanup_function.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_60_minutes.arn
}