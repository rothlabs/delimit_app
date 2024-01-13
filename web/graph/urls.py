from django.urls import path
from django.contrib import admin
from . import views

app_name = 'graph'
urlpatterns = [
    path(r'', views.index, name='index'),
    path(r'extension/<str:apiKey>/<str:codeNode>/<str:name>.js', views.extension, name='worker'), # /<str:count>
]