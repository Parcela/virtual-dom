/*global describe, it,  document */
"use strict";
var expect = require('chai').expect;


(function (window) {
	var vdom = require('../virtual-dom.js')(window),
		Parcel = require('parcel');

	var v = vdom.vNode;

	var mock = window.navigator.userAgent == 'fake' && window.navigator;

	describe('testing portions of vDOM', function () {
		it ('_diffClassNames' , function () {
			var e = { node: {className:'-'}};

			vdom._diffClassNames(e, ['a','c'],['c','a']);
			expect(e.node.className).to.be.equal('-');
			vdom._diffClassNames(e, ['a','c'],['b','c','a']);
			expect(e.node.className).to.be.equal('a b c');
			vdom._diffClassNames(e, ['a','c'],['b','a']);
			expect(e.node.className).to.be.equal('a b');
			vdom._diffClassNames(e, ['a','c'],['b','a','d','c']);
			expect(e.node.className).to.be.equal('a b c d');
			vdom._diffClassNames(e, null,['b','a','d','c']);
			expect(e.node.className).to.be.equal('a b c d');
			vdom._diffClassNames(e, ['a','c'],null);
			expect(e.node.className).to.be.equal('');
			vdom._diffClassNames(e, ['a','c'],['a','d','e','f','g']);
			expect(e.node.className).to.be.equal('a d e f g');
		});
	});

	var resetWindow = function () {
		if (mock) {
			mock.reset();
			mock.stats.clear();
		}
	};
	var count = 1,
		q = function (sel) {
			return document.querySelector(sel);
		},
		hasOne = function (sel) {
			expect(document.querySelectorAll(sel).length).to.be.equal(1);
		},
		d = function (sel) {
			if (mock) return;
			var el = document.querySelector(sel);
			var p = el.parentElement;
			p.parentElement.removeChild(p);
		},

		prefix = function () {
			return '#a' + count++;
		},
		pdiv = function () {
			return 'body > div > div#a' + (count -1);
		},
		firstChild = function () {
			return window.document.body.childNodes[0].childNodes[0];
		},
		getVDOM = function () {
			return vdom._vDOM.children[0].children[0];
		};



	describe('Simple Renderings:', function () {
		var	renderView = function(vNode)  {
			if (mock) resetWindow();
			vdom.rootApp(Parcel.subClass({
				view: function () {
					return vNode;
				}
			}));
		};
		it('a br', function () {
			renderView(v('br'));
			if (mock) {
				expect(firstChild().nodeName).equal('BR');
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1});
			} else {
				hasOne('body > div > br');
				expect(getVDOM()).to.be.eql({tag:'br',node: q('body > div > br')});
			}
			expect(getVDOM().tag).to.be.eql('br');
			d('body > div > br');
		});
		it('a div with id', function () {
			var p = prefix();
			renderView(v(p));
			if (mock) {
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:1});
			} else {
				hasOne(p);
				expect(getVDOM()).to.be.eql({tag:'div',node: q(p), attrs:{id:p.substr(1)}});
			}
			expect(getVDOM().tag).to.be.eql('div');
			expect(getVDOM().attrs).to.be.eql({id:p.substr(1)});
			d(p);
		});
		it('a div with mixed content', function () {
			var p = prefix();
			renderView(v(p, [
				'before',
				v('br'),
				'after'
			]));
			if (mock) {
				var n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 3, insertBefore: 4, createTextNode: 2, appendChild:1 , setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.id).equal(p.substr(1));
				expect(n.childNodes[0].nodeValue).equal('before');
				expect(n.childNodes[1].nodeName).equal('BR');
				expect(n.childNodes[2].nodeValue).equal('after');

			} else {
				hasOne(pdiv() + ' > br');
				expect(q(p).innerHTML).to.be.equal('before<br>after');
			}
			var vs = getVDOM();
			expect(vs.tag).eql('div');
			expect(vs.children[0] + '').equal('before');
			expect(vs.children[1].tag).equal('br');
			expect(vs.children[2] + '').equal('after');
			d(p);
		});
		it('an element with classnames', function () {
			var p = prefix();
			renderView(v(p + '.z', {class:'a'}));
			if (mock) {
				var n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.className.split(' ').sort().join(' ')).equal('a z');
			} else {
				hasOne(pdiv() + '.a.z');
				expect(q(p).className.split(' ').sort().join(' ')).to.be.equal('a z');
			}
			expect(getVDOM().tag).to.be.eql('div');
			expect(getVDOM().attrs.class.sort().join(' ')).to.be.eql('a z');
			d(p);
		});
		it('an element with several classnames', function () {
			var p = prefix();
			renderView(v(p + '.z',{class:'a b'}));
			if (mock) {
				var n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.className.split(' ').sort().join(' ')).equal('a b z');
			} else {
				hasOne(pdiv() + '.a.z.b');
				expect(q(p).className.split(' ').sort().join(' ')).to.be.equal('a b z');
			}
			expect(getVDOM().tag).to.be.eql('div');
			expect(getVDOM().attrs.class.sort().join(' ')).to.be.eql('a b z');
			d(p);
		});
		it('an element with several classnames as array', function () {
			var p = prefix();
			renderView(v(p + '.z',{class:['a', 'b']}));
			if (mock) {
				var n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.className.split(' ').sort().join(' ')).equal('a b z');
			} else {
				hasOne(pdiv() + '.a.z.b');
				expect(q(p).className.split(' ').sort().join(' ')).to.be.equal('a b z');
			}
			d(p);
		});
		it('an element with styles', function () {
			var p = prefix();
			renderView(v(p,{style:{color:'red', margin:'1em'}}));
			if (mock) {
				var n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.style.color).equal('red');
				expect(n.style.margin).equal('1em');
			} else {
				expect(q(p).style.color).to.be.equal('red');
				expect(q(p).style.margin).to.be.equal('1em');
			}
			d(p);
		});

	});

	describe('changing the default container, className and attributes', function () {
		it ('should create a span', function () {
			if (mock) resetWindow();
			var px = prefix(),
				P = Parcel.subClass({
					containerType:'span',
					className:'something',
					attributes: {'data-id': 123},
					view:  function () {
						return v(px);
					}
				}),
				n;
			var p = vdom.rootApp(P);
			if (mock) {
				expect(mock.stats.get(), 1).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:2});
				n = firstChild();
				expect(n.nodeName, 1).equal('DIV');
				expect(n.parentNode.nodeName, 1).eql('SPAN');
				expect(n.parentNode.getAttribute('data-id'), 1).eql('123');
				expect(n.parentNode.className, 1).eql('parcel something');
			} else {
				hasOne('body > span.parcel.something > div' + px);
				expect(q(px).parentNode.getAttribute('data-id'),1).equal('123');
			}

			p.attributes['data-id'] = 456;
			vdom.render();

			if (mock) {
				expect(mock.stats.get(), 2).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:3, getAttribute: 1});
				n = firstChild();
				expect(n.nodeName, 1).equal('DIV');
				expect(n.parentNode.nodeName, 1).eql('SPAN');
				expect(n.parentNode.getAttribute('data-id'), 1).eql('456');
				expect(n.parentNode.className, 1).eql('parcel something');
			} else {
				hasOne('body > span.parcel.something > div' + px);
				expect(q(px).parentNode.getAttribute('data-id'),2).equal('456');
			}


			d(px);
		});
	});

	describe('Data attribute', function () {
		it('should be recalled but never set on the dom', function() {
			if (mock) resetWindow();
			var px = prefix(),
				P = Parcel.subClass({
					view: function () {
						return v(px, {data: 123});
					},
				}),
				n;
			var p = vdom.rootApp(P);
			if (mock) {
				n = firstChild();
				expect(n.getAttribute('data')).to.be.undefined;
			} else {
				expect(q(px).getAttribute('data')).to.be.null;
			}
			expect(p._pNode.children[0].attrs.data).equal(123);

		});
	});
	describe('should render into any container', function () {
		it('should render anywhere', function () {
			if (mock) resetWindow();
			var anywhere = window.document.createElement('div');
			window.document.body.appendChild(anywhere);
			var px = prefix();
			var P = Parcel.subClass({
				containerType:'span',
				view:  function () {
					return v(px);
				}
			});
			vdom.rootApp(P, anywhere);
			expect(anywhere.childNodes[0].nodeName).equal('SPAN');
			expect(anywhere.childNodes[0].childNodes[0].id).equal(px.substr(1));
			anywhere.parentNode.removeChild(anywhere);
		});
	});

	describe('Simple Rendering and refresh:', function () {
		var	renderVFn = function(vFn)  {
			if (mock) resetWindow();
			vdom.rootApp(Parcel.subClass({
				view: vFn
			}));
		};
		it('a div with mixed content', function () {
			var p = prefix();
			var i = 0, n;
			renderVFn(function () {
				return v(p, [
					'before' + i,
					v('br'),
					'after' + i
				]);
			});
			if (mock) {
				n = firstChild();
				expect(mock.stats.get(), 1).eql({ createElement: 3, insertBefore: 4, createTextNode: 2, appendChild:1, setAttribute:1 });
				expect(n.nodeName, 1).equal('DIV');
				expect(n.id, 1).equal(p.substr(1));
				expect(n.childNodes[0].nodeValue, 1).equal('before0');
				expect(n.childNodes[1].nodeName, 1).equal('BR');
				expect(n.childNodes[2].nodeValue, 1).equal('after0');

			} else {
				hasOne(pdiv() + ' > br');
				expect(q(p).innerHTML, 1).to.be.equal('before0<br>after0');
			}
			i++;
			vdom.render();
			if (mock) {
				n = firstChild();
				expect(mock.stats.get(), 2).eql({ createElement: 3, insertBefore: 4, createTextNode: 2 , appendChild:1, setAttribute:1 });
				expect(n.nodeName, 2).equal('DIV');
				expect(n.id, 2).equal(p.substr(1));
				expect(n.childNodes[0].nodeValue, 2).equal('before1');
				expect(n.childNodes[1].nodeName, 2).equal('BR');
				expect(n.childNodes[2].nodeValue, 2).equal('after1');

			} else {
				expect(q(p).innerHTML, 2).to.be.equal('before1<br>after1');
			}
			d(p);
		});
		it('an element with classnames', function () {
			var p = prefix();
			var c = {class:'a'}, n;
			renderVFn(function () {
				return v(p + '.z',c);
			});
			if (mock) {
				n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.className.split(' ').sort().join(' ')).equal('a z');
			} else {
				hasOne(pdiv() + '.a.z');
				expect(q(p).className.split(' ').sort().join(' ')).to.be.eql('a z');
			}
			c.class = 'b';
			vdom.render();
			if (mock) {
				n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.className.split(' ').sort().join(' ')).equal('b z');
			} else {
				expect(q(p).className.split(' ').sort().join(' ')).to.be.eql('b z');
			}
			d(p);
		});
		it('an element with several classnames', function () {
			var p = prefix();
			var c = {class:'a b'}, n;
			renderVFn(function () {
				return v(p + '.z',c);
			});
			if (mock) {
				n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.className.split(' ').sort().join(' ')).equal('a b z');
			} else {
				hasOne(pdiv() + '.a.z.b');
				expect(q(p).className.split(' ').sort().join(' ')).to.be.eql('a b z');
			}
			c.class = 'a d';
			vdom.render();
			if (mock) {
				n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.className.split(' ').sort().join(' ')).equal('a d z');
			} else {
				expect(q(p).className.split(' ').sort().join(' ')).to.be.eql('a d z');
			}
			d(p);
		});
		it('an element with several classnames as array', function () {
			var p = prefix();
			var c = {class:['a', 'b']}, n;
			renderVFn(function () {
				return v(p + '.z',c);
			});
			if (mock) {
				n = firstChild();
				expect(mock.stats.get()).eql({ createElement:2 , insertBefore: 1, appendChild:1, setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.className.split(' ').sort().join(' ')).equal('a b z');
			} else {
				hasOne(pdiv() + '.a.z.b');
				expect(q(p).className.split(' ').sort().join(' ')).to.be.eql('a b z');
			}
			c.class.push('g');
			vdom.render();
			if (mock) {
				n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.className.split(' ').sort().join(' ')).equal('a b g z');
			} else {
				expect(q(p).className.split(' ').sort().join(' ')).to.be.eql('a b g z');
			}
			d(p);
		});
		it('an element with styles', function () {
			var p = prefix();
			var s = {color:'red', margin:'1em'}, n;
			renderVFn(function () {
				return v(p,{style:s});
			});
			if (mock) {
				n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.style.color).equal('red');
				expect(n.style.margin).equal('1em');
			} else {
				expect(q(p).style.color).to.be.equal('red');
				expect(q(p).style.margin).to.be.equal('1em');
			}
			s.color = 'blue';
			s.padding = '1px';
			vdom.render();
			if (mock) {
				n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.style.color).equal('blue');
				expect(n.style.margin).equal('1em');
				expect(n.style.padding).equal('1px');
			} else {
				expect(q(p).style.color).to.be.equal('blue');
				expect(q(p).style.margin).to.be.equal('1em');
				expect(q(p).style.padding).to.be.equal('1px');
			}
			delete s.margin;
			vdom.render();
			if (mock) {
				n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 2, insertBefore: 1, appendChild:1, setAttribute:1});
				expect(n.nodeName).equal('DIV');
				expect(n.style.color).equal('blue');
				expect(n.style.margin).to.be.undefined;
				expect(n.style.padding).to.be.equal('1px');
			} else {
				expect(q(p).style.color).to.be.equal('blue');
				expect(q(p).style.margin).to.be.equal('');
				expect(q(p).style.padding).to.be.equal('1px');
			}
			d(p);
		});

	});

	describe('nested Views', function () {
		var px1 = prefix(),
			px2 = prefix(),
			P1 = Parcel.subClass({
				view: function () {
					return v('p' + px1);
				}
			}),
			P2 = Parcel.subClass({
				init: function () {
					this.p1 = new P1();
				},
				view: function () {
					return v(px2 ,[this.p1]);
				},
				destroy: function () {
					this.p1.destroy();
				}
			}),
			n;


		var	renderView = function(vFn)  {
			if (mock) resetWindow();
			vdom.rootApp(P2);
		};
		it('should be nested one inside another', function () {
			renderView();
			if (mock) {
				n = firstChild();
				expect(mock.stats.get()).eql({ createElement: 4, insertBefore: 3, appendChild:1, setAttribute:2});
				expect(n.nodeName).eql('DIV');
				expect(n.id).eql(px2.substr(1));
				n = n.childNodes[0];
				expect(n.nodeName).eql('DIV');
				n = n.childNodes[0];
				expect(n.nodeName).eql('P');
				expect(n.id).eql(px1.substr(1));
			} else {
				hasOne('body > div > div' + px2);
				hasOne('body > div > div' + px2 + ' > div > p' + px1);
			}
			var vd = getVDOM();
			expect(vd).to.have.keys(['tag','node','attrs','children']);
			expect(vd.tag).equal('div');
			if (!mock) expect(vd.node).eql(q(px2));
			expect(vd.attrs.id).eql(px2.substr(1));
			vd = vd.children[0];
			expect(vd).to.have.keys(['parcel','stamp','children','node', 'attrs', 'tag']);
			expect(vd.parcel).instanceof(Parcel);
			vd = vd.children[0];
			expect(vd).to.have.keys(['tag','node','attrs']);
			expect(vd.tag).equal('p');
			if (!mock) expect(vd.node).eql(q(px1));
			expect(vd.attrs.id).eql(px1.substr(1));
			expect(vd.children).undefined;

			d(px2);
		});
	});

	describe('test stamp', function () {
		var px = prefix(),
			stp = false,
			count = 0,
			In = Parcel.subClass({
				view: function () {
					return v('p',{class:count++});
				}
			}),
			in1 = new In(),
			in2 = new In(),
			Cont = Parcel.subClass({
				stamp: function () {
					return stp;
				},
				view: function () {
					return v(px,{class:count++}, [in1, in2]);
				}
			});
		it('first render', function () {
			var n, vd, node, child;

			if (mock) resetWindow();
			var cont = vdom.rootApp(Cont);
	//		if (mock) {
	//			n = firstChild();
	//
	//		} else {
	//		}
			vd = vdom._vDOM;

			// Checking the outer Parcel: Cont
			node = vd.children[0];
			expect(node.stamp).false;
			expect(node.parcel).eq(cont);

			// Check the div container in Cont
			node = node.children[0];
			expect(node.tag).eql('div');
			expect(node.attrs.id).eql(px.substr(1));
			expect(node.attrs.class[0]).eql(0);

			// Check the first instance if In (in1)
			child = node.children[0];
			expect(child.parcel).eql(in1);
			child = child.children[0];
			expect(child.attrs.class[0]).eql(1);

			// Check the second instance if In (in2)
			child = node.children[1];
			expect(child.parcel).eql(in2);
			child = child.children[0];
			expect(child.attrs.class[0]).eql(2);

			// render again
			if (mock) resetWindow();
			vdom.render();
	//		if (mock) {
	//			n = firstChild();
	//
	//		} else {
	//		}
			vd = vdom._vDOM;

			// Checking the outer Parcel: Cont
			node = vd.children[0];
			// the stamp should be the same
			expect(node.stamp).false;
			expect(node.parcel).eq(cont);

			// Check the div container in Cont
			node = node.children[0];
			expect(node.tag).eql('div');
			expect(node.attrs.id).eql(px.substr(1));
			// With the stamp unchanged, the class should be the same
			expect(node.attrs.class[0]).eql(0);

			// Check the first instance if In (in1)
			child = node.children[0];
			expect(child.parcel).eql(in1);
			child = child.children[0];
			expect(child.attrs.class[0],1).eql(3);

			// Check the second instance if In (in2)
			child = node.children[1];
			expect(child.parcel).eql(in2);
			child = child.children[0];
			expect(child.attrs.class[0],2).eql(4);

			// Change the stamp
			stp = 123;

			// render again
			if (mock) resetWindow();
			vdom.render();
	//		if (mock) {
	//			n = firstChild();
	//
	//		} else {
	//		}
			vd = vdom._vDOM;

			// Checking the outer Parcel: Cont
			node = vd.children[0];
			// the stamp should be the same
			expect(node.stamp).eql(123);
			expect(node.parcel).eq(cont);

			// Check the div container in Cont
			node = node.children[0];
			expect(node.tag).eql('div');
			expect(node.attrs.id).eql(px.substr(1));
			// With the stamp changed, it should now be 5
			expect(node.attrs.class[0]).eql(5);

			// Check the first instance if In (in1)
			child = node.children[0];
			expect(child.parcel).eql(in1);
			child = child.children[0];
			expect(child.attrs.class[0],1).eql(6);

			// Check the second instance if In (in2)
			child = node.children[1];
			expect(child.parcel).eql(in2);
			child = child.children[0];
			expect(child.attrs.class[0],2).eql(7);

		});


	});

	describe('swap children', function () {
		var p = new (Parcel.subClass({
				view: function () {
					return v('p');
				}
			}))(),
			children = [
				'abcd',
				v('p'),
				p
			],
			expects = [
				function (node, el, when) {
					expect(node + '', when + 'vNode to be string').eql('abcd');
					expect(el.nodeValue, when + 'actual node to be a string').eql('abcd');
				},
				function (node, el, when) {
					expect(node.tag, when +  'vDom to be a <p>').eql('p');
					expect(el.nodeName.toLowerCase(), when + 'Element nodeName to be P').eql('p');
				},
				function (node, el, when) {
					expect(node.parcel, when + 'pNode.parcel to be an instance of Parcel').instanceof(Parcel);
					expect(node.parcel,  when + 'pNode to be this parcel').eql(p);
					expect(el.nodeName.toLowerCase(), when + 'the node to be a <div>').eql('div');
					expect(el.childNodes[0].nodeName.toLowerCase(), when + 'the node to be a <p>').eql('p');
				},
				function (node, el, when) {
					expect(node ,  when + 'vDOM to be undef').to.be.undefined;
					expect(el,  when + 'No element either').to.be.undefined;
				}
			],
			i, j, n, a, b, ta, tb, xa, xb, vd, dd, x;


			var tt = function (a,b,ta,tb,xa,xb) {
				it(ta.join('-') + ' to ' + tb.join('-'), function () {
					var px = '#a'+ ta.join('') + '_' + tb.join('');
					//if (px =="#a200_000") debugger;
					if (mock) resetWindow();
					var first = true;
					vdom.rootApp(Parcel.subClass({
						view: function () {
							return v(px ,(first?a:b));
						}
					}));

					vd = getVDOM().children || [];
					dd = (mock?firstChild().childNodes:q(px).childNodes);
					for (n = 0; n < xa.length; n++) {
						xa[n](vd[n], dd[n], 'before: ');
					}

					first = false;
					vdom.render();

					vd = getVDOM().children || [];
					dd = (mock?firstChild().childNodes:q(px).childNodes);
					for (n = 0; n < xb.length; n++) {
						xb[n](vd[n], dd[n], 'after: ');
					}

					d(px);
				});
			};


		for (i = 0; i < 64; i++) {
			a = []; ta = []; xa = [];
			for (n = 0; n < 6; n+=2) {
				x = (i >> n) & 3;
				ta.push(x);
				if (x < 3)  {
					a.push(children[x]);
					xa.push(expects[x]);
				}
			}
			for (j = 0; j < 64; j++) {
				b = []; tb = []; xb = [];
				for (n = 0; n < 6; n+=2) {
					x = (j >> n) & 3;
					tb.push(x);
					if (x < 3) {
						b.push(children[x]);
						xb.push(expects[x]);
					}
				}
				tt(a.slice(0), b.slice(0), ta.slice(0), tb.slice(0), xa.slice(0), xb.slice(0));
			}
		}
	});


	describe('Swap with same type but different content', function() {
		it('strings', function() {
			var px = prefix(),
				first = true,
				P = Parcel.subClass({
					view: function () {
						return v(px, (first?'abc':'def'));
					}
				}),
				n, vs;

			if (mock) resetWindow();

			vdom.rootApp(P);
			if (mock) {
				n = firstChild();

				expect(mock.stats.get(), 'before').eql({ createElement: 2, insertBefore: 2, createTextNode: 1, appendChild:1 , setAttribute:1});
				expect(n.nodeName, 'before').equal('DIV');
				expect(n.id, 'before').equal(px.substr(1));
				expect(n.childNodes[0].nodeValue, 'before').equal('abc');

			} else {
				expect(q(px).innerHTML, 'before').to.be.equal('abc');
			}
			vs = getVDOM();
			expect(vs.tag, 'before').eql('div');
			expect(vs.children[0] + '', 'before').equal('abc');

			first = false;
			vdom.render();

			if (mock) {
				n = firstChild();

				expect(mock.stats.get(), 'after').eql({ createElement: 2, insertBefore: 2, createTextNode: 1, appendChild:1 , setAttribute:1});
				expect(n.nodeName, 'after').equal('DIV');
				expect(n.id, 'after').equal(px.substr(1));
				expect(n.childNodes[0].nodeValue, 'after').equal('def');

			} else {
				expect(q(px).innerHTML, 'after').to.be.equal('def');
			}
			vs = getVDOM();
			expect(vs.tag, 'after').eql('div');
			expect(vs.children[0] + '', 'after').equal('def');
			d(px);
		});

		it('vNode', function() {
			var px = prefix(),
				first = true,
				P = Parcel.subClass({
					view: function () {
						return v(px, v(first?'p':'span'));
					}
				}),
				n, vs;

			if (mock) resetWindow();

			vdom.rootApp(P);
			if (mock) {
				n = firstChild();

				expect(mock.stats.get(), 'before').eql({ createElement: 3, insertBefore: 2,  appendChild:1 , setAttribute:1});
				expect(n.nodeName, 'before').equal('DIV');
				expect(n.id, 'before').equal(px.substr(1));
				expect(n.childNodes[0].nodeName, 'before').equal('P');

			} else {
				expect(q(px).nodeName, 'before').to.be.equal('DIV');
				expect(q(px).childNodes[0].nodeName, 'before').to.be.equal('P');
			}
			vs = getVDOM();
			expect(vs.tag, 'before').eql('div');
			expect(vs.children[0].tag, 'before').equal('p');

			first = false;
			vdom.render();

			if (mock) {
				n = firstChild();

				expect(mock.stats.get(), 'after').eql({ createElement: 4, insertBefore: 2,  appendChild:1 , setAttribute:1, replaceChild:1});
				expect(n.nodeName, 'after').equal('DIV');
				expect(n.id, 'after').equal(px.substr(1));
				expect(n.childNodes[0].nodeName, 'after').equal('SPAN');

			} else {
				expect(q(px).nodeName, 'after').to.be.equal('DIV');
				expect(q(px).childNodes[0].nodeName, 'after').to.be.equal('SPAN');
			}
			vs = getVDOM();
			expect(vs.tag, 'after').eql('div');
			expect(vs.children[0].tag, 'after').equal('span');
			d(px);
		});

		it('pNode', function() {
			var px = prefix(),
				first = true,
				P1 = Parcel.subClass({
					containerType:'p',
					view: function () {}
				}),
				P2 = Parcel.subClass({
					containerType:'span',
					view: function () {}
				}),
				P = Parcel.subClass({
					view: function () {
						return v(px, first?new P1():new P2());
					}
				}),
				n, vs;

			if (mock) resetWindow();

			vdom.rootApp(P);
			if (mock) {
				n = firstChild();

				expect(mock.stats.get(), 'before').eql({ createElement: 3, insertBefore: 2,  appendChild:1 , setAttribute:1});
				expect(n.nodeName, 'before').equal('DIV');
				expect(n.id, 'before').equal(px.substr(1));
				expect(n.childNodes[0].nodeName, 'before').equal('P');

			} else {
				expect(q(px).nodeName, 'before').to.be.equal('DIV');
				expect(q(px).childNodes[0].nodeName, 'before').to.be.equal('P');
			}
			vs = getVDOM();
			expect(vs.tag, 'before').eql('div');
			expect(vs.children[0].parcel, 'before').instanceof(P1);
			expect(vs.children[0].node.nodeName,'before').equal('P');

			first = false;
			vdom.render();

			if (mock) {
				n = firstChild();

				expect(mock.stats.get(), 'after').eql({ createElement: 4, insertBefore: 2,  appendChild:1 , setAttribute:1, replaceChild:1});
				expect(n.nodeName, 'after').equal('DIV');
				expect(n.id, 'after').equal(px.substr(1));
				expect(n.childNodes[0].nodeName, 'after').equal('SPAN');

			} else {
				expect(q(px).nodeName, 'after').to.be.equal('DIV');
				expect(q(px).childNodes[0].nodeName, 'after').to.be.equal('SPAN');
			}
			vs = getVDOM();
			expect(vs.children[0].parcel, 'before').instanceof(P2);
			expect(vs.children[0].node.nodeName,'before').equal('SPAN');
			d(px);
		});
	});
})(global.window || require('fake-dom'));
