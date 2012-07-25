var LIMIT = 5;

function Blog() {
  var req = new XMLHttpRequest();
  req.open('GET', 'blog.json', false);
  req.send(null);

  this.posts = JSON.parse(req.responseText);
  this.numpages = Math.ceil(this.posts.length/LIMIT) || 1;
}

Blog.prototype.internalRender = function(numpages, current, pages) {
  var render = function(title, page) { title+"<br /><hr>\n"+page+"<br />\n<hr>" }, r = '';

  pages.forEach(function(x) {
    r += x.title+"<br /><hr>\n"+x.content+"<br />\n<hr>" ;
  });

  return r;
}

Blog.prototype.router = function(page, args, callback) {
  var title = 'main';

  if (pineapple.config.theme.blogRender)
    this.render = pineapple.config.theme.blogRender;
  else
    this.render = this.internalRender; // Bad, report me if a theme lacks of a blogRender

  this.callback = callback;

  if (args) {
    title = args.shift();
  }

  switch (title) {
    case 'main':
      this.renderPosts(args);
      break;

    case 'page':
      this.singlePage(args);
      break;
  }

}

Blog.prototype.singlePage = function(args) {
  var post;

  if (!args.length)
    return this.callback('');

  this.posts.forEach(function(x) {
    if (x.id === args[0])
      post = x;
  });

  this.callback(this.render(this.numpages, 1, [post]));
}

Blog.prototype.renderPosts = function(args) {
  if (!args || !args.length)
    args = [1];

  this.callback(this.render(this.numpages, args[0], this.posts.slice((args[0]-1)*LIMIT, args[0]*LIMIT)));
}

var blog = new Blog;

define({
  main: blog.router.bind(blog), // for some reason, requirejs changes scope on values
  async: true
});