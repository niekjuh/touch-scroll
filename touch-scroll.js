(function($) {
	
	var defaults = {
		y: 0,
		elastic: true,
		momentum: true,
		elasticDamp: 0.6,
		elasticTime: 50,
		reboundTime: 400,
		momentumDamp: 0.9,
		momentumTime: 300,
		iPadMomentumDamp: 0.95,
		iPadMomentumTime: 1200
	};
	
	var methods = {
		
		init: function(options) {
			return this.each(function() {
				
				var $this = $(this),
					o = $.extend(defaults, options),
					scrollY = -o.y,
					touchY = 0,
					movedY = 0,
					pollY = 0,
					height = 0,
					maxHeight = 0,
					scrollHeight = $this.attr('scrollHeight'),
					scrolling = false,
					bouncing = false,
					moved = false,
					timeoutID,
					isiPad = navigator.platform.indexOf('iPad') !== -1,
					hasMatrix = 'WebKitCSSMatrix' in window,
					has3d = hasMatrix && 'm11' in new WebKitCSSMatrix();
				
				update();
				
				$this.css({'-webkit-transition-property': '-webkit-transform',
					'-webkit-transition-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
					'-webkit-transition-duration': '0',
					'-webkit-transform': cssTranslate(scrollY)});

				window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', update, false);

				$this.bind('touchstart.touchScroll', touchStart);
				$this.bind('touchmove.touchScroll', touchMove);
				$this.bind('touchend.touchScroll touchcancel.touchScroll', touchEnd);
				$this.bind('webkitTransitionEnd.touchScroll', transitionEnd);
				
				var setPosition = this.setPosition = function(y) {
					scrollY = y;
					$this.css('-webkit-transform', cssTranslate(scrollY));
				};
				
				function cssTranslate(y) {
					return 'translate' + (has3d ? '3d(0px, ' : '(0px, ') + y + 'px' + (has3d ? ', 0px)' : ')');
				}
				
				function update() {
					// Keep bottom of scroll area at the bottom
					height = $this.height();
					maxHeight = height - scrollHeight;
					clearTimeout(timeoutID);
					clampScroll(false);
				}

				function setTransitionTime(time) {
					time = time || '0';
					$this.css('-webkit-transition-duration', time + 'ms');
				}

				function getComputedScrollY() {
					if (hasMatrix) {
						var matrix = new WebKitCSSMatrix(window.getComputedStyle($this[0]).webkitTransform);
						return matrix.f;
					}
					return scrollY;
				}

				function reboundScroll() {
					if (scrollY > 0) {
						scrollTo(0, o.reboundTime);
					} else if (scrollY < maxHeight) {
						scrollTo(maxHeight, o.reboundTime);
					}
				}

				function transitionEnd() {
					if (bouncing) {
						bouncing = false;
						reboundScroll();
					}

					clearTimeout(timeoutID);
				}

				function clampScroll(poll) {
					if (!hasMatrix || bouncing) {
						return;
					}

					var oldY = pollY;
					pollY = getComputedScrollY();
					
					if (pollY > 0) {
						if (o.elastic) {
							bouncing = true;
							scrollY = 0;
							momentumScroll(pollY - oldY, o.elasticDamp, 1, height, o.elasticTime);
						} else {
							setTransitionTime(0);
							setPosition(0);
						}
					} else if (pollY < maxHeight) {
						if (o.elastic) {
							bouncing = true;
							scrollY = maxHeight;
							momentumScroll(pollY - oldY, o.elasticDamp, 1, height, o.elasticTime);
						} else {
							setTransitionTime(0);
							setPosition(maxHeight);
						}
					} else if (poll) {
						// Poll the computed position to check if element is out of bounds
						timeoutID = setTimeout(clampScroll, 20, true);
					}
				}

				function scrollTo(destY, time) {
					if (destY === scrollY) {
						return;
					}

					moved = true;
					setTransitionTime(time);
					setPosition(destY);
				}

				function momentumScroll(d, k, minDist, maxDist, t) {
					var ad = Math.abs(d),
						dy = 0;

					while (ad > 0.1) {
						ad *= k;
						dy += ad;
					}

					if (dy > maxDist) {
						dy = maxDist;
					}
					
					if (dy > minDist) {
						if (d < 0) {
							dy = -dy;
						}
						
						scrollTo(scrollY + Math.round(dy), t);
					}
					
					clampScroll(true);
				}

				function getTouches(e) {
					if (e.originalEvent) {
						if (e.originalEvent.touches && e.originalEvent.touches.length) {
							return e.originalEvent.touches;
						} else if (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
							return e.originalEvent.changedTouches;
						}
					}
					return e.touches;
				}

				function touchStart(e) {
					e.preventDefault();
					e.stopPropagation();

					var touches = getTouches(e);

					scrolling = true;
					moved = false;
					movedY = 0;

					clearTimeout(timeoutID);
					setTransitionTime(0);

					// Check scroll position
					if (o.momentum) {
						var y = getComputedScrollY();
						if (y !== scrollY) {
							setPosition(y);
							moved = true;
						}
					}

					touchY = touches[0].pageY - scrollY;
				}

				function touchMove(e) {
					if (!scrolling) {
						return;
					}

					var touches = getTouches(e),
						dy = touches[0].pageY - touchY;

					// Elastic-drag outside of scorll boundaries
					if (dy > 0) {
						if (o.elastic) {
							dy /= 2;
						} else {
							dy = 0;
						}
					} else if (dy < maxHeight) {
						if (o.elastic) {
							dy = (dy + maxHeight) / 2;
						} else {
							dy = maxHeight;
						}
					}

					movedY = dy - scrollY;
					moved = true;
					setPosition(dy);
				}

				function touchEnd(e) {
					if (!scrolling) {
						return;
					}

					scrolling = false;

					var touches = getTouches(e);

					if (moved) {
						// Ease back to within boundaries
						if (scrollY > 0 || scrollY < maxHeight) {
							reboundScroll();
						} else if (o.momentum) {
							// Free scroll with momentum
							momentumScroll(movedY, isiPad ? o.iPadMomentumDamp : o.momentumDamp, 40, 2000, isiPad ? o.iPadMomentumTime : o.momentumTime);
						}			
					} else {
						// Dispatch a fake click event if this touch event did not move
						var touch = touches[0],
							target = touch.target,
							me = document.createEvent('MouseEvent');

						while (target.nodeType !== 1) {
							target = target.parentNode;
						}
						me.initMouseEvent('click', true, true, touch.view, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
						target.dispatchEvent(me);
					}
				}
			
			});
		},
		
		setPosition: function(y) {
			return this.each(function() {
				this.setPosition(-y);				
			});
		}
		
	};
		
	$.fn.touchScroll = function(method) {
		
	    if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.touchScroll');
		}
		
	};

})(jQuery);