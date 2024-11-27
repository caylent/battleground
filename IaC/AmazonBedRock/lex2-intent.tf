# Generic Custom Intent needs to be presented
resource "aws_lexv2models_intent" "Newintent" {
  bot_id      = aws_lexv2models_bot.VladsBot.id
  bot_version = aws_lexv2models_bot_locale.VladsBot.bot_version
  name        = "Newintent"
  locale_id   = aws_lexv2models_bot_locale.VladsBot.locale_id

  #dialog_code_hook {
  #  enabled = true
  #}

  sample_utterance {
    utterance = "Hello"
  }
  sample_utterance {
    utterance = "Howdy"
  }
  sample_utterance {
    utterance = "Hi"
  }
  sample_utterance {
    utterance = "Bonjour"
  }
}

/*
Amazon Lex V2 offers a built-in AMAZON.QnAIntent that you can add to your bot. 
This intent harnesses generative AI capabilities from Amazon Bedrock by recognizing customer questions and
searching for an answer from the following knowledge stores 
(for example, Can you provide me details on the baggage limits for my international flight?). 
This feature reduces the need to configure questions and answers using task-oriented dialogue within Amazon Lex V2 intents. 
This intent also recognizes follow-up questions 
(for example, What about domestic flight?) based on the conversation history and provides the answer accordingly.
*/
#resource "aws_lexv2models_intent" "QnAIntent" {
#  bot_id      = aws_lexv2models_bot.VladsBot.id
#  bot_version = aws_lexv2models_bot_locale.VladsBot.bot_version
#  name        = "QnAIntent"
#  locale_id   = aws_lexv2models_bot_locale.VladsBot.locale_id
#
#  parent_intent_signature = "AMAZON.QnAIntent"
#
#  QnAIntentConfiguration {
#    dataSourceConfiguration = {
#      bedrockKnowledgeStoreConfiguration = {
#        "bedrockKnowledgeBaseArn" = "${aws_bedrockagent_knowledge_base.demo_kb.arn}"
#      }
#    }
#  }
#
#}

# Update Bot with tweaked intents and alias to use Lambda
resource "null_resource" "VladsBot" {
  depends_on = [aws_lexv2models_bot_version.VladsBot]

  triggers = {
    bot_id         = aws_lexv2models_bot.VladsBot.id
    locale_id      = aws_lexv2models_bot_locale.VladsBot.locale_id
    latest_version = aws_lexv2models_bot_version.VladsBot.bot_version
    lambda_arn     = "${module.ai_lambda_function.lambda_function_arn}"

    always_run = timestamp()
  }

  provisioner "local-exec" {
    #command = "./bot_update.sh ${aws_lexv2models_bot.VladsBot.id} ${aws_lexv2models_bot_locale.VladsBot.locale_id} ${aws_lexv2models_bot_version.VladsBot.bot_version} '${module.ai_lambda_function.lambda_function_arn}'"
    command = "./bot_update.sh ${aws_lexv2models_bot.VladsBot.id} ${aws_lexv2models_bot_locale.VladsBot.locale_id} 'DRAFT' '${module.ai_lambda_function.lambda_function_arn}' ${aws_bedrockagent_knowledge_base.demo_kb.arn}"
  }
}
