pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        AWS_CREDENTIALS       = credentials('aws-credentials')
        FRONTEND_IMAGE        = "kamalnathd/task-frontend"
        BACKEND_IMAGE         = "kamalnathd/task-backend"
        CLUSTER_NAME          = "task-management-cluster"
        AWS_REGION            = "us-east-2"
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
                withEnv([
                    "AWS_ACCESS_KEY_ID=${AWS_CREDENTIALS_USR}",
                    "AWS_SECRET_ACCESS_KEY=${AWS_CREDENTIALS_PSW}",
                    "AWS_DEFAULT_REGION=${AWS_REGION}"
                ]) {
                    dir('infra/terraform/eks') {
                        sh '''
                            terraform init -input=false
                            terraform apply -auto-approve -input=false
                        '''
                    }
                }
            }
        }

        stage('Configure AWS & EKS') {
            steps {
                echo "⚙️ Configuring AWS CLI and EKS kubeconfig..."
                withEnv([
                    "AWS_ACCESS_KEY_ID=${AWS_CREDENTIALS_USR}",
                    "AWS_SECRET_ACCESS_KEY=${AWS_CREDENTIALS_PSW}",
                    "AWS_DEFAULT_REGION=${AWS_REGION}"
                ]) {
                    sh '''
                        aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME
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
                echo "🧪 Scanning Docker images with Trivy..."
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

        stage('Login & Push to Docker Hub') {
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
                withEnv([
                    "AWS_ACCESS_KEY_ID=${AWS_CREDENTIALS_USR}",
                    "AWS_SECRET_ACCESS_KEY=${AWS_CREDENTIALS_PSW}",
                    "AWS_DEFAULT_REGION=${AWS_REGION}"
                ]) {
                    sh '''
                        aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME

                        echo "📦 Applying Kubernetes manifests..."
                        kubectl apply -f k8s/ --validate=false

                        echo "⏳ Waiting for rollouts..."
                        kubectl rollout status deployment/backend-deployment
                        kubectl rollout status deployment/frontend-deployment

                        echo "🔍 Current Pods and Services:"
                        kubectl get pods -o wide
                        kubectl get svc -o wide

                        echo "🌐 Frontend LoadBalancer URL:"
                        kubectl get svc frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
                        echo ""
                    '''
                }
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
