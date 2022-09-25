from django.views.generic import ListView, UpdateView
from catalog.models import Product
from .forms import Edit_Form

class Index_View(ListView):
    model = Product
    template_name = 'easel/index.html'

class Edit_View(UpdateView):
    model = Product
    form_class = Edit_Form
    template_name = 'easel/edit.html'
    def get_success_url(self): return ''


#def index(request):
#    context = {}
#    return render(request, 'easel/index.html', context)
