locals {
  ai_function_source = "./genai-lambda-package.zip"
  src_bucket         = "demo-kb-usw2-lex-web-ui"
}

resource "aws_s3_object" "ai_function" {
  bucket = local.src_bucket
  key    = "${filemd5(local.ai_function_source)}.zip"
  source = local.ai_function_source
}

module "ai_lambda_function" {
  source = "terraform-aws-modules/lambda/aws"

  function_name = "genai-demo-lambda"
  description   = "lambda function to interact with AI"
  handler       = "index.lambda_handler"
  runtime       = "python3.12"
  timeout       = "240"

  publish = true
  environment_variables = {
    PROJECT     = "vpatoka-poc",
    FallbackIntent = "genai-demo-lambda"
  }

  create_package      = false
  s3_existing_package = {
    bucket = local.src_bucket
    key    = aws_s3_object.ai_function.id
  }

  attach_policy_statements = true
  policy_statements = {
    cloud_watch = {
      effect    = "Allow",
      actions   = ["cloudwatch:PutMetricData"],
      resources = ["*"]
    },
    lambda = {
      effect    = "Allow",
      actions   = ["lambda:InvokeFunction"],
      resources = ["*"]
    },
    ai = {
      effect    = "Allow",
      actions   = ["bedrock:InvokeModel"],
      resources = ["arn:aws:bedrock:*::foundation-model/*"]
    }
  }
}

# Gives an external source Lex permission to access the Lambda function.
# We need our bot to be able to invoke a lambda function when
# we attempt to fulfill our intent.
resource "aws_lambda_permission" "allow_lex" {
  statement_id  = "AllowExecutionFromLex"
  action        = "lambda:InvokeFunction"
  function_name = "${module.ai_lambda_function.lambda_function_name}"
  principal     = "lex.amazonaws.com"
}
