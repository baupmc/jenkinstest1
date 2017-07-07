node {
    stage ("docker-build"){
        docker.withRegistry("http://localhost:5000", "") {
            echo "reached3"
            sh ("docker --version")
            echo "reached2"
            sh ("pwd")
            git 'https://github.com/baupmc/jenkinstest1.git'
            sh "git rev-parse HEAD > .git/commit-id"
            def commit_id = readFile('.git/commit-id').trim()
            println commit_id
            def container = docker.build("galaxyapi:0.4-${commit_id}", '.')
            echo "reached 5"
            container.push()
            //docker.build ("helloNode:v1", '.')
        }
    }    
}
