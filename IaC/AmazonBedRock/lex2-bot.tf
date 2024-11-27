data "aws_partition" "current" {}

resource "aws_iam_role" "VladsBot" {
  name = "vpatoka-ai-poc"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lexv2.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "special_lex2_policy" {
  name = "SpecialAmazoLex2Policy_${var.kb_name}"
  role = aws_iam_role.VladsBot.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = [ "iam:AttachRolePolicy", "iam:PutRolePolicy", "iam:GetRolePolicy" ]
        Effect   = "Allow"
        Resource = "arn:${local.partition}:iam::*:role/aws-service-role/lexv2.amazonaws.com/AWSServiceRoleForLexBots*"
      },
      {
        Action   = "iam:ListRoles"
        Effect   = "Allow"
        Resource = "*"
      },
      {
        #Sid = "Permissions to invoke Lambda
        Action   = "lambda:InvokeFunction"
        Effect   = "Allow"
        Resource = "*"
      },
      {
        #Sid = "Permissions to invoke Amazon Bedrock foundation models"
        Action   = "bedrock:InvokeModel"
        Effect   = "Allow"
        #Resource = data.aws_bedrock_foundation_model.kb.model_arn
        Resource = "arn:${local.partition}:bedrock:${local.region}::foundation-model/${var.response_foundation_model}"
      },
      {
        #Sid = "Permissions to access knowledge base in Amazon Bedrock"
        Action   = "bedrock:Retrieve"
        Effect   = "Allow"
        Resource = "arn:${local.partition}:bedrock:*:${local.account_id}:knowledge-base/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "VladsBot" {
  role       = aws_iam_role.VladsBot.name
  policy_arn = "arn:${data.aws_partition.current.partition}:iam::aws:policy/AmazonLexFullAccess"
}

resource "aws_lexv2models_bot" "VladsBot" {
  name                        = "vpatoka-ai-poc"
  idle_session_ttl_in_seconds = 300
  role_arn                    = aws_iam_role.VladsBot.arn

  data_privacy {
    child_directed = false
  }
}

resource "aws_lexv2models_bot_locale" "VladsBot" {
  locale_id                        = "en_US"
  bot_id                           = aws_lexv2models_bot.VladsBot.id
  bot_version                      = "DRAFT"
  n_lu_intent_confidence_threshold = 0.4

  voice_settings {
    voice_id = "Danielle"
    engine   = "neural"
  }
}

resource "aws_lexv2models_bot_version" "VladsBot" {
  bot_id = aws_lexv2models_bot.VladsBot.id
  locale_specification = {
    (aws_lexv2models_bot_locale.VladsBot.locale_id) = {
      source_bot_version = "DRAFT"
    }
  }
}


/* Alternative way to create LEX v2 Bot
Another option is to use the AWS CLI in Terraform through local execution provisioners.
While this method can work effectively, it requires the AWS CLI to be installed on the host executing Terraform, 
which might introduce additional dependencies.
*/

/*
resource "null_resource" "create-endpoint" {
  provisioner "local-exec" {
    command = " aws lexv2-models create-bot --bot-name "vpatoka-ai-poc" --role-arn <role> --data-privacy <value> --cli-input-json file://<file.json>"
  }
}

*/
