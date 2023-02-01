from django.views.decorators.cache import never_cache
from django.shortcuts import render
from core.models import Product

@never_cache
def index(request):
    context = {'num_shoes' : Product.objects.count}
    return render(request, 'core/index.html', context)
