'use strict';

bdb.minimoBuscar = 2;
bdb.timeout         = 10000;
bdb.userAgent = navigator.userAgent.toLowerCase();
bdb.urlNext = '';
bdb.urlPrev = '';
bdb.booksPerPage = 15;
bdb.opCat = 'cat';
bdb.opBus = 'bus';
bdb.searchParams = ['title', 'isbn', 'cat', 'format', 'author', 'publisher'];
bdb.docsFolder = 'docs/';
bdb.imgFolder = 'img/';

if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}

bdb.browser = {
    version: (bdb.userAgent.match( /.+(?:rv|it|ra|ie|me)[\/: ]([\d.]+)/ ) || [])[1],
    chrome: /chrome/.test( bdb.userAgent ),
    safari: /webkit/.test( bdb.userAgent ) && !/chrome/.test( bdb.userAgent ),
    opera: /opera/.test( bdb.userAgent ),
    msie: /msie/.test( bdb.userAgent ) && !/opera/.test( bdb.userAgent ),
    mozilla: /mozilla/.test( bdb.userAgent ) && !/(compatible|webkit)/.test( bdb.userAgent )
};

bdb.openDocument = function(docu) {
	if (window.runtime) { 
		window.runtime.flash.net.navigateToURL(new window.runtime.flash.net.URLRequest('app:/' + docu));
	} else {
		window.open(docu);
	}
	return false;	 
};

bdb.close = function() {
	var win = window.open('', '_self', '');
	win.opener = top;
	win.close();

	return false;
};

bdb.replaceLatinChar = function(s){
    return output = s.replace(/á|é|í|ó|ú|ä|ë|ï|ö|ü/ig, function(str, offset, s){
        var str = str == "á" ? "a" : str == "é" ? "e" : str == "í" ? "i" : str == "ó" ? "o" : str == "ú" ? "u" : str;
        str = str == "Á" ? "A" : str == "É" ? "E" : str == "Í" ? "I" : str == "Ó" ? "O" : str == "Ú" ? "U" : str;
        str = str == "Á" ? "A" : str == "É" ? "E" : str == "Í" ? "I" : str == "Ó" ? "O" : str == "Ú" ? "U" : str;
        str = str == "ä" ? "a" : str == "ë" ? "e" : str == "ï" ? "i" : str == "ö" ? "o" : str == "ü" ? "u" : str;
        str = str == "Ä" ? "A" : str == "Ë" ? "E" : str == "Ï" ? "I" : str == "Ö" ? "O" : str == "Ü" ? "U" : str;
        return (str);
    })
};


bdb.getURLParameter = function(name, defaultValue){
    var param = decodeURIComponent((location.search.match(RegExp("[?|&]" + name + '=(.+?)(&|$)')) || [, null])[1]);
	return (param == 'null')?defaultValue:param;
};

bdb.setURLParameter = function(name, value) {
	return name + '=' + value;
};

bdb.createURL = function(page, params) {
	var url = page;
	var parameters = '';

	for (var i = 0; i<params.length; i++) {
		if (i != 0)
			parameters += '&';
		parameters += bdb.setURLParameter(params[i][0], params[i][1]);
	}
	
	if (parameters == '')
		return url;
	else
		return url + '?' + parameters;
};

bdb.createMenuByCategories = function() {
	function createSubMenuByCategoryId(categoryId) {
		var category = bdb.findCategoryById(categoryId);
		var html = '';

		if (category.subcategories == '') {
			html += '<li>';
				 html += '<a href="index.html?op=cat&pagid=1&catid=' + category.id + '" title="2nd Level 1">' + category.title + '</a>';
			html += '</li>';
		} else {
        html += '<li class="dropdown-submenu">';
	        html += '<a href="#" title="2nd Level 1">' + category.title + '</a>';
	        html += '<ul class="dropdown-menu">';
	            html += '<li>';
	                html += '<a href="index.html?op=cat&pagid=1&catid=' + categoryId + '" title="2nd Level 2">Ver todos</a>';
	            html += '</li>';
	            html += '<li class="divider">';
	            html += '</li>';

				var subcategories = category.subcategories.split(',');
				for (var i=0; i<subcategories.length; i++) {
					var subcategory = bdb.findCategoryById(subcategories[i]);
		            html += '<li>';
		                html += '<a href="index.html?op=cat&pagid=1&catid=' + subcategories[i] + '" title="3rd Level 1">' + subcategory.title + '</a>';
		            html += '</li>';
				}
				
	        html += '</ul>';
    	html += '</li>';
		}
		
		return html;
	}
	
	var html = '';
	var maincats = bdb.findMainCategories();

	for (var i=0; i<maincats.length; i++) {
		var subcats = maincats[i].subcategories.split(',');

		 html += '<li class="dropdown">';
			  html += '<a class="dropdown-toggle" data-toggle="dropdown" href="#" title="1st Level 3">' + maincats[i].title + '<b class="caret"></b></a>';
			  html += '<ul class="dropdown-menu">';
					html += '<li>';
						 html += '<a href="index.html?op=cat&pagid=1&catid=' + maincats[i].id + '" title="2nd Level 2">Ver todos</a>';
					html += '</li>';
					html += '<li class="divider">';
					html += '</li>';
					for (var j=0; j<subcats.length; j++) {
						html += createSubMenuByCategoryId(subcats[j]);
					}
			  html += '</ul>';
		 html += '</li>';
	}
	
	$('ul#menu-categorias').html($(html));
};

bdb.findCategoryById = function(categoryId) {
	var resp = null;
	$.each(bdb.categories, function(index, value) {
		if (value.id == categoryId) {
			resp = value;
			return false;
		}
	});
	return resp;
};

bdb.findMainCategories = function() {
	var cats = Array();
	$.each(bdb.categories, function(index, value) {
		if (value.parents == '' && value.id != '00') {
			cats.push(value);
		}
	});
	return cats;
};

bdb.findBookById = function(bookId) {
	var resp = null;
	$.each(bdb.books, function(index, value) {
		if (value.id == bookId) {
			resp = value;
			return false;
		}
	});
	return resp;
};

bdb.findAuthorById = function(authorId) {
	var resp = null;
	var search = authorId.split('#');
	$.each(bdb.authors, function(index, value) {
		if (value.id == search[0]) {
			value.name = value.name + (search[1]?' ' + search[1]:'');
			resp = value;
			return false;
		}
	});
	return resp;
};

bdb.findPublisherById = function(publisherId) {
	var resp = null;
	$.each(bdb.publishers, function(index, value) {
		if (value.id == publisherId) {
			resp = value;
			return false;
		}
	});
	return resp;
};

bdb.findFormatById = function(formatId) {
	var resp = null;
	$.each(bdb.formats, function(index, value) {
		if (value.id == formatId) {
			resp = value;
			return false;
		}
	});
	return resp;
};

bdb.createURLListByCategory = function(listingParams) {
	var urlParams = [['op', bdb.opCat]];
	return bdb.createURL('index.html', urlParams.concat(listingParams));
};

bdb.truncateString = function(pstring, length) {
	var post = '';
	
	while (pstring.length > length) {
		var posi = pstring.lastIndexOf(' ');
		if (posi != -1) {
			post = '...';
			pstring = pstring.substr(0, posi);
		} else {
			post = '...';
			pstring = pstring.substr(0, length-1);
		}
	}
	
	return pstring + post;
};

bdb.fillBooksListing = function() {
	var op = bdb.getURLParameter('op','cat');
	var pageId = bdb.getURLParameter('pagid','1');
	var categoryId = bdb.getURLParameter('catid','00');

	var books;

	function createParamsByCategory(pageId) {
		return [['catid', categoryId], ['pagid', pageId]];		
	}

	function createPagerByCategory(pageNumber, numPages, pageId, title) {
		var url = '';
		if (pageId == null) {
			url='<li class="disabled"><a href="#">' + title + '</a></li>';
		} else {
			var params = createParamsByCategory(pageId);
			var href = bdb.createURLListByCategory(params); 
			if (pageId == pageNumber) {
				url='<li class="active"><a href="' + href + '">' + (title==null?pageId:title) + '</a></li>';
			} else {
				if (pageId < 1 || pageId > numPages) {
					url = '<li class="disabled"><a href="' + href + '">' + (title == null ? pageId : title) + '</a></li>';
				} else {
					url = '<li><a href="' + href + '">' + (title == null ? pageId : title) + '</a></li>';
				}
			}
		}
		return url;
	}
	
	function createParamsBySearch(pageId) {
		var pageParams = [['op', bdb.opBus], ['pagid', pageId]];
		
		for (var i=0; i<bdb.searchParams.length; i++) {
			var param = bdb.getURLParameter(bdb.searchParams[i], '');
			if (param != '') {
				pageParams.push([bdb.searchParams[i], param]);
			}
		}
		
		return pageParams;
	}

	function createPagerBySearch(pageNumber, numPages, pageId, title) {
		var url = '';
		if (pageId == null) {
			url='<li class="disabled"><a href="#">' + title + '</a></li>';
		} else {
			var href = bdb.createURL('index.html', createParamsBySearch(pageId));
			
			if (pageId == pageNumber) {
				url='<li class="active"><a href="' + href + '">' + (title==null?pageId:title) + '</a></li>';
			} else {
				if (pageId < 1 || pageId > numPages) {
					url = '<li class="disabled"><a href="' + href + '">' + (title == null ? pageId : title) + '</a></li>';
				} else {
					url = '<li><a href="' + href + '">' + (title == null ? pageId : title) + '</a></li>';
				}
			}
		}
		return url;
	}

	if (op == bdb.opCat) {
		books = bdb.searchBooksByCategory(pageId);
		bdb.fillBreadcrumbByCategory(books.category);
		bdb.fillPager(books, pageId, createPagerByCategory);
	} else {
		books = bdb.searchBooksBySearch(pageId);
		bdb.fillBreadcrumbBySearch();
		bdb.fillPager(books, pageId, createPagerBySearch);
	}

	var title = '';
	if (op == bdb.opCat) {
		title = 'Recursos en ' + (books.category.id=='00'?' la Base de Datos':('"' + books.category.title + '"'));
	} else {
		title = 'Buscador de Recursos';
	}
	$('h2#titulo-listado').html(title);
	
	if (op == bdb.opCat) {
		title = books.category.id=='00'?'en la Base de Datos':'en la categoría';
	} else {
		title = 'encontrados';
	}
	$('p#total-libros').html(books.numBooks + ' recursos ' + title);

	for (var i=1; i<= bdb.booksPerPage; i++) {
		var div = $('li#ficha' + i);
		if (books.books.length >= i) {
			if (op == bdb.opCat) {
				var from = createParamsByCategory(pageId).concat([['op', bdb.opCat]]);
			} else {
				var from = createParamsBySearch(pageId);
			}
			var href = bdb.createURL('ficha.html',[['bookid', books.books[i-1].id]].concat(from));
			$('a#ver-ficha',div).attr('href', href);
			
			var title = bdb.truncateString(books.books[i-1].title,65);
			$('p.titulo',div).text(title);


			var formatId = books.books[i-1].format;
			var formatAlt = '';
			var formatSrc = 'book.png';
			if (formatId != '') {
				var format = bdb.findFormatById(formatId);
				if (format != null) {
					formatSrc = bdb.imgFolder + format.picture;
					formatAlt = format.name;
				}				
			}
			$('img.media-object',div).attr('src',formatSrc);
			$('img.media-object',div).attr('alt',formatAlt);

			var authorId = books.books[i-1].authors.split(',')[0];
			var authorName = '';
			if (authorId != '') {
				var author = bdb.findAuthorById(authorId);
				if (author != null) {
					authorName = author.name;
				}				
			}
			$('small.autor', div).html(bdb.truncateString(authorName,45));

			var publisherId = books.books[i-1].publisher;
			var publisherName = '';
			if (publisherId != '') {
				var publisher = bdb.findPublisherById(publisherId);
				if (publisher != null) {
					publisherName = publisher.name;
				}				
			}
			$('small.editor', div).html(bdb.truncateString(publisherName,45));
			
		} else {
			div.hide();
		}
	}
};

bdb.searchBooksBySearch = function(pageId) {
	var books = { numBooks : 0, books : []};
	var evalSearch = [];

	function searchNone(book) {
		return 0;
	}
	
	function createEvalSearch(param, field, weigth) {
		var cond = bdb.getURLParameter(param, '');
		if (cond != '') {
			var search = new RegExp(cond);
			
			return function(book) {
				return (book[field].match(search))?weigth:0;
			}
		} else {
			return searchNone;
		}
	}
	
	function createSearchTitle(searchString) {
		var search = new RegExp(bdb.replaceLatinChar(searchString), 'i');
		
		return function(book) {
			return (bdb.replaceLatinChar(book.title).match(search))?2:0;
		}
	}

	var title =  bdb.getURLParameter('title', '');
	if (title != '') {
		var searchWords = title.split(' ');
		for (i=0; i<searchWords.length; i++) {
			evalSearch.push(createSearchTitle(searchWords[i]));
		}
	}
	
	evalSearch.push(createEvalSearch('isbn', 'isbn', 1));
	evalSearch.push(createEvalSearch('cat', 'categories', 4));
	evalSearch.push(createEvalSearch('format', 'format', 1));
	evalSearch.push(createEvalSearch('author', 'authors', 3));
	evalSearch.push(createEvalSearch('publisher', 'publisher', 3));
	
	var numberOfConditions = evalSearch.length;
	$.each(bdb.books, function(index, value) {
		var weight = 0;
		for (var i=0;i<numberOfConditions;i++) {
			weight += evalSearch[i](value);
		}
		if (weight>0) {
			books.numBooks++;
			value.weight = weight;
			books.books.push(value);
		}
	});
	
	if (books.books.length > 0) {
		books.books.sort(function(a,b) { return b.weight - a.weight; });
	}

	if (pageId != null) {
		var fromBook = (pageId - 1) * bdb.booksPerPage + 1;
		var count = 1;
		var result = {books : [], numBooks : books.numBooks};
		$.each(books.books, function(index, value) {
			if ((count >= fromBook) && ((count - fromBook) < bdb.booksPerPage)) {
				result.books.push(value);
			}
			count++;
		});
	} else {
		var result = books;
	}
	
	return result;
};

bdb.fillBreadcrumbBySearch = function() {
	var href = bdb.createURLListByCategory([['catid', '00'], ['pagid', '1']]);
	var html = '';
	var href = bdb.createURL('buscador.html', []);

	html += '<li class="active"><a href="' + href + '">' + "Buscador de Recursos" + '</a></li>';

	$('ul#breadcrumb').html($(html));
};

bdb.searchBooksByCategory = function(pageId){
	var categoryId = bdb.getURLParameter('catid','00');
	var books = { numBooks : 0, books : []};

	books.category = bdb.findCategoryById(categoryId);
	
	if (books.category != null) {
		books.numBooks = books.category.books;
	}
	
	var fromBook = (pageId - 1) * bdb.booksPerPage + 1
	var count = 1;
	var booksFound = 0;
	var regex = new RegExp(categoryId);
	$.each(bdb.books, function(index, value) {
		if (booksFound < bdb.booksPerPage) {
			if (value.categories.match(regex) || (categoryId == '00')) {
				if (count >= fromBook) {
					books.books.push(value);
					booksFound++;
				}
				count++;
			}
		} else {
			return false;
		}
	});

	return books;
};

bdb.fillBreadcrumbByCategory = function(category) {
	var href = bdb.createURLListByCategory([['catid', '00'], ['pagid', '1']]);
	var html = '<li><a href="' + href + '">Todos los recursos</a><span class="divider">/</span></li>';
	if (category.id != '00') {
		var parents = category.parents;
		if (parents != '') {
			var categories = parents.split(',');
			$.each(categories, function(index, value){
				var category = bdb.findCategoryById(value);
				var href = bdb.createURLListByCategory([['catid', category.id], ['pagid', '1']]);
				html += '<li><a href="' + href + '">' + category.title + '</a><span class="divider">/</span></li>';
			});
		}
		html += '<li class="active">' + category.title + '</li>';
	}
	$('ul#breadcrumb').html($(html));
};

bdb.fillPager = function(books, pageId, createPageUrl){
	var numPages = Math.ceil(books.numBooks / bdb.booksPerPage);
	
	var pageNumber = parseInt(pageId);
	var lastPage = 1;
	
	function onPageLimits(page){
		return page > 1 && page < numPages;
	}
	
	var html = '<ul>';
	html += createPageUrl(pageNumber, numPages, pageNumber - 1, 'Pág Ant');
	html += createPageUrl(pageNumber, numPages, 1);
	
	for (var i = 2; i <= 3; i++) {
		if (onPageLimits(i)) {
			html += createPageUrl(pageNumber, numPages, i);
			lastPage = i;
		}
	}
	
	if (pageNumber >= 6 && numPages >= 6) { 
		html += createPageUrl(pageNumber, numPages, null, '...');
	}

	if (pageNumber  >= 5) { 
		if (onPageLimits(pageNumber - 1)) {
			html += createPageUrl(pageNumber, numPages, pageNumber-1);
			lastPage = pageNumber - 1;
		}
	}
	
	if (pageNumber > 3) {
		if (onPageLimits(pageNumber)) {
			html += createPageUrl(pageNumber, numPages, pageNumber);
			lastPage = pageNumber;
		}
	}

	if ((pageNumber+1)  < (numPages-2) && (pageNumber+1>lastPage)) { 
		if (onPageLimits(pageNumber + 1)) {
			html += createPageUrl(pageNumber, numPages, pageNumber+1);
			lastPage = pageNumber + 1;
		}
	}
	
	if (lastPage  < (numPages-4)) { 
		html += createPageUrl(pageNumber, numPages, null, '...');
	}

	for (i=numPages-3; i<numPages; i++) {
		if (i>lastPage) {
			if (onPageLimits(i)) {
				html += createPageUrl(pageNumber, numPages, i);
			}
		}
	}	

	if (numPages>1) {
		html += createPageUrl(pageNumber, numPages, numPages);
	}
	html += createPageUrl(pageNumber, numPages, pageNumber+1,'Pág Sig');
	html += '</ul>';
	$('div#paginador').html($(html));
};

bdb.fillBooksSearch = function() {
	bdb.fillCategories();
	bdb.fillPublishers();
	bdb.fillAuthors();
	bdb.fillFormats();
	
	$(document).keyup(function(event){
	    if(event.keyCode == 13){
	        bdb.searchBooks();
	    }
	});	

	$('div#buscar-libros button#btnSearch').click(bdb.searchBooks);
	
	var btnBack = $('a#button-back');
	btnBack.click(function() { history.back(); return false; });
};

bdb.searchBooks = function(eventObject) {
	var searchConditions = [];
	var div = $('div#buscar-libros');
	
	function parseCond(name, input) {
		var cond = $(input, div).val();
		if (cond != '' && cond != '00') {
			searchConditions.push([name,cond]);
			return true;
		} else {
			return false;
		}
	};
	
	parseCond('title', 'input#input-title');
	parseCond('isbn', 'input#input-isbn');
	parseCond('format', 'select#select-format');
	parseCond('author', 'select#select-author');
	parseCond('publisher', 'select#select-publisher');
	
	if (!parseCond('cat', 'select#select-category-three')) {
		if (!parseCond('cat', 'select#select-category-two')) {
			parseCond('cat', 'select#select-category-one');
		}
	}
	
	if (searchConditions.length == 0) {
		alert('Introduce alguna condición para buscar');
	} else {
		searchConditions.push(['op', 'bus']);
		var url = bdb.createURL('index.html', searchConditions);
		$(location).attr('href',url);
	}
};

bdb.fillCategories = function() {
	var cat = $('div#buscar-libros select#select-category-one');
	var html = [];
	html.push('<option selected value="00">Selecciona una Categoría</option>');
	
	$.each(bdb.categories, function(index, value) {
		if ((value.id != '00') && (value.parents == '')) {
			html.push('<option value="' + value.id + '">' + value.title + '</option>');
		}
	});
	
	cat.html($(html.join(' ')));
};

bdb.fillCategoriesTwo = function(parentId) {
	var cat = $('div#buscar-libros select#select-category-two');
	var html = [];
	html.push('<option selected value="00">Selecciona una Subcategoría</option>');
	
	$.each(bdb.categories, function(index, value) {
		if (value.parents == parentId) {
			html.push('<option value="' + value.id + '">' + value.title + '</option>');
		}
	});
	
	cat.html($(html.join(' ')));
};

bdb.fillCategoriesThree = function(parentId) {
	var cat = $('div#buscar-libros select#select-category-three');
	var html = [];
	html.push('<option selected value="00">Selecciona una Subcategoría</option>');
	
	var regex = new RegExp(parentId);

	$.each(bdb.categories, function(index, value) {
		if (value.parents.match(regex)) {
			html.push('<option value="' + value.id + '">' + value.title + '</option>');
		}
	});

	if (html.length == 1) {
		cat.prop('disabled', true);
	}
	
	cat.html($(html.join(' ')));
};

bdb.fillPublishers = function() {
	var pub = $('div#buscar-libros select#select-publisher');
	var html = [];
	html.push('<option selected value="00">Selecciona una Editorial</option>');
	
	$.each(bdb.publishers, function(index, value) {
		html.push('<option value="' + value.id + '">' + value.name + '</option>');
	});
	
	pub.html($(html.join(' ')));
};

bdb.fillAuthors = function() {
	var auth = $('div#buscar-libros select#select-author');
	var html = [];
	var authors = Array();
	html.push('<option selected value="00">Selecciona un Autor</option>');
	
	$.each(bdb.authors, function(index, value) {
		if (value.id != '999') {
			authors.push(value);
		}
	});


	authors.sort(function(v1, v2) { return (v1.name < v2.name) ? -1 : ((v1.name > v2.name) ? 1 : 0); });

	$.each(authors, function(index, value) {
		html.push('<option value="' + value.id + '">' + value.name + '</option>');
	});
	
	auth.html($(html.join(' ')));
};

bdb.fillFormats = function() {
	var form = $('div#buscar-libros select#select-format');
	var html = [];
	html.push('<option selected value="00">Selecciona el Formato</option>');
	
	$.each(bdb.formats, function(index, value) {
		html.push('<option value="' + value.id + '">' + value.name + '</option>');
	});
	
	form.html($(html.join(' ')));
};

bdb.selectedCategoryOneChanged = function(eventObject) {
	var div = $('div#buscar-libros');
	var value =  $('select#select-category-one option:selected', div);

	$('select#select-category-two', div).val('00');
	$('select#select-category-three', div).val('00');
	
	if (value.val() == '00') {
		$('select#select-category-two', div).prop('disabled', true);
		$('select#select-category-three', div).prop('disabled', true);
	} else {
		$('select#select-category-two', div).prop('disabled', false);
		$('select#select-category-three', div).prop('disabled', true);
		
		bdb.fillCategoriesTwo(value.val());
	}
};

bdb.selectedCategoryTwoChanged = function(eventObject) {
	var div = $('div#buscar-libros');
	var value =  $('select#select-category-two option:selected', div);

	if (value.val() == '00') {
		$('select#select-category-three', div).prop('disabled', true);
	} else {
		$('select#select-category-three', div).prop('disabled', false);
		
		bdb.fillCategoriesThree(value.val());
	}
};

bdb.selectedCategoryThreeChanged = function(eventObject) {
	var div = $('div#buscar-libros');
	var value =  $('select#select-category-three option:selected', div);
};

bdb.fillBookDetailCategories = function(detailsDiv, book) {
	var categoriesDiv = $('div#book-categories', detailsDiv);
	var categories = book.categories.trim().split(' ');
	var html = '';
	for (var i=0; i<categories.length; i++) {
		html += '<div>';
		var subcats = categories[i].split('.');
		for (var j=0; j<subcats.length; j++) {
			var cat = bdb.findCategoryById(subcats[j]);
			var href = '<a href="' + bdb.createURLListByCategory([['catid', cat.id]]) + '">' + cat.title + '</a>';
        	html += (j!=0)?'<i class="icon-chevron-right"></i>':'';
			html += '<span class="label label-info">' + href + '</span>';
		}
		html += '</div>';
	}
	categoriesDiv.html($(html));
};

bdb.fillBookDetailAuthors = function(detailsDiv, book) {
	var authorsDiv = $('span#book-authors', detailsDiv);
	var authors = book.authors.trim().split(',');
	var html = '';
	for (var i=0; i<authors.length; i++) {
		if (authors[i] != '') {
			var author = bdb.findAuthorById(authors[i]);
	    	html += (i!=0)?', ':'';
			html += author.name;
		}
	}
	authorsDiv.html(html);
};

bdb.fillBookDetailPublisher = function(detailsDiv, book) {
	var publisherDiv = $('small#book-publisher', detailsDiv);
	var html = '';
	
	if (book.publisher != '') {
		var publisher = bdb.findPublisherById(book.publisher);
		html = publisher.name;
	}
	if (book.year != '') {
		html += ' | ' + book.year;
	}
	if (book.format != '') {
		var format = bdb.findFormatById(book.format);
		html += ' | ' + format.name;
	}
	
	publisherDiv.html(html);
};

bdb.fillBookDetailBack = function(detailsDiv) {
	var btnBack = $('a#button-back', detailsDiv);
	var from = '';
	var op = bdb.getURLParameter('op', bdb.opCat);
	var pageId = bdb.getURLParameter('pagid', bdb.opCat);
	if (op == bdb.opCat) {
		var categoryId = bdb.getURLParameter('catid','00');
		from = bdb.createURLListByCategory([['pagid', pageId],['catid',categoryId]]);
	} else {
		var urlParams = [['op', bdb.opBus],['pagid', pageId]];
		for (var i=0; i<bdb.searchParams.length; i++) {
			var param = bdb.getURLParameter(bdb.searchParams[i], '');
			if (param != '') {
				urlParams.push([bdb.searchParams[i], param]);
			}
		}
		from = bdb.createURL('index.html', urlParams);
	}
	if (from != '') {
		btnBack.attr('href', from);
	}
};

bdb.fillBookDetailNav = function(detailsDiv) {
	var bookId = bdb.getURLParameter('bookid','0005');
	var op = bdb.getURLParameter('op', bdb.opCat);

	function createURLDetails(bookId) {
		var pageId = bdb.getURLParameter('pagid', bdb.opCat);
		var urlParams = [['op', op],['pagid', pageId],['bookid', bookId]];
	
		if (op == bdb.opCat) {
			var categoryId = bdb.getURLParameter('catid','00');
			urlParams.push(['catid',categoryId]);
		} else {
			for (var i=0; i<bdb.searchParams.length; i++) {
				var param = bdb.getURLParameter(bdb.searchParams[i], '');
				if (param != '') {
					urlParams.push([bdb.searchParams[i], param]);
				}
			}
		}
	
		return bdb.createURL('ficha.html', urlParams);
	}


	var prevBook = '';
	var nextBook = '';
	if (op==bdb.opCat) {
		var categoryId = bdb.getURLParameter('catid','00');
		var regex = new RegExp(categoryId);
		var found = false;
		$.each(bdb.books, function(index, value) {
			if (value.categories.match(regex) || (categoryId == '00')) {
				if (value.id == bookId) {
					found = true;
				} else {
					if (found) {
						nextBook = value.id;
						return false;
					} else {
						prevBook = value.id;
					}
				}
			}
		});
	} else {
		var booksFound = bdb.searchBooksBySearch().books; 
		var found = false;
		$.each(booksFound, function(index, value) {
			if (value.id == bookId) {
				found = true;
			} else {
				if (found) {
					nextBook = value.id;
					return false;
				} else {
					prevBook = value.id;
				}
			}
		});
	}

	var btnPrev = $('a#button-prev');
	var btnNext = $('a#button-next');
	if (prevBook != '') {
		btnPrev.attr('href', createURLDetails(prevBook));
	} else {
		btnPrev.parent().addClass('disabled');
	}
	
	if (nextBook != '') {
		btnNext.attr('href', createURLDetails(nextBook));
	} else {
		btnNext.parent().addClass('disabled');
	}
	
	$(document).keyup(function(event){
		var loc = '';
		if (event.keyCode == 39) {
			loc = $('a#button-next').attr('href');
		} else if (event.keyCode == 37) {
			loc = $('a#button-prev').attr('href');
		}
		if (loc != '#' && loc != '') {
        	$(location).attr('href', loc);
		}
	});
};

bdb.fillBookDetailLink = function(detailsDiv, book){
	var linkDiv = $('p#book-link', detailsDiv);
	
	if (book.url == null || book.url == '') {
		linkDiv.hide();
	} else {
		$('a', linkDiv).attr('href', book.url);
	}
};

bdb.fillBookDetailPdf = function(detailsDiv, book){
	var pdfDiv = $('p#book-pdf', detailsDiv);
	
	if (book.pdf == null || book.pdf == '') {
		pdfDiv.hide();
	} else {
		var pdfName = bdb.docsFolder + book.pdf + '.pdf';
		$('a', pdfDiv).click(function(pdf) { return function(){ bdb.openDocument(pdf);}}(pdfName));
	}
};

bdb.fillBookDetail = function() {
	var detailsDiv = $('div#ficha-libro');
	var bookId = bdb.getURLParameter('bookid','0005');
	var book = bdb.findBookById(bookId);
	var op = bdb.getURLParameter('op', bdb.opCat);
 
	bdb.fillBookDetailCategories(detailsDiv, book);

	var titleDiv = $('h3#book-title', detailsDiv);
	titleDiv.html(book.title);
	
	bdb.fillBookDetailAuthors(detailsDiv, book);
	bdb.fillBookDetailPublisher(detailsDiv, book);

	var isbnDiv = $('strong#book-isbn', detailsDiv);
	isbnDiv.html(book.isbn);

	bdb.fillBookDetailBack(detailsDiv);
	bdb.fillBookDetailNav(detailsDiv);
	bdb.fillBookDetailLink(detailsDiv, book);
	bdb.fillBookDetailPdf(detailsDiv, book);

	if (op == bdb.opCat) {
		var categoryId = bdb.getURLParameter('catid', '00');
		var category = bdb.findCategoryById(categoryId);
	}
};

$(document).ready(function(){
    if ($('ul#menu-categorias').length != 0) {
		bdb.createMenuByCategories();
	}
    if ($('div#listado-libros').length != 0) {
        bdb.fillBooksListing();
    }
    if ($('div#ficha-libro').length != 0) {
        bdb.fillBookDetail();
    }
	
    if ($('div#buscar-libros').length != 0) {
        bdb.fillBooksSearch();
		
		$('div#buscar-libros select#select-category-one').change(bdb.selectedCategoryOneChanged);
		$('div#buscar-libros select#select-category-two').change(bdb.selectedCategoryTwoChanged);
		$('div#buscar-libros select#select-category-three').change(bdb.selectedCategoryThreeChanged);
    }
	$(document).keyup(function(event){
		if (event.keyCode == 39) {
			if (bdb.urlNext != '') {
				$(location).attr('href',bdb.urlNext);
			}
		}
		if (event.keyCode == 37) {
			if (bdb.urlNext != '') {
				$(location).attr('href',bdb.urlPrev);
			}
		}
	});
});
