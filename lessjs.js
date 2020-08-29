function Term(options) {
    //fulltext, linesPerScreen, funShowHtml) {
    this.enabled = false;
    this.linesPerScreen = options.linesPerScreen;
    this.funShowHtml = options.funShowHtml;
    this.setText = function (text) {
        this.fulltext = text;
        this.fullLines = this.fulltext.split("\n");
        this.curScreen = [];
        this.curLine = 0;
    }
    this.setText(options.fulltext);
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
        this.curLine += line;
        if (this.curLine < 0)
            this.curLine = 0;
        else if (this.curLine >= this.fullLines.length) {
            this.curLine = this.fullLines.length - 1;
        }
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
    this.show = function () {
        if (this.enabled)
            this.funShowHtml(this.text(true));
    }
    this.sendCommand = function (cmd) {
        console.log(cmd);
        if (cmd.substr(0, 7) == "/alert ") {
            alert(cmd.substr(7));
        }
    }
};