(function($) {
	
	// Define default scroll settings
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
	
	// Define methods
	var methods = {
		
		init: function(options) {
			return this.each(function() {
				
				// Define element variables
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
				
				// Keep bottom of scroll area at the bottom on resize
				var update = this.update = function() {
					height = $this.height();
					maxHeight = height - scrollHeight;
					clearTimeout(timeoutID);
					clampScroll(false);
				};
				
				// Set up initial variables
				update();
				
				// Set up transform CSS
				$this.css({'-webkit-transition-property': '-webkit-transform',
					'-webkit-transition-timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
					'-webkit-transition-duration': '0',
					'-webkit-transform': cssTranslate(scrollY)});
				
				// Listen for screen size change event
				window.addEventListener('onorientationchange' in window ? 'orientationchange' : 'resize', update, false);
				
				// Listen for touch events
				$this.bind('touchstart.touchScroll', touchStart);
				$this.bind('touchmove.touchScroll', touchMove);
				$this.bind('touchend.touchScroll touchcancel.touchScroll', touchEnd);
				$this.bind('webkitTransitionEnd.touchScroll', transitionEnd);
				
				// Set the position of the scroll area using transform CSS
				var setPosition = this.setPosition = function(y) {
					scrollY = y;
					$this.css('-webkit-transform', cssTranslate(scrollY));
				};
				
				// Transform using a 3D translate if available
				function cssTranslate(y) {
					return 'translate' + (has3d ? '3d(0px, ' : '(0px, ') + y + 'px' + (has3d ? ', 0px)' : ')');
				}
				
				// Set CSS transition time
				function setTransitionTime(time) {
					time = time || '0';
					$this.css('-webkit-transition-duration', time + 'ms');
				}

				// Get the actual pixel position made by transform CSS
				function getPosition() {
					if (hasMatrix) {
						var matrix = new WebKitCSSMatrix(window.getComputedStyle($this[0]).webkitTransform);
						return matrix.f;
					}
					return scrollY;
				}
				
				this.getPosition = function() {
					return getPosition();
				};

				// Bounce back to the bounds after momentum scrolling
				function reboundScroll() {
					if (scrollY > 0) {
						scrollTo(0, o.reboundTime);
					} else if (scrollY < maxHeight) {
						scrollTo(maxHeight, o.reboundTime);
					}
				}

				// Stop everything once the CSS transition in complete
				function transitionEnd() {
					if (bouncing) {
						bouncing = false;
						reboundScroll();
					}

					clearTimeout(timeoutID);
				}
				
				// Limit the scrolling to within the bounds
				function clampScroll(poll) {
					if (!hasMatrix || bouncing) {
						return;
					}

					var oldY = pollY;
					pollY = getPosition();
					
					if (pollY > 0) {
						if (o.elastic) {
							// Slow down outside top bound
							bouncing = true;
							scrollY = 0;
							momentumScroll(pollY - oldY, o.elasticDamp, 1, height, o.elasticTime);
						} else {
							// Stop outside top bound
							setTransitionTime(0);
							setPosition(0);
						}
					} else if (pollY < maxHeight) {
						if (o.elastic) {
							// Slow down outside bottom bound
							bouncing = true;
							scrollY = maxHeight;
							momentumScroll(pollY - oldY, o.elasticDamp, 1, height, o.elasticTime);
						} else {
							// Stop outside bottom bound
							setTransitionTime(0);
							setPosition(maxHeight);
						}
					} else if (poll) {
						// Poll the computed position to check if element is out of bounds
						timeoutID = setTimeout(clampScroll, 20, true);
					}
				}
				
				// Animate to a position using CSS
				function scrollTo(destY, time) {
					if (destY === scrollY) {
						return;
					}

					moved = true;
					setTransitionTime(time);
					setPosition(destY);
				}
				
				// Perform a momentum-based scroll using CSS
				function momentumScroll(d, k, minDist, maxDist, t) {
					var ad = Math.abs(d),
						dy = 0;
					
					// Calculate the total distance
					while (ad > 0.1) {
						ad *= k;
						dy += ad;
					}
					
					// Limit to within min and max distances
					if (dy > maxDist) {
						dy = maxDist;
					}
					if (dy > minDist) {
						if (d < 0) {
							dy = -dy;
						}
						
						// Perform scroll
						scrollTo(scrollY + Math.round(dy), t);
					}
					
					clampScroll(true);
				}
				
				// Get the touch points from this event
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
				
				// Perform a touch start event
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
						var y = getPosition();
						if (y !== scrollY) {
							setPosition(y);
							moved = true;
						}
					}

					touchY = touches[0].pageY - scrollY;
				}
				
				// Perform a touch move event
				function touchMove(e) {
					if (!scrolling) {
						return;
					}
					
					var touches = getTouches(e),
						dy = touches[0].pageY - touchY;
					
					// Elastic-drag or stop when moving outside of boundaries
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
				
				// Perform a touch end event
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
		
		update: function() {
			return this.each(function() {
				this.update();
			});
		},
		
		getPosition: function() {
			var a = [];
			this.each(function() {
				a.push(-this.getPosition());
			});
			return a;
		},
		
		setPosition: function(y) {
			return this.each(function() {
				this.setPosition(-y);
			});
		}
		
	};
	
	// Public method for touchScroll
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