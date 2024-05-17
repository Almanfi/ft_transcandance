from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return HttpResponse("Hello there From Index")

# Create your views here.
