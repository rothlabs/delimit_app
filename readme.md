# Delimit Monorepo
All-in-one repo. Maybe split up into Web and CAx later.

# Getting started with django
Move into web folder.
'''cd web'''
Make virtual environment.
'''python3 -m venv env'''
Activate environment
'''source env/bin/activate'''
Install dependencies.
'''pip install django psycopg2-binary'''
Collect static files.
'''python3 manage.py collectstatic'''
Run test server.
'''python3 manage.py runserver 0.0.0.0:8000'''
Check if the website loads at localhost:8000 in your browser.



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

