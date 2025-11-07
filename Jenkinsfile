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
                git 'https://github.com/<your-username>/<your-repo>.git'
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
            echo '✅ Docker images built and pushed successfully!'
        }
        failure {
            echo '❌ Build failed! Check logs.'
        }
    }
}
