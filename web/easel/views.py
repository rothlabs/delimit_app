from django.shortcuts import render

def index(request):
    context = {}
    return render(request, 'easel/index.html', context)
