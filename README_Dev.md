# MAIN WEBSITE
## Development commands
```
nx serve main-website-react --configuration=development
nx build main-website-react
```
## Dockerization
### without cache
>docker build --progress=plain --no-cache -t main-website-react -f ./apps/main-website-react/Dockerfile .
### with cache
>docker build --progress=plain -t main-website-react -f ./apps/main-website-react/Dockerfile .
### running docker for website
>docker run --name main-website-react -p 8080:80 main-website-react

# DEMO APPLICATION
## Development commands
```
nx serve ml-api-web-demo --configuration=development
nx build ml-api-web-demo
```
### without cache
>docker build --progress=plain --no-cache -t ml-api-web-demo -f ./apps/ml-api-web-demo/Dockerfile .
### with cache
>docker build --progress=plain -t ml-api-web-demo -f ./apps/ml-api-web-demo/Dockerfile .
### running docker for website
>docker run --name api-web-demo -p 4200:80 ml-api-web-demo

## pruning docker
docker image prune -a
docker container prune
docker volume prune
docker system prune -a

# For ML API WEB
>docker build --progress=plain --no-cache -t ml-api-web -f ./apps/ml-api-web/Dockerfile .
>docker run --name ml-api-web -p 4200:80 ml-api-web 

# For ML API
>docker build --progress=plain --no-cache -t ml-api -f ./apps/ml-api/Dockerfile .
>docker run --name ml-api -p 3000:3000 ml-api 

# Run multiples app
APP_ENV=development nx run-many --parallel --target=serve --projects=ml-api,ml-api-web-demo --configuration=development

# Docker Ports
main-website-react 4200 (next is used)
ml-api-web-demo 80
ml-api 3000
