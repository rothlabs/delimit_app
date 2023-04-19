from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.shortcuts import render
from core.schema import schema
#from core.models import ntc, ctn
import json

@ensure_csrf_cookie
def home(request):
    context = {'ctx':{'entry':'/'}} #'ntc':ntc, 'ctn':ctn, 
    return render(request, 'core/index.html', context)

@ensure_csrf_cookie
def catalog(request):
    context = {'ctx':{'entry':'catalog'}}
    return render(request, 'core/index.html', context)

@ensure_csrf_cookie
def studio(request, pk=0):
    context = {'ctx':{'entry':'studio'}}
    return render(request, 'core/index.html', context)

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
