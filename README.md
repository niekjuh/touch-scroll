# touchScroll jQuery plugin

## About

touchScroll is a jQuery plugin that provides a way to have inline scrollable content. It mimics the behaviour of scrolling on iOS devices (iPhone, iPod touch and iPad) to solve the problem that `position: fixed;` does not work in mobile Safari.

- This plugin will only work for vertical-scrolling content. It has been designed with only this in mind to keep the library lightweight and efficient.
- The code is based on [iScroll](https://github.com/cubiq/iscroll), but is a simpler (and more accurate) plugin for jQuery.

## Example

Using your iOS device (iPhone, iPod touch or iPad), view an example of touchScroll in action at: [neave.github.com/touch-scroll/example.html](http://neave.github.com/touch-scroll/example.html)

For an example of a page with a fixed footer, view this page on your iOS device: [neave.github.com/touch-scroll/footer.html](http://neave.github.com/touch-scroll/footer.html)

Make sure your code uses the same base CSS as provided in these examples.

## How to use

`$('nav').touchScroll(); // Creates touch-scrollable content for a 'nav' element`

`$('nav').touchScroll({y: 100}); // Change the initial vertical scroll position to 100 pixels down`

`$('nav').touchScroll({scrollHeight: 1000}); // Manually set height of the scrollable area, useful for dynamically sized pages`

`$('nav').touchScroll({elastic: false}); // Turn off the elastic-bounce at the end of a scroll movement`

`$('nav').touchScroll({momentum: false}); // Turn off the momentum when a finger is lifted from the screen`

`$('nav').touchScroll({elastic: false, momentum: false}); // Turn off both elastic-bounce and momentum`

`$('nav').touchScroll('update'); // Refresh the touch-scroll area if content has changed`

`$('nav').touchScroll('setPosition', 100); // Method to set the content vertical scroll position at any time`

`var scrollY = $('nav').touchScroll('getPosition'); // Returns the current vertical scroll position in pixels`


## License

This software is released under the MIT License.

Copyright (c) 2011 Paul Neave, [neave.com](http://neave.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
