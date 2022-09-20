# Delimit Monorepo
All-in-one repo. Maybe split up into Web and CAx later.

## Getting Started
### Setup test database
Install postgresql.  
```sudo apt install postgresql```  
Log into an interactive Postgres session.  
```sudo -u postgres psql```  
In the Postgres session, do the following.  
```CREATE DATABASE delimit;```  
```CREATE USER delimit WITH PASSWORD 'g88mphftt';```  
```ALTER ROLE delimit SET client_encoding TO 'utf8';```  
```ALTER ROLE delimit SET default_transaction_isolation TO 'read committed';```  
```ALTER ROLE delimit SET timezone TO 'UTC';```  
```GRANT ALL PRIVILEGES ON DATABASE delimit TO delimit;```  
```\q```
### Setup django
Move into web folder: delimit/web  
Make virtual environment.  
```python3 -m venv web_env```  
Activate environment  
```source web_env/bin/activate```  
Install dependencies.  
```pip install django psycopg2-binary```  
Perform database schema migration.  
```./manage.py makemigrations```  
```./manage.py migrate```  
Collect static files.  
```./manage.py collectstatic```  
Run test server.  
```./manage.py runserver```  
Check if the website loads at localhost:8000 in your browser. Go to localhost:8000/admin for admin portal.  
When done working on web stuff, deactivate web_env.  
```deactivate```  
### Test FreeCAD
Move into cax folder: delimit/cax  
Run freecad worker. Make sure freecad is in your PATH.  
```freecad freecad_worker.py```  
### Test Blender
Move into cax folder: delimit/cax  
Run blender worker. Make sure blender is in your PATH.  
```blender -P blender_worker.py```  

## Production
If the changes aren't visible after pull, restart gunicorn.  
```systemctl restart gunicorn```  

## Web data flow
### Django
.json -> Django -> .json
### Babylon
(User, gltf) -> Babylon -> .json

## CAx data flow
### FreeCAD
.json -> FreeCAD -> (.obj, .nc)
### Blender
.obj -> Blender -> .gltf

