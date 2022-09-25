from django.urls import path
from .views import Index_View, Edit_View

app_name = 'easel'
urlpatterns = [
    path('', Index_View.as_view(), name='index'),
    path('<int:pk>/', Edit_View.as_view(), name='edit'),
] 
