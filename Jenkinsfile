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

                echo 'Creating application build artefact...'
                bat 'npm pack'
            }

            post {
                success {
                    archiveArtifacts artifacts: '*.tgz', fingerprint: true
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
    }
}
