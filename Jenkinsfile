pipeline {
    agent any

    environment {
        REGISTRY = "docker.io" // Change if using AWS ECR or another registry
        IMAGE_NAME = "wasimakramshaik/fhbp-frontend"
        DOCKER_CREDS = credentials('dockerhub-credentials') // Jenkins credential ID
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies & Build Test') {
            steps {
                sh '''
                    cd frontend
                    npm ci
                    npm run build
                '''
            }
        }

        stage('Build and Push Docker Image') {
            steps {
                script {
                    // Log in to Docker registry using Jenkins credentials
                    sh 'echo $DOCKER_CREDS_PSW | docker login $REGISTRY -u $DOCKER_CREDS_USR --password-stdin'
                    
                    // Build image pointing to your frontend Dockerfile location
                    app = docker.build("${IMAGE_NAME}:${env.BUILD_NUMBER}", "-f infrastructure/docker/Dockerfile.frontend .")
                    
                    // Push the tagged build and latest reference
                    app.push("${env.BUILD_NUMBER}")
                    app.push("latest")
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}