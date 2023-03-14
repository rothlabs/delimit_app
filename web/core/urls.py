from django.urls import path
from . import views

app_name = 'core'
urlpatterns = [
    path('',        views.home,   name='home'),
    path('catalog', views.catalog, name='catalog'),
    path('studio',  views.studio,  name='studio'),
    path('studio/<str:pk>', views.studio, name='studio'),
    path('gql', views.graphql, name='graphql'),
] 
