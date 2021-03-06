/*
 * ================================//
 * Интерпретатор языка JsMobileBasic
 * ~~~~~~~~~~by PROPHESSOR~~~~~~~~~~
 * ================================//
 */

//JsMB-SDL2 Alpha 11 58884391d121876a2269f10202c65a9761b25e78

'use strict';

const $Config = require('./config');
const SDL = require('node-sdl2');

// Графика
/**
 * @namespace JsMB
 */
const JsMB = {
    '$Mouse': {
        'x': 0,
        'y': 0,
        'lcount': 0,
        'rcount': 0
    },
    '$Gel': { '$Sprite': {} },
    '$Font': {
        'family': 'arial',
        'size': '10'
    },
    '$Draw': {
        'color': null,
        'BGCOLOR': [255, 255, 255, 255],
        'linewidth': 1
    },
    '$JsMobileBasic': {
        'name': 'JsMobileBasic',
        'version': 'Alpha 11',
        'author': 'PROPHESSOR',
        'url': 'http://vk.com/JsMobileBasic',
        'Mobile': $Config.Mobile,
        'Debug': true,
        'canvas': typeof document === 'undefined' ? null : document.getElementById('c'),
        'graphics': false,
        'supports': {
            'document': typeof document !== 'undefined',
            'window': typeof window !== 'undefined',
            'browser': typeof document !== 'undefined' && typeof window !== 'undefined',
            'ls': typeof localStorage !== 'undefined',
            'module': typeof module !== 'undefined'
        }
    },

    /** Число PI до 15 знака (3.1415....)
     */
    'PI': Math.PI,

    /** Число G (9.8)
     */
    'G': 9.8,

    /** Преобразование радиан в градусы (180 / PI)
     */
    'RAD2DEG': 180 / Math.PI,

    /** Преобразование градусов в радиан (PI / 180)
     */
    'DEG2RAD': Math.PI / 180,

    __preinit() {
        for (const i in this) {
            if (typeof this[i] === 'function') this[i] = this[i].bind(this);
        }
    },

    __init() {
        if (typeof require !== 'function') window.require = () => console.warn('Использование системных функций не поддерживается на Вашей платформе');

        const { supports } = this.$JsMobileBasic;

        this.debug('#===== Включён режим отладки =====#', 'color:gray;');
        this.debug(this.$JsMobileBasic.name, 'background:gray;color:yellow;');
        this.debug('v. ' + this.$JsMobileBasic.version, 'background:gray;color:yellow;');
        this.debug('by ' + this.$JsMobileBasic.author, 'background:gray;color:yellow;');
        this.debug(this.$JsMobileBasic.url, 'background:gray;color:yellow;');

        // ======Инициализация рабочей среды======//
        this.debug('// ======Инициализация рабочей среды======//', 'color:gray;');
        // Чтение конфига
        if (typeof $Config === 'undefined') {
            console.error('Не найден файл конфигурации!');
        }

        // if ($Config.type === 'graphics') {

        this.$JsMobileBasic.graphics = true;
        this.debug('Используется графика!', 'background:black;color:yellow;');

        this.c = new SDL.window({
            closable: true,
            title: 'JsMobileBasic'
        });

        //    this.$JsMobileBasic.canvas = this.c;

        this.ctx = this.c.render;
        this.gfx = this.ctx.gfx;
        if ($Config.canvas_size[0] === '*' && $Config.canvas_size[1] === '*') {
            // this.debug('Canvas растянут на весь экран', 'background:black;color:#00ff00;');
            this.c.size = { h: 480, w: 640 }; // TODO: FullScreen
        } else {
            // this.debug(this.$Config.canvas_size);
            // [this.c.width, this.c.height] = $Config.canvas_size;
            this.c.size = { h: $Config.canvas_size[1], w: $Config.canvas_size[0] };
        }
        // } else {
        //     this.debug('Графика не используется!', 'background:black;color:yellow;');
        //     this.c = supports.window ? window : null;
        //     if (supports.document && document.getElementById('c'))
        //         document.body.removeChild(document.getElementById('c'));
        // }

        this.setLineWidth(1);
        this.setColor([0, 0, 0, 0.9]);

        this.debug('Имя проекта: ' + $Config.name, 'background:brown;color:yellow;');

        this.$Player = [supports.document ? document.getElementById('player0') : null];

        this.debug('// ======Инициализация интерпретатора======//', 'color:gray;');

    },

    /** Задать текущий цвет
     * @param  {array} color - Цвет в RGB формате
     * @returns {this}
     */
    setColor(color) {
        this.$Draw.color = new JsMB._Color(color);
        this.ctx.color = this.$Draw.color.getNumber();
        return this;
    },

    /** Задать толщину линий
     * @param  {number} width - Толщина
     * @returns {this}
     */
    setLineWidth(width) {
        this.$Draw.linewidth = width;
        return this;
    },

    /** Рисует залитый прямоугольник
     * @param  {number} x - Координата X левого верхнего угла
     * @param  {number} y - Координата Y левого верхнего угла
     * @param  {number} w - Ширина
     * @param  {number} h - Высота
     * @returns {this}
     */
    fillRect(x, y, w, h) {
        this.ctx.fillRect([[x, y, w, h]]);
        return this;
    },

    /** Переключить полноэкранный режим
     * @param  {bool} mode - true - включить, false - отключить
     * @returns {this}
     */
    fullScreen(mode) {
        if (this.$JsMobileBasic.supports.document) {
            if (mode) {
                if (document.documentElement.requestFullscreen)
                    document.documentElement.requestFullScreen();
                else if (document.documentElement.webkitRequestFullScreen)
                    document.documentElement.webkitRequestFullScreen();
            } else {
                if (document.cancelFullScreen)
                    document.cancelFullScreen();
                else if (document.webkitCancelFullScreen)
                    document.webkitCancelFullScreen();
            }
            return this;
        }
        this.debug('Работа в полноэкранном режиме невозможна!');
        return false;
    },

    /** Очищает экран
     * @returns {this}
     */
    cls() {
        const tmp = this.$Draw.color;
        this.setColor(0xFFFFFFFF);
        this.ctx.clear();
        this.setColor(tmp);
        return this;
    },

    /** Заливает экран выбранным цветом
     * @param  {string} color - Цвет в CSS формате
     * @returns {this}
     */
    fillScreen(color) {
        const tmp = this.ctx.color;
        this.setColor(color);
        this.fillRect(0, 0, this.screenWidth(), this.screenHeight());
        this.ctx.color = tmp;
        return this;
    },

    /** Рисует прямоугольник
     * @param  {number} x - Координата X левого верхнего угла
     * @param  {number} y - Координата Y левого верхнего угла
     * @param  {number} w - Ширина
     * @param  {number} h - Высота
     * @returns {this}
     */
    drawRect(x, y, w, h) {
        this.ctx.drawRect([x, y, x1, y1]);
        return this;
    },

    /** Рисует точку по координатам (заливает пиксель)
     * @param  {number} x - X координата точки
     * @param  {number} y - Y координата точки
     * @returns {this}
     */
    drawPlot(x, y) {
        this.ctx.drawPoint([[x, y]]);
        return this;
    },

    /** Очищяет прямоугольную область
     * @param  {number} x - Координата X левого верхнего угла
     * @param  {number} y - Координата Y левого верхнего угла
     * @param  {number} w - Ширина
     * @param  {number} h - Высота
     * @returns {this}
     */
    clearRect(x, y, w, h) {
        const tmp = this.ctx.color;
        this.setColor(this.$Draw.BGCOLOR);
        this.fillRect(x, y, w, h);
        this.ctx.color = tmp;
        return this;
    },

    /** Рисует линию по 2 точкам
     * @param  {number} x1 - X 1 точки
     * @param  {number} y1 - Y 1 точки
     * @param  {number} x2 - X 2 точки
     * @param  {number} y2 - Y 2 точки
     * @returns {this}
     */
    drawLine(x1, y1, x2, y2) {
        if(x1 === Infinity || x2 === Infinity || y1 === Infinity || y2 === Infinity) return this;
        this.gfx.line(x1, y1, x2, y2, this.$Draw.color.getNumber(), this.$Draw._lineWidth);
        return this;
    },

    /** Рисует проекцию паралелепипеда (через 2 соединенных прямоугольника)
     * @param  {number} x - X левого верхнего угла
     * @param  {number} y - Y левого верхнего угла
     * @param  {number} w - ширина
     * @param  {number} h - высота
     * @param  {number} q - глубина
     * @returns {this}
     */
    drawCube(x, y, w, h, q) {
        this.ctx.strokeRect(x, y, w, h);
        this.ctx.strokeRect(x + (q / Math.sqrt(2)), y + (q / Math.sqrt(2)), w, h);
        this.drawLine(x, y, x + (q / Math.sqrt(2)), y + (q / Math.sqrt(2)));
        this.drawLine(x + w, y, x + w + (q / Math.sqrt(2)), y + (q / Math.sqrt(2)));
        this.drawLine(x, y + h, x + (q / Math.sqrt(2)), y + h + (q / Math.sqrt(2)));
        this.drawLine(x + w, y + h, x + w + (q / Math.sqrt(2)), y + h + (q / Math.sqrt(2)));
        return this;
    },

    /** Рисует залитую окружность
     * @param  {number} x - X центра
     * @param  {number} y - Y центра
     * @param  {number} radius - радиус
     * @param  {number} startAngle=(15*PI/7) - Угол начала
     * @param  {number} endAngle=(13*PI/2) - Угол конца
     * @param  {bool} counterClockwise=false - По часовой стрелке?
     * @returns {this}
     */
    drawArc(x, y, radius,
        startAngle,// = (15 * Math.PI / 7),
        endAngle,// = (13 * Math.PI / 2),
        counterClockwise = false) {

        if (!startAngle) {
            this.gfx.ellipse(x, y, radius, radius, this.$Draw.color.getNumber());
        } else {
            this.gfx.pie(x, y, radius, this.deg(startAngle), this.deg(endAngle), this.$Draw.color.getNumber());
        }
        return this;
    },

    /** Рисует залитую окружность
     * @param  {number} x - X центра
     * @param  {number} y - Y центра
     * @param  {number} radius - радиус
     * @param  {number} startAngle=(15*PI/7) - Угол начала
     * @param  {number} endAngle=(13*PI/2) - Угол конца
     * @param  {bool} counterClockwise=false - По часовой стрелке?
     * @returns {this}
     */
    fillArc(x, y, radius,
        startAngle, // = (15 * Math.PI / 7),
        endAngle = (13 * Math.PI / 2),
        counterClockwise = false) {

        if (!startAngle) {
            this.gfx.ellipseFilled(x, y, radius, radius, this.$Draw.color.getNumber());
        } else {
            this.gfx.pieFilled(x, y, radius, this.deg(startAngle), this.deg(endAngle), this.$Draw.color.getNumber());
        }
        return this;
    },

    /** Рисует залитый четырехугольник по четырем точкам
     * @param  {number} x1 - X 1 точки
     * @param  {number} y1 - Y 1 точки
     * @param  {number} x2 - X 2 точки
     * @param  {number} y2 - Y 2 точки
     * @param  {number} x3 - X 3 точки
     * @param  {number} y3 - Y 3 точки
     * @param  {number} x4 - X 4 точки
     * @param  {number} y4 - Y 4 точки
     * @returns {this}
     */
    fillRect4(x1, y1, x2, y2, x3, y3, x4, y4) {
        // this.ctx.beginPath();
        // this.ctx.moveTo(x1, y1);
        // this.ctx.lineTo(x2, y2);
        // this.ctx.lineTo(x3, y3);
        // this.ctx.lineTo(x4, y4);
        // this.ctx.lineTo(x1, y1);
        // this.ctx.closePath();
        // this.ctx.fill(); //TODO:

        return this;
    },

    /** Рисует четырехугольник по четырем точкам
     * @param  {number} x1 - X 1 точки
     * @param  {number} y1 - Y 1 точки
     * @param  {number} x2 - X 2 точки
     * @param  {number} y2 - Y 2 точки
     * @param  {number} x3 - X 3 точки
     * @param  {number} y3 - Y 3 точки
     * @param  {number} x4 - X 4 точки
     * @param  {number} y4 - Y 4 точки
     * @returns {this}
     */
    drawRect4(x1, y1, x2, y2, x3, y3, x4, y4) {
        this.drawLine(x1, y1, x2, y2);
        this.drawLine(x2, y2, x3, y3);
        this.drawLine(x3, y3, x4, y4);
        this.drawLine(x4, y4, x1, y1);

        return this;
    },

    /** Рисует залитый триугольник по трем точкам
     * @param  {number} x1 - X 1 точки
     * @param  {number} y1 - Y 1 точки
     * @param  {number} x2 - X 2 точки
     * @param  {number} y2 - Y 2 точки
     * @param  {number} x3 - X 3 точки
     * @param  {number} y3 - Y 3 точки
     * @returns {this}
     */
    fillTriangle(x1, y1, x2, y2, x3, y3) {
        /* this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x3, y3);
        this.ctx.lineTo(x1, y1);
        this.ctx.closePath();
        this.ctx.fill(); */

        return this;
    },

    /** Рисует n-угольник по точкам
     * @param  {array} array - Двумерный массив точек ([[x,y],[x1,y1],...])
     * @returns {this}
     */
    drawNangle(array) {
        if (!(array && array.length)) {
            console.warn('Аргументом оператора drawNangle должен быть двумерный массив!');
            return this;
        }

        this.ctx.beginPath();
        for (let i = 0; i < array.length; i++) {
            if (i == 0) this.ctx.moveTo(array[i][0], array[i][1]);
            else this.ctx.lineTo(array[i][0], array[i][1]);
        }
        this.ctx.lineTo(array[0][0], array[0][0]);
        this.ctx.closePath();
        this.ctx.stroke();
        return this;
    },

    /** Рисует залитый n-угольник по точкам
     * @param  {array} array - Двумерный массив точек ([[x,y],[x1,y1],...])
     * @returns {this}
     */
    fillNangle(array) {
        if (!(array && array.length)) {
            console.warn('Аргументом оператора fillNangle должен быть двумерный массив!');
            return this;
        }

        this.ctx.beginPath();
        for (let i = 0; i < array.length; i++) {
            if (i == 0) this.ctx.moveTo(array[i][0], array[i][1]);
            else this.ctx.lineTo(array[i][0], array[i][1]);
        }
        this.ctx.lineTo(array[0][0], array[0][0]);
        this.ctx.closePath();
        this.ctx.fill();
        return this;
    },

    /** Рисует триугольник по трем точкам
     * @param  {number} x1 - X 1 точки
     * @param  {number} y1 - Y 1 точки
     * @param  {number} x2 - X 2 точки
     * @param  {number} y2 - Y 2 точки
     * @param  {number} x3 - X 3 точки
     * @param  {number} y3 - Y 3 точки
     * @returns {this}
     */
    drawTriangle(x1, y1, x2, y2, x3, y3) {
        this.drawLine(x1, y1, x2, y2);
        this.drawLine(x2, y2, x3, y3);
        this.drawLine(x3, y3, x1, y1);

        return this;
    },

    /**
     * @param  {string} text - Текст для отображения
     * @param  {number} x - X
     * @param  {number} y - Y
     * @returns {this}
     */
    drawString(text, x, y) {
        /* this.ctx.fillText(text, x, y); */
        return this;
    },

    /** В некоторых реализациях JsMB используется двойная буфферизация
     * repaint производит отрисовку на экран ранее произведенных действий
     * В стандартной реализации ничего не делает
     * @returns {this}
     */
    repaint() {
        this.ctx.present();
        return this;
    },

    /** Задать размер шрифта
     * @param  {number} size - Размер
     * @returns {this}
     */
    setFontSize(size) {
        /* this.ctx.font = size + 'px ' + this.$Font.family;
        this.$Font.size = size; */
        return this;
    },

    /** Задать шрифт
     * @param  {string} family - Шрифт
     * @returns {this}
     */
    setFont(family) {
        /* this.ctx.font = this.$Font.size + 'px ' + family;
        this.$Font.family = family; */
        return this;
    },

    /** Создает линейный градиент
     * @param  {number} x - X координата левого верхнего угла
     * @param  {number} y - Y координата левого верхнего угла
     * @param  {number} x1 - X координата правого нижнего угла
     * @param  {number} y1 - Y координата правого нижнего угла
     * @returns {this}
     */
    makeLinearGradient(x, y, x1, y1) {
        /* return this.ctx.createLinearGradient(x, y, x1, y1); */
        return null;
    },

    /** Создает радиальный (круговой) градиент
     * @param  {number} x - X координата левого верхнего угла
     * @param  {number} y - Y координата левого верхнего угла
     * @param  {number} r - Радиус внутреннего круга
     * @param  {number} x1 - X координата правого нижнего угла
     * @param  {number} y1 - Y координата правого нижнего угла
     * @param  {number} r1 - Радиус внешнего круга
     * @returns {this}
     */
    makeRadialGradient(x, y, r, x1, y1, r1) {
        /* return this.ctx.createRadialGradient(x, y, r, x1, y1, r1); */
        return null;
    },

    /** Задать цвет градиенту
     * @param  {gradient} g - Градиент
     * @param  {number} pos - Позиция (0 - 1)
     * @param  {string} color - Цвет в CSS формате
     * @returns {this}
     */
    setGradientColor(g, pos, color) {
        // g.addColorStop(pos, color);
        return this;
    },

    // Конвертеры

    /** Цвет в rgb
     * @param  {number} red=0 - Значение красного цвета (0 - 255)
     * @param  {number} green=0 - Значение зеленого цвета (0 - 255)
     * @param  {number} blue=0 - Значение синего цвета (0 - 255)
     * @returns {string} "rgb(red, green, blue)"
     */
    rgb(red = 0, green = 0, blue = 0) {
        return [255, red, green, blue];
    },

    /** Цвет в rgb
     * @param  {number} red=0 - Значение красного цвета (0 - 255)
     * @param  {number} green=0 - Значение зеленого цвета (0 - 255)
     * @param  {number} blue=0 - Значение синего цвета (0 - 255)
     * @param  {number} alpha=0 - Прозрачность (0 - 1)
     * @returns {string} "rgba(red, green, blue, alpha)"
     */
    rgba(red = 0, green = 0, blue = 0, alpha = 0) {
        return [red, green, blue, alpha];
    },

    // Гели/спрайты

    /** Загрузить гель в память
     * @param  {string} file - Файл (./,http,...)
     * @param  {string} name - Имя геля
     * @returns {this}
     */
    gelLoad(file, name) {
        this.$Gel[name] = new Image();
        this.$Gel[name].src = file;
        return this;
    },

    /** [НЕ РЕАЛИЗОВАНО]
     * Переводит гель в спрайт
     * @param  {string} sprite - Имя спрайта
     * @param  {string} gel - Имя геля
     * @returns {this}
     */
    spriteGel(/* sprite, gel */) {
        console.warn('Внимание! Оператор spriteGel не работает!');
        return this;
    },

    /** Рисует гель по указанным координатам
     * @param  {string} name - Имя геля
     * @param  {number} x - X координата левого верхнего угла
     * @param  {number} y - Y координата левого верхнего угла
     * @returns {this}
     */
    drawGel(name, x, y) {
        if (this.$Gel[name].resize == true) {
            this.ctx.drawImage(this.$Gel[name], x, y, this.$Gel[name].w, this.$Gel[name].h);
        } else {
            this.ctx.drawImage(this.$Gel[name], x, y);
        }
        return this;
    },

    /** [НЕ РЕАЛИЗОВАНО]
     * Рисует спрайт по указанным координатам
     * @param  {string} name - Имя спрайта
     * @param  {number} x - X координата левого верхнего угла
     * @param  {number} y - Y координата левого верхнего угла
     * @returns {this}
     */
    drawSprite(/* name, x, y */) {
        console.warn('Внимание! Оператор drawSprite не работает!');
        return this;
    },

    /** Задать размеры гелю (деформация)
     * @param  {string} name - Название геля
     * @param  {number} w - Ширина
     * @param  {number} h - Высота
     * @returns {this}
     */
    gelSize(name, w, h) {
        this.$Gel[name].resize = true;
        this.$Gel[name].w = w;
        this.$Gel[name].h = h;
        return this;
    },

    /** Рисует фрагмент геля
     * @param  {string} name - Имя геля
     * @param  {number} fx - Координаты левого верхнего угла области
     * @param  {number} fy - Координаты левого верхнего угла области
     * @param  {number} fw - Ширина области
     * @param  {number} fh - Высота области
     * @param  {number} x - Координаты левого верхнего угла для рисования
     * @param  {number} y - Координаты левого верхнего угла для рисования
     * @param  {number} w=fw - ширина для рисования
     * @param  {number} h=fh - высота для рисования
     * @returns {this}
     */
    drawGelFragment(name, fx, fy, fw, fh, x, y, w = fw, h = fh) { // TODO: Проверить
        // this.ctx.drawImage(this.$Gel[name], fx, fy, fw, fh, x, y, w, h);
        return this;
    },

    /** Создает текстуру из геля
     * @param  {string} gelname - Имя геля
     * @param  {string} repeat='repeat' - Повторение (repeat/no-repeat)
     * @returns {this}
     */
    makeTexture(gelname, repeat = 'repeat') { // repeat/no-repeat
        return this.ctx.createPattern(this.$Gel[gelname], repeat);
    },


    // Ввод

    /** Окно ввода данных
     * @param  {string} text - Текст заголовка окна
     * @param  {string} [def] - Текст по умолчанию
     * @returns {this}
     */
    input(text, def) {
        const tmp = prompt(text, def); // eslint-disable-line
        return Number(tmp) || tmp;
    },


    // Вывод

    /** Вывести текст на экран
     * @returns {this}
     */
    println(...text) {
        const p = document.getElementById('p');

        p.style = 'position:fixed;top:0px;left:0px;width:100%;height:100%;-webkit-user-select:none;    pointer-events: none;';
        p.innerHTML += text + '<br/>';
        return this;
    },

    // Звук

    /** Играть звук
     * @param  {string} file - Файл звука
     * @param  {bool} loop - Зациклить?
     * @param  {string} channel=0 - Канал
     * @returns {this}
     */
    playSound(file, loop = false, channel = 0) {
        if (!this.$Player[0]) {
            console.warn('На вашей платформе не поддерживается воспроизведение звука!');
            return this;
        }
        if (this.$Player[channel] === undefined) {
            const p = document.createElement('audio');

            p.id = 'player' + channel;
            document.getElementById('audio').appendChild(p);
            this.$Player[channel] = document.getElementById('player' + channel);
        }
        this.$Player[channel].setAttribute('src', file);

        this.$Player[channel].setAttribute('loop', Number(loop));

        this.$Player[channel].play();
        return this;
    },

    /** Приостановить воспроизведение звука на канале
     * @param  {number} channel=-1 - Канал (-1 для остановки на всех каналах)
     * @returns {this}
     */
    pauseSound(channel = -1) {
        if (!this.$Player[0]) return this;
        if (channel == -1) {
            for (const ch of this.$Player) {
                ch.pause();
            }
            return this;
        }
        if (this.$Player[channel] === undefined) {
            this.debug('На данном канале нет плеера');
            return false;
        }
        this.$Player[channel].pause();
        return this;
    },

    // Matheматика

    /** Возвращает квадратный корень из числа
     * @param  {number} number - Число
     * @returns {number}
     */
    'sqrt': number => Math.sqrt(number),

    /** Возвращает случайное число
     * @param  {number} min - От
     * @param  {number} max - До
     * @returns {number}
     */
    'random': (min, max) => Math.floor(Math.random() * max) + min,

    /** Возвращает синус угла
     * @param  {number} angle - Угол в радианах
     * @returns {number}
     */
    'sin': angle => Math.sin(angle),

    /** Возвращает косинус угла
     * @param  {number} angle - Угол в радианах
     * @returns {number}
     */
    'cos': angle => Math.cos(angle),

    /** Возвращает тангенс угла
     * @param  {number} angle - Угол в радианах
     * @returns {number}
     */
    'tan': angle => Math.tan(angle),

    /** Возвращает котангенс угла
     * @param  {number} angle - Угол в радианах
     * @returns {number}
     */
    'ctg': angle => 1 / Math.tan(angle),

    /** Возвращает арксинус угла (в радианах)
     * @param  {number} number - Угол в радианах
     * @returns {number}
     */
    'asin': number => Math.asin(number),

    /** Возвращает арккосинус угла (в радианах)
     * @param  {number} number - Угол в радианах
     * @returns {number}
     */
    'acos': number => Math.acos(number),

    /** Возвращает арктангенс угла (в радианах)
     * @param  {number} number - Угол в радианах
     * @returns {number}
     */
    'atan': number => Math.atan(number),

    /** Возвращает остаток от деления 2-х чисел
     * @param  {number} x - Делимое
     * @param  {number} y - Делитель
     * @returns {number}
     */
    'mod': (x, y) => x % y,

    /** Возвращает модуль числа
     * @param  {number} number - Число
     * @returns {number}
     */
    'abs': number => Math.abs(number),

    /** Возводит число в степень
     * @param  {number} number - Число
     * @param  {number} power - Степень
     * @returns {number}
     */
    'pow': (number, power) => Math.pow(number, power),

    /** Возвращает натуральный логарифм от числа
     * @param  {number} number - Число
     * @returns {number}
     */
    'ln': number => Math.log(number),

    /** Возвращает число e в степени
     * @param  {number} power - Степень
     * @returns {number}
     */
    'exp': power => Math.exp(power),

    /** Возвращает ограниченное значение переменной
     * @param  {number} variable - Начальное значение
     * @param  {number} min - Минимум (нижняя граница)
     * @param  {number} max - Максимум (верхняя граница)
     * @returns {number}
     */
    limit(variable, min, max) {
        return variable <= min ? min : max;
    },

    /** Возвращает минимальное значение из аргументов
     * @returns {number}
     */
    'min': (...a) => Math.min(...a),

    /** Возвращает максимальное значение из аргументов
     * @returns {number}
     */
    'max': (...a) => Math.max(...a),

    /** Переводит градусы в радианы
     * @param  {number} deg - Значение в градусах
     * @returns {number} Радианы
     */
    rad(deg) {
        if (deg === 90) return this.PI / 2;
        if (deg === 270) return 3 * this.PI / 2;
        return deg * this.DEG2RAD;
    },

    /** Переводит радианы в градусы
     * @param  {number} rad - Значение в радианах
     * @returns {number} Градусы
     */
    deg(rad) {
        return rad * this.RAD2DEG;
    },

    // Строковые функции


    /** Возвращает длину строки/массива
     * @param  {string} str - Строка/массив
     * @returns {number}
     */
    'len': str => str.length,

    /** Переводит число/значение в строку
     * @param  {*} num - Число или другое значение
     * @returns {string}
     */
    'str': num => String(num),

    /** Переводит строку в число (или возвращает NaN, если это невозможно)
     * @param  {string} str - Строка с числом
     * @returns {number}
     */
    'val': str => Number(str),

    /** Переводит строку в число (или возвращает NaN, если это невозможно)
     * Лучше использовать val
     * @param  {string} str - Строка с числом
     * @param  {number} [system=10] - Система исчисления
     * @returns {number} Int
     */
    int(str, system = 10) {
        return parseInt(str, system);
    },

    /** Переводит строку в число с плавающей точкой (или возвращает NaN, если это невозможно)
     * @param  {string} str - Строка с числом
     * @returns {number} Float
     */
    'float': str => parseFloat(str),

    /** Приводит все символы строки в ВЕРХНИЙ РЕГИСТР
     * @param  {string} str - Строка
     * @returns {string}
     */
    'upper': str => str.toUpperCase(),

    /** Приводит все символы строки в нижний регистр
     * @param  {string} str - Строка
     * @returns {string}
     */
    'lower': str => str.toLowerCase(),

    /** Возвращает часть строки
     * @param  {string} str - Строка
     * @param  {number} pos - Начало выделения
     * @param  {number} len - Длина выделения
     * @returns {string}
     */
    'mid': (str, pos, len) => str.substr(pos, len),

    /** Возвращает символ по его коду. Можно передать несколько кодов
     * @param  {number} code - Код(ы) символа
     * @returns {string}
     */
    'chr': (...codes) => String.fromCharCode(...codes), // code to string

    /** Возвращает код символа
     * @param  {string} str - Строка
     * @param  {number} [pos=0] - Позиция символа в строке
     * @returns {number}
     */
    'asc': (str, pos = 0) => str.charCodeAt(pos), // string to code

    /** Разбивает строку и возвращает массив частей
     * @param  {string} str - Строка
     * @param  {string} char - Символ/регулярное выражение, по которому разбивать
     * @returns {array}
     */
    'split': (str, char) => str.split(char),

    /** Переводит массив в строку, разделяя элементы разделителем
     * @param  {array} array - массив
     * @param  {string} [separator=' '] - разделитель
     * @returns {string}
     */
    'join': (array, separator = ' ') => array.join(separator),

    /** Возвращает строку с замененной частью
     * @param  {string} str - Строка
     * @param  {string} reg - Строка/регулярное выражение для замены
     * @param  {string} to - На что менять
     * @param  {bool} [all=false] - Заменять все включения
     * @returns {string}
     */
    replace(str, reg, to, all = false) {
        if (all) return str.replace(new RegExp(reg, 'g'));
        return str.replace(reg, to);
    },

    // Работа с локальными данными

    /** Сохранить данные в хранилище
     * @param  {string} name - Название ячейки
     * @param  {*} _data - Данные
     * @returns {this}
     */
    localSaveData(name, _data) {
        const data = typeof (_data) == 'object' ? this.toJSON(_data) : _data;

        window.localStorage.setItem(name, data);
        return this;
    },

    /** Получить данные из хранилища
     * @param  {string} name - Название ячейки
     * @returns {object}
     */
    localReadData(name) {
        /* try {
            return this.parseJSON(window.localStorage.getItem(name));
        } catch (e) {
            return window.localStorage.getItem(name);
        } */
    },

    /** Возвращает объект из JSON строки
     * @param  {string} json - JSON строка
     * @returns {object}
     */
    'parseJSON': (json) => {
        try {
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    },

    /** Возвращает JSON строку из объекта
     * @param  {object} object - Объект
     * @param  {function} [f=null] - Дополнительный обработчик
     * @param  {number} [s=4] - Отступ
     * @returns {string}
     */
    'toJSON': (object, f = null, s = 4) => JSON.stringify(object, f, s),

    /** Возвращает PSON строку из объекта (с функциями)
     * @param  {object} object - Объект
     * @param  {number} [s=4] - Отступ
     * @returns {string}
     */
    'toPSON': (object, s = 4) => JSON.stringify(object, (a, b) => typeof b === 'function' ? String(b) : b, s), // eslint-disable-line

    // Работа с модулями

    /** Подключает модуль/файл
     * @param  {string} file - Имя/адрес файла
     * @returns {this}
     */
    include(file) {
        //TODO:FIXME:
        /* const e = document.createElement('script');

        e.src = file;
        e.type = 'text/javascript';
        document.getElementById('modules').appendChild(e); */
        return this;
    },

    getModuleName(ID) {
        console.warn('This function is deprecated!');
        return ID.name;
    },

    getModuleAuthor(ID) {
        console.warn('This function is deprecated!');
        return ID.author;
    },

    getModuleDescription(ID) {
        console.warn('This function is deprecated!');
        return ID.description;
    },

    getModuleUrl(ID) {
        console.warn('This function is deprecated!');
        return ID.url;
    },

    getModuleVersion(ID) {
        console.warn('This function is deprecated!');
        return ID.version;
    },

    // Получение значений

    /** Возвращает ширину экрана
     * @returns {number}
     */
    screenWidth() {
        return this.c.size.w;
    },

    /** Возвращает высоту экрана
     * @returns {number}
     */
    screenHeight() {
        return this.c.size.h;
    },

    /** Возвращает X координату мыши в данный момент
     * @returns {number}
     */
    getMouseX() {
        return this.$Mouse.x;
    },

    /** Возвращает Y координату мыши в данный момент
     * @returns {number}
     */
    getMouseY() {
        return this.$Mouse.y;
    },

    /** Возвращает количество кликов с момента запуска программы
     * @returns {number}
     */
    getLeftClicksCount() {
        return this.$Mouse.lcount;
    },

    /** Возвращает количество правых кликов с момента запуска программы
     * @returns {number}
     */
    getRightClicksCount() {
        return this.$Mouse.rcount;
    },


    // Техническое

    /** Логирование
     * @param  {*} - Данные
     * @returns {this}
     */
    log(...text) {
        console.log(...text);
        return this;
    },

    /** Вывести сообщение для отладки
     * @param  {string} text - Сообщение
     * @param  {string} [style] - Оформление сообщения (CSS)
     * @returns {this}
     */
    debug(text) {
        if ($Config.Debug_Mode) {
            console.log(text);
        }
        return this;
    },

    /** Закрыть программу
     * @returns {this}
     */
    exit() {
        process.exit(0);
        return this;
    },

    _Color: class {
        constructor(color) {
            {
                this.getRgbArray = this.getRgbArray.bind(this);
                this.getArgbArray = this.getArgbArray.bind(this);
                this.getHex = this.getHex.bind(this);
                this.getNumber = this.getNumber.bind(this);
                this.getObject = this.getObject.bind(this);
            }
            this._color = { a: 0, r: 0, g: 0, b: 0 };
            if (typeof color === 'number') {
                this._color = {
                    a: (color >> 24) & 0xFF,
                    r: (color >> 16) & 0xFF,
                    g: (color >> 8) & 0xFF,
                    b: (color >> 0) & 0xFF
                }
            }
            else if (typeof color === 'object') {
                if(color instanceof JsMB._Color) {
                    this._color = color._color;
                }
                else if (color instanceof Array) {
                    if (color.length === 4) {
                        if (color[3] > 0 && color[3] <= 1) {
                            //Css RGBA format
                            this._color = {
                                a: (color[3] * 1000) & 0xFF,
                                r: color[0],
                                g: color[1],
                                b: color[2]
                            }
                        }
                        else {
                            //[TEMP] SDL ARGB format
                            this._color = {
                                a: color[0],
                                r: color[1],
                                g: color[2],
                                b: color[3]
                            }
                        }
                    }
                    else {
                        //TODO: RGB
                        JsMB.debug(`[COLOR] Неизвестный формат массива цвета!`);
                        this._color = { a: 0, r: color[0] || 0, g: color[1] || 0, b: color[2] || 0 };
                    }
                }

                else if (color.r + 1 && color.g + 1 && color.b + 1 && color.a + 1) {
                    this._color = color;
                }

                else {
                    JsMB.debug(`[COLOR] Неизвестный формат цвета!`);
                    this._color = { a: 0, r: 0, g: 0, b: 0 };
                }
            }
        }

        getRgbArray() {
            const c = this._color;
            return [c.r, c.g, c.b];
        }

        getArgbArray() {
            const c = this._color;
            return [c.a, c.r, c.g, c.b];
        }

        getHex() {}

        getNumber() {
            //FIXME: Можно проще
            const c = this._color;
            let a = c.a.toString(16)
                a = a.length === 1 ? '0'+a : a;
            let r = c.r.toString(16)
                r = r.length === 1 ? '0' + r : r;
            let g = c.g.toString(16)
                g = g.length === 1 ? '0' + g : g;
            let b = c.b.toString(16)
                b = b.length === 1 ? '0' + b : b;
            return Number(`0x${a}${r}${g}${b}`);
        }

        getObject() {
            return this._color;
        }
    },

    // Обработчики событий TODO:
    _eventListeners() {
        // window.onClick =
        //     window.onMouseDown = window.onMouseMove = window.onMouseUp = window.onKeyDown = window.onKeyPress = window.onKeyUp = window.onRightClick = window.Loop = () => {};
        this.c.addEventListener('mousemove', (event) => {
            this.$Mouse.x = event.offsetX;
            this.$Mouse.y = event.offsetY;
            if (typeof onMouseMove === 'function')
                onMouseMove(event.offsetX, event.offsetY, event);
        }, false);
        this.c.addEventListener('click', (event) => {
            this.$Mouse.lcount++;
            if (typeof onClick === 'function')
                onClick(event.offsetX, event.offsetY, event);
        }, false);
        this.c.addEventListener('mousedown', (event) => {
            if (typeof onMouseDown === 'function')
                onMouseDown(event.offsetX, event.offsetY, event);
        }, false);
        this.c.addEventListener('mouseup', (event) => {
            if (typeof onMouseUp === 'function')
                onMouseUp(event.offsetX, event.offsetY, event);
        }, false);
        this.c.addEventListener('contextmenu', (event) => {
            this.$Mouse.rcount++;
            if (typeof onRightClick === 'function')
                onRightClick(event.offsetX, event.offsetY, event);
        }, false);
        window.addEventListener('keypress', (event) => {
            if (typeof onKeyPress === 'function')
                onKeyPress(event.keyCode, event);
        }, false);

        window.addEventListener('keydown', (event) => {
            if (typeof onKeyDown === 'function')
                onKeyDown(event.keyCode, event);
        }, false);

        window.addEventListener('keyup', (event) => {
            if (typeof onKeyUp === 'function')
                onKeyUp(event.keyCode, event);
        }, false);
    }
};
// ======Прочее======//

JsMB.__preinit();
if (JsMB.$JsMobileBasic.supports.browser && $Config.mount_window) {
    Object.assign(window, JsMB);
    JsMB.__init();
} else {
    JsMB.__init();
}

if (typeof module === 'object') module.exports = JsMB;

JsMB.debug('// ======Инициализация завершена======//', 'background:black;color: #00ff00;');

if (typeof window !== 'undefined') window.addEventListener('load', () => {
    JsMB._eventListeners();
    if (typeof Main === "function") Main(); //eslint-disable-line
    else throw new Error('В файле Autorun.bas должен быть хук Main()!');
    if (typeof Loop === 'function') {
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = (window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function (fnc) {
                return window.setTimeout(fnc, 1000 / 60);
            });
        }

        function $Loop() { //eslint-disable-line
            window.requestAnimationFrame($Loop);
            Loop();
        }
        $Loop();
    }
});

JsMB.debug('// ======Подключение модулей/библиотек======//', 'color:gray;');