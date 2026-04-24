pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'todo_app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = 'shahdelwan'

        APP_PORT = '8082'
        APP_NAME = 'todo_app'
    }

    stages {
        stage('Clone the repo from github') {
            steps {
                echo '1. Cloning repository...'
                checkout scm
                sh 'ls -la'
            }
        }
        
        stage('Build the docker image') {
            steps {
                echo '2. Building Docker image...'
                sh """
                    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                    docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                """
            }
        }
        
        stage('Deploy') {
            steps {
                echo '3. Deploying container...'
                sh """
                    docker stop ${APP_NAME} || true
                    docker rm ${APP_NAME} || true

                    docker run -d \
                        --name ${APP_NAME} \
                        -p ${APP_PORT}:80 \
                        --restart unless-stopped \
                        --label "prometheus.scrape=true" \
                        --label "prometheus.port=80" \
                        --label "prometheus.path=/health" \
                        ${DOCKER_IMAGE}:latest
                """
                
                script {
                    timeout(time: 30, unit: 'SECONDS') {
                        waitUntil {
                            def status = sh(script: "docker inspect --format='{{.State.Health.Status}}' ${APP_NAME} 2>/dev/null || echo 'starting'", returnStdout: true).trim()
                            echo "Container health: ${status}"
                            return status == 'healthy'
                        }
                    }
                }
            }
        }
        
        stage('Push to DockerHub') {
            when {
                expression { return env.DOCKER_REGISTRY != '' }
            }
            steps {
                echo '4. Pushing image to Docker Hub...'
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest
                        docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest
                        docker logout
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
            script {
                try {
                    withCredentials([string(credentialsId: 'telegram-bot-token', variable: 'TOKEN')]) {
                        withCredentials([string(credentialsId: 'telegram-chat-id', variable: 'CHAT_ID')]) {
                            sh """
                                curl -s -X POST https://api.telegram.org/bot\${TOKEN}/sendMessage \
                                    -d chat_id=\${CHAT_ID} \
                                    -d text="Build #${env.BUILD_NUMBER} SUCCEEDED!\\nApp: http://localhost:${APP_PORT}"
                            """
                        }
                    }
                } catch(Exception e) {
                    echo "Telegram notification failed: ${e.getMessage()}"
                }
                
                try {
                    withCredentials([string(credentialsId: 'slack-webhook-url', variable: 'SLACK_URL')]) {
                        sh """
                            curl -X POST -H 'Content-type: application/json' \
                                --data '{"text":"Build #${env.BUILD_NUMBER} succeeded! App ready at http://localhost:${APP_PORT}"}' \
                                \${SLACK_URL}
                        """
                    }
                } catch(Exception e) {
                    echo "Slack notification failed: ${e.getMessage()}"
                }
            }
        }
        
        failure {
            echo 'Pipeline failed!'
            script {
                try {
                    withCredentials([string(credentialsId: 'telegram-bot-token', variable: 'TOKEN')]) {
                        withCredentials([string(credentialsId: 'telegram-chat-id', variable: 'CHAT_ID')]) {
                            sh """
                                curl -s -X POST https://api.telegram.org/bot\${TOKEN}/sendMessage \
                                    -d chat_id=\${CHAT_ID} \
                                    -d text="Build #${env.BUILD_NUMBER} FAILED!\\nCheck: ${env.BUILD_URL}"
                            """
                        }
                    }
                } catch(Exception e) {
                    echo "Telegram notification failed: ${e.getMessage()}"
                }
                
                try {
                    withCredentials([string(credentialsId: 'slack-webhook-url', variable: 'SLACK_URL')]) {
                        sh """
                            curl -X POST -H 'Content-type: application/json' \
                                --data '{"text":"Build #${env.BUILD_NUMBER} FAILED! See ${env.BUILD_URL}"}' \
                                \${SLACK_URL}
                        """
                    }
                } catch(Exception e) {
                    echo "Slack notification failed: ${e.getMessage()}"
                }
            }
        }
        
        always {
            echo 'Pipeline execution finished'
            sh '''
                docker image prune -f || true
                docker images ${DOCKER_IMAGE} --format "{{.Tag}}" | grep -E '^[0-9]+$' | sort -rn | tail -n +6 | xargs -r docker rmi 2>/dev/null || true
            '''
        }
    }
}