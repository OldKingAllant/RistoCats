# RistoCats
Project for software engineering (group RistoCats) 2024

This project consists in developing a restaurant management system in a rigorous way.

To all projects contributors: 
- The "executive" branch should NOT be modified by a single person
- The "dev" branch should be modified when we want to officially test
  both the frontend and backend together
- The "frontend" and "backend" branches should be independent. To avoid
  commiting the wrong files when doing local testing, follow the "local testing guide"
- Common files (like the router for the API) are shared by all branches,
  and modified only when all the group members want to modify it

# Local testing guide
- Download files from the opposite branch by using "git checkout <other branch> -- <files to obtain>"
- Immediately after getting those files (or immediately before committing), do 
  "git restore --staged <downloaded files>"
- If one fails to do so, and those files are committed to the wrong
  branch, one can do "git rm --cached <files>" to remove them from
  the index

# Usage
1.	First, clone the dev or the executive branch in an empty directory: git clone https://github.com/OldKingAllant/RistoCats.git
2.	After that, enter the project’s directory with “cd RistoCats”.
3.	Then, we need to install the node dependencies by using “npm install”
4.	Create a .env file at the root of the project’s and paste the necessary things 
5.	Run the server with “node index.js”
6.	If you want to access the API docs, run the server and go to http://localhost:5000/docs
7.	After that, you can navigate to http://localhost:5000/ and you will be redirected to the login page
8.	On the right of the login button insert an integer number and then click on login
9.	Watch the “Test implementation” for the remaining instructions
