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
Move into web folder.
```cd delimit/web```
Make virtual environment.
```python3 -m venv env```
Activate environment
```source env/bin/activate```
Install dependencies.
```pip install django psycopg2-binary```
Collect static files.
```python3 manage.py collectstatic```
Run test server.
```python3 manage.py runserver 0.0.0.0:8000```
Check if the website loads at localhost:8000 in your browser. Go to localhost:8000/admin for admin portal.

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

