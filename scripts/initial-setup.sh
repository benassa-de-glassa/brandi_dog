heroku plugins:install https://github.com/lstoll/heroku-repo.git
heroku git:remote -a boomer-backend -r heroku-backend
heroku git:remote -a boomerdog -r heroku-frontend