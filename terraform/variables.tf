variable "aws_region" {
  description = "AWS region where infrastructure resources are provisioned"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "cluster_name" {
  description = "Name of the Amazon EKS cluster"
  type        = string
  default     = "bugboard-eks"
}

variable "vpc_cidr" {
  description = "IPv4 CIDR block for the dedicated VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "List of CIDR blocks for public subnets (minimum 2 across distinct AZs)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "List of CIDR blocks for private subnets hosting EKS worker nodes"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.20.0/24"]
}

variable "node_instance_types" {
  description = "EC2 instance types for EKS managed worker node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "desired_capacity" {
  description = "Desired number of worker nodes in the EKS node group"
  type        = number
  default     = 2
}

variable "min_capacity" {
  description = "Minimum number of worker nodes in the auto-scaling group"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum number of worker nodes in the auto-scaling group"
  type        = number
  default     = 3
}
