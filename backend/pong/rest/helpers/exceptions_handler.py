from django.http import JsonResponse
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

class GlobalExceptionMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response
	
	def __call__(self, request):
		try:
			return self.get_response(request)
		except Exception as exc:
			return JsonResponse({'message': "An unexpected error occured", "error_code": 111 , 'details': str(exc)}, status=500)
		
def rest_exception_handler(exc, context):
	res = exception_handler(exc, context)
	if res is None:
		return Response({"message": str(exc), "error_code": 112}, status= status.HTTP_500_INTERNAL_SERVER_ERROR)	
	return res