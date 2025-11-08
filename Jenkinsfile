pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        FRONTEND_IMAGE = "kamalnathd/task-frontend"
        BACKEND_IMAGE = "kamalnathd/task-backend"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout([$class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[url: 'https://github.com/kamalnathdhekwar/Task-Manager.git']]
                ])
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker build -t $BACKEND_IMAGE ./backend'
                    sh 'docker build -t $FRONTEND_IMAGE ./frontend'
                }
            }
        }

        stage('Scan with Trivy') {
            steps {
                script {
                    sh '''
                    echo "🔍 Scanning Backend Image with Trivy..."
                    trivy image --exit-code 0 --severity HIGH,CRITICAL --no-progress $BACKEND_IMAGE > trivy-backend-report.txt

                    echo "🔍 Scanning Frontend Image with Trivy..."
                    trivy image --exit-code 0 --severity HIGH,CRITICAL --no-progress $FRONTEND_IMAGE > trivy-frontend-report.txt

                    echo "✅ Trivy scan completed. Reports generated."
                    '''
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                script {
                    sh 'docker push $BACKEND_IMAGE'
                    sh 'docker push $FRONTEND_IMAGE'
                }
            }
        }
    }

    post {
        always {
            echo "📄 Archiving Trivy scan reports..."
            archiveArtifacts artifacts: 'trivy-*.txt', allowEmptyArchive: true
        }
        success {
            echo '✅ Docker images built, scanned, and pushed successfully!'
        }
        failure {
            echo '❌ Build failed! Check logs.'
        }
    }
}
