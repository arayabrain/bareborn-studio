#!/bin/bash

BUCKET_NAME="optinist-app-storage-637423646530"

# Remove all versions
echo "Deleting object versions..."
VERSIONS=$(aws s3api list-object-versions \
    --bucket "$BUCKET_NAME" \
    --output json \
    --query 'Versions[].{Key:Key,VersionId:VersionId}')

if [ "$VERSIONS" != "null" ]; then
    echo "$VERSIONS" | jq -c '.[]' | while read -r OBJECT; do
        KEY=$(echo "$OBJECT" | jq -r '.Key')
        VERSION_ID=$(echo "$OBJECT" | jq -r '.VersionId')
        echo "Deleting $KEY version $VERSION_ID"
        aws s3api delete-object \
            --bucket "$BUCKET_NAME" \
            --key "$KEY" \
            --version-id "$VERSION_ID"
    done
fi

echo "Removing any remaining current objects..."
aws s3 rm "s3://$BUCKET_NAME" --recursive


terraform destroy \
  -target="aws_ecs_service.main" \
  -target="aws_lb.main" \
  -target="aws_ecs_cluster.main" \
  -target="aws_db_instance.main" \
  -target="aws_efs_file_system.snmk" \
  -target="aws_s3_bucket.app_storage" \
  -target="aws_instance.nat" \
  -target="aws_eip.nat_instance" \
  -target="aws_vpc.main"


  ##!/bin/bash
# terraform destroy \
#   -target="aws_vpc.main" \
#   -target="aws_ecs_cluster.main" \
#   -target="aws_db_instance.main" \
#   -target="aws_lb.main" \
#   -target="aws_efs_file_system.snmk" \
#   -target="aws_s3_bucket.app_storage" \
#   -target="aws_nat_gateway.nat1" \
#   -target="aws_nat_gateway.nat2" \
#   -target="aws_eip.nat1" \
#   -target="aws_eip.nat2"
