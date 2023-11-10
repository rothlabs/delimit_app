from django.urls import path
from django.contrib import admin
from . import views

app_name = 'graph'
urlpatterns = [
    path(r'', views.index, name='index'),
    path(r'<str:pk>/worker.js', views.worker, name='worker'),
]