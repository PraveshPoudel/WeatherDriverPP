###############################################################################
# Lambda function for Zone Listener
###############################################################################

resource "null_resource" "prepare_zone_listener_package" {
  triggers = { always_run = timestamp() }
  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command = <<-EOT
      set -e
      SRC_DIR=../../src/library/
      PCK_DIR=../../src/build/lambda_packages/
      DST_DIR=../../src/build/lambda/zone_listener_package/
      rm -rf "$DST_DIR"
      mkdir -p "$DST_DIR"
      rsync -av "$PCK_DIR"/ "$DST_DIR"/
      rsync "$SRC_DIR"/* "$DST_DIR"/
      cp ../../src/aws/lambda/zone_listener/lambda_function.py "$DST_DIR"/
    EOT
  }
}

data "archive_file" "zone_listener_zip" {
  depends_on = [null_resource.prepare_zone_listener_package]
  type        = "zip"
  source_dir  = "../../src/build/lambda/zone_listener_package"
  output_path = "../../src/build/lambda/zone_listener_package/function.zip"
}

###############################################################################
# Lambda function for Alert Listener
###############################################################################

resource "null_resource" "prepare_alert_listener_package" {
  triggers = { always_run = timestamp() }
  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command = <<-EOT
      set -e
      SRC_DIR=../../src/library/
      PCK_DIR=../../src/build/lambda_packages/
      DST_DIR=../../src/build/lambda/alert_listener_package/
      rm -rf "$DST_DIR"
      mkdir -p "$DST_DIR"
      rsync -av "$PCK_DIR"/ "$DST_DIR"/
      rsync "$SRC_DIR"/* "$DST_DIR"/
      cp ../../src/aws/lambda/alert_listener/lambda_function.py "$DST_DIR"/
    EOT
  }
}

data "archive_file" "alert_listener_zip" {
  depends_on = [null_resource.prepare_alert_listener_package]
  type        = "zip"
  source_dir  = "../../src/build/lambda/alert_listener_package"
  output_path = "../../src/build/lambda/alert_listener_package/function.zip"
}

###############################################################################
# Lambda function for Poll Alerts
###############################################################################

resource "null_resource" "prepare_poll_alerts_package" {
  triggers = { always_run = timestamp() }
  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command = <<-EOT
      set -e
      SRC_DIR=../../src/library/
      PCK_DIR=../../src/build/lambda_packages/
      DST_DIR=../../src/build/lambda/poll_alerts_package/
      rm -rf "$DST_DIR"
      mkdir -p "$DST_DIR"
      rsync -av "$PCK_DIR"/ "$DST_DIR"/
      rsync "$SRC_DIR"/* "$DST_DIR"/
      cp ../../src/aws/lambda/poll_alerts/lambda_function.py "$DST_DIR"/
    EOT
  }
}

data "archive_file" "poll_alerts_zip" {
  depends_on = [null_resource.prepare_poll_alerts_package]
  type        = "zip"
  source_dir  = "../../src/build/lambda/poll_alerts_package"
  output_path = "../../src/build/lambda/poll_alerts_package/function.zip"
}

###############################################################################
# Lambda function for Zone Backfill
###############################################################################

resource "null_resource" "prepare_zone_backfill_package" {
  triggers = { always_run = timestamp() }
  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command = <<-EOT
      set -e
      SRC_DIR=../../src/library/
      PCK_DIR=../../src/build/lambda_packages/
      DST_DIR=../../src/build/lambda/zone_backfill_package/
      rm -rf "$DST_DIR"
      mkdir -p "$DST_DIR"
      rsync -av "$PCK_DIR"/ "$DST_DIR"/
      rsync "$SRC_DIR"/* "$DST_DIR"/
      cp ../../src/aws/lambda/zone_backfill/lambda_function.py "$DST_DIR"/
    EOT
  }
}

data "archive_file" "zone_backfill_zip" {
  depends_on = [null_resource.prepare_zone_backfill_package]
  type        = "zip"
  source_dir  = "../../src/build/lambda/zone_backfill_package"
  output_path = "../../src/build/lambda/zone_backfill_package/function.zip"
}

###############################################################################
# Lambda function for Search Function
###############################################################################

resource "null_resource" "prepare_search_package" {
  triggers = { always_run = timestamp() }
  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command = <<-EOT
      set -e
      SRC_DIR=../../src/library/
      PCK_DIR=../../src/build/lambda_packages/
      DST_DIR=../../src/build/lambda/search_package/
      rm -rf "$DST_DIR"
      mkdir -p "$DST_DIR"
      rsync -av "$PCK_DIR"/ "$DST_DIR"/
      rsync "$SRC_DIR"/* "$DST_DIR"/
      cp ../../src/aws/lambda/search/lambda_function.py "$DST_DIR"/
    EOT
  }
}

data "archive_file" "search_zip" {
  depends_on = [null_resource.prepare_search_package]
  type        = "zip"
  source_dir  = "../../src/build/lambda/search_package"
  output_path = "../../src/build/lambda/search_package/function.zip"
}

###############################################################################
# Lambda function for Cleanup Function
###############################################################################

resource "null_resource" "prepare_cleanup_package" {
  triggers = { always_run = timestamp() }
  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command = <<-EOT
      set -e
      SRC_DIR=../../src/library/
      PCK_DIR=../../src/build/lambda_packages/
      DST_DIR=../../src/build/lambda/cleanup_package/
      rm -rf "$DST_DIR"
      mkdir -p "$DST_DIR"
      rsync -av "$PCK_DIR"/ "$DST_DIR"/
      rsync "$SRC_DIR"/* "$DST_DIR"/
      cp ../../src/aws/lambda/cleanup/lambda_function.py "$DST_DIR"/
    EOT
  }
}

data "archive_file" "cleanup_zip" {
  depends_on = [null_resource.prepare_cleanup_package]
  type        = "zip"
  source_dir  = "../../src/build/lambda/cleanup_package"
  output_path = "../../src/build/lambda/cleanup_package/function.zip"
}
