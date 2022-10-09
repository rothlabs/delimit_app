from django.shortcuts import render
from catalog.models import Shoe

def index(request):
    context = {'num_shoes' : Shoe.objects.count}
    return render(request, 'core/index.html', context)
