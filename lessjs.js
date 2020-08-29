function Term(options) {
    this.enabled = options.enabled || false;
    this.linesPerScreen = options.linesPerScreen || 100;
    this.funShowHtml = options.funShowHtml || null;
    this.funOpenCommand = options.funOpenCommand || null;
    this.funCloseCommand = options.funCloseCommand || null;
    this.funShowCommand = options.funShowCommand || null;
    this.beforeCommandSubmit = options.beforeCommandSubmit || null;
    this.onKeyEvent = options.onKeyEvent || null;

    this.highlightReg = false;
    this.inCommandMode = false;
    this.commandText = "";
    this.tempDiv = document.createElement("div");
    this.setText(options.fulltext || "");
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

Term.prototype.handleKeyEvent = function (e) {
    if (!this.enabled) return;
    if (this.onKeyEvent) this.onKeyEvent(e);
    if (this.inCommandMode) {
        if (e.key == 'Escape') {
            if (this.funCloseCommand) this.funCloseCommand();
            return;
        }
        if (e.key == 'Enter') {
            if (this.funShowCommand) this.funShowCommand(this.commandText);
            if (this.beforeCommandSubmit) {
                this.commandText = this.beforeCommandSubmit(this.commandText);
            }
            this.sendCommand(this.commandText);
            if (this.funCloseCommand)
                this.funCloseCommand();
            return;
        }
        if (e.key == 'Backspace') {
            this.commandText = this.commandText.substr(0, this.commandText.length - 1);
            if (this.commandText.length == 1) {
                if (this.funCloseCommand)
                    this.funCloseCommand();
            }
            if (this.funShowCommand) this.funShowCommand(this.commandText);
            return;
        } else if (isPrintableKeyCode(e.keyCode)) {
            this.commandText += e.key;
        }
        if (this.funShowCommand) this.funShowCommand(this.commandText);
        return;
    }
    switch (e.key) {
        case 'k': this.prevLine(); break;
        case 'j': this.nextLine(); break;
        case 'd': this.nextPage(0.5); break;
        case 'u': this.prevPage(0.5); break;
        // case 'l': $("#content").scrollLeft($("#content").scrollLeft() + 100); break;
        // case 'h': $("#content").scrollLeft($("#content").scrollLeft() - 100); break;
        case ':': if (this.funOpenCommand) this.funOpenCommand(":", "command"); break;
        case '/': if (this.funOpenCommand) this.funOpenCommand("/", "search"); break;
    }
}

Term.prototype.setText = function (text) {
    this.fulltext = text;
    this.fullLines = this.fulltext.split("\n");
    this.curScreen = [];
    this.curLine = 0;
}

Term.prototype.setLine = function (line) {
    this.curLine = line;
    if (this.curLine < 0)
        this.curLine = 0;
    else if (this.curLine >= this.fullLines.length) {
        this.curLine = this.fullLines.length - 1;
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
    this.show();
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
                // backgoround
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

Term.prototype.show = function () {
    if (this.enabled && this.funShowHtml) {
        let text = this.encodeHtmlEntities(this.text(true));
        // Highlights
        if (this.highlightReg) {
            text = text.replace(this.highlightReg, '\033\[44m$1\033\[49m');
        }

        // Parse color control characters
        text = this.parseColor(text);
        this.funShowHtml(text);
    }
}

Term.prototype.encodeHtmlEntities = function (text) {
    let div = this.tempDiv;
    $(div).text(text);
    return $(div).html();
}

Term.prototype.setHighlight = function (regText) {
    this.highlightReg = new RegExp("(" + regText + ")", "g");
    console.log("setHighlight to ", this.highlightReg);
    this.show();
}

Term.prototype.noHighlight = function () {
    this.highlightReg = false;
    this.show();
}

Term.prototype.sendCommand = function (cmd) {
    console.log(cmd);
    if (cmd.substr(0, 7) == "/alert ") {
        return alert(cmd.substr(7));
    }

    if (cmd.substr(0, 1) == "/") {
        return this.setHighlight(cmd.substr(1));
    }
    
    if (cmd == ':nohl') {
        return this.noHighlight();
    }

    if (cmd.substr(0, 1) == ':') {
        if (cmd.substr(1).match(/^\d+$/)) {
            return this.setLine(parseInt(cmd.substr(1)) - 1);
        }
    }
}