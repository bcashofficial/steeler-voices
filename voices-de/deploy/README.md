# Remote schedule (shown, not applied)

Locally the scheduler fires the pipelines while `make dev` runs. Remotely
the same schedules are EventBridge rules, each starting the same image as
a one-shot ECS Fargate task with a different command:

```
EventBridge rule (remote_schedule) ──▶ ECS RunTask ──▶ voices-de image
                                                      command: python -m pipelines.<key>.main
                                                      env:     BACKEND_URL, OLLAMA_BASE_URL (SSM)
                                                      secrets: INTERNAL_API_KEY (Secrets Manager)
```

`main.tf` is the Terraform for it: one task definition, one rule and one
target per pipeline, driven by the same table the app shows. A total-run
failure exits non-zero so CloudWatch surfaces it; the next rule firing is
the retry.
