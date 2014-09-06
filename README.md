virtual-dom
===========

Parcela Virtual DOM

[![Build Status](https://travis-ci.org/Parcela/virtual-dom.svg?branch=master)](https://travis-ci.org/Parcela/virtual-dom)

[![browser support](https://ci.testling.com/Parcela/virtual-dom.png)](https://ci.testling.com/Parcela/virtual-dom)

Provides a rendering system by using and internal copy of the DOM, the *virtual DOM* that will be reflected on the actual DOM.  Whenever a render occurs, a new *expected* version of the *virtual DOM* (or vDOM) or a section of it is created and compared to the *existing* copy of the vDOM.  Then, only the differences in between the *expected* and the *existing* are send to the actual DOM.  The *expected* then becomes the *existing* and the old version discarded.   

Since accessing the DOM from JavaScript is the slowest part, by minimizing the number of accesses the process is fast.  Traversing and comparing the two vDOMs is fast and it usually does not involve the whole vDOM, just parts of it.
