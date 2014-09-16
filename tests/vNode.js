/*global describe, it */
"use strict";
var expect = require('chai').expect;
(function (window) {
	var v = require('../virtual-dom.js')(window).vNode;

	describe('various vNodes', function () {
		it('render a simple BR', function () {

			expect(v('br')).to.be.eql({
				tag: 'br'
			});
		});
		it('render a complex list', function () {
			expect(v('ul.list', [
					{key: 'k1',	text: 'first value'},
					{key: 'k2',	text: 'second value'}
				 ].map(function (option) {
					return v('li', {'data-key': option.key}, option.text);
				}))).to.be.eql(
				{tag: 'ul',	attrs: {class: ['list']},	children: [
					{tag: 'li',	attrs: {'data-key': 'k1'}, children: ['first value']},
					{tag: 'li',	attrs: {'data-key': 'k2'}, children: ['second value']}
				]}
			);
		});
		it('render a tag with id, class, attrs and contents', function () {
				expect(v('a#google.external[href="http://google.com"]', 'Google')).to.be.eql(
				{tag: 'a', attrs: {
					class:['external'],
					href:'http://google.com',
					id:'google'
				}, children:['Google']},
				'google'
			);
		});
	});
})(global.window || require('fake-dom'));
