# Delimit
Artistic footwear design web app. Includes computer-aided design and manufacturing (CAx) module. 


## Extra things installed on server
pip install graphene-file-upload


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
If there are problems with database migrations, it might be necessary to manually use the postgres session to manipulate or delete databases before running ```./manage.py migrate``` again.

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
Perform database schema migration.
```
./manage.py makemigrations
./manage.py migrate
```  
Create superuser. Enter username, email, and password as prompted.
```
./manage.py createsuperuser
```  
Run test server
```
./manage.py runserver
```  
Check if the website loads at `localhost:8000` in your browser. Go to `localhost:8000/admin` for admin portal. Make add a couple shoes and sketches. Sample sketches can be found in cax/sketches.  

`Ctrl+C` To stop the webserver  

When done working on web stuff, deactivate web_env  
```
deactivate
```  

### FreeCAD
Inside `delimit/cax/freecad`, run freecad worker. Make sure freecad is in your PATH.  
For MacOS, the path is `/Applications/FreeCAD.app/Contents/Resources/bin`
```
freecad --console worker.py
```  
For GUI:  
```
freecad worker.py
```  
### Blender
In `delimit/cax/blender/worker.py` set `sys.path += ` to the absolute path of the delimit/cax/blender directory. Blender doesn't run script local... stupid...  
Inside `delimit/cax/blender`, run blender worker. Make sure blender is in your PATH. For MacOS installing blender using **homebrew** should take care of this.
```
blender -b -P worker.py
```  
For GUI:
```
blender -P worker.py
``` 

#### MacOS
```
blender -b -P worker.py
```
This will take a few minutes to complete. You will see a picture generated in `delimit/cax/blender/rendering`

## Database Migrations
Everytime django models are changed, do a database migration. If you pull code, it's best to assume a model has been changed.  
```
./manage.py makemigrations
./manage.py migrate
```  
If you still have problems running the project, it might be neccesary to go into the postgres interactive session or use pgAdmin to change tables and fields.  
As a last resort, it might be necessary to delete the "migrations" folder in some or all of the "apps" in the django (web folder) project. Then run migrations again.  

## Easel 
To test the easel, make sure there is at least one Shoe in the database. Use the 'localhost:8000/admin' portal to add a shoe.  
It's also necessary to have some Sketches in the database. In the admin portal, add sketches and upload svg files. Some svg files are in 'cax/sketches'

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
(user, json, glb, svg) -> Babylon -> (json, svg) 
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
(json, obj) -> Blender -> (glb, png)
```

## Help
[Software development process](https://docs.google.com/document/d/1tRWYg5H_MLdlJAFzCSrXW3bG_a9W1qh-CDyd5hQHdwc/edit?usp=sharing)

## Blender Addon Modification
To make gltf2 export work without GUI, follow these instructions:  
Go to the following folder.  
```
/blender-3.2.2/3.2/scripts/addons/io_scene_gltf2/blender/exp/  
```
Remove the following from gltf2_blender_export.py   
```
if bpy.context.active_object is not None:  
        if bpy.context.active_object.mode != "OBJECT": # For linked object, you can't force OBJECT mode  
            bpy.ops.object.mode_set(mode='OBJECT')  
```
Remove the following from gltf2_blender_gather_tree.py  
```
bpy.context.window.scene = blender_scene  
```
Remove the following from gltf2_blender_gather.py  
```
bpy.context.window.scene = store_user_scene
```
See https://github.com/KhronosGroup/glTF-Blender-IO/issues/1281  

## FreeCAD Curves Workbench
Copy code from https://github.com/tomate44/CurvesWB into  
```
cax/freecad/Curves
```
Modify the Curves workbench by adding the following condition before any FreeCADGui.addcommand call:
```
if hasattr(FreeCADGui,'addCommand'):
``` 