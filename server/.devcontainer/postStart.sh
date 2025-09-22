#!/bin/sh
# pip3 install --user -r requirements.txt

echo "Starting local deployment.."

echo "Cleaning up the build directory..."
rm -rf /src/build/*

pip install -r requirements.txt

pip install -r requirements.txt -t src/build/lambda_packages

rm -f ./terraform/local/datastore.tf ./terraform/local/lambda_packaging.tf
cp ./terraform/shared/datastore.tf ./terraform/local/
cp ./terraform/shared/lambda_packaging.tf ./terraform/local/

cd ./terraform/local

terraform init
terraform destroy -auto-approve
terraform apply -auto-approve

echo "Infrastructure is deployed locally"

