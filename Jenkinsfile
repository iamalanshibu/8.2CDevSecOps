pipeline {
    agent any

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
    }
}
