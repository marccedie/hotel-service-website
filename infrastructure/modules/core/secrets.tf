resource "random_bytes" "jwe_secret" {
  length = 16
}

resource "aws_secretsmanager_secret" "backend" {
  name        = "${var.resource_prefix}/backend/prod"
  description = "Production settings secret for the backend"
}

resource "aws_secretsmanager_secret_version" "example" {
  secret_id = aws_secretsmanager_secret.backend.id
  secret_string = jsonencode({
    server_jwe_secret_key       = random_bytes.jwe_secret.hex,
    server_google_client_id     = var.google_oauth_client_id,
    server_google_client_secret = var.google_oauth_client_secret,
    server_captcha_secret_key   = cloudflare_turnstile_widget.example.secret,
  })

  depends_on = [random_bytes.jwe_secret, cloudflare_turnstile_widget.example]
}


resource "aws_secretsmanager_secret" "accounts" {
  name        = "${var.resource_prefix}/accounts/prod"
  description = "Production settings secret for the accounts edge server."
}

resource "aws_secretsmanager_secret_version" "accounts" {
  secret_id = aws_secretsmanager_secret.accounts.id
  secret_string = jsonencode({
    jwe_secret_key = random_bytes.jwe_secret.hex,
  })

  depends_on = [random_bytes.jwe_secret, ]
}


resource "aws_secretsmanager_secret" "seeker_portal" {
  name        = "${var.resource_prefix}/seeker_portal/prod"
  description = "Production settings secret for the seeker portal edge server."
}

resource "aws_secretsmanager_secret_version" "seeker_portal" {
  secret_id = aws_secretsmanager_secret.seeker_portal.id
  secret_string = jsonencode({
    jwe_secret_key = random_bytes.jwe_secret.hex,
  })

  depends_on = [random_bytes.jwe_secret, ]
}

resource "aws_secretsmanager_secret" "recruiter_portal" {
  name        = "${var.resource_prefix}/recruiter_portal/prod"
  description = "Production settings secret for the recruiter portal edge server."
}

resource "aws_secretsmanager_secret_version" "recruiter_portal" {
  secret_id = aws_secretsmanager_secret.recruiter_portal.id
  secret_string = jsonencode({
    jwe_secret_key = random_bytes.jwe_secret.hex,
  })

  depends_on = [random_bytes.jwe_secret, ]
}
