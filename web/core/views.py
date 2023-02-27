#from django.views.decorators.cache import never_cache
#from django.http import HttpResponse
from django.http import JsonResponse
from django.shortcuts import render
#from core.models import Product
from core.schema import schema
import json

#@never_cache
def home(request):
    context = {'ctx':{'page':'/'}}
    return render(request, 'core/index.html', context)

def catalog(request):
    context = {'ctx':{'page':'catalog'}}
    return render(request, 'core/index.html', context)

def studio(request):
    context = {'ctx':{'page':'studio'}}
    return render(request, 'core/index.html', context)

def graphql_public(request):
    query = json.loads(request.body)
    result = schema.execute(query['query'], context_value=request)
    response = {}
    response['data'] = result.data
    return JsonResponse(response, status=200)
