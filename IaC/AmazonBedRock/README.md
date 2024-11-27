# AWS BedRock and LEX2 Agents

# *BTW: I am actively looking for a DevOps/Clod Engineer job. Please considering me !*



## Overview

This project demonstrates the use of Terraform to create AWS BedRock and LEX2 agents and establish communication between them. 
Also, Lambda function will be envoked everytime if the LLM will faile to get the answer from the existed Knowledge Base (located on S3)
The goal is to automate the provisioning and configuration of these resources to facilitate seamless interaction.

## Prerequisites
Before you begin, ensure you have the following:
- An AWS account with appropriate permissions.
- Terraform installed on your local machine.
- AWS CLI configured with your credentials.
- Basic knowledge of Terraform and AWS services.
- The S3 bucket with some materials which Knowledge Base will use as a source (RAG)
  

## Project Structure
The project directory is organized as follows:

├── ai_lambda.tf
├── genai-lambda-package.zip
├── lex2-bot.tf
├── lex2-intent.tf
├── main.tf
├── outputs.tf
├── provider.tf
├── README.md
└── variables.tf
