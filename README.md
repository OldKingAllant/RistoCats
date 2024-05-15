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

# Common testing
- TODO
