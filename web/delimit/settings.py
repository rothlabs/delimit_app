"""
Django settings for delimit project.
Generated by 'django-admin startproject' using Django 4.1.1.
For more information on this file, see
https://docs.djangoproject.com/en/4.1/topics/settings/
For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.1/ref/settings/
"""

import os
from pathlib import Path


################################ Allows python to print to console when gunicorn -R is used
#os.environ['PYTHONUNBUFFERED'] = 'TRUE'

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'x=v8rfzhm&ty94f*bnqqzfd15b_cwol_7odzjkd+#vdvmc^@_*'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['delimit.art','www.delimit.art','localhost', 'graph.delimit', 'graph.delimit.art', 'graph.localhost']

# Application definition

INSTALLED_APPS = [
    'core.apps.CoreConfig',
    'graph.apps.GraphConfig',

    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'graphene_django',
    'django_hosts',
    #'corsheaders',
    'silk',
    #'ajax_select', 
]

MIDDLEWARE = [
    'django_hosts.middleware.HostsRequestMiddleware',
    #'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    #'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'silk.middleware.SilkyMiddleware',
    'django_hosts.middleware.HostsResponseMiddleware',
]

ROOT_URLCONF = 'delimit.urls'

ROOT_HOSTCONF = 'delimit.hosts'
DEFAULT_HOST= 'www'
PARENT_HOST = 'delimit.art'

SILKY_AUTHENTICATION = False
SILKY_AUTHORISATION = False

#CORS_ALLOW_ALL_ORIGINS = True

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'delimit.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

DATABASES = {
   'default': {
       'ENGINE': 'django.db.backends.postgresql_psycopg2',
       'NAME': 'delimit',
       'USER': 'delimit',
       'PASSWORD': 'g88mphftt',
       'HOST': 'localhost',
       'PORT': '',
   }
}
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': 'sqlite3.db',
#         'USER': '',
#         'PASSWORD': '',
#         'HOST': '',
#         'PORT': '',
#     }
# }



# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True



# Django looks for additional static files to collect from here:
#STATICFILES_DIRS = (
#    os.path.join(BASE_DIR, "static/"),
#)


#>>>>>>>>>>> https://djangodeployment.readthedocs.io/en/latest/05-static-files.html <<<<<<<<<<<<<<

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static/') # dev  ##### STATIC_ROOT not used at all in dev


#STATIC_ROOT = '/var/cache/delimit/static/'    # deployment

# Media files (user uploaded images, generated 3D models, etc)
# https://docs.djangoproject.com/en/4.1/topics/files/
MEDIA_URL = 'media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media/')   
#MEDIA_ROOT = '/var/opt/delimit/media/'         # deployment


# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

GRAPH = {
    'socket':{
        'host': 'localhost',
        'port': '3636', 
    },
    'server':{
        'host': 'localhost',
        'port': '6363',
    },
    'user':{
        'admin':{
            'key':  '9h3IAvdGrdn8sjORuwJwCYJekg0UijjK9N7i3JipkETLtPTNJTPwfVeMwp2ItaVT', #'5c6rvgUaTups5i45d6sW82sKtOOADmL0HVu5j4RyaNXqkrtx558udQDq8nKM6mUv',
        },
    }
}