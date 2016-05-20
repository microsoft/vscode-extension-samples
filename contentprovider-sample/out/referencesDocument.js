/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
var vscode = require('vscode');
var ReferencesDocument = (function () {
    function ReferencesDocument(emitter, uri, locations) {
        this._emitter = emitter;
        this._uri = uri;
        this._locations = locations.sort(ReferencesDocument._compareLocations);
        // print header
        this._lines = [("Found " + this._locations.length + " references")];
        this._ranges = [];
        this._join = this._populate();
    }
    Object.defineProperty(ReferencesDocument.prototype, "value", {
        get: function () {
            return this._lines.join('\n');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ReferencesDocument.prototype, "ranges", {
        get: function () {
            return this._ranges;
        },
        enumerable: true,
        configurable: true
    });
    ReferencesDocument.prototype.join = function () {
        return this._join;
    };
    ReferencesDocument.prototype._populate = function () {
        var _this = this;
        var locations = this._locations;
        if (locations.length === 0) {
            return;
        }
        // group locations by files
        var map = new Map();
        locations.forEach(function (location) {
            var ranges = map.get(location.uri.toString());
            if (ranges) {
                ranges.push(location.range);
            }
            else {
                map.set(location.uri.toString(), [location.range]);
            }
        });
        // fetch one by one, update doc asap
        return new Promise(function (resolve) {
            var iter = map.entries();
            var next = function () {
                var entry = iter.next();
                if (entry.done) {
                    resolve(_this);
                    return;
                }
                var _a = entry.value, uri = _a[0], ranges = _a[1];
                _this._fetchAndFormatLocation(vscode.Uri.parse(uri), ranges).then(function (lines) {
                    _this._emitter.fire(_this._uri);
                    next();
                });
            };
            next();
        });
    };
    ReferencesDocument.prototype._fetchAndFormatLocation = function (uri, ranges) {
        var _this = this;
        return vscode.workspace.openTextDocument(uri).then(function (doc) {
            _this._lines.push('', uri.toString());
            for (var i = 0; i < ranges.length; i++) {
                var range = ranges[i];
                var line = range.start.line;
                var prev = ranges[i - 1];
                _this._appendContext(doc, line, prev ? Math.min(2, line - prev.start.line) : 2, false);
                _this._appendMatch(doc, range);
                var next = ranges[i + 1];
                _this._appendContext(doc, line + 1, next ? Math.min(2, next.start.line - line) : 2, true);
                if (next) {
                    _this._lines.push('  ...');
                }
            }
        }, function (err) {
            _this._lines.push('', "Failed to load '" + uri.toString() + "'\n\n" + String(err), '');
        });
    };
    ReferencesDocument.prototype._appendContext = function (doc, line, offset, down) {
        var from = down ? line : line - offset;
        var to = down ? line + offset : line;
        while (from < to) {
            if (from >= 0 && from < doc.lineCount) {
                var text = doc.lineAt(from).text;
                this._lines.push(("  " + (from + 1)) + (text && "  " + text));
            }
            from++;
        }
    };
    ReferencesDocument.prototype._appendMatch = function (doc, range) {
        var line = range.start.line;
        var text = doc.lineAt(line).text;
        var preamble = "  " + (line + 1) + ": ";
        this._ranges.push(new vscode.Range(this._lines.length, preamble.length + range.start.character, this._lines.length, preamble.length + range.end.character));
        this._lines.push(preamble + text);
    };
    ReferencesDocument._compareLocations = function (a, b) {
        if (a.uri.toString() < b.uri.toString()) {
            return -1;
        }
        else if (a.uri.toString() > b.uri.toString()) {
            return 1;
        }
        else {
            return a.range.start.compareTo(b.range.start);
        }
    };
    return ReferencesDocument;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ReferencesDocument;
//# sourceMappingURL=referencesDocument.js.map