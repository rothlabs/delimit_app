from django.urls import re_path, path, include
from . import views
from graphene_file_upload.django import FileUploadGraphQLView
#from graphene_django.views import GraphQLView
from core.api.api import api

# class PatchedGraphQLView(GraphQLView):
#     def get_response(self, request, data, show_graphiql=False):
#         try:
#             check_min_native_version(request)
#             latest_policy_check(request)
#             return super(PatchedGraphQLView, self).get_response(request, data, show_graphiql)
#         except (PolicyRequiredException, UpgradeNeededException) as e:
#             result = self.json_encode(request, {"errors": [self.format_error(e)], "data": None}, pretty=show_graphiql)
#             status_code = e.code
#             return result, status_code


app_name = 'core'
urlpatterns = [
    path('',        views.index,   name='index'), # rename to index #1
    path('catalog', views.catalog, name='catalog'), # rename to shop or use sub domain for shop
    path('studio',  views.studio,  name='studio'), # sub domain for studio as well
    #### re_path(r'^static/(?P<path>.*)', views.static_access, name='static'), # was used to make django auth user for static files
    path('gql', FileUploadGraphQLView.as_view(graphiql=True, schema=api), name='graphql'), # move to graph app or api app? #1
    ##path('sandbox', views.sandbox, name='sandboxed'),
    #path('studio/<str:pk>', views.studio, name='studio'),
    #path('gql', views.GQL_View.as_view(graphiql=True, schema=schema), name='graphql'),
    #path('gql', views.graphql, name='graphql'),
    
    #path('gql', GraphQLView.as_view(graphiql=True, schema=schema), name='graphql'),
] 

