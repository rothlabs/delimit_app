from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views import generic
from core.models import Project

#@method_decorator(never_cache, name='dispatch')
class List_View(generic.ListView):
    model = Project
    template_name = 'catalog/list.html'

#@method_decorator(never_cache, name='dispatch')
class Detail_View(generic.DetailView):
    model = Project
    template_name = 'catalog/detail.html'
    
   
   
#from django.shortcuts import render, get_object_or_404

#def index(request):
#    latest_product_list = Product.objects.order_by('-publish_date')[:5]
#    context = {'latest_product_list': latest_product_list}
#    return render(request, 'catalog/index.html', context)

#def detail(request, product_id):
#    product = get_object_or_404(Product, pk=product_id)
#    return render(request, 'catalog/detail.html', {'product': product})
