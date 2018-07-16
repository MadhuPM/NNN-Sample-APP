# set up tools
Read [Wiki](https://gitprod.statestr.com/SSC/clo_ssccdt3ui/wiki/How-to-use-selenium-test)

## using node v8
    set NODE_V8=C:\Users\%USERNAME%\nodejsv8                            # in windows this dir contain node.exe
    set NPM_PATH=C:\Users\%USERNAME%\AppData\Roaming\npm
    set PHANTOMJS=C:\Users\%USERNAME%\AppData\Roaming\npm\node_modules\phantomjs\lib\phantom\bin
    set PATH=C:\WINDOWS\System32;C:\WINDOWS;%NODE_V8%;%NPM_PATH%;%PHANTOMJS%

## start server (state-street-design)
    cd ../state-street-design  
    npm start

## run test
    npm run selenium

# phantomjs support (headless browser)
## install phantomjs

[download](https://bitbucket.org/ariya/phantomjs/downloads/)   and put file  
C:\Users\\< USERNAME >\AppData\Local\Temp\phantomjs\phantomjs-2.1.1-windows.zip 

    npm install -g phantomjs
## run headless
    npm run headless
## doc
[headless-testing](http://phantomjs.org/headless-testing.html)

## web driver
[GhostDriver](https://github.com/detro/ghostdriver)

# tips
web api is different between IE / firefox & chrome
