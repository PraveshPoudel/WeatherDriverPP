resource "null_resource" "localstack_create_s3_weather_alerts_bucket" {
  triggers = { always_run = timestamp() }
  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command = <<-EOT
      set -e
      echo "Creating S3 bucket: weather-alerts-bucket in LocalStack"
      aws --endpoint-url=http://host.docker.internal:4566 s3api create-bucket --bucket weather-alerts-bucket-202505 || echo "Bucket may already exist"
    EOT
  }
}

resource "null_resource" "localstack_create_s3_zone_bucket" {
  triggers = { always_run = timestamp() }
  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command = <<-EOT
      set -e
      echo "Creating S3 bucket: zone-bucket-202505 in LocalStack"
      aws --endpoint-url=http://host.docker.internal:4566 s3api create-bucket --bucket zone-bucket-202505 || echo "Bucket may already exist"
    EOT
  }
}

resource "null_resource" "localstack_create_s3_weather_alerts_export_bucket" {
  triggers = { always_run = timestamp() }
  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command = <<-EOT
      set -e
      echo "Creating S3 bucket: weather-alerts-export-bucket-202505 in LocalStack"
      aws --endpoint-url=http://host.docker.internal:4566 s3api create-bucket --bucket weather-alerts-export-bucket-202505 || echo "Bucket may already exist"
    EOT
  }
}