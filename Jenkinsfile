pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        SONARQUBE_TOKEN = credentials('sonar-token')
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

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=task-manager \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://<your-ec2-ip>:9000 \
                        -Dsonar.login=$SONARQUBE_TOKEN
                    '''
                }
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
                sh '''
                    trivy image $BACKEND_IMAGE --format html -o backend-trivy-report.html || true
                    trivy image $FRONTEND_IMAGE --format html -o frontend-trivy-report.html || true
                '''
            }
        }

        stage('Login to Docker Hub') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                sh 'docker push $BACKEND_IMAGE'
                sh 'docker push $FRONTEND_IMAGE'
            }
        }

        stage('Archive Reports') {
            steps {
                archiveArtifacts artifacts: '*.html', allowEmptyArchive: true
            }
        }
    }

    post {
        success {
            echo '✅ Build, Analysis, and Push completed successfully!'
        }
        failure {
            echo '❌ Build failed! Check logs and reports.'
        }
    }
}
