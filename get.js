var request = require('request');
var cheerio = require('cheerio');
var _ = require('cheerio/node_modules/underscore');

var url = 'http://ufal.mff.cuni.cz/staff.html';
if (!String.prototype.strip_degrees) {
	Object.defineProperty(String.prototype, 'strip_degrees', {
		value: function () {
			       var commaless = this.replace(/,/, '');
			       var parts = commaless.split(' ').filter(function(e,i,a) { return  !/\.|^MA$/.test(e) } );
			       return parts.join(' ');
		       },
		enumerable: false,
	});
}

var results = {};

request(url, function(err, resp, body) {
	if (err) throw err;
	$ = cheerio.load(body);
	// BEWARE people without a link to struktura are left out!!!
	$('#content a[href*="struktura"]').each(function() {
		var $this = $(this);
		results[name] = {
			name_with_degrees: $this.text(),
			name: $this.text().strip_degrees(),
			position: $this.closest('ul').prevAll('h2').first().text(),
			old_url: $this.next('a').attr('href'),
			mff_url: $this.attr('href')
		};
	});	
	
	
	// NOW SCRAPE OBTAINED MFF URLS
	var people = Object.keys(results);
	var remaining = people.length;
	//remaining = 2;
	


	
	//for (var i=0; i<2; i++) {
	for (var i=0; i<people.length; i++) {
		var url = results[people[i]]['mff_url'];
		request(url, (function(i) { return function(err, resp, body) {
			if (err) throw err;
			$ = cheerio.load(body);
			var properties = {};
			$('dd').each(function() {
				var dd = $(this).text().trim();
				var dt = $(this).prevAll('dt').first().text().trim();
				//console.log(dt + ':' + dd);
				// massaging
				if (dt === 'Odkazy') {
					sis_href = $(this).find('a').first().attr('href');
					var parts  = /=(\d+)$/.exec(sis_href);
					sis_code = parts[1];
					properties['Sis code'] = sis_code;
				}
				properties[dt] = dd;
			});
			_.extend(results[people[i]], properties);
			//console.log(JSON.stringify(properties, null, '\t'));
			remaining -= 1;

			if (remaining == 0) {
				console.log(JSON.stringify(results));
			}
		}})(i));
	}
});

