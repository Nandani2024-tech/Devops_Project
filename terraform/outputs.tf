output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = aws_vpc.main.id
}

output "public_subnets" {
  description = "List of IDs of the provisioned public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnets" {
  description = "List of IDs of the provisioned private subnets"
  value       = aws_subnet.private[*].id
}

output "eks_cluster_name" {
  description = "The name of the Amazon EKS cluster"
  value       = aws_eks_cluster.main.name
}

output "eks_cluster_endpoint" {
  description = "The Kubernetes API server endpoint URL for the EKS cluster"
  value       = aws_eks_cluster.main.endpoint
}

output "eks_cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster control plane"
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}
