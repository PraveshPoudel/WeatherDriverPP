resource "aws_cloudwatch_log_group" "zone_listener_function" {
  name              = "/aws/lambda/zone-listener-function"
  retention_in_days = 7 
}

resource "aws_cloudwatch_log_group" "alert_listener_function" {
  name              = "/aws/lambda/alert-listener-function"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "search_function" {
  name              = "/aws/lambda/search-function"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "cleanup_function" {
  name              = "/aws/lambda/cleanup-function"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "poll_alerts_function" {
  name              = "/aws/lambda/poll-alerts-function"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "zone_backfill_function" {
  name              = "/aws/lambda/zone-backfill-function"
  retention_in_days = 7
}

resource "aws_cloudwatch_event_rule" "every_5_minutes" {
  name                = "every-5-minutes"
  schedule_expression = "rate(5 minutes)"
}

resource "aws_cloudwatch_event_target" "poll_alerts_lambda_target" {
  rule      = aws_cloudwatch_event_rule.every_5_minutes.name
  target_id = "poll-alerts-lambda"
  arn       = aws_lambda_function.poll_alerts_function.arn
}

resource "aws_lambda_permission" "allow_events_bridge_to_invoke_poll_alerts" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.poll_alerts_function.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_5_minutes.arn
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