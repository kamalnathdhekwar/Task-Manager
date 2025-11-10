output "cluster_id" {
  description = "EKS Cluster ID."
  value       = module.eks.cluster_id
}

output "cluster_endpoint" {
  description = "EKS Control Plane Endpoint."
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security Group ID attached to the EKS control plane."
  value       = module.eks.cluster_security_group_id
}

output "oidc_provider_arn" {
  description = "OIDC Provider ARN for IRSA (IAM Roles for Service Accounts)."
  value       = module.eks.oidc_provider_arn
}

output "region" {
  description = "AWS Region where EKS is deployed."
  value       = var.aws_region
}

output "update_kubeconfig_command" {
  description = "Run this command to update your kubeconfig for EKS cluster access."
  value = (
    module.eks.cluster_id != null ?
    format("aws eks update-kubeconfig --name %s --region %s", module.eks.cluster_id, var.aws_region) :
    "EKS cluster not yet created - run 'terraform apply' or check cluster creation status"
  )
}
