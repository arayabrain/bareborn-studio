# Provider configuration
provider "aws" {
  region = "ap-northeast-1"
}

variable "db_name" {
  description = "Name for RDS database"
  type        = string
  default     = "studio"
}

# Variables for sensitive information saved in terraform.tfvars
variable "db_username" {
  description = "Username for RDS instance"
  type        = string
}

variable "db_password" {
  description = "Password for RDS instance"
  type        = string
  sensitive   = true
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "optinist-cloud-vpc-tf"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "optinist-cloud-igw-tf"
  }
}


# Public Subnets
resource "aws_subnet" "public1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.0.0/20"
  availability_zone = "ap-northeast-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "optinist-cloud-subnet-public1-ap-northeast-1a-tf"
  }
}

resource "aws_subnet" "public2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.16.0/20"
  availability_zone = "ap-northeast-1c"
  map_public_ip_on_launch = true

  tags = {
    Name = "optinist-cloud-subnet-public2-ap-northeast-1c-tf"
  }
}

# Private Subnets
resource "aws_subnet" "private1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.128.0/20"
  availability_zone = "ap-northeast-1a"

  tags = {
    Name = "optinist-cloud-subnet-private1-ap-northeast-1a-tf"
  }
}

resource "aws_subnet" "private2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.144.0/20"
  availability_zone = "ap-northeast-1c"

  tags = {
    Name = "optinist-cloud-subnet-private2-ap-northeast-1c-tf"
  }
}

# Elastic IP for NAT Instance
resource "aws_eip" "nat_instance" {
  domain = "vpc"
  instance = aws_instance.nat.id

  tags = {
    Name = "optinist-nat-instance-eip-tf"
  }
}

# NAT Instance
data "aws_ami" "nat_instance" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn-ami-vpc-nat-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_network_interface" "nat" {
  depends_on = [aws_instance.nat]

  filter {
    name   = "attachment.instance-id"
    values = [aws_instance.nat.id]
  }

  filter {
    name   = "attachment.device-index"
    values = ["0"]
  }
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "optinist-cloud-rtb-public-tf"
  }
}

resource "aws_route_table" "private1" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
 #   nat_gateway_id = aws_nat_gateway.nat1.id
    network_interface_id = data.aws_network_interface.nat.id
  }

  tags = {
    Name = "optinist-cloud-rtb-private1-ap-northeast-1a-tf"
  }
}

resource "aws_route_table" "private2" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
 #   nat_gateway_id = aws_nat_gateway.nat1.id
    network_interface_id = data.aws_network_interface.nat.id
  }

  tags = {
    Name = "optinist-cloud-rtb-private2-ap-northeast-1c-tf"
  }
}


# Route Table Associations
resource "aws_route_table_association" "public1" {
  subnet_id      = aws_subnet.public1.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public2" {
  subnet_id      = aws_subnet.public2.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private1" {
  subnet_id      = aws_subnet.private1.id
  route_table_id = aws_route_table.private1.id
}

resource "aws_route_table_association" "private2" {
  subnet_id      = aws_subnet.private2.id
  route_table_id = aws_route_table.private2.id
}

resource "aws_vpc_endpoint_route_table_association" "private1_s3" {
  route_table_id  = aws_route_table.private1.id
  vpc_endpoint_id = aws_vpc_endpoint.s3.id
}

resource "aws_vpc_endpoint_route_table_association" "private2_s3" {
  route_table_id  = aws_route_table.private2.id
  vpc_endpoint_id = aws_vpc_endpoint.s3.id
}

# S3 VPC Endpoint
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.ap-northeast-1.s3"

  tags = {
    Name = "optinist-cloud-vpce-s3-tf"
  }
}

# Security groups
resource "aws_security_group" "ecs" {
  name        = "ecs-optinist-cloud-security-group-tf"
  description = "Created by Terraform for ECS"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port        = 8000
    to_port          = 8009
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port        = 2049
    to_port          = 2049
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  ingress {
    from_port        = 3306
    to_port          = 3306
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = {
    Name = "optinist-cloud-sg-ecs-tf"
  }
}

resource "aws_security_group" "alb" {
  name        = "optinist-alb-security-group-tf"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port        = 8000
    to_port          = 8000
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "optinist-alb-sg-tf"
  }
}

# Add the cross-references as separate rules
resource "aws_security_group_rule" "ecs_from_alb" {
  type                     = "ingress"
  from_port                = 8000
  to_port                  = 8000
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
  security_group_id        = aws_security_group.ecs.id
  description              = "ALB health checks"
}

resource "aws_security_group_rule" "alb_to_ecs" {
  type                     = "egress"
  from_port                = 8000
  to_port                  = 8000
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ecs.id
  security_group_id        = aws_security_group.alb.id
  description              = "Health check to ECS targets"
}

resource "aws_security_group" "rds" {
  name        = "optinist-rds-security-group-tf"
  description = "Security group for RDS"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "optinist-cloud-sg-rds-tf"
  }
}

resource "aws_security_group" "efs" {
  name        = "optinist-cloud-efs-sg-tf"
  description = "Security group for EFS mount targets"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  tags = {
    Name = "optinist-cloud-efs-sg-tf"
  }
}

resource "aws_security_group" "nat_instance" {
  name        = "nat-instance-sg-tf"
  description = "Security group for NAT Instance"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "optinist-nat-instance-sg-tf"
  }
}

# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution" {
  name = "optinist-cloud-task-execution-role-tf"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Task Role
resource "aws_iam_role" "ecs_task" {
  name = "optinist-cloud-task-role-tf"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Add necessary policy attachments for ECS task role
resource "aws_iam_role_policy_attachment" "ecs_task_efs" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonElasticFileSystemClientFullAccess"
}

resource "aws_iam_role_policy_attachment" "ecs_task_cloudwatch" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

resource "aws_iam_role_policy_attachment" "ecs_task_ecr" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# NAT role
resource "aws_iam_role" "nat_instance" {
  name = "nat-instance-role-tf"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_instance_profile" "nat_instance" {
  name = "nat-instance-profile-tf"
  role = aws_iam_role.nat_instance.name
}

# RDS Task Role
resource "aws_iam_role" "rds_monitoring" {
  name = "rds-monitoring-role-tf"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "optinist-rds-subnet-group-tf"
  subnet_ids = [
    aws_subnet.private1.id,
    aws_subnet.private2.id,
    aws_subnet.public1.id,
    aws_subnet.public2.id
  ]

  tags = {
    Name = "optinist-rds-subnet-group-tf"
  }
}

# S3 policy
resource "aws_s3_bucket_policy" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowECSTaskAccess"
        Effect    = "Allow"
        Principal = {
          AWS = aws_iam_role.ecs_task.arn
        }
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket",
          "s3:DeleteObject"
        ]
        Resource = [
          aws_s3_bucket.app_storage.arn,
          "${aws_s3_bucket.app_storage.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_s3" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"  # You might want to create a more restrictive policy
}

# Cloudwatch
resource "aws_iam_role_policy" "ecs_task_execution_cloudwatch" {
  name = "cloudwatch-logs"
  role = aws_iam_role.ecs_task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier              = "optinist-cloud-rds-tf"
  allocated_storage       = 20
  storage_type            = "gp3"
  engine                  = "mysql"
  engine_version          = "8.0"
  instance_class          = "db.t4g.micro"
  parameter_group_name    = "default.mysql8.0"
  db_name                 = var.db_name
  username                = var.db_username
  password                = var.db_password
  skip_final_snapshot     = true
  final_snapshot_identifier = "${var.db_name}-final-snapshot"
  backup_retention_period = 7
  monitoring_interval     = 60
  monitoring_role_arn     = aws_iam_role.rds_monitoring.arn
  publicly_accessible     = false
  enabled_cloudwatch_logs_exports = []
  network_type            = "IPV4"
  port                    = 3306
  vpc_security_group_ids  = [aws_security_group.rds.id]
  db_subnet_group_name    = aws_db_subnet_group.main.name
  multi_az                = false
  storage_encrypted       = true

  tags = {
    Name = "optinist-cloud-rds-tf"
  }
}

# Launch NAT Instance
resource "aws_instance" "nat" {
  ami                    = data.aws_ami.nat_instance.id
  instance_type          = "t3a.nano"
  subnet_id              = aws_subnet.public1.id
  vpc_security_group_ids = [aws_security_group.nat_instance.id]
  source_dest_check      = false

  iam_instance_profile   = aws_iam_instance_profile.nat_instance.name

  root_block_device {
    volume_size = 8
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              echo 1 > /proc/sys/net/ipv4/ip_forward
              iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
              EOF

  tags = {
    Name = "optinist-nat-instance-tf"
  }
}

# EFS File System
resource "aws_efs_file_system" "snmk" {
  creation_token = "optinist-cloud-snmk-volume-tf"

  lifecycle_policy {
    transition_to_ia = "AFTER_7_DAYS"
  }

  lifecycle_policy {
    transition_to_primary_storage_class = "AFTER_1_ACCESS"
  }

  performance_mode = "generalPurpose"
  throughput_mode = "bursting"

  tags = {
    Name = "optinist-cloud-snmk-volume-tf"
  }
}

# EFS Mount Targets
resource "aws_efs_mount_target" "private1" {
  file_system_id  = aws_efs_file_system.snmk.id
  subnet_id       = aws_subnet.private1.id
  security_groups = [aws_security_group.efs.id]
}

resource "aws_efs_mount_target" "private2" {
  file_system_id  = aws_efs_file_system.snmk.id
  subnet_id       = aws_subnet.private2.id
  security_groups = [aws_security_group.efs.id]
}

# EFS Access Point
resource "aws_efs_access_point" "snmk" {
  file_system_id = aws_efs_file_system.snmk.id

  root_directory {
    path = "/"
    creation_info {
      owner_gid   = 1000
      owner_uid   = 1000
      permissions = "755"
    }
  }

  tags = {
    Name = "optinist-cloud-efs-ap-tf"
  }
}

# S3 bucket

resource "aws_s3_bucket" "app_storage" {
  bucket = "optinist-app-storage-${data.aws_caller_identity.current.account_id}"
  force_destroy = true

  tags = {
    Name        = "OptiNiSt Application Storage"
    Environment = "Production"
  }
}

resource "aws_s3_bucket_versioning" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Block all public access to S3
resource "aws_s3_bucket_public_access_block" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}


# Target Group
resource "aws_lb_target_group" "app" {
  name        = "optinist-cloud-target-group-tf"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    interval            = 30
    matcher            = "200"
    path               = "/health"
    port               = "traffic-port"
    protocol           = "HTTP"
    timeout            = 5
  }

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "optinist-cloud-target-group-tf"
  }
}


# Application Load Balancer
resource "aws_lb" "main" {
  name               = "optinist-lb-tf"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id, aws_security_group.ecs.id]
  subnets           = [aws_subnet.public1.id, aws_subnet.public2.id]

  enable_deletion_protection = false
  idle_timeout              = 60

  tags = {
    Name = "optinist-load-balancer-tf"
  }
}


resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}


# Combined API routes with proper priorities
# Documentation API routes
resource "aws_lb_listener_rule" "api_docs" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  condition {
    path_pattern {
      values = [
        "/docs",
        "/docs/*",
        "/redoc",
        "/redoc/*",
        "/openapi.json"
      ]
    }
  }
}

# Core API routes
resource "aws_lb_listener_rule" "api_core" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  condition {
    path_pattern {
      values = [
        "/api/*",
        "/health",
        "/is_standalone"
      ]
    }
  }
}

# Preflight handling
resource "aws_lb_listener_rule" "preflight" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 30

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  condition {
    http_request_method {
      values = ["OPTIONS"]
    }
  }
}

# Static files
resource "aws_lb_listener_rule" "static_files" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 40

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  condition {
    path_pattern {
      values = ["/static/*"]
    }
  }
}

# Frontend catch-all (lowest priority)
resource "aws_lb_listener_rule" "frontend" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "optinist-cloud-cluster-tf"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  service_connect_defaults {
    namespace = aws_service_discovery_private_dns_namespace.main.arn
  }

  tags = {
    Name = "optinist-cloud-cluster-tf"
  }
}


# ECS Service
resource "aws_ecs_service" "main" {
  name             = "optinist-cloud-service-tf"
  cluster          = aws_ecs_cluster.main.id
  task_definition  = aws_ecs_task_definition.app.arn
  desired_count    = 1
  platform_version = "1.4.0"
  deployment_maximum_percent        = 200
  deployment_minimum_healthy_percent = 100

  network_configuration {
    subnets          = [aws_subnet.private1.id, aws_subnet.private2.id]
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight           = 1
    base            = 0
  }
  enable_execute_command = true

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "optinist-cloud-container-tf"
    container_port   = 8000
  }

  depends_on = [
#    aws_nat_gateway.nat1,
    aws_instance.nat,
    aws_db_instance.main,
    aws_lb.main,
    aws_lb_listener.http
  ]

  health_check_grace_period_seconds = 300

  tags = {
    Name = "optinist-cloud-service-tf"
  }
}

resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "optinist.local"
  vpc         = aws_vpc.main.id
}

# ECS Task Definition
resource "aws_ecs_task_definition" "app" {
  family                   = "optinist-cloud-taskdef-tf"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = 2048
  memory                  = 16384
  task_role_arn          = aws_iam_role.ecs_task.arn
  execution_role_arn     = aws_iam_role.ecs_task_execution.arn

  ephemeral_storage {
    size_in_gib = 21
  }

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture       = "X86_64"
  }

  container_definitions = jsonencode([
    {
      name                  = "optinist-cloud-container-tf"
      image                 = "637423646530.dkr.ecr.ap-northeast-1.amazonaws.com/optinist-cloud-tf:latest"
      cpu                   = 2048
      memory                = 16384
      memoryReservation     = 12288
      essential             = true
      workingDirectory      = "/app"
      entryPoint            = ["/bin/sh", "-c"]
      command               = ["./cloud-startup.sh"]

      portMappings = [
        {
          name           = "optinist-cloud-container-port-8000-tf"
          containerPort  = 8000
          hostPort      = 8000
          protocol      = "tcp"
          appProtocol   = "http"
        }
      ]

      environment = [
        {
          name  = "CLOUDWATCH_LOG_GROUP"
          value = "/ecs/optinist-cloud-taskdef-tf"
        },
        {
          name  = "PYTHONPATH"
          value = "/app/"
        },
        {
          name  = "TZ"
          value = "Asia/Tokyo"
        },
        {
          name  = "DB_HOST"
          value = replace(aws_db_instance.main.endpoint, ":3306", "")
        },
        {
          name  = "DB_NAME"
          value = "studio"
        },
        {
          name  = "DB_USER"
          value = var.db_username
        },
        {
          name  = "DB_PASSWORD"
          value = var.db_password
        },
        {
          name  = "AWS_SERVICE_URL"
          value = aws_lb.main.dns_name
        },
        {
          name  = "BACKEND_HOST"
          value = "0.0.0.0"
        },
        {
          name  = "BACKEND_PORT"
          value = "8000"
        },
        {
          name  = "CLOUDWATCH_STREAM_NAME"
          value = "optinist-cloud-stream-tf"
        },
        {
          name  = "PYTHONUNBUFFERED"
          value = "1"
        },
        {
          name  = "OPTINIST_DIR"
          value = "/app/studio_data"
        },
        {
          name  = "S3_DEFAULT_BUCKET_NAME"
          value = aws_s3_bucket.app_storage.id
        },
        {
          name  = "INITIAL_FIREBASE_UID"
          value = var.initial_firebase_uid
        },
        {
          name  = "INITIAL_USER_NAME"
          value = var.initial_user_name
        },
        {
          name  = "INITIAL_USER_EMAIL"
          value = var.initial_user_email
        },
        {
          name  = "LOG_LEVEL",
          value = "DEBUG"
        },
        {
          name  = "UVICORN_ACCESS_LOG",
          value = "1"
        },
        {
          name  = "CORS_ORIGINS"
          value = "*"
        }
      ]

      mountPoints = [
        {
          sourceVolume  = "optinist-cloud-snmk-volume-tf"
          containerPath = "/app/.snakemake"
          readOnly      = false
        },
        {
          sourceVolume  = "optinist-cloud-studio-data-volume-tf"
          containerPath = "/app/studio_data"
          readOnly      = false
        }
      ]

      healthCheck = {
        command     = ["CMD-SHELL", "curl -v http://127.0.0.1:8000/health"]
        interval    = 300
        timeout     = 5
        retries     = 3
        startPeriod = 300
      }

      dockerLabels = {
        "health.check.enabled" = "true"
      }

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/optinist-cloud-taskdef-tf"
          "mode"                  = "non-blocking"
          "awslogs-multiline-pattern" = "^\\[\\d{4}-\\d{2}-\\d{2}\\s\\d{2}:\\d{2}:\\d{2}"
          "max-buffer-size"       = "25m"
          "awslogs-datetime-format" = "%Y-%m-%d %H:%M:%S"
          "awslogs-region"        = "ap-northeast-1"
          "awslogs-create-group"  = "true"
          "awslogs-stream-prefix" = "ecs"
          "mode"                  = "non-blocking"
        }
      }
    }
  ])

  volume {
    name = "optinist-cloud-studio-data-volume-tf"
  }

  volume {
    name = "optinist-cloud-snmk-volume-tf"
    efs_volume_configuration {
      file_system_id = aws_efs_file_system.snmk.id
      root_directory = "/"
      transit_encryption = "ENABLED"
      authorization_config {
        access_point_id = aws_efs_access_point.snmk.id
        iam            = "DISABLED"
      }
    }
  }

  tags = {
    Name = "optinist-cloud-taskdef-tf"
  }
}

# FARGATE_SPOT to capacity providers
resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight           = 1
  }
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/optinist-cloud-taskdef-tf"
  retention_in_days = 7

  tags = {
    Name = "optinist-cloud-logs-tf"
  }
}

# Auto Scaling
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 2
  min_capacity       = 0
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.main.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_policy" {
  name               = "optinist-cloud-autoscaling-policy-tf"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    target_value = 75.0
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}

# Variables
variable "initial_firebase_uid" {
  description = "Firebase UID for initial admin user"
  type        = string
}

variable "initial_user_name" {
  description = "Name for initial admin user"
  type        = string
}

variable "initial_user_email" {
  description = "Email for initial admin user"
  type        = string
}

# Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value = {
    public1 = aws_subnet.public1.id
    public2 = aws_subnet.public2.id
  }
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value = {
    private1 = aws_subnet.private1.id
    private2 = aws_subnet.private2.id
  }
}

output "public_subnet_cidrs" {
  description = "CIDR blocks of public subnets"
  value = {
    public1 = aws_subnet.public1.cidr_block
    public2 = aws_subnet.public2.cidr_block
  }
}

output "private_subnet_cidrs" {
  description = "CIDR blocks of private subnets"
  value = {
    private1 = aws_subnet.private1.cidr_block
    private2 = aws_subnet.private2.cidr_block
  }
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_security_group_id" {
  value = aws_security_group.rds.id
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs.id
}

output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.main.dns_name
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = aws_ecs_service.main.name
}

output "efs_id" {
  description = "ID of the EFS file system"
  value       = aws_efs_file_system.snmk.id
}

output "app_storage_bucket" {
  description = "S3 bucket for application storage"
  value       = aws_s3_bucket.app_storage.id
}


# Configuration Outputs
output "frontend_config" {
  description = "Configuration values for frontend/.env.production"
  value = {
    REACT_APP_SERVER_HOST = aws_lb.main.dns_name
    REACT_APP_SERVER_PORT = "80"
    REACT_APP_SERVER_PROTO = "http"
  }
}

output "backend_config" {
  description = "Configuration values for studio/auth/config/.env"
  value = {
    S3_DEFAULT_BUCKET_NAME = aws_s3_bucket.app_storage.id
  }
}
