@echo off
echo Initializing Git repository...
git init

echo Adding all files...
git add .

echo Committing files...
git commit -m "Finalizing COE Portal Project"

echo Renaming branch to main...
git branch -M main

echo Linking to GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/Vigoreddy/Rathinam_Controller-of-Examinations.git

echo Pushing code to GitHub...
git push -u origin main

echo.
echo =======================================================
echo If you saw no errors above, the project is pushed!
echo =======================================================
pause
