# Help write the specification for a micro-services project

The project is a web page where users can login, read and write to subjects (sports, healthy, news, food, autos), the feed on home does not refresh automatically, and the feed has "eventual consistency" and loads inside a iframe.

## Intructions:
- Must be a markdown file
- Must be detailed to be used as context to GenAI prompts
- Must especify the folders structure
- Must use Domain Driven Design
- Must implement test when possible
- Should contain the objects JSON on communications using markdown JSON notation
- Should describe each api endpoint
- Could contain file names inside the folders structure


"""
# Create a micro-services project using docker

* Include a docker-compose.yaml to run all services at once, with health check

## `db`: MySQL database service

* Table Users
  - UUID String
  - Username String
  - Password Hash String

## `kafka`: Kafka service

* topics
  - sports
  - healthy
  - news
  - food
  - autos

## `feed`: Kotlin Ktor backend service

* Connection with database on `kafka` service with docker
* Compiles `topics` of `kafka` on html pages and stores it in memory
* Endpoits
  - `api/subjects/{subject}`
    - GET html `subject` page
* Swagger/OpenAPI for all endpoints
* Unit tests and Integrations tests
* Pipeline CI/CD with Github actions

## `backend`: NestJS backend service

* Connection with database on `db` service with docker
* Connection with database on `kafka` service with docker
* RestFull CRUD operations
	- `api/auth`
		- POST username and password to compare with the hash stored on `db`, returns a jwt token
	- `api/users`
		- GET users from `db`
		- POST new user to `db`
	- `api/users/{id}`
		- GET userfrom `db`
		- PUT data to update user to `db`
	- `api/subjects/{subject}`
		- sports, healthy, news, food, autos
		- POST new messages to `subject` topic on `kafka`
* Swagger/OpenAPI for all endpoints
* Unit tests and Integrations tests
* Pipeline CI/CD with Github actions
## `frontend`: NextJS frontend service
* Connection with `backend` service with docker
* Connection with `feed` service with docker
* UI Mobile first
* Pages
  - Create user `backend:api/users`
  - Login `backend:api/auth`
  - Home
    - Buttons to select beetwen subjects (sports, healthy, news, food, autos)
    - Feed with last subjects html pages from `feed:api/subjects/{subject}` loaded into an iframe
    - Text field to post a messages to a selected subject
* UI Tests
* Pipeline CI/CD with Github actions

"""
