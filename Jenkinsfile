pipeline {
    agent any

    environment {
        // Jenkins credentials IDs (create in Jenkins > Manage Credentials)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        SONARQUBE_TOKEN = credentials('sonar-token')

        // Docker images
        FRONTEND_IMAGE = "kamalnathd/task-frontend"
        BACKEND_IMAGE  = "kamalnathd/task-backend"

        // SonarQube server
        SONAR_HOST_URL = "http://3.145.50.62:9000"
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

        stage('SonarQube Analysis') {
    steps {
        echo "🔍 Running SonarQube analysis..."
        sh '''
            echo "Cleaning up old Trivy reports..."
            sudo rm -rf trivy-reports || true

            docker run --rm \
              -e SONAR_HOST_URL=$SONAR_HOST_URL \
              -e SONAR_TOKEN=$SONARQUBE_TOKEN \
              -v "$(pwd)":/usr/src \
              sonarsource/sonar-scanner-cli \
              -Dsonar.projectKey=task-manager \
              -Dsonar.sources=. \
              -Dsonar.exclusions=trivy-reports/**,**/node_modules/**,**/fanal/**,**/.git/**
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
