from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db import IntegrityError
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework.decorators import action
from rest_framework import status
from ..models.user_model import User, users_images_path, user_image_route
from ..serializers.user_serializers import UserSerializer
from ..helpers import parse_uuid, save_uploaded_file, CookieAuth, JWT_PRIVATE_KEY
import os
import argon2
import binascii
import jwt

class UserInfo(ViewSet):

	def get_authenticators(self):
		if self.request.method in ["GET", "PATCH", "DELETE"]:
			return [CookieAuth()]
		return super().get_authenticators()
	"""
		Get Users Info Request
	"""
	@action(['get'], True)
	def get_users(self, request):
		if len(request.data) == 0:
			user_data = request.user.data.copy()
			user_data['profile_picture'] = user_image_route(user_data["profile_picture"])
			return Response(user_data, status=status.HTTP_200_OK)
		users_ids = parse_uuid(request.data)
		users = User.fetch_users_by_id(users_ids)
		if users == None:
			return Response(status=status.HTTP_404_NOT_FOUND)
		context = {
			'exclude': [
				'password',
				'salt'
			]
		}
		serialized_users = UserSerializer(users, many=True, context=context)
		for user in serialized_users.data:
			user["profile_picture"] = user_image_route(user["profile_picture"])
		return Response(serialized_users.data, status=status.HTTP_200_OK)

	@action(['post'], True)
	def search_users(self, request):
		if not 'search_term' in request.data or request.data['search_term'] == "":
			return Response({"message": "No search term given", "error_code": 110}, status= status.HTTP_400_BAD_REQUEST)
		matchin_users = User.search_users(request.data['search_term']);
		context = {
			'exclude': [
				'password',
				'salt'
			]
		}
		serialized_users = UserSerializer(matchin_users, many=True, context=context)
		for user in serialized_users.data:
			user["profile_picture"] = user_image_route(user["profile_picture"])
		return Response(serialized_users.data, status=status.HTTP_200_OK)

	def hash_password(self, serializer:UserSerializer):
		user_data = serializer.validated_data
		ph = argon2.PasswordHasher(hash_len=128, salt_len=32)
		user_data['salt'] = binascii.a2b_base64(binascii.b2a_base64(os.urandom(32)).decode('utf-8'))
		user_data['password'] = ph.hash(user_data['password'], salt = user_data['salt'])
		return user_data['password']

	def check_for_user_picture(self, data):
		filename , fullpath = ("profile.jpg", f"{users_images_path()}/profile.jpg")
		if 'profile_picture' in data and isinstance(data['profile_picture'], InMemoryUploadedFile):
			filename, fullpath = save_uploaded_file(data['profile_picture'],['.jpg','.png', '.jpeg'])
			if fullpath == None:
				return None
		data['profile_picture'] = fullpath
		return filename
	
	"""
		Create New User Request
	"""
	@action(['post'], False)
	def create_user(self, request):
		data = request.data.copy()
		filename = self.check_for_user_picture(data)
		if (filename == None):
			return Response("Extensions Not allowed should be .jpg, .png .jpeg",status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
		user_data = UserSerializer(data=data)
		if user_data.is_valid():
			self.hash_password(user_data)
			user_data.validated_data['profile_picture'] = filename
			try:
				user_data.save()
			except IntegrityError as e:
				return Response({"message": "Username already in use"}, status=status.HTTP_400_BAD_REQUEST)
			user_data.validated_data['id'] = user_data.instance.id
			del user_data.validated_data['salt']
			del user_data.validated_data['password']
			user_data.validated_data['profile_picture'] = user_image_route(user_data.validated_data['profile_picture'])
			return Response(user_data.validated_data, status=status.HTTP_201_CREATED)
		if data['profile_picture'] != None and filename != 'profile.jpg':
			os.remove(data['profile_picture'])
		return Response(user_data.errors, status=status.HTTP_401_UNAUTHORIZED)

	def verify_password(self, password_hash , password):
		ph = argon2.PasswordHasher(hash_len=128, salt_len=32)
		try :
			return ph.verify(password_hash, password)
		except argon2.exceptions.VerifyMismatchError:
			return False

	"""
		Login User Request
	"""
	@action(['post'], False)
	def login_user(self, request):
		login_data = request.data
		if not 'username' in login_data or not 'password' in login_data:
			return Response({"message": "No username or password in request body", "error_code": 98}, status=status.HTTP_400_BAD_REQUEST)
		user = User.fetch_user_by_username(login_data['username'])
		if (user == None):
			return Response({"message":"wrong username", "error_code": 10}, status=status.HTTP_404_NOT_FOUND)
		if not self.verify_password(user['password'], login_data['password']):
			return Response({"message":"wrong password", "error_code": 11},status=status.HTTP_401_UNAUTHORIZED)
		signed_jwt = jwt.encode({'id': user['id']}, JWT_PRIVATE_KEY, algorithm="EdDSA")
		res = Response({"message": "log-in sucessfull"}, status=status.HTTP_200_OK)
		max_age = 7200  # 1 hour in seconds
		cookie = {
			"max_age" : max_age,
			"samesite":'None',
			"secure": True,
		}
		res.set_cookie("id_key", signed_jwt, **cookie)
		return res
	
	def validate_user_update(self, old_user: UserSerializer, update_data, picture=None):
		banned_updates = any(key in update_data for key in ['id', 'salt', 'created_at', 'username', 'oauth_user' ,'status'])
		if banned_updates:
			return Response({"message": "Not allowed update fields", "error_code": 99}, status=status.HTTP_400_BAD_REQUEST)
		updated_user = UserSerializer(old_user.instance, data = update_data)
		if not updated_user.is_valid():
			return Response({"message": "Wrong update request", "error_code": 117, "details": old_user.errrors}, status= status.HTTP_400_BAD_REQUEST)
		if 'password' in update_data:
			self.hash_password(updated_user)
		if picture != None:
			if old_user.data["profile_picture"] != "profile.jpg":
				os.remove(f"{users_images_path()}/{old_user.data['profile_picture']}")
			updated_user.validated_data['profile_picture'] = picture
		updated_user.save()
		res = {**updated_user.data}
		del res['password']
		del res['salt']
		res['profile_picture'] = user_image_route(res['profile_picture'])
		return Response(res, status=status.HTTP_200_OK)

	"""
		Update User Request
	"""
	@action(['patch'], True)
	def update_user(self, request):
		data = request.data.copy()
		picture_update = self.check_for_user_picture(data)
		picture_update = picture_update if picture_update != 'profile.jpg' else None
		if picture_update == None:
			del data['profile_picture']
		return self.validate_user_update(request.user, data, picture_update)

	"""
		Delete Users Request including their profile pictures
	"""
	@action(['delete'], False)
	def delete_users(self, request):
		users_ids = parse_uuid([request.user.data['id']])
		(deletion_info, deleted_users)= User.remove_users(users_ids)
		if (deletion_info[0] <= 0):
			return Response({"message": "No user to be deleted", "error_code": 116}, status=status.HTTP_400_BAD_REQUEST)
		deleted_users = UserSerializer(deleted_users, many=True)
		for user in deleted_users.data:
			if 'profile_picture' in user and not user['profile_picture'] == "profile.jpg":
				os.remove(f"{users_images_path()}/{user["profile_picture"]}")
		return Response({"message": "User deleted sucessfully"} ,status=status.HTTP_200_OK)

# Create your views here.
