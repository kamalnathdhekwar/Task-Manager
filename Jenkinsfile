pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        FRONTEND_IMAGE = "kamalnathd/task-frontend"
        BACKEND_IMAGE = "kamalnathd/task-backend"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git 'https://github.com/kamalnathdhekwar/Task-Manager.git'
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

        stage('Scan Docker Images with Trivy') {
            steps {
                script {
                    // Scan backend image
                    sh '''
                    echo "🔍 Scanning backend image..."
                    trivy image --exit-code 1 --severity HIGH,CRITICAL $BACKEND_IMAGE || true
                    '''

                    // Scan frontend image
                    sh '''
                    echo "🔍 Scanning frontend image..."
                    trivy image --exit-code 1 --severity HIGH,CRITICAL $FRONTEND_IMAGE || true
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
        success {
            echo '✅ Docker images built, scanned, and pushed successfully!'
        }
        failure {
            echo '❌ Build failed! Check logs.'
        }
    }
}
