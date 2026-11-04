#!/bin/bash
cd "$(dirname "$0")"
echo "Сервер запущен: http://localhost:8000/Ver3/"
python3 -m http.server 8000
