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
                script {
                    sh '''
                    docker run --rm \
                      -e SONAR_HOST_URL="http://3.145.50.62:9000" \
                      -e SONAR_TOKEN="$SONARQUBE_TOKEN" \
                      -v "$(pwd)":/usr/src \
                      sonarsource/sonar-scanner-cli \
                      -Dsonar.projectKey=task-manager \
                      -Dsonar.sources=.
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
                script {
                    sh '''
                    mkdir -p $WORKSPACE/trivy-reports
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v $WORKSPACE/trivy-reports:/reports \
                      aquasec/trivy image $BACKEND_IMAGE \
                      --format table --output /reports/backend-report.txt

                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v $WORKSPACE/trivy-reports:/reports \
                      aquasec/trivy image $FRONTEND_IMAGE \
                      --format table --output /reports/frontend-report.txt
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

        stage('Archive Reports') {
            steps {
                archiveArtifacts artifacts: 'trivy-reports/*.txt', fingerprint: true
            }
        }
    }

    post {
        success {
            echo '✅ Build, scan, and push completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed! Check logs and reports.'
        }
    }
}
