from django.urls import path

from . import views

app_name = 'easel'
urlpatterns = [
    path('', views.index, name='index'),
] 
