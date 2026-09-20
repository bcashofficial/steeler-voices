# voices-de on AWS — one image, one EventBridge schedule per pipeline.
# Sketch: it plans cleanly against a cluster and VPC that already exist and
# is not applied for this submission.

variable "cluster_arn" {}
variable "subnets" { type = list(string) }
variable "security_group" {}
variable "image" { default = "voices-de:latest" }
variable "backend_url" {}
variable "internal_api_key_secret_arn" {}

locals {
  pipelines = {
    ingest     = "rate(10 minutes)"
    ingest_rss = "rate(15 minutes)"
    schedule   = "cron(0 10 * * ? *)"
    embed      = "rate(15 minutes)"
    tag        = "rate(1 hour)"
    project    = "rate(1 hour)"
    cluster    = "rate(1 hour)"
    generate   = "cron(0 10 ? * TUE *)"
  }
}

resource "aws_cloudwatch_log_group" "pipelines" {
  name              = "/steeler-voices/voices-de"
  retention_in_days = 14
}

resource "aws_ecs_task_definition" "pipeline" {
  family                   = "voices-de"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 1024
  memory                   = 2048
  container_definitions = jsonencode([{
    name        = "pipeline"
    image       = var.image
    essential   = true
    environment = [{ name = "BACKEND_URL", value = var.backend_url }, { name = "PIPELINE_HOST", value = "remote" }]
    secrets     = [{ name = "INTERNAL_API_KEY", valueFrom = var.internal_api_key_secret_arn }]
    logConfiguration = {
      logDriver = "awslogs"
      options   = { awslogs-group = aws_cloudwatch_log_group.pipelines.name, awslogs-region = "us-east-1", awslogs-stream-prefix = "run" }
    }
  }])
}

resource "aws_scheduler_schedule" "pipeline" {
  for_each            = local.pipelines
  name                = "voices-de-${each.key}"
  schedule_expression = each.value
  flexible_time_window { mode = "OFF" }
  target {
    arn      = var.cluster_arn
    role_arn = aws_iam_role.scheduler.arn
    ecs_parameters {
      task_definition_arn = aws_ecs_task_definition.pipeline.arn
      launch_type         = "FARGATE"
      network_configuration {
        subnets          = var.subnets
        security_groups  = [var.security_group]
        assign_public_ip = true
      }
    }
    input = jsonencode({ containerOverrides = [{ name = "pipeline", command = ["python", "-m", "pipelines.${each.key}.main"] }] })
  }
}

resource "aws_iam_role" "scheduler" {
  name               = "voices-de-scheduler"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "scheduler.amazonaws.com" }, Action = "sts:AssumeRole" }] })
}
