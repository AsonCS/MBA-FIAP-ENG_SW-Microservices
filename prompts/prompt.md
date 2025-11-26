# Create a micro-services project using docker
## `db`: MySQL database service
* Table Users
  * UUID String
  * Username String
  * Password Hash String
## `kafka`: Kafka service
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
		- POST new messages to `subject` queue on `kafka`
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
    - Feed with last subjects messages `feed:api/subjects/{subject}`
    - Text field to post a messages to a selected subject
* UI Tests
