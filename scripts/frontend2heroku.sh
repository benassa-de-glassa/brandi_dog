#!/bin/bash

# Push backend folder to heroku remote for deployment

# might need 
# heroko repo:reset -a heroku-backend 
# before

git subtree push --prefix backend heroku-backend main