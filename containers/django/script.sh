sleep 5

python3 -m venv venv
source venv/bin/activate
pip install -r /usr/backend/requirements.txt
cd /usr/backend/pong
python3 manage.py makemigrations *
python3 manage.py migrate
python3 manage.py runserver 0.0.0.0:8000