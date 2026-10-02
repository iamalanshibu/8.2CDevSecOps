pipeline {
    agent any

    environment {
        JAVA_HOME = 'C:\\Users\\hp\\AppData\\Local\\Programs\\Eclipse Adoptium\\jdk-21.0.12.101-hotspot'
        PATH = "${JAVA_HOME}\\bin;${env.PATH}"
    }

    stages {

        stage('Build') {
            steps {
                echo '=== BUILD STAGE ==='

                bat 'node --version'
                bat 'npm --version'

                echo 'Installing project dependencies...'
                bat 'npm install'

                echo 'Removing previous build artefacts...'
                bat(returnStatus: true, script: 'del /Q *.tgz')

                echo 'Creating application build artefact...'
                bat 'npm pack'
            }

            post {
                success {
                    archiveArtifacts(
                        artifacts: '*.tgz',
                        fingerprint: true
                    )
                }
            }
        }

        stage('Test') {
            steps {
                echo '=== TEST STAGE ==='
                echo 'Running automated unit tests...'

                bat 'node --test --test-reporter=spec tests/hd-pipeline.test.js'

                echo 'All automated tests passed successfully.'
            }
        }

        stage('Code Quality') {
            steps {
                echo '=== CODE QUALITY STAGE ==='
                echo 'Running SonarCloud code quality analysis...'

                withCredentials([
                    string(
                        credentialsId: 'SONAR_TOKEN',
                        variable: 'SONAR_TOKEN'
                    )
                ]) {
                    bat '''
                    npx sonar-scanner ^
                    -Dsonar.token=%SONAR_TOKEN%
                    '''
                }

                echo 'SonarCloud analysis completed successfully.'
            }
        }

        stage('Security') {
            steps {
                echo '=== SECURITY STAGE ==='
                echo 'Running automated dependency vulnerability scan using npm audit...'

                script {
                    def auditStatus = bat(
                        returnStatus: true,
                        script: 'npm audit'
                    )

                    echo "npm audit finished with exit code: ${auditStatus}"

                    if (auditStatus != 0) {
                        echo 'Security vulnerabilities were detected.'
                        echo 'The pipeline will continue so the findings can be reviewed and documented.'
                    } else {
                        echo 'No dependency vulnerabilities were detected.'
                    }

                    bat(
                        returnStatus: true,
                        script: 'npm audit --json > npm-audit.json'
                    )
                }

                echo 'Security analysis completed.'
            }

            post {
                always {
                    archiveArtifacts(
                        artifacts: 'npm-audit.json',
                        allowEmptyArchive: true,
                        fingerprint: true
                    )
                }
            }
        }

        stage('Deploy') {
            steps {
                echo '=== DEPLOY STAGE ==='
                echo 'Deploying application to Docker staging environment...'

                bat 'docker --version'

                script {
                    echo 'Cleaning previous staging containers...'

                    bat(
                        returnStatus: true,
                        script: 'docker rm -f sit223-goof-staging'
                    )

                    bat(
                        returnStatus: true,
                        script: 'docker rm -f sit223-goof-mongo'
                    )

                    bat(
                        returnStatus: true,
                        script: 'docker network rm sit223-hd-network'
                    )
                }

                echo 'Creating Docker staging network...'
                bat 'docker network create sit223-hd-network'

                echo 'Starting MongoDB staging database...'
                bat '''
                docker run -d ^
                --name sit223-goof-mongo ^
                --network sit223-hd-network ^
                mongo:3
                '''

                echo 'Building staging application image...'
                bat 'docker build -t sit223-goof:staging .'

                echo 'Starting staging application container...'
                bat '''
                docker run -d ^
                --name sit223-goof-staging ^
                --network sit223-hd-network ^
                -e MONGODB_URI=mongodb://sit223-goof-mongo/express-todo ^
                -p 3001:3001 ^
                sit223-goof:staging
                '''

                echo 'Waiting for application startup...'
                bat 'powershell -NoProfile -Command "Start-Sleep -Seconds 20"'

                echo 'Checking deployed containers...'
                bat 'docker ps'

                echo 'Performing HTTP deployment smoke test...'
                bat '''
                curl --fail --silent --show-error ^
                http://localhost:3001 ^
                --output deployment-check.html
                '''

                echo 'Deployment smoke test passed.'
                echo 'Application successfully deployed at http://localhost:3001'
            }

            post {
                success {
                    archiveArtifacts(
                        artifacts: 'deployment-check.html',
                        fingerprint: true
                    )
                }

                failure {
                    echo 'Deployment failed. Showing container information...'

                    bat(
                        returnStatus: true,
                        script: 'docker ps -a'
                    )

                    bat(
                        returnStatus: true,
                        script: 'docker logs sit223-goof-staging'
                    )

                    bat(
                        returnStatus: true,
                        script: 'docker logs sit223-goof-mongo'
                    )
                }
            }
        }
    }
}
