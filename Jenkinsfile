pipeline {
    agent {
        docker {
            image 'hashicorp/terraform:1.9.8' // Terraform + Linux base image
            args '-u root:root -v /var/run/docker.sock:/var/run/docker.sock' // for Docker access
        }
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        AWS_CREDENTIALS = credentials('aws-credentials') // Jenkins AWS creds ID
        FRONTEND_IMAGE = "kamalnathd/task-frontend"
        BACKEND_IMAGE  = "kamalnathd/task-backend"
        CLUSTER_NAME   = "task-management-cluster"
        AWS_REGION     = "us-east-2"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "📦 Checking out source code..."
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: 'https://github.com/kamalnathdhekwar/Task-Manager.git']]
                ])
            }
        }

        stage('Terraform Init & Apply (EKS Infra)') {
            steps {
                echo "🏗️ Setting up EKS infrastructure..."
                dir('infra/terraform/eks') {
                    sh '''
                        terraform init -input=false
                        terraform apply -auto-approve -input=false
                    '''
                }
            }
        }

        stage('Configure AWS & EKS') {
            steps {
                echo "⚙️ Configuring AWS and EKS cluster access..."
                sh '''
                    apk add --no-cache aws-cli kubectl docker-cli bash curl
                    aws configure set aws_access_key_id $AWS_CREDENTIALS_USR
                    aws configure set aws_secret_access_key $AWS_CREDENTIALS_PSW
                    aws configure set default.region $AWS_REGION
                    aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "🐳 Building Docker images..."
                sh '''
                    docker build -t $BACKEND_IMAGE:latest ./backend
                    docker build -t $FRONTEND_IMAGE:latest ./frontend
                '''
            }
        }

        stage('Scan Docker Images with Trivy') {
            steps {
                echo "🧪 Scanning Docker images with Trivy..."
                sh '''
                    mkdir -p trivy-reports

                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        -v $WORKSPACE/trivy-reports:/reports \
                        aquasec/trivy image $BACKEND_IMAGE:latest \
                        --format table --output /reports/backend-report.txt

                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        -v $WORKSPACE/trivy-reports:/reports \
                        aquasec/trivy image $FRONTEND_IMAGE:latest \
                        --format table --output /reports/frontend-report.txt
                '''
            }
        }

        stage('Login to Docker Hub & Push Images') {
            steps {
                echo "☁️ Pushing images to Docker Hub..."
                sh '''
                    echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                    docker push $BACKEND_IMAGE:latest
                    docker push $FRONTEND_IMAGE:latest
                '''
            }
        }

        stage('Deploy to EKS') {
            steps {
                echo "🚀 Deploying to EKS..."
                sh '''
                    cd k8s
                    kubectl apply -f backend-deployment.yaml
                    kubectl apply -f backend-service.yaml
                    kubectl apply -f frontend-deployment.yaml
                    kubectl apply -f frontend-service.yaml

                    echo "✅ Deployment Completed!"
                    kubectl get pods -o wide
                    kubectl get svc -o wide
                '''
            }
        }

        stage('Archive Reports') {
            steps {
                echo "📄 Archiving Trivy reports..."
                archiveArtifacts artifacts: 'trivy-reports/*.txt', fingerprint: true
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed! Check logs for details.'
        }
    }
}
