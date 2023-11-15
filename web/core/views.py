from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.shortcuts import render
import json
from django.contrib.auth.decorators import login_required
from django.utils.functional import cached_property
from graphene_file_upload.django import FileUploadGraphQLView # from graphene_django.views import GraphQLView

#@login_required
@ensure_csrf_cookie
def index(request):
    context = {'ctx':{'entry':'/'}} #'ntc':ntc, 'ctn':ctn, 
    return render(request, 'core/index.html', context)

#@login_required
@ensure_csrf_cookie
def shop(request):
    context = {'ctx':{'entry':'shop'}}
    return render(request, 'core/index.html', context)

#@login_required
@ensure_csrf_cookie
def studio(request):#, pk=0):
    context = {'ctx':{'entry':'studio'}}
    return render(request, 'core/index.html', context)

# # @ensure_csrf_cookie
# # @login_required
# # def static_access(request, path): ############ was used to make django auth user for static files
# #     #if access_granted:
# #     response = HttpResponse()
# #     # Content-type will be detected by nginx
# #     del response['Content-Type']
# #     response['X-Accel-Redirect'] = '/protected/static/' + path
# #     return response
# #     #else:
# #     #    return HttpResponseForbidden('Not authorized to access this media.')
# #     #context = {'ctx':{'entry':'static'}}
# #     #return render(request, 'core/index.html', context)

# @xframe_options_sameorigin
# def sandbox(request):
#     context = {'ctx':{'entry':'/'}} #'ntc':ntc, 'ctn':ctn, 
#     return render(request, 'core/sandbox.html', context)


# from core.loaders import Float_E_Loader, PF_By_R_Loader, PP_By_N_Loader, Parts_By_Parts_Loader
# class GQLContext:
#     def __init__(self, request):
#         self.request = request
#     @cached_property
#     def user(self):
#         return self.request.user
#     @cached_property
#     def float_e_loader(self):
#         return Float_E_Loader()
#     @cached_property
#     def pf_by_r_loader(self):
#         return PF_By_R_Loader()
#     @cached_property
#     def pp_by_n_loader(self):
#         return PP_By_N_Loader()
#     @cached_property
#     def parts_by_parts_loader(self):
#         return Parts_By_Parts_Loader()
# class GQL_View(FileUploadGraphQLView):
#     def get_context(self, request):
#         return GQLContext(request)

# @ensure_csrf_cookie
# def graphql(request):
#     query = json.loads(request.body) #query = json.loads(request.body)
#     result = schema.execute(query['query'], variable_values=query['variables'], context_value=request)
#     response = {'data':result.data}
#     return JsonResponse(response, status=200)



#from django.http import HttpResponse
#from core.models import Product
#from django.views.decorators.cache import never_cache
#@never_cache

#if request.user.is_authenticated:
