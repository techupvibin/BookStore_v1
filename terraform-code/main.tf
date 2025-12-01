terraform {
  required_version = ">= 1.2.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.0"
    }
  }

  backend "s3" {
    bucket         = var.tf_backend_s3_bucket
    key            = "${var.project_name}/terraform.tfstate"
    region         = var.region
    dynamodb_table = var.tf_backend_dynamodb_table
    encrypt        = true
  }
}

provider "aws" {
  region = var.region
}

data "aws_availability_zones" "azs" {}

####################
# VPC (terraform-aws-modules/vpc recommended)
####################
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = ">= 3.0.0"

  name = "${var.project_name}-vpc"
  cidr = var.vpc_cidr

  azs             = slice(data.aws_availability_zones.azs.names, 0, 2)
  public_subnets  = ["10.0.1.0/24","10.0.2.0/24"]
  private_subnets = ["10.0.11.0/24","10.0.12.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = var.tags
}

####################
# Security Groups
####################
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  vpc_id      = module.vpc.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ecs_tasks" {
  name   = "${var.project_name}-ecs-sg"
  vpc_id = module.vpc.vpc_id

  # Allow ALB -> tasks (we will allow on ports used by containers)
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Allow internal traffic for Kafka/RPC if needed — tighten later
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

####################
# ECR repos for all containers used
####################
resource "aws_ecr_repository" "frontend" {
  name = "${var.project_name}-frontend"
}
resource "aws_ecr_repository" "backend" {
  name = "${var.project_name}-backend"
}
resource "aws_ecr_repository" "grafana" {
  name = "${var.project_name}-grafana"
}
resource "aws_ecr_repository" "prometheus" {
  name = "${var.project_name}-prometheus"
}
resource "aws_ecr_repository" "alertmanager" {
  name = "${var.project_name}-alertmanager"
}
resource "aws_ecr_repository" "pgadmin" {
  name = "${var.project_name}-pgadmin"
}
# Optionally create kafka repo if you plan custom builds
resource "aws_ecr_repository" "kafka" {
  name = "${var.project_name}-kafka"
}

####################
# ECS cluster + execution role
####################
resource "aws_ecs_cluster" "cluster" {
  name = "${var.project_name}-cluster"
}

data "aws_iam_policy_document" "ecs_task_assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "ecs_task_execution" {
  name               = "${var.project_name}-ecs-exec-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

####################
# ALB & target groups
####################
resource "aws_lb" "alb" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets
}

resource "aws_lb_target_group" "frontend_tg" {
  name     = "${var.project_name}-frontend-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  health_check {
    path                = "/"
    matcher             = "200-399"
  }
}

resource "aws_lb_target_group" "backend_tg" {
  name     = "${var.project_name}-backend-tg"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = module.vpc.vpc_id
  health_check {
    path    = "/actuator/health"
    matcher = "200-399"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "OK"
      status_code  = "200"
    }
  }
}

# Listener rules: frontend (root paths) and backend (/api/*)
resource "aws_lb_listener_rule" "backend_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 90
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }
  condition {
    path_pattern { values = ["/api/*","/api"] }
  }
}
resource "aws_lb_listener_rule" "frontend_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100
  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_tg.arn
  }
  condition {
    path_pattern { values = ["/","/static/*","/app/*"] }
  }
}

####################
# CloudWatch log groups
####################
resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.project_name}-frontend"
  retention_in_days = 14
}
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}-backend"
  retention_in_days = 14
}

####################
# ECS Task definitions & services for each container
# NOTE: We use simple container_definitions referencing ECR repo URIs and :latest tag.
####################
locals {
  frontend_def = jsonencode([
    {
      name      = "frontend"
      image     = "${aws_ecr_repository.frontend.repository_url}:latest"
      portMappings = [{ containerPort = 80, protocol = "tcp" }]
      essential = true
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  backend_def = jsonencode([
    {
      name      = "backend"
      image     = "${aws_ecr_repository.backend.repository_url}:latest"
      portMappings = [{ containerPort = 8080, protocol = "tcp" }]
      essential = true
      environment = [
        { name = "SPRING_DATASOURCE_URL", value = "jdbc:postgresql://${aws_db_instance.postgres.address}:${aws_db_instance.postgres.port}/${var.db_name}" },
        { name = "SPRING_DATASOURCE_USERNAME", value = var.db_username },
        { name = "SPRING_DATASOURCE_PASSWORD", value = var.db_password },
        { name = "REDIS_HOST", value = aws_elasticache_cluster.redis.cache_nodes[0].address }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  grafana_def = jsonencode([
    {
      name      = "grafana"
      image     = "${aws_ecr_repository.grafana.repository_url}:latest"
      portMappings = [{ containerPort = 3000, protocol = "tcp" }]
      essential = true
    }
  ])

  prometheus_def = jsonencode([
    {
      name      = "prometheus"
      image     = "${aws_ecr_repository.prometheus.repository_url}:latest"
      portMappings = [{ containerPort = 9090, protocol = "tcp" }]
      essential = true
    }
  ])

  alertmanager_def = jsonencode([
    {
      name = "alertmanager"
      image = "${aws_ecr_repository.alertmanager.repository_url}:latest"
      portMappings = [{ containerPort = 9093, protocol = "tcp" }]
      essential = true
    }
  ])

  pgadmin_def = jsonencode([
    {
      name = "pgadmin"
      image = "${aws_ecr_repository.pgadmin.repository_url}:latest"
      portMappings = [{ containerPort = 80, protocol = "tcp" }]
      essential = true
    }
  ])
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project_name}-frontend"
  cpu                      = "256"
  memory                   = "512"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  container_definitions    = local.frontend_def
}

resource "aws_ecs_service" "frontend" {
  name            = "${var.project_name}-frontend"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = var.frontend_desired_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.frontend_tg.arn
    container_name   = "frontend"
    container_port   = 80
  }
  depends_on = [aws_lb_listener.http]
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend"
  cpu                      = "512"
  memory                   = "1024"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  container_definitions    = local.backend_def
}

resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-backend"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.backend_desired_count
  launch_type     = "FARGATE"
  network_configuration {
    subnets         = module.vpc.private_subnets
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.backend_tg.arn
    container_name   = "backend"
    container_port   = 8080
  }
  depends_on = [aws_lb_listener.http]
}

# Add Grafana/Prometheus/Alertmanager/pgAdmin ECS tasks & services (no ALB rules here — they can be reached via separate target groups or ALB path rules)
resource "aws_ecs_task_definition" "grafana" {
  family                   = "${var.project_name}-grafana"
  cpu                      = "256"
  memory                   = "512"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  container_definitions    = local.grafana_def
}

resource "aws_ecs_service" "grafana" {
  name            = "${var.project_name}-grafana"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.grafana.arn
  desired_count   = 1
  network_configuration {
    subnets = module.vpc.private_subnets
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
  depends_on = [aws_lb_listener.http]
}

resource "aws_ecs_task_definition" "prometheus" {
  family                   = "${var.project_name}-prometheus"
  cpu                      = "256"
  memory                   = "512"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  container_definitions    = local.prometheus_def
}

resource "aws_ecs_service" "prometheus" {
  name            = "${var.project_name}-prometheus"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.prometheus.arn
  desired_count   = 1
  network_configuration {
    subnets = module.vpc.private_subnets
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
}

resource "aws_ecs_task_definition" "alertmanager" {
  family                   = "${var.project_name}-alertmanager"
  cpu                      = "256"
  memory                   = "512"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  container_definitions    = local.alertmanager_def
}

resource "aws_ecs_service" "alertmanager" {
  name            = "${var.project_name}-alertmanager"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.alertmanager.arn
  desired_count   = 1
  network_configuration {
    subnets = module.vpc.private_subnets
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
}

resource "aws_ecs_task_definition" "pgadmin" {
  family                   = "${var.project_name}-pgadmin"
  cpu                      = "256"
  memory                   = "512"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  container_definitions    = local.pgadmin_def
}

resource "aws_ecs_service" "pgadmin" {
  name            = "${var.project_name}-pgadmin"
  cluster         = aws_ecs_cluster.cluster.id
  task_definition = aws_ecs_task_definition.pgadmin.arn
  desired_count   = 1
  network_configuration {
    subnets = module.vpc.private_subnets
    security_groups = [aws_security_group.ecs_tasks.id]
    assign_public_ip = false
  }
}

####################
# RDS Postgres
####################
resource "aws_db_subnet_group" "postgres" {
  name       = "${var.project_name}-db-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_db_instance" "postgres" {
  identifier              = "${var.project_name}-postgres"
  engine                  = "postgres"
  engine_version          = "14"
  instance_class          = var.db_instance_class
  allocated_storage       = 20
  name                    = var.db_name
  username                = var.db_username
  password                = var.db_password
  skip_final_snapshot     = true
  publicly_accessible     = false
  db_subnet_group_name    = aws_db_subnet_group.postgres.name
  vpc_security_group_ids  = [aws_security_group.ecs_tasks.id]
  apply_immediately       = true
}

####################
# ElastiCache Redis (single node)
####################
resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.project_name}-redis-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${var.project_name}-redis"
  engine               = "redis"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.ecs_tasks.id]
}

####################
# Outputs
####################
output "alb_dns" {
  value = aws_lb.alb.dns_name
}

output "postgres_endpoint" {
  value = aws_db_instance.postgres.address
}

output "redis_endpoint" {
  value = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "ecr_frontend" {
  value = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend" {
  value = aws_ecr_repository.backend.repository_url
}

# NOTE: Kafka / MSK not included in this main.tf by default. See next section on Kafka.
