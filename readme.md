# Delimit Monorepo
All-in-one repo. 

## TODOs: 
- Maybe split up into Web and CAx later.

## Getting Started

### Setup test database
#### Linux
Install postgresql.  
```
sudo apt install postgresql
```  
Log into an interactive Postgres session.  
```
sudo -u postgres psql
```  

#### MacOS
Install postgresql.
```bash
brew install postgresql
```  

Start the server
```
brew services start postgresql 
```
or the following to have it not restart at boot time
```
brew services run postgresql
```

Log into an interactive Postgres session.
```
psql postgres
```  

### Set up Postgres
In the Postgres session, do the following.  
```postgres
CREATE DATABASE delimit; 
CREATE USER delimit WITH PASSWORD 'g88mphftt'; 
ALTER ROLE delimit SET client_encoding TO 'utf8';
ALTER ROLE delimit SET default_transaction_isolation TO 'read committed';  
ALTER ROLE delimit SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE delimit TO delimit;
\q
```

### Setup django
Inside `delimit/web`, create virtual environment.  
```
python3 -m venv web_env
```  
Activate environment  
```
source web_env/bin/activate
```  
Install dependencies.  
```
pip install django psycopg2-binary
```  
Perform database schema migration
```
./manage.py makemigrations
./manage.py migrate
```  
Collect static files
```
./manage.py collectstatic
```  
Run test server
```
./manage.py runserver
```  
Check if the website loads at `localhost:8000` in your browser. Go to `localhost:8000/admin` for admin portal.  
`Ctrl+C` To stop the webserver

When done working on web stuff, deactivate web_env
```
deactivate
```  

### Test FreeCAD
Inside `delimit/cax/freecad`, run freecad example. Make sure freecad is in your PATH.  
For MacOS, the path is `/Applications/FreeCAD.app/Contents/Resources/bin`
```
freecad example.py
```  
### Test Blender
Inside `delimit/cax/blender`, run blender example. Make sure blender is in your PATH. For MacOS installing blender using **homebrew** should take care of this.
```
blender -b -P example.py
```  

#### MacOS
```
blender -b -P example.py
```
This will take a few minutes to complete. You will see a picture generated in `delimit/cax/rendering`

## Production
Production is setup based on these instructions:  
https://www.digitalocean.com/community/tutorials/how-to-set-up-django-with-postgres-nginx-and-gunicorn-on-ubuntu-22-04  
If the changes aren't visible after pull, restart gunicorn.  
```
systemctl restart gunicorn
```  

#### MacOS
```
kill -HUP <pid>
```
With `<pid>` beign the process id of `gunicorn` 

## Web data flow
### Babylon
```
(user, json, gltf, svg) -> Babylon -> (json, svg) 
```
### Django
```
(json, svg) -> Django -> (json, svg)
```
## CAx data flow
### FreeCAD
```
(json, svg) -> FreeCAD -> (obj, nc)
```
### Blender
```
(json, obj) -> Blender -> (gltf, png)
```

