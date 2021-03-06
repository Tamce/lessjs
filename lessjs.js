/**
 * LessJs, https://github.com/tamce/lessjs
 * Author: Tamce <tamce@outlook.com>
 * License MIT
 */

function Term(options) {
    this.debug = options.debug || false;
    this.debugPrintThis = options.debugPrintThis || false;
    this.enabled = options.enabled || false;
    this.linesPerScreen = Math.floor(options.linesPerScreen || 100);
    this.funShowHtml = options.funShowHtml || null;
    this.funShowLineNumber = options.funShowLineNumber || null;
    this.funShowCommandBar = options.funShowCommandBar || null;
    this.funHideCommandBar = options.funHideCommandBar || null;
    this.funSetCommandBarText = options.funSetCommandBarText || null;
    this.beforeCommandSubmit = options.beforeCommandSubmit || null;
    this.funSetStatusBarText = options.funSetStatusBarText || null;
    this.onKeyEvent = options.onKeyEvent || null;
    let el = document.querySelector(options.eventElement);
    el.onkeydown = this.handleKeyEvent.bind(this);
    el.onmousewheel = this.handleWheelEvent.bind(this);
    

    this.highlightReg = false;
    this.inCommandMode = false;
    this.commandText = "";
    this.statusText = "";
    this.tempDiv = document.createElement("div");
    this.setText(options.fulltext || "");
}

Term.prototype.handleWheelEvent = function (e) {
    if (e.deltaY > 0) {
        this.nextLine();
    } else if (e.deltaY < 0) {
        this.prevLine();
    }
    e.stopPropagation();
}

Term.prototype.isPrintableKeyCode = function (keycode) {
    let valid = 
        (keycode > 47 && keycode < 58)   || // number keys
        keycode == 32 || keycode == 13   || // spacebar & return key(s) (if you want to allow carriage returns)
        (keycode > 64 && keycode < 91)   || // letter keys
        (keycode > 95 && keycode < 112)  || // numpad keys
        (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
        (keycode > 218 && keycode < 223);   // [\]' (in order)
    return valid;
}

Term.prototype.debugLog = function(...args) {
    if (this.debug && this.debugPrintThis) {
        console.log(...args, this);
    } else if (this.debug) {
        console.log(...args);
    }
}

Term.prototype.handleKeyEvent = function (e) {
    this.debugLog("handleKeyEvent: ", e.key, e.keyCode);
    if (!this.enabled) return;
    if (this.onKeyEvent) this.onKeyEvent(e);
    if (this.inCommandMode) {
        if (e.key == 'Escape') {
            if (this.funHideCommandBar) this.funHideCommandBar();
            this.inCommandMode = false;
            return;
        }
        if (e.key == 'Enter') {
            this.inCommandMode = false;
            if (this.funSetCommandBarText) this.funSetCommandBarText(this.commandText);
            this.sendCommand(this.commandText);
            if (this.funHideCommandBar)
                this.funHideCommandBar();
            return;
        }
        if (e.key == 'Backspace') {
            this.commandText = this.commandText.substr(0, this.commandText.length - 1);
            if (this.commandText.length < 1) {
                this.inCommandMode = false;
                if (this.funHideCommandBar)
                    this.funHideCommandBar();
                return;
            }
            if (this.funSetCommandBarText) this.funSetCommandBarText(this.commandText);
            return;
        } else if (this.isPrintableKeyCode(e.keyCode)) {
            this.commandText += e.key;
        }
        if (this.funSetCommandBarText) this.funSetCommandBarText(this.commandText);
        return;
    }
    switch (e.key) {
        case 'g': this.setLine(0); break;
        case 'G': this.setLine(this.fullLines.length); break;
        case 'k': this.prevLine(); break;
        case 'j': this.nextLine(); break;
        case 'd': this.nextPage(0.5); break;
        case 'u': this.prevPage(0.5); break;
        case 'n': this.nextMatch(); break;
        case 'N': this.prevMatch(); break;
        case ':':
        case '/':
            this.inCommandMode = true;
            this.commandText = e.key;
            if (this.funShowCommandBar) {
                this.funShowCommandBar(e.key, e.key == ':' ? 'command' : 'search');
            }
            break;
    }
}

Term.prototype.setText = function (text) {
    this.fulltext = text;
    this.fullLines = this.fulltext.split("\n");
    this.curScreen = [];
    this.curLine = 0;
    this.show();
}

Term.prototype.setLine = function (line) {
    line = Math.floor(line);
    if (isNaN(line)) {
        line = 0;
    }
    this.curLine = line;
    let max = Math.floor(this.fullLines.length - this.linesPerScreen / 3);
    if (this.curLine < 0) {
        this.curLine = 0;
    } else if (this.curLine >= max) {
        this.curLine = max;
    }
    this.show();
}

Term.prototype.nextLine = function () {
    return this.next(1);
}

Term.prototype.prevLine = function () {
    return this.prev(1);
}

Term.prototype.nextPage = function (scale) {
    if (!scale) scale = 0.9;
    return this.next(Math.floor(this.linesPerScreen * scale));
}

Term.prototype.prevPage = function (scale) {
    return this.nextPage(-1 * scale);
}

Term.prototype.prev = function (line) {
    return this.next(-1 * line);
}

Term.prototype.next = function (line) {
    this.setLine(this.curLine + line);
}

Term.prototype.nextMatch = function (diff, offset) {
    if (!this.highlightReg) return;
    if (!diff) diff = 1;
    if (undefined == offset) offset = diff;

    this.show();    // update highlight style display first
    let cur = this.curLine + offset;
    while (cur < this.fullLines.length && cur >= 0) {
        if (this.fullLines[cur].match(this.highlightReg)) {
            this.setLine(cur);
            return;
        }
        cur += diff;
    }
    this.setStatus("NOT FOUND | ");
}

Term.prototype.prevMatch = function () {
    return this.nextMatch(-1);
}

Term.prototype.text = function (update) {
    if (!update) {
        return this.curScreen.join("\n");
    }

    let n = 0;
    this.curScreen = [];
    for (let i = this.curLine; i < this.fullLines.length; ++i) {
        if (n++ >= this.linesPerScreen)
            break;
        this.curScreen.push(this.fullLines[i]);
    }
    return this.curScreen.join("\n");
}

Term.prototype.parseColor = function (text) {
    // FIXME: 目前代码 9 只是当作默认来处理（使用9族class），并没有实现类似的 pop 的逻辑
    text = "<span>" + text + "</span>";
    let match = null;
    let curfg = 9;
    let curbg = 9;
    let curfmt = 9;
    while (match = text.match(/\033\[(.*?)m/)) {
        let ctrls = match[1].split(";");
        // console.log("Color segs:", ctrls);
        
        let cls = "";
        ctrls.forEach(ctrl => {
            if (ctrl >= 30 && ctrl <= 39) {
                // foreground
                curfg = ctrl - 30;
            } else if (ctrl >= 40 && ctrl <= 49) {
                // background
                curbg = ctrl - 40;
            } else if (ctrl < 10) {
                // formatter
                curfmt = ctrl;
            }
        });
        cls = `fg${curfg} bg${curbg} fmt${curfmt}`;
        text = text.replace(/\033\[(.*?)m/, `</span><span class="${cls}">`);
    }
    return text;
}

Term.prototype.setStatus = function (status) {
    this.statusText = status || "";
    if (this.funSetStatusBarText) {
        let cur = this.curLine + 1;
        let tot = this.fullLines.length;
        let percent = Math.floor(cur / tot * 100);
        status = this.statusText + `${cur} / ${tot} (${percent}%)`;
        this.funSetStatusBarText(status);
    }
}

Term.prototype.show = function () {
    if (this.enabled && this.funShowHtml) {
        let text = this.encodeHtmlEntities(this.text(true));
        text = text.replace(/\n/g, "<br>");
        // Highlights
        if (this.highlightReg) {
            text = text.replace(this.highlightReg, '\033\[43m$1\033\[49m');
        }

        // Parse color control characters
        text = this.parseColor(text);
        this.funShowHtml(text);
        this.setStatus();
    }
    if (this.enabled && this.funShowLineNumber) {
        let ln = this.curLine;
        let result = this.curScreen.map(function () {
            ln++;
            return ln;
        });
        this.funShowLineNumber(result.join("<br>"));
    }
}

Term.prototype.encodeHtmlEntities = function (text) {
    let div = this.tempDiv;
    $(div).text(text);
    return $(div).html();
}

Term.prototype.setHighlight = function (regText) {
    if (!regText) return;
    // Only support for i flag
    let flag = "";
    if (regText.match(/(?!\\).\/i$/)) {
        flag = "i";
        regText = regText.substr(0, regText.length - 2);
    }
    this.debugLog("setHighlight: ", regText, "g" + flag);
    this.highlightReg = new RegExp("(" + regText + ")", "g" + flag);
    this.nextMatch(1, 0);
}

Term.prototype.noHighlight = function () {
    this.highlightReg = false;
    this.show();
}

Term.prototype.sendCommand = function (cmd) {
    this.debugLog("send command: ", cmd);
    if (this.beforeCommandSubmit) {
        this.commandText = this.beforeCommandSubmit(this.commandText);
    }
    this.commitCommand(this.commandText);
}

Term.prototype.commitCommand = function (cmd) {
    this.debugLog("commit command: ", cmd);
    if (cmd.substr(0, 7) == ":alert ") {
        return alert(cmd.substr(7));
    }

    if (cmd.substr(0, 1) == "/") {
        return this.setHighlight(cmd.substr(1));
    }
    
    switch (cmd) {
        case ':nohl': return this.noHighlight();
        case ':debug': this.debug = true; return;
        case ':nodebug': this.debug = false; return;
    }

    // jump to line n[%]
    if (cmd.match(/^:\d+$/)) {
        return this.setLine(parseInt(cmd.substr(1)) - 1);
    } else if (cmd.match(/^:\d+%$/)) {
        let percent = parseInt(cmd.match(/^:(\d+)%$/)[1]);
        this.setLine(percent / 100 * this.fullLines.length);
    }
}