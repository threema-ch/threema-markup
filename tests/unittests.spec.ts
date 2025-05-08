/**
 * This file is part of threema-markup.
 *
 * Copyright (c) 2018–2025 Threema GmbH.
 *
 * Licensed under either of
 * 
 *  - Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
 *  - MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)
 * 
 * at your option.
 */

// tslint:disable:max-line-length

import 'jasmine';
import {SpecReporter, StacktraceOption} from 'jasmine-spec-reporter';
import {markify, parse, tokenize, TokenType, TOKEN_TYPE_ASTERISK} from '../src/index';

// Set up jasmine reporter
jasmine.getEnv().clearReporters() // remove default reporter logs
jasmine.getEnv().addReporter(
  new SpecReporter({
    spec: {
      displayPending: true,
      displayStacktrace: StacktraceOption.PRETTY,
    },
  })
)

describe('Markup Parser', () => {
    describe('tokenizer', () => {
        it('simple', function() {
            const text = 'hello *there*!';
            const tokens = tokenize(text);
            expect(tokens).toEqual([
                { kind: TokenType.Text, value: 'hello ' },
                { kind: TokenType.Asterisk },
                { kind: TokenType.Text, value: 'there' },
                { kind: TokenType.Asterisk },
                { kind: TokenType.Text, value: '!' },
            ]);
        });

        it('nested', function() {
            const text = 'this is *_nested_*!';
            const tokens = tokenize(text);
            expect(tokens).toEqual([
                { kind: TokenType.Text, value: 'this is ' },
                { kind: TokenType.Asterisk },
                { kind: TokenType.Underscore },
                { kind: TokenType.Text, value: 'nested' },
                { kind: TokenType.Underscore },
                { kind: TokenType.Asterisk },
                { kind: TokenType.Text, value: '!' },
            ]);
        });

        it('ignore if not along boundary', function() {
            const text = 'this*is_not~at-boundary';
            const tokens = tokenize(text);
            expect(tokens).toEqual([
                { kind: TokenType.Text, value: 'this*is_not~at-boundary' },
            ]);
        });

        it('ignore markup in URLs', function() {
            const text = 'ignore if *in* a link: https://example.com/pic_-_a.jpg';
            const tokens = tokenize(text);
            expect(tokens).toEqual([
                { kind: TokenType.Text, value: 'ignore if ' },
                { kind: TokenType.Asterisk },
                { kind: TokenType.Text, value: 'in' },
                { kind: TokenType.Asterisk },
                { kind: TokenType.Text, value: ' a link: https://example.com/pic_-_a.jpg' },
            ]);
        });

        it('with newlines', function() {
            const text = 'hello\n*world*\n';
            const tokens = tokenize(text);
            expect(tokens).toEqual([
                { kind: TokenType.Text, value: 'hello' },
                { kind: TokenType.Newline },
                { kind: TokenType.Asterisk },
                { kind: TokenType.Text, value: 'world' },
                { kind: TokenType.Asterisk },
                { kind: TokenType.Newline },
            ]);
        });
    });

    describe('parser', () => {
        it('simple text without formatting', () => {
            const tokens = [{ kind: TokenType.Text, value: 'hello world' }];
            const html = parse(tokens);
            expect(html).toEqual('hello world');
        });

        it('simple bold text', () => {
            const tokens = [
                { kind: TokenType.Text, value: 'hello ' },
                { kind: TokenType.Asterisk },
                { kind: TokenType.Text, value: 'bold' },
                { kind: TokenType.Asterisk },
            ];
            const html = parse(tokens);
            expect(html).toEqual('hello <span class="text-bold">bold</span>');
        });

        it('simple italic text', () => {
            const tokens = [
                { kind: TokenType.Text, value: 'hello ' },
                { kind: TokenType.Underscore },
                { kind: TokenType.Text, value: 'italic' },
                { kind: TokenType.Underscore },
            ];
            const html = parse(tokens);
            expect(html).toEqual('hello <span class="text-italic">italic</span>');
        });

        it('simple strikethrough text', () => {
            const tokens = [
                { kind: TokenType.Text, value: 'hello ' },
                { kind: TokenType.Tilde },
                { kind: TokenType.Text, value: 'strikethrough' },
                { kind: TokenType.Tilde },
            ];
            const html = parse(tokens);
            expect(html).toEqual('hello <span class="text-strike">strikethrough</span>');
        });

        it('correct nesting', () => {
            const tokens = [
                { kind: TokenType.Text, value: 'hello ' },
                { kind: TokenType.Asterisk },
                { kind: TokenType.Text, value: 'bold and ' },
                { kind: TokenType.Underscore },
                { kind: TokenType.Text, value: 'italic' },
                { kind: TokenType.Underscore },
                { kind: TokenType.Asterisk },
            ];
            const html = parse(tokens);
            expect(html).toEqual('hello <span class="text-bold">bold and <span class="text-italic">italic</span></span>');
        });

        it('incorrect nesting', () => {
            const tokens = [
                { kind: TokenType.Asterisk },
                { kind: TokenType.Text, value: 'hi ' },
                { kind: TokenType.Underscore },
                { kind: TokenType.Text, value: 'there' },
                { kind: TokenType.Asterisk },
                { kind: TokenType.Underscore },
            ];
            const html = parse(tokens);
            expect(html).toEqual('<span class="text-bold">hi _there</span>_');
        });
    });

    function testPatterns(cases: Array<[string, string]>, classes?: Record<number, string>) {
        for (const testcase of cases) {
            const input = testcase[0];
            const expected = testcase[1];
            if (classes == undefined) {
                expect(markify(input)).toEqual(expected);
            } else {
                expect(markify(input, classes)).toEqual(expected);
            }
        }
    }

    describe('markify', () => {

        it('detects bold text', () => {
            testPatterns([
                ['*bold text (not italic)*',
                 '<span class="text-bold">bold text (not italic)</span>'],
            ]);
        });

        it('detects italic text', () => {
            testPatterns([
                ['This text is not italic.',
                 'This text is not italic.'],
                ['_This text is italic._',
                 '<span class="text-italic">This text is italic.</span>'],
                ['This text is _partially_ italic',
                 'This text is <span class="text-italic">partially</span> italic'],
                ['This text has _two_ _italic_ bits',
                 'This text has <span class="text-italic">two</span> <span class="text-italic">italic</span> bits'],
            ]);

        });

        it('detects strikethrough text', () => {
            testPatterns([
                ['so ~strikethrough~', 'so <span class="text-strike">strikethrough</span>'],
            ]);
        });

        it('detects mixed markup', () => {
            testPatterns([
                ['*bold text with _italic_ *',
                 '<span class="text-bold">bold text with <span class="text-italic">italic</span> </span>'],
                ['*part bold,* _part italic_',
                 '<span class="text-bold">part bold,</span> <span class="text-italic">part italic</span>'],
                ['_italic text with *bold* _',
                 '<span class="text-italic">italic text with <span class="text-bold">bold</span> </span>'],
            ]);
        });

        it('is applied on word boundaries', () => {
            testPatterns([
                ['(*bold*)',
                 '(<span class="text-bold">bold</span>)'],
                ['¡*Threema* es fantástico!',
                 '¡<span class="text-bold">Threema</span> es fantástico!'],
                ['«_great_ service»',
                 '«<span class="text-italic">great</span> service»'],
                ['"_great_" service',
                 '"<span class="text-italic">great</span>" service'],
                ['*bold*…',
                 '<span class="text-bold">bold</span>…'],
                ['_<a href="https://threema.ch">Threema</a>_',
                 '<span class="text-italic"><a href="https://threema.ch">Threema</a></span>'],
            ]);
        });

        it('is only applied on word boundaries', () => {
            testPatterns([
                ['so not_really_italic',
                 'so not_really_italic'],
                ['invalid*bold*stuff',
                 'invalid*bold*stuff'],
                ['no~strike~through',
                 'no~strike~through'],
                ['*bold_but_no~strike~through*',
                 '<span class="text-bold">bold_but_no~strike~through</span>'],
                ['<_< >_>',
                 '<_< >_>'],
                ['<a href="https://threema.ch">_Threema_</a>',
                 '<a href="https://threema.ch">_Threema_</a>'],
            ]);
        });

        it('does not break URLs', () => {
            testPatterns([
                ['https://en.wikipedia.org/wiki/Java_class_file *nice*',
                 'https://en.wikipedia.org/wiki/Java_class_file <span class="text-bold">nice</span>'],
                ['https://example.com/_output_/',
                 'https://example.com/_output_/'],
                ['https://example.com/*output*/',
                 'https://example.com/*output*/'],
                ['https://example.com?_twitter_impression=true',
                 'https://example.com?_twitter_impression=true'],
                ['https://example.com?__twitter_impression=true',
                 'https://example.com?__twitter_impression=true'],
                ['https://example.com?___twitter_impression=true',
                 'https://example.com?___twitter_impression=true'],
                ['https://example.com/image_-_1.jpg',
                 'https://example.com/image_-_1.jpg'],
            ]);
        });

        it('ignores invalid markup', () => {
            testPatterns([
                ['*invalid markup (do not parse)_', '*invalid markup (do not parse)_'],
                ['random *asterisk', 'random *asterisk'],
                ['***three asterisks', '***three asterisks'],
                ['***three asterisks*', '**<span class="text-bold">three asterisks</span>'],
                ['**double asterisks*', '**double asterisks*'],
            ]);
        });

        it('ignores markup with \\n (newline)', () => {
            testPatterns([
                ['*First line\n and a new one. (do not parse)*', '*First line\n and a new one. (do not parse)*'],
                ['*\nbegins with linebreak. (do not parse)*', '*\nbegins with linebreak. (do not parse)*'],
                ['*Just some text. But it ends with newline (do not parse)\n*', '*Just some text. But it ends with newline (do not parse)\n*'],
            ]);
        });

        it('supports overriding the css classes (TS const enum)', () => {
            testPatterns([
                ['*bold*', '<span class="bbb">bold</span>'],
                ['_italic_', '<span class="iii">italic</span>'],
                ['~strikethrough~', '<span class="sss">strikethrough</span>'],
            ], {
                [TokenType.Asterisk]: 'bbb',
                [TokenType.Underscore]: 'iii',
                [TokenType.Tilde]: 'sss',
            });
        });

        it('supports overriding the css classes (JS compat constants)', () => {
            testPatterns(
                [['*bold*', '<span class="bbb">bold</span>']],
                {[TOKEN_TYPE_ASTERISK]: 'bbb'}
            );
        });
    });

});
