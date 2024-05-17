#!/bin/bash

curr_branch=$(git branch --show-current)

if [[ $curr_branch -eq "backend" ]]
then
   mocha ./backend/tests/api_tests.js
else
   if [[ $curr_branch -eq "frontend" ]]; then
    echo "Insert tests for frontend"
   fi
fi