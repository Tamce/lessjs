function Term(options) {
    //fulltext, linesPerScreen, funShowHtml) {
    this.enabled = false;
    this.linesPerScreen = options.linesPerScreen;
    this.funShowHtml = options.funShowHtml;
    this.highlightReg = false;
    this.tempDiv = document.createElement("div");
    this.setText = function (text) {
        this.fulltext = text;
        this.fullLines = this.fulltext.split("\n");
        this.curScreen = [];
        this.curLine = 0;
    }
    this.setText(options.fulltext);
    this.setLine = function (line) {
        this.curLine = line;
        if (this.curLine < 0)
            this.curLine = 0;
        else if (this.curLine >= this.fullLines.length) {
            this.curLine = this.fullLines.length - 1;
        }
        this.show();
    }
    this.nextLine = function () {
        return this.next(1);
    }
    this.prevLine = function () {
        return this.prev(1);
    }
    this.nextPage = function (scale) {
        if (!scale) scale = 0.9;
        return this.next(Math.floor(this.linesPerScreen * scale));
    }
    this.prevPage = function (scale) {
        return this.nextPage(-1 * scale);
    }
    this.prev = function (line) {
        return this.next(-1 * line);
    }
    this.next = function (line) {
        this.setLine(this.curLine + line);
        this.show();
    }
    this.text = function (update) {
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
    this.parseColor = function (text) {
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
            cls = `fg${curfg} bg${curbg} fmt${}`;
            text = text.replace(/\033\[(.*?)m/, `</span><span class="${cls}">`);
        }
        return text;
    }
    this.show = function () {
        if (this.enabled) {
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
    this.encodeHtmlEntities = function (text) {
        let div = this.tempDiv;
        $(div).text(text);
        return $(div).html();
    }
    this.setHighlight = function (regText) {
        this.highlightReg = new RegExp("(" + regText + ")", "g");
        console.log("setHighlight to ", this.highlightReg);
        this.show();
    }
    this.noHighlight = function () {
        this.highlightReg = false;
        this.show();
    }
    this.sendCommand = function (cmd) {
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
};