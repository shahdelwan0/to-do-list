pipeline {
  agent any

  environment {
    DOCKER_IMAGE = 'to-do-list_todo-app:latest'
    DOCKER_TAG = "${env.BUILD_NUMBER}"
    DOCKER_REGISTRY = 'shahdelwan'

    APP_PORT = '8081'
    APP_NAME = 'todo-app'

    SLACK_WEBHOOK = credentials('slack-webhook-url')
    TELEGRAM_BOT_TOKEN = credentials('telegram-bot-token')
    TELEGRAM_CHAT_ID = credentials('telegram-chat-id')
  }

  stages{
      stage ('Clone the repo from github') {
        steps{
            echo '1. Cloning'
            checkout scm
            sh 'ls -la'
        }
      }
      stage('Build the docker image') {
        steps{
            echo '2. Building the image'
            script {
              def image = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
              docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").tag("${DOCKER_IMAGE}:latest")
            }
        }
      }
      stage('Deploy') {
        steps{
            echo '3. Deploying the container'
            script {
              sh "docker stop ${APP_NAME} ||true"
              sh "docker rm ${APP_NAME} || true"

              sh """
                  docker run -d --name ${APP_NAME} \
                  -p ${APP_PORT}:80 \
                  --restart unless-stopped
                  --label "prometheus.scrape=true" \
                  --label "prometheus.port=80" \
                  --label "prometheus.path=/health" \
                    to-do-list_todo-app:latest
               """

              timeout(time: 30, unit: 'SECONDS') {
                waitUntil {
                  def status = sh(script: "docker inspect --format='{{.State.Health.Status}}' ${APP_NAME}", returnStdout: true).trim()
                  echo "Container health: ${status}"
                  return status == 'healthy'
                }
              }
            }
        }
      }
      stage ('Push to DockerHub') {
        steps{
            when {
              expression {env.DOCKER_REGISTRY != ''}
            }
            steps{
                echo '4. Pushing the image to dockerhub'
                withCredentials([usernamePassword(
                  credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')])

                  sh """ 
                    docker login -u ${DOCKER_PASS} --password-stdin
                    docker tag to-do-list:latest ${DOCKER_REGISTRY}/to-do-list:${DOCKER_TAG}

                    docker push ${DOCKER_REGISTRY}/to-do-list:${DOCKER_TAG}
                  
                  """
            }
        }
      }
  }

}