@echo off
echo =======================================================
echo Pushing latest changes to GitHub...
echo =======================================================
git add .
git commit -m "Update COE Portal"
git push origin main
echo.
echo Done!
pause