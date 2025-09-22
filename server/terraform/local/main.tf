provider "aws" {
  region                       = "us-east-1"
  access_key                   = "test"
  secret_key                   = "test"
  skip_credentials_validation  = true
  skip_metadata_api_check      = true
  skip_requesting_account_id   = true
  endpoints {
    lambda      = "http://host.docker.internal:4566"
    iam         = "http://host.docker.internal:4566"
    apigateway  = "http://host.docker.internal:4566"
    route53     = "http://host.docker.internal:4566"
    sqs         = "http://host.docker.internal:4566"
    cloudwatch  = "http://host.docker.internal:4566"
    s3          = "http://host.docker.internal:4566"
    dynamodb    = "http://host.docker.internal:4566"
    eventbridge = "http://host.docker.internal:4566"
    logs       = "http://host.docker.internal:4566"
    // ...add more services as needed...
  }
}

resource "aws_iam_role" "lambda_exec_role" {
  name     = "lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda-exec"

  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions   = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
