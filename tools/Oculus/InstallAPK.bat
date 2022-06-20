@echo off
IF "%~1" == "" GOTO NoFile
WHERE adb
if %ERRORLEVEL% == 0 (
	adb install -r -d --user all "%~1" && echo Install finished you may now close this window  or press Enter && goto :END
) else (
if exist %userprofile%\AppData\Roaming\SideQuest\platform-tools\adb.exe (
	%userprofile%\AppData\Roaming\SideQuest\platform-tools\adb.exe install -r -d --user all "%~1" && echo Install finished you may now close this window or press Enter && goto :END
) else (
	echo adb not found
))
:END
pause
exit
:NoFile
echo drag and drop the apk into this window and press enter:
set /p apk=
WHERE adb
if %ERRORLEVEL% == 0 (
	echo adb install -r -d --user all %apk% && echo Install finished you may now close this window  or press Enter && goto :END
) else (
if exist %userprofile%\AppData\Roaming\SideQuest\platform-tools\adb.exe (
	%userprofile%\AppData\Roaming\SideQuest\platform-tools\adb.exe install -r -d --user all %apk% && echo Install finished you may now close this window or press Enter && goto :END
) else (
	echo adb not found
))
goto END