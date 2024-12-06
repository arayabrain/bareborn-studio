#!/bin/bash
terraform destroy \
  -target="aws_vpc.main" \
  -target="aws_ecs_cluster.main" \
  -target="aws_db_instance.main" \
  -target="aws_lb.main" \
  -target="aws_efs_file_system.snmk" \
  -target="aws_s3_bucket.app_storage" \
  -target="aws_nat_gateway.nat1" \
  -target="aws_nat_gateway.nat2" \
  -target="aws_eip.nat1" \
  -target="aws_eip.nat2"
