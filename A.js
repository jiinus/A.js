if (typeof ktls === "undefined") {
	var ktls = {}
}
!(function(global) {

	function A(a) {
		this.a = a;
	};

	A.prototype = {

		constructor: A,

		indexOf: function(e) {
			for (var i = 0; i < this.a.length; i++) {
				if (this.a[i] === e) {
					return i;
				}
			}
			return -1;
		},

		groupBy: function(grouperKey, groupProperty, childProperty) {
			var result = [];
			var hashtable = {};
			var collection;

			if (childProperty === undefined) {
				childProperty = 'objects';
			}

			var self = this;
			this.each(function() {
				var obj = this;
				var grouperValue = (typeof(grouperKey) == 'function') ? grouperKey(obj) : obj[grouperKey];
				if (hashtable[grouperValue] === undefined) {
					var tGroupItem;
					if (groupProperty === undefined) {
						tGroupItem = { 'grouper': grouperValue };
					} else {
						tGroupItem = obj[groupProperty];
					}
					tGroupItem[childProperty] = [obj]
					hashtable[grouperValue] = tGroupItem;
					result.push(tGroupItem)
				} else {
					hashtable[grouperValue][childProperty].push(obj);
				}
			});

			/*
			for(var _key in hashtable) {
				collection = hashtable[_key];
				result.push(collection)
			}
			*/

			return result;
		},

		delete: function(e, all) {

			if (all === undefined) all = false;

			if (e.constructor === Array) {
				var self = this;
				new A(e).each(function() {
					self.delete(this);
				});
			} else {
				var i = this.a.length;
				while(-1 < --i) {
					if (this.a[i] === e) {
						this.a.splice(i, 1);
						if (!all) break;
					}
				}
			}

			return this.a;
		},

		filterDelete: function(f) {
			var i = this.a.length;
			var count = 0;
			itemloop:
			while(--i >= 0) {
				e = this.a[i];
				proploop:
				for (var key in f) {
					if (e[key] !== f[key]) continue itemloop;
				}
				this.a.splice(i, 1);
				count++;
			}
			return count;
		},

		contains: function(e) {
			return (this.a.indexOf(e) != -1);
		},

		exists: function(f) {
			var i = this.a.length;
			var e;
			itemloop:
			while(--i >= 0) {
				e = this.a[i];
				proploop:
				for (var key in f) {
					if (e[key] !== f[key]) continue itemloop;
				}
				return true;
			}
			return false;
		},

		first: function() {
			return (this.a && this.a.length) ? this.a[0] : null;
		},

		last: function(i) {
			if (!this.a.length) return null;
			if (i === undefined) i = 0;
			i = (this.a.length - 1 - i) % this.a.length;
			return this.a[i];
		},

		each: function(callback, debug) {

			if (!this.a) return;

			if (this.a.constructor === Array) {
				for (var i = 0; i < this.a.length; i++) {
					var isFirst = (i == 0);
					var isLast = (i == (this.a.length - 1));
					var result = callback.apply(this.a[i], [i, isFirst, isLast]);
					if (result === false) break;
					if (typeof result == 'number') {
						i = i + result;
					}
				}
			} else {
				for (var propName in this.a) {
					if (this.a.hasOwnProperty(propName)) {
						var propValue = this.a[propName];
						var result = callback.apply(propValue, [propName, propValue]);
						if (result === false) break;
					}
				}
			}
		},

		eachReverse: function(callback) {
			var i = this.a.length;
			while(-1 < --i) {
				var isFirst = (i == 0);
				var isLast = (i == (this.a.length - 1));
				var result = callback.apply(this.a[i], [i, isFirst, isLast]);
				if (result === false) break;
				if (typeof result == 'number') {
					i = i + result;
				}
			}
		},

		loop: function(callback, debug) {

			if (!this.a) return;

			for (var i = 0, len = this.a.length; i < len; i++) {
				var isFirst = (i == 0);
				var isLast = (i == (this.a.length - 1));
				var result = callback.apply(this.a[i], [this.a[i], i, isFirst, isLast]);
				if (result === false) return false;
				if (typeof result == 'number') {
					i = i + result;
				}
			}
		},

		loopReverse: function(callback, debug) {

			if (!this.a) return;

			var i = this.a.length;
			while(-1 < --i) {
				var isFirst = (i == 0);
				var isLast = (i == (this.a.length - 1));
				var result = callback.apply(this.a[i], [this.a[i], i, isFirst, isLast]);
				if (result === false) return false;
				if (typeof result == 'number') {
					i = i + result;
				}
			}
		},

		pushUnique: function(e) {
			if (this.a.indexOf(e) === -1) {
				this.a.push(e);
			}
			return this.a;
		},

		queue: function(e, l) {
			// Append element to array
			this.a.push(e);
			// If array is longer than l, shift first element off
			while(this.a.length > l && l > 0) {
				return this.a.shift();
			}
		},

		isFirst: function(e) {
			return (this.a.indexOf(e) === 0);
		},

		isLast: function(e) {
			return (this.a.indexOf(e) === this.a.length-1);
		},

		isArray: function() {
			return Array.isArray && Array.isArray(this.a)
		},

		/**
		 * @param p String or Array of properties to compare
		 * @param ascending True to sort in ascending order, false to sort in descending order
		 */
		sort: function(p, ascending) {
			if (!this.a) return null;
			if (ascending === undefined) ascending = true;
			if (p.constructor !== Array) { p = [p]; }
			var i;
			this.a.sort(function(a, b) {
				i = p.length;
				while(-1 < --i) {
					var pVal = p[i];
					var aVal = a[pVal];
					var bVal = b[pVal];

					//console.log('--- pVal:', pVal, a, b);
					//console.log('--- aVal:', aVal, 'bVal:', bVal);

					if (aVal == bVal) continue;
					if (aVal < bVal) return (ascending) ? -1 : 1;
					if (aVal > bVal) return (ascending) ? 1 : -1;
				}
				return 0;
			});
			return this.a;
		},

		filter: function(f) { // filter
			if (!this.a) return null;
			var r = []; // result
			itemloop:
			for (var i = 0; i < this.a.length; i++) { // iterator
				var e = this.a[i]; // element
				proploop:
				for (var key in f) {
					var fVal = f[key];
					var _a = new A(fVal)
					if (_a.isArray()) {
						keyloop:
						var fValLen = fVal.length;
						for (var j = 0; j < fValLen; j++) {
							var _key = key;
							if (e[_key] === fVal[j]) continue proploop;
						}
					} else {
						if (key[0] === '!') { // Condition is negated by placing ! in front of the key. Such magic! So blergh! Much evil! Muhahahahaahahaahaha!
							if (e[key.substr(1)] === f[key]) continue itemloop;
						} else {
							if (e[key] !== f[key]) continue itemloop;
						}
					}
				}
				r.push(e);
			}
			return r;
		},

		exclude: function(f) { // filter
			if (!this.a) return null;
			var r = []; // result
			itemloop:
			for (var i = 0; i < this.a.length; i++) { // iterator
				var e = this.a[i]; // element
				proploop:
				for (var key in f) {
					var fVal = f[key];
					var _a = new A(fVal)
					if (_a.isArray()) {
						if (~(fVal.indexOf(e[key]))) continue itemloop;
					} else {
						if (e[key] === fVal) continue itemloop;
					}
				}
				r.push(e);
			}
			return r;
		},

		count: function(f) {
			var count = 0;
			if (!this.a) return count;
			itemloop:
			for (var i = 0; i < this.a.length; i++) { // iterator
				var e = this.a[i]; // element
				proploop:
				for (var key in f) {
					if (key[0] === '!') { // Condition is negated by placing ! in front of the key. Such magic! So blergh! Much evil! Muhahahahaahahaahaha!
						if (e[key.substr(1)] === f[key]) continue itemloop;
					} else {
						if (e[key] !== f[key]) continue itemloop;
					}
				}
				count++;
			}
			return count;
		},

		get: function(f) {
			var r = this.filter(f);
			return (r && r.length) ? r[0] : null;
		},

		shuffle: function() {
			var copy = [], n = this.a.length, i;

			while (n) {
				// Pick a remaining element...
				i = Math.floor(Math.random() * n--);
				// And move it to the new array.
				copy.push(this.a.splice(i, 1)[0]);
			}

			// Finally push everything back to self
			n = copy.length;
			while(n--) {
				this.a.push(copy[n]);
			}
		},
	};

	// Store global reference
	if (global) {

		global.A = function(arr) {
			return new A(arr);
		};

		global.A.append = function(a, b) {
			if (a && b) {
				return a.concat(b);
			} else if (a) {
				return a.slice();
			} else if (b) {
				return b.slice();
			} else {
				return [];
			}
		};
	}

}(typeof window !== 'undefined' ? window : ktls));