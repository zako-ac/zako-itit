
pipeline {
    environment {
        IMAGE_NAME = 'zako-itit'
        GIT_REPO = 'https://github.com/zako-ac/zako-itit'
    }

    agent any

    stages {
        stage('Build Docker Image') {
            steps {
                container('kaniko') {
                    git branch: "main", url: "${GIT_REPO}"

                    script {
                        sh '''
                            echo "Building Docker image..."
                            /kaniko/executor --context $(pwd) --dockerfile $(pwd)/Dockerfile --destination registry.walruslab.org/common/${IMAGE_NAME}:latest
                        '''
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo "Docker image pushed to Harbor successfully."
            withCredentials([string(credentialsId: 'zako2-webhook', variable: 'DISCORD')]) {
                discordSend description: "Built Docker image successfully.", 
                footer: "Jenkins", 
                link: env.BUILD_URL, result: currentBuild.currentResult, 
                title: "itit", 
                webhookURL: "$DISCORD"
            }
        }
        failure {
            echo "Build or push failed."
            withCredentials([string(credentialsId: 'zako2-webhook', variable: 'DISCORD')]) {
                discordSend description: "Build or push failed.", 
                footer: "Jenkins", 
                link: env.BUILD_URL, result: currentBuild.currentResult, 
                title: "itit", 
                webhookURL: "$DISCORD"
            }
        }
    }
}

