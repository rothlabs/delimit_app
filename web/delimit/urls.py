"""delimit URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
#from ajax_select import urls as ajax_select_urls

urlpatterns = [
    path(r'', include('core.urls')),
    path(r'admin/', admin.site.urls),
    path(r'silk/', include('silk.urls', namespace='silk'))
    #url(r'^ajax_select/', include(ajax_select_urls)),
    #url(r'^admin/', include(admin.site.urls)),
]# + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) # FOR LOCAL TESTING ONLY: https://docs.djangoproject.com/en/4.1/howto/static-files/#serving-files-uploaded-by-a-user-during-development

#urlpatterns += [path('silk/', include('silk.urls', namespace='silk'))]