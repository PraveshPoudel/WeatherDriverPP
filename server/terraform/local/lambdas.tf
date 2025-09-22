resource "aws_lambda_function" "zone_listener_function" {
  function_name = "zone-listener"
  filename      = data.archive_file.zone_listener_zip.output_path
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  role          = aws_iam_role.lambda_exec.arn
  timeout       = 90
  memory_size   = 512
  source_code_hash = data.archive_file.zone_listener_zip.output_base64sha256
  depends_on = [aws_cloudwatch_log_group.zone_listener_function]
}

resource "aws_lambda_function" "alert_listener_function" {
  function_name = "alert-listener"
  filename      = data.archive_file.alert_listener_zip.output_path
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  role          = aws_iam_role.lambda_exec.arn
  timeout       = 90
  memory_size   = 512
  source_code_hash = data.archive_file.alert_listener_zip.output_base64sha256
  depends_on = [aws_cloudwatch_log_group.alert_listener_function]
}

resource "aws_lambda_function" "poll_alerts_function" {
  function_name = "poll-alerts"
  filename      = data.archive_file.poll_alerts_zip.output_path
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  role          = aws_iam_role.lambda_exec.arn
  timeout       = 90
  memory_size   = 512
  source_code_hash = data.archive_file.poll_alerts_zip.output_base64sha256
  depends_on = [aws_cloudwatch_log_group.poll_alerts_function]
}

resource "aws_lambda_function" "zone_backfill_function" {
  function_name = "zone-backfill"
  filename      = data.archive_file.zone_backfill_zip.output_path
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  role          = aws_iam_role.lambda_exec.arn
  timeout       = 900
  memory_size   = 512
  source_code_hash = data.archive_file.zone_backfill_zip.output_base64sha256
  depends_on = [aws_cloudwatch_log_group.zone_backfill_function]
}

resource "aws_lambda_function" "search_function" {
  function_name = "search"
  filename      = data.archive_file.search_zip.output_path
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  role          = aws_iam_role.lambda_exec.arn
  timeout       = 90
  memory_size   = 512
  source_code_hash = data.archive_file.search_zip.output_base64sha256
  depends_on = [aws_cloudwatch_log_group.search_function]
}

resource "aws_lambda_function" "cleanup_function" {
  function_name = "cleanup"
  filename      = data.archive_file.cleanup_zip.output_path
  handler       = "lambda_function.lambda_handler"
  runtime       = "python3.12"
  role          = aws_iam_role.lambda_exec.arn
  timeout       = 90
  memory_size   = 512
  source_code_hash = data.archive_file.cleanup_zip.output_base64sha256
  depends_on = [aws_cloudwatch_log_group.cleanup_function]
}