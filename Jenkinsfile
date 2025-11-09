pipeline {
    agent any

    environment {
        // Jenkins credentials IDs
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')

        // Docker images
        FRONTEND_IMAGE = "kamalnathd/task-frontend"
        BACKEND_IMAGE  = "kamalnathd/task-backend"
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

        stage('Archive Reports') {
            steps {
                echo "📄 Archiving Trivy reports..."
                archiveArtifacts artifacts: 'trivy-reports/*.txt', fingerprint: true
            }
        }
    }

    post {
        success {
            echo '✅ Build, scan, and push completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed! Check logs and reports for details.'
        }
    }
}
