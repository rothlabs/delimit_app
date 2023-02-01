from django.urls import path
from . import views

app_name = 'catalog'
urlpatterns = [
    path('', views.List_View.as_view(), name='list'),
    path('<int:pk>/', views.Detail_View.as_view(), name='detail'),
]
