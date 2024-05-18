from django.http import HttpResponse
from rest_framework.views import APIView

def index(request):
    return HttpResponse("Hello there From Index Starting")

class UserInfo(APIView):
    """
        Get a Specific User Info
    """
    def get(self, request, id):
        return None

    """
        Create New User,
        Modify A Specific User Info
    """
    def post(self, request, id=-1):
        return None
    
    """
        Delete Specific User
    """
    def delete(self, request, id):
        return None

# Create your views here.
