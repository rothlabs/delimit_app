from django.urls import path
from .views import Index_View, Line_Art_Edit_View

app_name = 'easel'
urlpatterns = [
    path('', Index_View.as_view(), name='index'),
    path('<int:pk>/', Line_Art_Edit_View.as_view(), name='line_art_edit'),
] 
