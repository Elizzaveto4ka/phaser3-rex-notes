import EventEmitterMethods from '../../utils/eventemitter/EventEmitterMethods.js';
import GetValue from '../../utils/object/GetValue.js';
import EscapeRegex from '../../utils/string/EscapeRegex.js';
import DefaultValueConverter from '../../utils/string/TypeConvert.js';
import ParseValue from './ParseValue.js';

const DefaultTagExpression = `[a-zA-Z0-9-_.]+`;
const DefaultValueExpression = `[ #a-zA-Z-_.0-9,]+`;
const BypassValueConverter = function (s) { return s; }

class BracketParser {
    constructor(config) {
        // Event emitter
        this.setEventEmitter(GetValue(config, 'eventEmitter', undefined));

        // Parameters for regex
        this.setTagExpression(GetValue(config, 'regex.tag', DefaultTagExpression));
        this.setValueExpression(GetValue(config, 'regex.value', DefaultValueExpression));
        // Value convert
        this.setValueConverter(GetValue(config, 'valueConvert', true));
        // Brackets and generate regex
        var brackets = GetValue(config, 'brackets', '<>');
        this.setBrackets(brackets[0], brackets[1]);

        this.isPaused = false;
        this.skipEventFlag = false;
        this.lastTagStart = null;
        this.lastTagEnd = null;
        this.lastContent = null;
    }

    shutdown() {
        this.destroyEventEmitter();
    }

    destroy() {
        this.shutdown();
    }

    setTagExpression(express) {
        this.tagExpression = express;
        return this;
    }

    setValueExpression(express) {
        this.valueExpression = express;
        return this;
    }

    setValueConverter(converter) {
        if (converter === true) {
            converter = DefaultValueConverter;
        } else if (!converter) {
            converter = BypassValueConverter;
        }
        this.valueConverter = converter;
        return this;
    }

    setBrackets(bracketLeft, bracketRight) {
        if (bracketRight === undefined) {
            bracketRight = bracketLeft[1];
            bracketLeft = bracketLeft[0];
        }
        this.bracketLeft = bracketLeft;
        this.bracketRight = bracketRight;

        bracketLeft = EscapeRegex(bracketLeft);
        bracketRight = EscapeRegex(bracketRight);
        var tagOn = `${bracketLeft}(${this.tagExpression})${bracketRight}`;
        var tagOnWithValue = `${bracketLeft}(${this.tagExpression})=(${this.valueExpression})${bracketRight}`;
        var tagOff = `${bracketLeft}\/(${this.tagExpression})${bracketRight}`;

        this.reTagOn = RegExp(tagOn, 'i');
        this.reTagOnWithValue = RegExp(tagOnWithValue, 'i');
        this.reTagOff = RegExp(tagOff, 'i');
        this.reSplit = RegExp(`${tagOn}|${tagOnWithValue}|${tagOff}`, 'gi');
        return this;
    }

    setSource(source) {
        this.source = source;
        return this;
    }

    resetIndex(index) {
        if (index === undefined) {
            index = 0;
        }
        this.progressIndex = index;
        this.reSplit.lastIndex = index;
        this.lastTagStart = null;
        this.lastTagEnd = null;
        this.lastContent = null;
        return this;
    }

    start(source) {
        this
            .setSource(source)
            .restart();
        return this;
    }

    restart() {
        this
            .resetIndex()
            .next();
    }

    next() {
        this.isPaused = false;
        var text = this.source,
            lastIndex = text.length;

        if (this.reSplit.lastIndex === 0) {
            this.onStart();
        }
        while (!this.isPaused) {
            var regexResult = this.reSplit.exec(text);
            if (!regexResult) {
                if (this.progressIndex < lastIndex) {
                    this.onContent(text.substring(this.progressIndex, lastIndex));
                }
                this.onComplete();
                return;
            }

            var match = regexResult[0];
            var matchStart = this.reSplit.lastIndex - match.length;

            if (this.progressIndex < matchStart) {
                this.onContent(text.substring(this.progressIndex, matchStart));
            }

            if (this.reTagOff.test(match)) {
                this.onTagEnd(match);
            } else if (this.reTagOn.test(match)) {
                this.onTagStart(match);
            } else {
                this.onTagStartWithValue(match);
            }

            this.progressIndex = this.reSplit.lastIndex;
        }

    }

    skipEvent() {
        this.skipEventFlag = true;
        return this;
    }

    pause() {
        this.isPaused = true;
        return this;
    }

    onContent(content) {
        this.emit('content', content);
        this.lastContent = content;
    }

    onTagStart(tagContent) {
        var tag = tagContent.match(this.reTagOn)[1];

        this.skipEventFlag = false;
        this.emit(`+${tag}`);
        if (!this.skipEventFlag) {
            this.emit('+', tag);
        }

        this.lastTagStart = tag;
    }

    onTagStartWithValue(tagContent) {
        var regexResult = tagContent.match(this.reTagOnWithValue);
        var tag = regexResult[1];
        var value = regexResult[2];
        value = ParseValue(value, this.valueConverter);

        this.skipEventFlag = false;
        this.emit(`+${tag}`, value);
        if (!this.skipEventFlag) {
            this.emit('+', tag, value);
        }

        this.lastTagStart = tag;
    }

    onTagEnd(tagContent) {
        var tag = tagContent.match(this.reTagOff)[1];

        this.skipEventFlag = false;
        this.emit('-', tag);
        if (!this.skipEventFlag) {
            this.emit(`-${tag}`);
        }

        this.lastTagEnd = tag;
    }

    onStart() {
        this.emit('start');
    }

    onComplete() {
        this.emit('complete');
        this.resetIndex();
    }
}


Object.assign(
    BracketParser.prototype,
    EventEmitterMethods
);

export default BracketParser;