// Optional Jenkins pipeline — demonstrates the same suite running under a
// second CI orchestrator, distinct from the GitHub Actions gated pipeline
// in .github/workflows/playwright.yml. Not required for the primary CI
// story; included for CI tooling diversity.
pipeline {
    agent {
        docker {
            image 'mcr.microsoft.com/playwright:v1.49.1-jammy'
        }
    }

    environment {
        CI = 'true'
        BASE_URL = 'https://practice.expandtesting.com'
        NOTES_API_URL = 'https://practice.expandtesting.com/notes/api'
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Smoke') {
            steps {
                sh 'npx playwright test --grep @smoke --project=chromium'
            }
        }

        stage('Critical') {
            steps {
                sh 'npx playwright test --grep "@smoke|@critical" --project=chromium'
            }
        }

        stage('Report') {
            steps {
                sh 'npx allure generate allure-results -o allure-report --clean'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: true
                    archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'test-results/**/*.xml'
        }
    }
}
