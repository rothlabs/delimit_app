from django.views import generic
from .models import Shoe

class Index(generic.ListView):
    model = Shoe
    template_name = 'catalog/index.html'

class Detail(generic.DetailView):
    model = Shoe
    template_name = 'catalog/detail.html'
    
   
   
#from django.shortcuts import render, get_object_or_404

#def index(request):
#    latest_product_list = Product.objects.order_by('-publish_date')[:5]
#    context = {'latest_product_list': latest_product_list}
#    return render(request, 'catalog/index.html', context)

#def detail(request, product_id):
#    product = get_object_or_404(Product, pk=product_id)
#    return render(request, 'catalog/detail.html', {'product': product})
