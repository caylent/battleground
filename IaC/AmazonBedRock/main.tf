terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.48"
    }
    opensearch = {
      source  = "opensearch-project/opensearch"
      version = "= 2.2.0"
    }
  }
  required_version = "~> 1.5"
}

# Use data sources to get common information about the environment
data "aws_caller_identity" "this" {}
data "aws_partition" "this" {}
data "aws_region" "this" {}

data "aws_bedrock_foundation_model" "agent" {
  model_id = var.agent_model_id
}

# With the service role in place, we can now proceed to define the corresponding IAM policy.
data "aws_bedrock_foundation_model" "kb" {
  model_id = var.kb_model_id
}

locals {
  account_id            = data.aws_caller_identity.this.account_id
  partition             = data.aws_partition.this.partition
  region                = data.aws_region.this.name
  region_name_tokenized = split("-", local.region)
  region_short          = "${substr(local.region_name_tokenized[0], 0, 2)}${substr(local.region_name_tokenized[1], 0, 1)}${local.region_name_tokenized[2]}"
}

locals {
  lambda_ssm_param = "arn:aws:ssm:us-west-2:123456789012:parameter/app/vecdb/temp-creds"

  common_tags = {
    Description    = "Vlad's Retrieval-Augmented Generationi tests"
    CreatedBy      = "Vlad Patoka"
    Terraform      = "true"
    TerraformStack = local.stack_name
  }
}

# Vlad's AWS BedRock

# Knowledge base resource role
resource "aws_iam_role" "bedrock_kb_demo_kb" {
  name = "AmazonBedrockExecutionRoleForKnowledgeBase_${var.kb_name}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "bedrock.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = local.account_id
          }
          ArnLike = {
            "aws:SourceArn" = "arn:${local.partition}:bedrock:${local.region}:${local.account_id}:knowledge-base/*"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "bedrock_kb_demo_kb_model" {
  name = "AmazonBedrockFoundationModelPolicyForKnowledgeBase_${var.kb_name}"
  role = aws_iam_role.bedrock_kb_demo_kb.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        #Sid = "Permissions to invoke Amazon Bedrock foundation models"
        Action   = "bedrock:InvokeModel"
        Effect   = "Allow"
        Resource = data.aws_bedrock_foundation_model.kb.model_arn
      },
      {
        #Sid = "Permissions to access knowledge base in Amazon Bedrock"
        Action   = "bedrock:Retrieve"
        Effect   = "Allow"
        Resource = "arn:${local.partition}:bedrock:${local.region}:${local.account_id}:knowledge-base/*"
      }
    ]
  })
}

/*
We create the Amazon S3 bucket that acts as the data source for the knowledge base 
using the aws_s3_bucket resource. To adhere to security best practices, we also enable S3-SSE
*/

# S3 bucket for the knowledge base
resource "aws_s3_bucket" "demo_kb" {
  bucket        = "${var.kb_s3_bucket_name_prefix}-${local.region_short}-${local.account_id}"
  force_destroy = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "demo_kb" {
  bucket = aws_s3_bucket.demo_kb.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "demo_kb" {
  bucket = aws_s3_bucket.demo_kb.id
  versioning_configuration {
    status = "Enabled"
  }
  depends_on = [aws_s3_bucket_server_side_encryption_configuration.demo_kb]
}

# Now that the S3 bucket is available, we can create the IAM policy that gives
resource "aws_iam_role_policy" "bedrock_kb_demo_kb_s3" {
  name = "AmazonBedrockS3PolicyForKnowledgeBase_${var.kb_name}"
  role = aws_iam_role.bedrock_kb_demo_kb.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "S3ListBucketStatement"
        Action   = "s3:ListBucket"
        Effect   = "Allow"
        Resource = aws_s3_bucket.demo_kb.arn
        Condition = {
          StringEquals = {
            "aws:PrincipalAccount" = local.account_id
          }
      } },
      {
        Sid      = "S3GetObjectStatement"
        Action   = "s3:GetObject"
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.demo_kb.arn}/*"
        Condition = {
          StringEquals = {
            "aws:PrincipalAccount" = local.account_id
          }
        }
      }
    ]
  })
}

/*
This data access policy provides read and write permissions to the vector 
search collection and its indices to the knowledge base execution role and the creator of the policy.

Note that aoss:DeleteIndex was added to the list because this is required for cleanup by Terraform via terraform destroy.
*/
resource "aws_opensearchserverless_access_policy" "demo_kb" {
  name = var.kb_oss_collection_name
  type = "data"
  policy = jsonencode([
    {
      Rules = [
        {
          ResourceType = "index"
          Resource = [
            "index/${var.kb_oss_collection_name}/*"
          ]
          Permission = [
            "aoss:CreateIndex",
            "aoss:DeleteIndex", # Required for Terraform
            "aoss:DescribeIndex",
            "aoss:ReadDocument",
            "aoss:UpdateIndex",
            "aoss:WriteDocument"
          ]
        },
        {
          ResourceType = "collection"
          Resource = [
            "collection/${var.kb_oss_collection_name}"
          ]
          Permission = [
            "aoss:CreateCollectionItems",
            "aoss:DescribeCollectionItems",
            "aoss:UpdateCollectionItems"
          ]
        }
      ],
      Principal = [
        aws_iam_role.bedrock_kb_demo_kb.arn,
        data.aws_caller_identity.this.arn
      ]
    }
  ])
}

# This encryption policy simply assigns an AWS-owned key to the vector search collection
resource "aws_opensearchserverless_security_policy" "demo_kb_encryption" {
  name = var.kb_oss_collection_name
  type = "encryption"
  policy = jsonencode({
    Rules = [
      {
        Resource = [
          "collection/${var.kb_oss_collection_name}"
        ]
        ResourceType = "collection"
      }
    ],
    AWSOwnedKey = true
  })
}

/*
We need a network policy which defines whether a collection is accessible publicly or privately

This network policy allows public access to the vector search collection's API endpoint 
and dashboard over the internet
*/
resource "aws_opensearchserverless_security_policy" "demo_kb_network" {
  name = var.kb_oss_collection_name
  type = "network"
  policy = jsonencode([
    {
      Rules = [
        {
          ResourceType = "collection"
          Resource = [
            "collection/${var.kb_oss_collection_name}"
          ]
        },
        {
          ResourceType = "dashboard"
          Resource = [
            "collection/${var.kb_oss_collection_name}"
          ]
        }
      ]
      AllowFromPublic = true
    }
  ])
}

# Creating the collection
resource "aws_opensearchserverless_collection" "demo_kb" {
  name = var.kb_oss_collection_name
  type = "VECTORSEARCH"
  depends_on = [
    aws_opensearchserverless_access_policy.demo_kb,
    aws_opensearchserverless_security_policy.demo_kb_encryption,
    aws_opensearchserverless_security_policy.demo_kb_network
  ]
}

# The knowledge base service role also needs access to the collection
resource "aws_iam_role_policy" "bedrock_kb_demo_kb_oss" {
  name = "AmazonBedrockOSSPolicyForKnowledgeBase_${var.kb_name}"
  role = aws_iam_role.bedrock_kb_demo_kb.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "aoss:APIAccessAll"
        Effect   = "Allow"
        Resource = aws_opensearchserverless_collection.demo_kb.arn
      }
    ]
  })
}

/*
Creating the index in Terraform is however more complex, since it is not an AWS resource but an OpenSearch construct
*/
provider "opensearch" {
  url         = aws_opensearchserverless_collection.demo_kb.collection_endpoint
  healthcheck = false
}

/*
We can create the index using the opensearch_index resource
Note that the dimension is set to 1536, which is the value required for the Titan G1 Embeddings - Text model.
*/
resource "opensearch_index" "demo_kb" {
  name                           = "bedrock-knowledge-base-default-index"
  number_of_shards               = "2"
  number_of_replicas             = "0"
  index_knn                      = true
  index_knn_algo_param_ef_search = "512"
  mappings                       = <<-EOF
    {
      "properties": {
        "bedrock-knowledge-base-default-vector": {
          "type": "knn_vector",
          "dimension": 1536,
          "method": {
            "name": "hnsw",
            "engine": "faiss",
            "parameters": {
              "m": 16,
              "ef_construction": 512
            },
            "space_type": "l2"
          }
        },
        "AMAZON_BEDROCK_METADATA": {
          "type": "text",
          "index": "false"
        },
        "AMAZON_BEDROCK_TEXT_CHUNK": {
          "type": "text",
          "index": "true"
        }
      }
    }
  EOF
  force_destroy                  = true
  depends_on                     = [aws_opensearchserverless_collection.demo_kb]
}

/*
Since Terraform creates resources in quick succession, there is a chance 
that the configuration of the knowledge base service role is not propagated 
across AWS endpoints before it is used by the knowledge base during its creation, 
resulting in temporary permission issues.
*/
resource "time_sleep" "aws_iam_role_policy_bedrock_kb_demo_kb_oss" {
  create_duration = "20s"
  depends_on      = [aws_iam_role_policy.bedrock_kb_demo_kb_oss]
}

/*
Creating the knowledge base
*/
resource "aws_bedrockagent_knowledge_base" "demo_kb" {
  name     = var.kb_name
  role_arn = aws_iam_role.bedrock_kb_demo_kb.arn
  knowledge_base_configuration {
    vector_knowledge_base_configuration {
      embedding_model_arn = data.aws_bedrock_foundation_model.kb.model_arn
    }
    type = "VECTOR"
  }
  storage_configuration {
    type = "OPENSEARCH_SERVERLESS"
    opensearch_serverless_configuration {
      collection_arn    = aws_opensearchserverless_collection.demo_kb.arn
      vector_index_name = "bedrock-knowledge-base-default-index"
      field_mapping {
        vector_field   = "bedrock-knowledge-base-default-vector"
        text_field     = "AMAZON_BEDROCK_TEXT_CHUNK"
        metadata_field = "AMAZON_BEDROCK_METADATA"
      }
    }
  }
  depends_on = [
    aws_iam_role_policy.bedrock_kb_demo_kb_model,
    aws_iam_role_policy.bedrock_kb_demo_kb_s3,
    opensearch_index.demo_kb,
    time_sleep.aws_iam_role_policy_bedrock_kb_demo_kb_oss
  ]
}

/*
We also need to add the data source to the knowledge base
*/
resource "aws_bedrockagent_data_source" "demo_kb" {
  knowledge_base_id = aws_bedrockagent_knowledge_base.demo_kb.id
  name              = "${var.kb_name}DataSource"
  data_source_configuration {
    type = "S3"
    s3_configuration {
      bucket_arn = aws_s3_bucket.demo_kb.arn
    }
  }
}

