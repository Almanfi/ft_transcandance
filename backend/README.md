## On Linux
    install PostgresSql 16
    install python3-venv python3-pip libpq-dev
    create a python venv "python3 -m venv venv"
    source the venv "source ./venv/bin/activate"
    install the python packages "pip install -r requirements.txt"
    create an appropriate .env file in the pong folder for Database connections
    
migrate the tables to the db "python3 manage.py makemigrations * && python3 manage.py migrate"
launch using python3 manage.py runserver
