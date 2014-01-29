/*    
      jQuery Setup                                                           
************************************************************************/ 
jQuery.ajaxSetup({
  cache: false
})

/*    
      ArticleAnimator Object                                                           
************************************************************************/ 
var ArticleAnimator = ArticleAnimator || {
  canScroll:          true,
  initialLoad:        true,
  animationDuration:  850,
  postCount:          4,
  currentPostIndex:   1,
  postCache:          {},
  pageTemplate:       null,
};

ArticleAnimator.load = function(){
  this.currentPostIndex = getURLIndex();
  this.makeSelections();

  $body.append( this.$current )
  $body.append( this.$next )

  var self = this;
  this.createPost({ type: 'current' }, function(){
    
	self.createPost({ type: 'next' }, function(){

      /* Selections. */
      self.refreshCurrentAndNextSelection();

      /* Push initial on to stack */
      history.pushState(pageState(), "", "#" + self.currentPostIndex)

      /* Bind to some events. */
      self.bindGotoNextClick();
      self.bindPopstate();
      self.bindWindowScroll();
	    $('#currentindex').html(self.currentPostIndex);
	    $('#nextindex').html(self.nextPostIndex(self.currentPostIndex));

    });
  });
}

ArticleAnimator.aIndex = function(x){
    var self = this;
	postIndex = parseInt(x);
	this.currentPostIndex = postIndex;
	//this.postCount = x;
	//this.refreshCurrentAndNextSelection();
	//this.makeSelections();

	this.createPost({ type: 'next', fromTemplate: true }, function(){
	  self.bindGotoNextClick();
	  this.refreshCurrentAndNextSelection();
	  //this.makeSelections();
	});
  
	//$body.append( this.nextElementClone() );
	
//  var self = this;
//  this.createPost({ type: 'current' }, function(){
//    self.createPost({ type: 'next' }, function(){
//
//      /* Selections. */
//      self.refreshCurrentAndNextSelection();
//
//      /* Push initial on to stack */
//      history.pushState(pageState(), "", "#" + self.currentPostIndex)
//
//      /* Bind to some events. */
//      self.bindGotoNextClick();
//      self.bindPopstate();
//      self.bindWindowScroll();
//    })
//  })
}

ArticleAnimator.makeSelections = function(){
  this.$page         = $('.page');
  this.pageTemplate  = elementToTemplate( this.$page.clone() );
  this.$current      = this.currentElementClone();
  this.$next         = this.nextElementClone();
}

ArticleAnimator.getPost = function(index, callback){
  callback = callback || $.noop;

  if ( this.postCache[index] ){
    callback( this.postCache[index] );
    return;
  }

  var self = this;
  $.getJSON('data/post_'+ index +'.json', function(d){
    self.postCache[index] = d;
    callback(d)
  });
} 

ArticleAnimator.nextPostIndex = function(index){
  return (index === this.postCount) ? 1 : index + 1 
   //return 3;
}

ArticleAnimator.createPost = function(opts, callback){
  opts      = opts || {};
  var self  = this;
  var type  = opts['type'] || 'next';
  var position = opts['pos'];
  
  if ( opts['fromTemplate'] ){
	  
    $body.append( this.nextElementClone() );
    this['$' + 'next'] = $('.' + 'next')
  }
  
  	    $('#currentindex').html(self.currentPostIndex);
	  $('#nextindex').html(self.nextPostIndex(self.currentPostIndex));

	if (type == 'next'){
		var index = self.nextPostIndex(self.currentPostIndex);
		//var index = 2;
		
		  this.getPost(index, function(d){
    		self.contentizeElement(self['$' + 'next'], d);
    		callback && callback();
  			});
			
	} else {
		var index = self.currentPostIndex;
		//var index = 2;
		  this.getPost(index, function(d){
			self.contentizeElement(self['$' + type], d);
			callback && callback();
  });

	}
}

ArticleAnimator.contentizeElement = function($el, d){
  $el.find('h1.title').html(d.title);
  $el.find('.content .text').html(d.content);
  $el.find('h1.question').html(d.title_secondary);
}

ArticleAnimator.animatePage = function(callback){
  var self              = this;
  var translationValue  = this.$next.get(0).getBoundingClientRect().top -30;
  this.canScroll        = false;

	//$('body').html(this.$current);
	
	
  this.$current.addClass('fade-up-out');

  this.$next.removeClass('content-hidden next')
       .addClass('easing-upward')
       .css({ "transform": "translate3d(0, -"+ translationValue +"px, 0)" });

  setTimeout(function(){
      scrollTop();
      self.$next.removeClass('easing-upward')
      self.$current.remove();

      self.$next.css({ "transform": "" });
      self.$current = self.$next.addClass('current');
      
      self.canScroll = true;
      self.currentPostIndex = self.nextPostIndex( self.currentPostIndex );

      callback();
  }, self.animationDuration );
  
}

ArticleAnimator.animateIndexPage = function(callback){
  var self              = this;
  var translationValue  = this.$next.get(0).getBoundingClientRect().top -30;
  this.canScroll        = false;

  this.$current.addClass('fade-up-out');

  this.$next.removeClass('content-hidden next')
       .addClass('easing-upward')
       .css({ "transform": "translate3d(0, -"+ translationValue +"px, 0)" });

  setTimeout(function(){
      scrollTop();
      self.$next.removeClass('easing-upward');
      self.$current.remove();

      self.$next.css({ "transform": "" });
      self.$current = self.$next.addClass('current');
      
      self.canScroll = true;
      self.currentPostIndex = self.nextPostIndex( self.currentPostIndex );

      callback();
  }, self.animationDuration );
}

ArticleAnimator.bindGotoNextClick = function(){
  var self  = this;
  var e     = 'ontouchstart' in window ? 'touchstart' : 'click';

  this.$next.find('.big-image').on(e, function(e){
    e.preventDefault();
    $(this).unbind(e);
	
	if (self.currentPostIndex == 4) {
	slideNumber = 1;
	} else {
	slideNumber = parseInt(self.currentPostIndex) +1;
	}
	
	self.colourChange(slideNumber);
		self.animatePage(function(){
		  self.createPost({ fromTemplate: true, type: 'next' });
		  self.bindGotoNextClick();
		  history.pushState( pageState(), '', "#" + self.currentPostIndex);
	
		});
  });

  
  /*function playNext(path,target)
	{
	target[0].src=path;
	target[0].load();
	target[0].play();
	}
*/
 
  $('nav a').on(e, function(e){
	  	var posIndex = parseInt($(this).attr('href').substr(1));

	  		  	self.colourChange(posIndex);

	  
    e.preventDefault();
    $(this).unbind(e);
	
	  $.getJSON('data/post_' + posIndex + '.json', function(d){
		self.postCache[posIndex] = d;
		//callback(d);
		  $('.next h1.title').html(d.title);
  		  $('.next .content .text').html(d.content);
		    $('.next .content h1.question').html(d.title_secondary);

		  	self.colourChange(posIndex);
			$('.next').removeClass().addClass('page current page'+posIndex);

			self.animateIndexPage(function(){
				 self.aIndex(posIndex);
				 callback && callback();
		   });
		   
	  });


	/*
	    self.animateIndexPage(function(){
	 self.aIndex(posIndex);
	 callback();
  	});
		 */
//      self.bindGotoNextClick();
	//$('.next').html('hello');

      history.pushState( pageState(), '', "#" + index);
 
/*
      self.createPost({ fromTemplate: true, type: 'aIndex', pos: index });
      self.bindGotoNextClick();
      history.pushState( pageState(), '', "#" + position);
*/
  });

}

 ArticleAnimator.colourChange = function(slideNumber) {
		if (slideNumber == 1){
			$('#wrapper').removeAttr('class');
			$('#wrapper').addClass('purple');
		}
		if (slideNumber == 2){
			$('#wrapper').removeAttr('class');
			$('#wrapper').addClass('orange');
			//playNext("videos/vid_1.mp4",$('#bgvid'));

		}
		if (slideNumber == 3){
			$('#wrapper').removeAttr('class');
			$('#wrapper').addClass('blue');
		}
		if (slideNumber == 4){
			$('#wrapper').removeAttr('class');
			$('#wrapper').addClass('green');
		}
  }

ArticleAnimator.bindPopstate = function(){
  var self = this;
  $window.on('popstate', function(e){
    
    if( !history.state || self.initialLoad ){
      self.initialLoad = false;
      return;
    }

    self.currentPostIndex = history.state.index;
    self.$current.replaceWith( history.state.current );
    self.$next.replaceWith( history.state.next );

    self.refreshCurrentAndNextSelection();
    self.createPost({ type: 'next' });
    self.bindGotoNextClick();
  });
}

ArticleAnimator.bindWindowScroll = function(){
  var self = this;
  $window.on('mousewheel', function(ev){
    if ( !self.canScroll ) 
      ev.preventDefault()
  })
}

ArticleAnimator.refreshCurrentAndNextSelection = function(){
  this.$current      = $('.page.current');
  this.$next         = $('.page.next');
}

ArticleAnimator.nextElementClone = function(){
  //return this.$page.clone().removeClass('hidden').addClass('next content-hidden page'+(this.currentPostIndex+1)).fadeIn(450);
  return this.$page.clone().removeClass('hidden').addClass('next content-hidden').fadeIn(450);
}

ArticleAnimator.currentElementClone = function(){
  //return this.$page.clone().removeClass('hidden').addClass('current page'+(this.currentPostIndex));
  return this.$page.clone().removeClass('hidden').addClass('current');
}

/*    
      Helper Functions.                                                      
************************************************************************/ 
function elementToTemplate($element){
  return $element.get(0).outerHTML;
}

function scrollTop(){
  $body.add($html).scrollTop(0);
}

function pageState(){
  return { index: ArticleAnimator.currentPostIndex, 
  		   current: elementToTemplate(ArticleAnimator.$current), 
		   next: elementToTemplate(ArticleAnimator.$next) 
		 }
}

function getURLIndex(){
  return parseInt( (history.state && history.state.index) ||window.location.hash.replace('#', "") || ArticleAnimator.currentPostIndex );
}


/*    
      Document ready.                                                         
************************************************************************/ 
$(document).ready(function(){

  /* A couple of selections. */
  $body         = $('body #wrapper');
  $window       = $(window);
  $html         = $(document.documentElement);

  /* Let's get it started. */
  ArticleAnimator.load();
})

$(document).on('click', '.content a', function(e){
		e.preventDefault();
		alert('clicked');
});
