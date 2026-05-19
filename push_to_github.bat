@echo off
echo ===================================================
echo Inicializando Git y subiendo el proyecto a GitHub...
echo ===================================================

:: Verificar si git esta instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git no esta instalado o no se encuentra en el PATH de tu sistema.
    echo Por favor, instala Git desde https://git-scm.com/ y vuelve a intentarlo.
    pause
    exit /b
)

:: Inicializar git si no esta inicializado
if not exist .git (
    echo Inicializando repositorio Git local...
    git init
) else (
    echo El repositorio Git ya esta inicializado.
)

:: Agregar archivos
echo Agregando archivos al area de preparacion...
git add .

:: Hacer el primer commit
echo Realizando primer commit...
git commit -m "First commit: Stride project documentation and flows"

:: Cambiar nombre de la rama a main
git branch -M main

:: Intentar agregar el control remoto, si falla (porque ya existe), cambiar su URL
git remote add origin https://github.com/thspin/stride.git 2>nul
if %errorlevel% neq 0 (
    echo El control remoto 'origin' ya existe. Actualizando URL...
    git remote set-url origin https://github.com/thspin/stride.git
)

:: Hacer push
echo Subiendo los cambios a GitHub...
echo Nota: Si es la primera vez, es posible que se abra una ventana para iniciar sesion en GitHub.
git push -u origin main

echo ===================================================
echo ¡Proceso finalizado! Revisa la salida anterior para confirmar si hubo errores.
echo ===================================================
pause
