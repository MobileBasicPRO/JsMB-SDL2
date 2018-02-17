const JsMB = require('./MobileBasic')

JsMB
    .cls()
    .fillScreen(0xFF00FF00)
    .setColor(0xFFFF0000)
    .fillRect(0,0,5,5)
    .clearRect(5,5,5,5)
    .drawLine(0,0,JsMB.screenWidth(), JsMB.screenHeight())
    .setColor(0xFF0000FF)
    .drawArc(JsMB.screenWidth() / 2, JsMB.screenHeight() / 2, 25)
    .setColor(0xFFFFFFFF)//[255,255,255,255])
    .fillArc(JsMB.screenWidth() / 2, JsMB.screenHeight() / 2, 22)
    .repaint();
setInterval(()=>{},1000);