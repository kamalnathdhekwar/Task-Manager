module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.17.2"  # Updated to work with AWS provider 5.x

  cluster_name    = "task-management-cluster"
  cluster_version = var.kubernetes_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    main = {
      name = "task-management-nodes"
      
      instance_types = [var.node_instance_type]
      min_size      = var.node_min_capacity
      max_size      = var.node_max_capacity
      desired_size  = var.node_desired_capacity

      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size = 50
            volume_type = "gp3"
            encrypted   = true
          }
        }
      }
    }
  }

  tags = {
    Environment = "production"
    Terraform   = "true"
  }
}