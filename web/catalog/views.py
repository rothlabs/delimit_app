from django.shortcuts import render, get_object_or_404

# Create your views here.

from .models import Product

def index(request):
    latest_product_list = Product.objects.order_by('-publish_date')[:5]
    context = {'latest_product_list': latest_product_list}
    return render(request, 'catalog/index.html', context)

def detail(request, product_id):
    product = get_object_or_404(Product, pk=product_id)
    return render(request, 'catalog/detail.html', {'product': product})
