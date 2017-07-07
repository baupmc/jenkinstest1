node {
    stage ("docker-build"){
        echo "reached3"
        sh ("docker --version")
        echo "reached2"
        sh ("pwd")
        git 'https://github.com/baupmc/jenkinstest1.git'
        sh "git rev-parse HEAD > .git/commit-id"
        def commit_id = readFile('.git/commit-id').trim()
        println commit_id
        def app = docker.build("galaxyapi:0.4-${commit_id}", '.')
        println app
        docker.tag("galaxyapi:0.4-${commit_id}","localhost:5000/galaxyapi:0.4-${commit_id}")
        //docker.build ("helloNode:v1", '.')
        
    }    
}
