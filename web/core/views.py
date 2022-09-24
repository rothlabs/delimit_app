from django.shortcuts import render
from catalog.models import Product

def index(request):
    context = {'num_products' : Product.objects.count}
    return render(request, 'core/index.html', context)
