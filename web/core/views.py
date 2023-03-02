#from django.views.decorators.cache import never_cache
#from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.shortcuts import render
#from core.models import Product
from core.schema import schema
import json

#@never_cache
@ensure_csrf_cookie
def home(request):
    context = {'ctx':{'page':'/'}}
    return render(request, 'core/index.html', context)

@ensure_csrf_cookie
def catalog(request):
    context = {'ctx':{'page':'catalog'}}
    return render(request, 'core/index.html', context)

@ensure_csrf_cookie
def studio(request, pk=0):
    context = {'ctx':{'page':'studio'}}
    return render(request, 'core/index.html', context)

@ensure_csrf_cookie
def graphql_public(request):
    query = json.loads(request.body)
    result = schema.execute(query['query'], variable_values=query['variables']) #context_value
    response = {}
    response['data'] = result.data
    return JsonResponse(response, status=200)
