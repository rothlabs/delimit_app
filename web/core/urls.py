from django.urls import path, include
from . import views
from graphene_file_upload.django import FileUploadGraphQLView
#from graphene_django.views import GraphQLView
from core.schema import schema

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
    path('',        views.home,   name='home'),
    path('catalog', views.catalog, name='catalog'),
    path('studio',  views.studio,  name='studio'),
    path('studio/<str:pk>', views.studio, name='studio'),
    #path('gql', views.GQL_View.as_view(graphiql=True, schema=schema), name='graphql'),
    #path('gql', views.graphql, name='graphql'),
    path('gql', FileUploadGraphQLView.as_view(graphiql=True, schema=schema), name='graphql'),
    #path('gql', GraphQLView.as_view(graphiql=True, schema=schema), name='graphql'),
] 

