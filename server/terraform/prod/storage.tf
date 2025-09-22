resource "aws_s3_bucket" "weather_alerts_bucket" {
  bucket = "weather-alerts-bucket-202505"
}

resource "aws_s3_bucket" "zone_bucket" {
  bucket = "zone-bucket-202505"
}

resource "aws_s3_bucket" "weather_alerts_export_bucket" {
  bucket = "weather-alerts-export-bucket-202505"
}