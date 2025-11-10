pipeline {
    agent any

    environment {
        // Docker Hub credentials from Jenkins
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')

        // Docker images
        FRONTEND_IMAGE = "kamalnathd/task-frontend"
        BACKEND_IMAGE  = "kamalnathd/task-backend"

        // AWS & EKS details
        AWS_REGION = "us-east-2"
        CLUSTER_NAME = "task-management-cluster"

        // Terraform directory
        TF_DIR = "infra/terraform/eks"
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

        stage('Terraform Init & Apply') {
            steps {
                echo "🏗️ Setting up EKS infrastructure..."
                dir("${TF_DIR}") {
                    sh '''
                        terraform init
                        terraform apply -auto-approve
                    '''
                }
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
                echo "🧪 Scanning Docker images..."
                sh '''
                    mkdir -p trivy-reports

                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v $WORKSPACE/trivy-reports:/reports \
                      aquasec/trivy image $BACKEND_IMAGE:latest \
                      --format table --output /reports/backend-report.txt

                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v $WORKSPACE/trivy-reports:/reports \
                      aquasec/trivy image $FRONTEND_IMAGE:latest \
                      --format table --output /reports/frontend-report.txt
                '''
            }
        }

        stage('Login to Docker Hub') {
            steps {
                echo "🔐 Logging in to Docker Hub..."
                sh '''
                    echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                echo "☁️ Pushing images to Docker Hub..."
                sh '''
                    docker push $BACKEND_IMAGE:latest
                    docker push $FRONTEND_IMAGE:latest
                '''
            }
        }

        stage('Deploy to EKS') {
            steps {
                echo "🚀 Deploying to EKS cluster..."
                sh '''
                    aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME

                    # Apply all manifests in k8s folder
                    kubectl apply -f k8s/

                    # Restart deployments to pick latest Docker Hub images
                    kubectl rollout restart deployment backend-deployment
                    kubectl rollout restart deployment frontend-deployment

                    # Wait until all pods are ready
                    kubectl get pods -o wide
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
            echo '✅ Build, scan, push, and deploy completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed! Check logs for details.'
        }
    }
}
