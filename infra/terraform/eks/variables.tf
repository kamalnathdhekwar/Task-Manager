variable "aws_region" {
  default     = "us-east-2"
  description = "AWS region to deploy resources."
}

variable "vpc_cidr" {
  default     = "10.0.0.0/16"
  description = "CIDR block for the VPC."
}

variable "kubernetes_version" {
  default     = "1.32"
  description = "Kubernetes version for EKS cluster."
}

variable "node_instance_type" {
  default     = "t2.medium"
  description = "EC2 instance type for EKS nodes."
}

variable "node_desired_capacity" {
  default     = 2
  description = "Desired number of nodes in the node group."
}

variable "node_min_capacity" {
  default     = 1
  description = "Minimum number of nodes in the node group."
}

variable "node_max_capacity" {
  default     = 3
  description = "Maximum number of nodes in the node group."
}
