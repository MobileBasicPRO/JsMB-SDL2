const JsMB = require('./MobileBasic')

JsMB
    .cls()
    .fillScreen(0xFF00FF00)
    .setColor(0xFFFF0000)
    .fillRect(0,0,5,5)
    .repaint();
setInterval(()=>{},1000);