# Server

### Express API

Express is

### Passport authentication

Passport is an industry standard for user authentication. I'm only interested in a local strategy for now.

For a larger scale project, I might give options for a GitHub, GitLab, or Bitbucket sign in for slicker integration with managing repos.

### Sequelize ORM

Sequelize makes the relationships between entities clear to anyone looking at the project, and working with the models is much easier to read than raw SQL queries.

### Data storage on heroku postgres

A hobby tier postgres instance is sufficient for 10,000 rows, or 1 GB of storage.

For a larger scale project, I'd look to cloud hosting like RDS on AWS.

### Events handled through socket.io

Socket.io is sufficient for handling up to about 1400 concurrent connections, so that's plenty.

ORGANIZTION level sockets: user status change, user online state change, project, domain, initiative, bug creations

BUG level sockets: comments, status changes,

For a larger scale project, I'd learn something like Redis pub/sub.

### Image hosting on google drive

No aws "free tier" this time. I'd just use an s3 bucket for a larger project.
