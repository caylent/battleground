variable "kb_s3_bucket_name_prefix" {
  description = "The name prefix of the S3 bucket for the data source of the knowledge base."
  type        = string
  default     = "demo-kb"
}

variable "kb_oss_collection_name" {
  description = "The name of the OSS collection for the knowledge base."
  type        = string
  default     = "bedrock-knowledge-base-demo-kb"
}

variable "kb_model_id" {
  description = "The ID of the foundational model used by the knowledge base."
  type        = string
  default     = "amazon.titan-embed-text-v1"
}

variable "kb_name" {
  description = "The knowledge base name."
  type        = string
  default     = "DemoKB"
}

variable "agent_model_id" {
  description = "The ID of the foundational model used by the agent."
  type        = string
  default     = "anthropic.claude-3-haiku-20240307-v1:0"
}

variable "action_group_desc" {
  description = "The action group description."
  type        = string
  default     = "The action group description"
}

variable "response_foundation_model" {
  description = "The response foundation model."
  type        = string
  default     = "anthropic.claude-3-haiku-20240307-v1:0"
}


